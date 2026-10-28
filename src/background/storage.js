const SETTINGS_KEY = "clearadplus.settings";
const FILTER_TEXT_KEY = "clearadplus.activeFilterText";

export const DEFAULT_SUBSCRIPTION_URL = "https://easylist.to/easylist/easylist.txt";
export const SEED_FILTER_TEXT = [
  "! Clear Ad Plus independent starter rules",
  "||doubleclick.net^",
  "||googlesyndication.com^",
  "||google-analytics.com^",
  "##.advertisement",
  "##.generic-ad"
].join("\n");

export const DEFAULT_SETTINGS = {
  globalEnabled: true,
  allowlistedDomains: [],
  subscriptionUrl: DEFAULT_SUBSCRIPTION_URL,
  lastSuccessfulUpdate: null,
  lastUpdateError: null,
  unsupportedFilterCount: 0,
  compiledNetworkRuleCount: 0,
  cosmeticRuleCount: 0,
  partialImport: false,
  pageBlockedCount: 0,
  totalBlockedCount: 0
};

export async function getSettings() {
  const stored = await chrome.storage.local.get(SETTINGS_KEY);
  return { ...DEFAULT_SETTINGS, ...(stored[SETTINGS_KEY] || {}) };
}

export async function saveSettings(patch) {
  const settings = { ...(await getSettings()), ...patch };
  await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
  return settings;
}

export async function getActiveFilterText() {
  const stored = await chrome.storage.local.get(FILTER_TEXT_KEY);
  return stored[FILTER_TEXT_KEY] || SEED_FILTER_TEXT;
}

export async function saveActiveFilterText(text) {
  await chrome.storage.local.set({ [FILTER_TEXT_KEY]: text });
}
