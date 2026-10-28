const RESOURCE_TYPES = {
  script: "script",
  image: "image",
  stylesheet: "stylesheet",
  font: "font",
  media: "media",
  xmlhttprequest: "xmlhttprequest",
  subdocument: "sub_frame",
  document: "main_frame"
};

function normalizeDomain(value) {
  const domain = value.trim().toLowerCase().replace(/^\.+|\.+$/g, "");
  return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(domain)
    ? domain
    : null;
}

function parseModifiers(raw) {
  const condition = {};
  const unsupported = [];
  const includeDomains = [];
  const excludedDomains = [];
  const resourceTypes = [];

  for (const modifier of raw ? raw.split(",").map((part) => part.trim()).filter(Boolean) : []) {
    if (RESOURCE_TYPES[modifier]) {
      resourceTypes.push(RESOURCE_TYPES[modifier]);
    } else if (modifier === "third-party") {
      condition.domainType = "thirdParty";
    } else if (modifier === "~third-party") {
      condition.domainType = "firstParty";
    } else if (modifier.startsWith("domain=")) {
      for (const entry of modifier.slice("domain=".length).split("|")) {
        const excluded = entry.startsWith("~");
        const domain = normalizeDomain(excluded ? entry.slice(1) : entry);
        if (!domain) unsupported.push(`invalid domain modifier: ${entry}`);
        else (excluded ? excludedDomains : includeDomains).push(domain);
      }
    } else {
      unsupported.push(`unsupported modifier: ${modifier}`);
    }
  }

  if (resourceTypes.length) condition.resourceTypes = [...new Set(resourceTypes)];
  if (includeDomains.length) condition.initiatorDomains = [...new Set(includeDomains)];
  if (excludedDomains.length) condition.excludedInitiatorDomains = [...new Set(excludedDomains)];
  return { condition, unsupported };
}

export function parseNetworkFilter(text) {
  const source = text.trim();
  if (!source || source.startsWith("!") || source.startsWith("[")) return { kind: "ignored" };
  if (source.includes("##") || source.includes("#@#")) return { kind: "not-network" };

  const exception = source.startsWith("@@");
  const body = exception ? source.slice(2) : source;
  const [pattern, rawModifiers, ...extra] = body.split("$");
  if (extra.length) return { kind: "unsupported", reason: "multiple modifier separators" };
  const { condition, unsupported } = parseModifiers(rawModifiers);
  if (unsupported.length) return { kind: "unsupported", reason: unsupported.join("; ") };

  const hostnameMatch = /^\|\|([^/^*|]+)(\^|\/)(.*)$/.exec(pattern);
  if (hostnameMatch) {
    const [, hostname, separator, suffix] = hostnameMatch;
    const domain = normalizeDomain(hostname);
    if (!domain) return { kind: "unsupported", reason: "invalid hostname rule" };
    // DNR urlFilter supports ABP-style || and ^ anchors plus * wildcards. Keep
    // the accepted suffix deliberately narrow rather than passing arbitrary ABP.
    if (!/^[A-Za-z0-9._~:/?&=%+;,@*\-]*$/.test(suffix)) {
      return { kind: "unsupported", reason: "unsupported hostname-path characters" };
    }
    condition.urlFilter = `||${domain}${separator}${suffix}`;
  } else if (/^\|https:\/\/[^|*\s]+\|$/.test(pattern)) {
    condition.regexFilter = `^${escapeRegex(pattern.slice(1, -1))}$`;
  } else {
    return { kind: "unsupported", reason: "unsupported URL pattern" };
  }
  return { kind: "network", text: source, exception, condition };
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isSafeSelector(selector) {
  // Simple class/id/attribute selectors, optionally prefixed by an element.
  // No combinators, pseudo-classes or selector lists are accepted.
  return /^(?:[a-z][a-z0-9-]*)?(?:[.#][A-Za-z_][\w-]*|\[[A-Za-z_][\w-]*(?:=["']?[\w-]+["']?)?\])$/.test(selector);
}

export function parseCosmeticFilter(text) {
  const source = text.trim();
  if (!source || source.startsWith("!") || source.startsWith("[")) return { kind: "ignored" };
  const exceptionIndex = source.indexOf("#@#");
  const exception = exceptionIndex >= 0;
  const index = exception ? exceptionIndex : source.indexOf("##");
  if (index < 0) return { kind: "not-cosmetic" };
  const domainPart = source.slice(0, index);
  const selector = source.slice(index + (exception ? 3 : 2)).trim();
  if (!isSafeSelector(selector)) return { kind: "unsupported", reason: "selector is outside the safe cosmetic subset" };
  const domains = domainPart ? domainPart.split(",").map(normalizeDomain) : [];
  if (domains.some((domain) => !domain)) return { kind: "unsupported", reason: "invalid cosmetic domain" };
  return { kind: "cosmetic", text: source, domains, selector, exception };
}

export function parseFilterText(text) {
  const network = [];
  const cosmetic = [];
  const cosmeticExceptions = [];
  const unsupported = [];
  for (const line of text.split(/\r?\n/)) {
    const cosmeticResult = parseCosmeticFilter(line);
    if (cosmeticResult.kind === "cosmetic") {
      (cosmeticResult.exception ? cosmeticExceptions : cosmetic).push(cosmeticResult);
    }
    else if (cosmeticResult.kind === "unsupported") unsupported.push({ text: line, reason: cosmeticResult.reason });
    else {
      const networkResult = parseNetworkFilter(line);
      if (networkResult.kind === "network") network.push(networkResult);
      else if (networkResult.kind === "unsupported") unsupported.push({ text: line, reason: networkResult.reason });
    }
  }
  return { network, cosmetic, cosmeticExceptions, unsupported };
}
