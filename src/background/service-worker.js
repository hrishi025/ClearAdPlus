import { parseFilterText } from "../shared/filter-parser.js";
import { compileAllowlistRules, compileNetworkRules, prioritizeNetworkFilters } from "./dnr.js";
import { getActiveFilterText, getSettings, saveActiveFilterText, saveSettings, SEED_FILTER_TEXT } from "./storage.js";

const MAX_COMPILED_NETWORK_RULES = 30000;
const MAX_FILTER_TEXT_BYTES = 10 * 1024 * 1024;
const SUBSCRIPTION_REFRESH_ALARM = "clearblock.subscription-refresh";
const SUBSCRIPTION_REFRESH_PERIOD_MINUTES = 24 * 60;
const CORE_STATIC_RULESET_ID = "clearblock_core";

function assertMessage(message) {
  return message && typeof message === "object" && typeof message.type === "string";
}

function isExtensionSender(sender) {
  return Boolean(sender?.id && sender.id === chrome.runtime.id);
}

function normalizeDomain(hostname) {
  const domain = String(hostname || "").toLowerCase().replace(/^www\./, "");
  return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(domain)
    ? domain
    : null;
}

function domainMatches(hostname, ruleDomains) {
  return ruleDomains.length === 0 || ruleDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
}

function dynamicRuleLimit() {
  // Chrome exposes the per-extension dynamic-rule quota as a DNR constant.
  // Older Chromium builds may not expose it, so retain their conservative
  // baseline rather than calling a non-existent quota API.
  const limit = chrome.declarativeNetRequest.MAX_NUMBER_OF_DYNAMIC_RULES;
  return Number.isSafeInteger(limit) && limit > 0 ? limit : 5000;
}

async function buildRules(filterText, settings) {
  const parsed = parseFilterText(filterText);
  const activeDomains = await getActiveDomains();
  const maximum = Math.max(0, Math.min(MAX_COMPILED_NETWORK_RULES, dynamicRuleLimit() - (settings.allowlistedDomains.length * 2)));
  const selected = prioritizeNetworkFilters(parsed.network, activeDomains).slice(0, maximum);
  const rules = compileNetworkRules(selected);
  rules.push(...compileAllowlistRules(settings.allowlistedDomains, 1000 + rules.length));
  return {
    rules,
    parsed,
    partialImport: parsed.network.length > selected.length,
    unsupportedCount: parsed.unsupported.length + Math.max(0, parsed.network.length - selected.length)
  };
}

async function getActiveDomains() {
  const tabs = await chrome.tabs.query({});
  return [...new Set(tabs.map((tab) => {
    try { return normalizeDomain(new URL(tab.url).hostname); }
    catch { return null; }
  }).filter(Boolean))];
}

async function replaceRules(filterText = null) {
  const settings = await getSettings();
  const text = filterText ?? await getActiveFilterText();
  const previousRules = await chrome.declarativeNetRequest.getDynamicRules();
  await syncCoreStaticRuleset(settings.globalEnabled);
  if (!settings.globalEnabled) {
    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: previousRules.map((rule) => rule.id) });
    return saveSettings({ compiledNetworkRuleCount: 0, cosmeticRuleCount: 0 });
  }
  const build = await buildRules(text, settings);
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: previousRules.map((rule) => rule.id),
    addRules: build.rules
  });
  return saveSettings({
    compiledNetworkRuleCount: build.rules.length,
    cosmeticRuleCount: build.parsed.cosmetic.length,
    unsupportedFilterCount: build.unsupportedCount,
    partialImport: build.partialImport,
    lastUpdateError: null
  }).then(updateBadge);
}

async function syncCoreStaticRuleset(shouldEnable) {
  const enabledRulesets = await chrome.declarativeNetRequest.getEnabledRulesets();
  const isEnabled = enabledRulesets.includes(CORE_STATIC_RULESET_ID);
  if (shouldEnable === isEnabled) return;
  await chrome.declarativeNetRequest.updateEnabledRulesets({
    enableRulesetIds: shouldEnable ? [CORE_STATIC_RULESET_ID] : [],
    disableRulesetIds: shouldEnable ? [] : [CORE_STATIC_RULESET_ID]
  });
}

async function refreshCosmetics() {
  const tabs = await chrome.tabs.query({});
  await Promise.all(tabs.map(async (tab) => {
    if (!tab.id || !/^https?:/.test(tab.url || "")) return;
    try { await chrome.tabs.sendMessage(tab.id, { type: "clearblock.refresh" }); }
    catch { /* No content script in this tab/frame. */ }
  }));
}

async function updateBadge() {
  const settings = await getSettings();
  const count = settings.pageBlockedCount || 0;
  
  if (count > 0) {
    await chrome.action.setBadgeText({ text: count.toString() });
    await chrome.action.setBadgeBackgroundColor({ color: "#dc2626" });
    await chrome.action.setBadgeTextColor({ color: "#ffffff" });
  } else {
    await chrome.action.setBadgeText({ text: "" });
  }
}

