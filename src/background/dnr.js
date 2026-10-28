const RULE_ID_START = 1000;

export function compileNetworkRules(filters, startId = RULE_ID_START) {
  const rules = [];
  let ruleId = startId;
  for (const filter of filters) {
    rules.push({
      id: ruleId++,
      priority: filter.exception ? 2 : 1,
      action: { type: filter.exception ? "allow" : "block" },
      condition: filter.condition
    });
  }
  return rules;
}

function hostnameFromFilter(filter) {
  const match = /^\|\|([^/^]+)/.exec(filter.condition.urlFilter || "");
  return match?.[1] || null;
}

function matchesActiveDomain(filterDomain, activeDomain) {
  return filterDomain === activeDomain ||
    filterDomain.endsWith(`.${activeDomain}`) ||
    activeDomain.endsWith(`.${filterDomain}`);
}

// Chrome's dynamic-rule quota is smaller than a modern EasyList subset. Keep
// deterministic list order, but move filters targeted at open sites to the
// front so a late list entry (such as a site-specific video rule) is useful.
export function prioritizeNetworkFilters(filters, activeDomains) {
  const preferred = [];
  const remaining = [];
  for (const filter of filters) {
    const filterDomain = hostnameFromFilter(filter);
    if (filterDomain && activeDomains.some((domain) => matchesActiveDomain(filterDomain, domain))) preferred.push(filter);
    else remaining.push(filter);
  }
  return [...preferred, ...remaining];
}

export function compileAllowlistRules(domains, startId) {
  const rules = [];
  let id = startId;
  for (const domain of domains) {
    rules.push({
      id: id++,
      priority: 100,
      action: { type: "allow" },
      condition: { initiatorDomains: [domain] }
    });
    rules.push({
      id: id++,
      priority: 100,
      action: { type: "allow" },
      condition: { urlFilter: `||${domain}^`, resourceTypes: ["main_frame"] }
    });
  }
  return rules;
}

export function allRuleIds(count) {
  return Array.from({ length: count }, (_, index) => RULE_ID_START + index);
}
