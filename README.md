# Clear Ad Plus

Clear Ad Plus is an independent, no-build Manifest V3 Chrome extension with powerful ad blocking. Load this directory with **Developer mode → Load unpacked**.

## Implemented filter subset

- `||example.com^` hostname blocking rules, with a conservative literal/wildcard URL suffix (for example `||example.com^*/midroll?`).
- `|https://example.com/path|` exact URL-style blocking rules.
- `@@` exceptions for either supported form. Exceptions use a higher DNR priority.
- `$script`, `$image`, `$stylesheet`, `$font`, `$media`, `$xmlhttprequest`, `$subdocument`, `$document`.
- `$third-party` and `$~third-party`.
- `$domain=example.com|~excluded.example.com` using DNR initiator-domain restrictions.
- `example.com##.advertisement` and generic `##.generic-ad` cosmetic rules, plus exact supported-selector exceptions such as `example.com#@#.advertisement`, for conservative element/class/id/attribute selectors.

Unsupported syntax is retained as a diagnostic count rather than compiled incorrectly. This is deliberately not full Adblock Plus compatibility. Regular expressions, redirects, header changes, CSP, scriptlets, wildcards beyond the two documented URL forms, and complex cosmetic selectors are unsupported.

## Design notes

- A small independent core set is packaged as a Chrome static DNR ruleset. Dynamic DNR rules are used for downloaded lists, user filters, and allowlists; global disable/enable synchronizes both classes of rules.
- The default subscription URL is EasyList. It refreshes on install/startup when no successful update exists, then every 24 hours. Downloads are parsed in memory and compiled before an atomic dynamic-rule replacement; an unsuccessful update leaves working rules intact.
- List compilation uses Chrome's `MAX_NUMBER_OF_DYNAMIC_RULES` quota (with a conservative 5,000-rule fallback for older Chromium builds), and is capped at 30,000 by this implementation. When the list exceeds that capacity, rules targeting currently open sites are prioritized before the remaining rules retain list order. The status UI reports a partial import as unsupported/ignored entries; it never claims full EasyList coverage.
- Global disabling removes this extension's dynamic rules. Re-enabling recompiles the last successfully stored filter text.
- Allowlisting persists domains. It installs higher-priority DNR allow rules for requests initiated by the site and stops cosmetic injection on that site. A main-frame allow rule is included for the exact allowlisted domain.
- ClearBlock does not modify, inspect, or disable other extensions by default. The popup can request Chrome's optional `management` permission only after the user clicks **Check for Adblock Plus conflict**. It checks the Adblock Plus ID observed in the supplied CRX and, if that extension is enabled, offers only to pause ClearBlock. Using one blocker at a time is the supported coexistence mode.

## Build-time static rulesets

For a large, licensed filter list, build a reviewed static DNR ruleset with:

```powershell
node tools/build-static-ruleset.mjs --input C:\path\to\licensed-list.txt --output rules\licensed-list.json
```

Then declare the generated file in `manifest.json` under `declarative_net_request.rule_resources`. The helper does not download lists, bundle third-party list content automatically, or execute list content. Review the list license and Chrome static-rule limits before distribution.

## Streaming-video limitation

ClearBlock blocks separately requested resources that match installed DNR rules. It cannot reliably skip video ads that a streaming provider stitches into the same media stream as program content. For YouTube only, ClearBlock adds an independent, allowlist-aware player fallback: it clicks a visible YouTube Skip control and seeks while the YouTube player explicitly has its `ad-showing` state. It is not a general video-player bypass and may stop working if YouTube changes its player markup/state model. A successful EasyList update increases request/cosmetic coverage but is not a promise that every Hotstar in-stream advertisement will disappear or skip.

## Test

Run `npm test` from this directory. These unit tests exercise parsing and DNR compilation only; Chrome API behavior still needs the manual checklist in `TESTING.md`.