async function refreshSubscription() {
  const settings = await getSettings();
  const url = new URL(settings.subscriptionUrl);
  if (url.protocol !== "https:") throw new Error("Subscription URL must use HTTPS");
  const response = await fetch(url, { redirect: "follow", cache: "no-store" });
  if (!response.ok) throw new Error(`Subscription download failed: HTTP ${response.status}`);
  const text = await response.text();
  if (!text || new TextEncoder().encode(text).byteLength > MAX_FILTER_TEXT_BYTES) throw new Error("Subscription is empty or exceeds 10 MiB");
  const candidate = parseFilterText(text);
  if (candidate.network.length === 0 && candidate.cosmetic.length === 0) throw new Error("Subscription did not contain supported filters");
  await replaceRules(text);
  await saveActiveFilterText(text);
  return saveSettings({ lastSuccessfulUpdate: new Date().toISOString(), lastUpdateError: null });
}

async function refreshSubscriptionIfDue(force = false) {
  const settings = await getSettings();
  const lastUpdate = settings.lastSuccessfulUpdate ? Date.parse(settings.lastSuccessfulUpdate) : NaN;
  const due = !Number.isFinite(lastUpdate) || Date.now() - lastUpdate >= SUBSCRIPTION_REFRESH_PERIOD_MINUTES * 60 * 1000;
  if (!force && !due) return settings;
  try {
    return await refreshSubscription();
  } catch (error) {
    // Download/parse failures are non-destructive: replaceRules() is called
    // only after a candidate has been fetched and contains supported filters.
    await saveSettings({ lastUpdateError: error.message });
    console.warn("ClearBlock subscription refresh failed", error);
    return getSettings();
  }
}

async function setAllowlist(domain, allowlisted) {
  const settings = await getSettings();
  const normalized = normalizeDomain(domain);
  if (!normalized) throw new Error("A valid hostname is required");
  const domains = new Set(settings.allowlistedDomains);
  if (allowlisted) domains.add(normalized); else domains.delete(normalized);
  await saveSettings({ allowlistedDomains: [...domains].sort() });
  await replaceRules();
  await refreshCosmetics();
  await updateBadge();
  return getSettings();
}

chrome.runtime.onInstalled.addListener(() => {
  void (async () => {
    const text = await getActiveFilterText();
    if (!text) await saveActiveFilterText(SEED_FILTER_TEXT);
    await replaceRules();
    await chrome.alarms.create(SUBSCRIPTION_REFRESH_ALARM, { periodInMinutes: SUBSCRIPTION_REFRESH_PERIOD_MINUTES });
    await refreshSubscriptionIfDue();
    await updateBadge();
  })().catch((error) => console.error("ClearBlock startup failed", error));
});

chrome.runtime.onStartup.addListener(() => {
  void (async () => {
    await replaceRules();
    await refreshSubscriptionIfDue();
    await updateBadge();
  })().catch((error) => console.error("ClearBlock startup reconciliation failed", error));
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === SUBSCRIPTION_REFRESH_ALARM) void refreshSubscriptionIfDue();
});

let siteReconcileTimer = null;
chrome.tabs.onUpdated.addListener((_tabId, changeInfo) => {
  if (!changeInfo.url) return;
  clearTimeout(siteReconcileTimer);
  siteReconcileTimer = setTimeout(() => {
    void replaceRules().catch((error) => console.error("ClearBlock site-priority sync failed", error));
  }, 750);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!assertMessage(message) || !isExtensionSender(sender)) return;
  (async () => {
    switch (message.type) {
      case "status.get":
        return getSettings();
      case "settings.globalEnabled":
        await saveSettings({ globalEnabled: Boolean(message.enabled) });
        await refreshCosmetics();
        await updateBadge();
        return replaceRules();
      case "allowlist.set":
        return setAllowlist(message.domain, Boolean(message.allowlisted));
      case "subscription.setUrl":
        new URL(message.url);
        return saveSettings({ subscriptionUrl: String(message.url), lastUpdateError: null });
      case "subscription.refresh":
        try {
          const updated = await refreshSubscription();
          await refreshCosmetics();
          return updated;
        }
        catch (error) {
          await saveSettings({ lastUpdateError: error.message });
          throw error;
        }
      case "cosmetic.get": {
        const settings = await getSettings();
        const domain = normalizeDomain(message.hostname);
        if (!settings.globalEnabled || !domain || settings.allowlistedDomains.includes(domain)) return [];
        const parsed = parseFilterText(await getActiveFilterText());
        const exceptions = new Set(parsed.cosmeticExceptions
          .filter((rule) => domainMatches(domain, rule.domains))
          .map((rule) => rule.selector));
        return parsed.cosmetic
          .filter((rule) => domainMatches(domain, rule.domains) && !exceptions.has(rule.selector))
          .map((rule) => rule.selector);
      }
      case "site.blockingState": {
        const settings = await getSettings();
        const domain = normalizeDomain(message.hostname);
        return { enabled: Boolean(settings.globalEnabled && domain && !settings.allowlistedDomains.includes(domain)) };
      }
      case "stats.getBlockedCount": {
        const settings = await getSettings();
        return {
          pageBlocked: settings.pageBlockedCount || 0,
          totalBlocked: settings.totalBlockedCount || 0
        };
      }
      case "stats.incrementCount": {
        const settings = await getSettings();
        await saveSettings({
          pageBlockedCount: (settings.pageBlockedCount || 0) + 1,
          totalBlockedCount: (settings.totalBlockedCount || 0) + 1
        });
        await updateBadge();
        return { success: true };
      }
      case "stats.resetPageCount": {
        await saveSettings({ pageBlockedCount: 0 });
        await updateBadge();
        return { success: true };
      }
      default:
        throw new Error("Unknown message type");
    }
  })().then(sendResponse, (error) => sendResponse({ error: error.message }));
  return true;
});
