import test from "node:test";
import assert from "node:assert/strict";
import { parseCosmeticFilter, parseFilterText, parseNetworkFilter } from "../src/shared/filter-parser.js";
import { compileNetworkRules, prioritizeNetworkFilters } from "../src/background/dnr.js";

test("compiles hostname blocks with resource and party modifiers", () => {
  const parsed = parseNetworkFilter("||tracker.example^$script,third-party,domain=site.example|~excluded.example");
  assert.equal(parsed.kind, "network");
  assert.equal(parsed.exception, false);
  assert.deepEqual(parsed.condition, { urlFilter: "||tracker.example^", resourceTypes: ["script"], domainType: "thirdParty", initiatorDomains: ["site.example"], excludedInitiatorDomains: ["excluded.example"] });
});

test("exceptions compile with higher priority", () => {
  const parsed = parseNetworkFilter("@@||cdn.example^");
  assert.equal(parsed.exception, true);
  assert.equal(compileNetworkRules([parsed])[0].priority, 2);
  assert.equal(compileNetworkRules([parsed])[0].action.type, "allow");
});

test("exact HTTPS syntax becomes anchored DNR regex", () => {
  const parsed = parseNetworkFilter("|https://example.com/ad.js|");
  assert.equal(parsed.kind, "network");
  assert.equal(parsed.condition.regexFilter, "^https://example\\.com/ad\\.js$");
});

test("compiles an ABP hostname rule with a conservative path wildcard", () => {
  const parsed = parseNetworkFilter("||hotstar.com^*/midroll?");
  assert.equal(parsed.kind, "network");
  assert.equal(parsed.condition.urlFilter, "||hotstar.com^*/midroll?");
});

test("accepts a direct hostname-path exception", () => {
  const parsed = parseNetworkFilter("@@||hotstar.com/vs/getad.php$domain=hotstar.com");
  assert.equal(parsed.kind, "network");
  assert.equal(parsed.condition.urlFilter, "||hotstar.com/vs/getad.php");
});

test("compiles the EasyList YouTube player ad-break endpoint", () => {
  const parsed = parseNetworkFilter("||youtube.com/youtubei/v1/player/ad_break");
  assert.equal(parsed.kind, "network");
  assert.equal(parsed.condition.urlFilter, "||youtube.com/youtubei/v1/player/ad_break");
});

test("prioritizes rules targeted at open sites before filling the DNR quota", () => {
  const first = parseNetworkFilter("||early.example^");
  const hotstar = parseNetworkFilter("||hotstar.com^*/midroll?");
  assert.deepEqual(prioritizeNetworkFilters([first, hotstar], ["hotstar.com"]), [hotstar, first]);
});

test("unsupported ABP constructs are reported", () => {
  assert.equal(parseNetworkFilter("/ads/.+").kind, "unsupported");
  assert.equal(parseNetworkFilter("||example.com^$redirect=noopjs").kind, "unsupported");
});

test("parses conservative cosmetic selectors", () => {
  assert.deepEqual(parseCosmeticFilter("example.com##.advertisement"), { kind: "cosmetic", text: "example.com##.advertisement", domains: ["example.com"], selector: ".advertisement", exception: false });
  assert.equal(parseCosmeticFilter("##div > .advertisement").kind, "unsupported");
  assert.equal(parseCosmeticFilter('hotstar.com##div[data-testid="bbtype-video"]').kind, "cosmetic");
});

test("keeps supported cosmetic exceptions separate from hiding rules", () => {
  const result = parseFilterText("##.advertisement\nexample.com#@#.advertisement");
  assert.equal(result.cosmetic.length, 1);
  assert.equal(result.cosmeticExceptions.length, 1);
  assert.equal(result.cosmeticExceptions[0].exception, true);
});

test("filter text keeps supported and unsupported counts separate", () => {
  const result = parseFilterText("||ads.example^\n##.generic-ad\n||example.com^$redirect=noopjs");
  assert.equal(result.network.length, 1);
  assert.equal(result.cosmetic.length, 1);
  assert.equal(result.unsupported.length, 1);
});
