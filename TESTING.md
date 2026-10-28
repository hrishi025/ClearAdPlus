# Manual Chrome validation checklist

1. Open `chrome://extensions`, enable Developer mode, select **Load unpacked**, and choose this project directory.
2. Open the extension's service-worker inspector. Confirm no startup exception appears.
3. In the popup, inspect the initial seed status. Use DevTools Network on a page that requests `https://doubleclick.net/...`; its request should be blocked while global blocking is enabled.
4. Use the popup to allowlist the current site, reload it, and confirm the site has no ClearBlock cosmetic style and its initiated matching requests are allowed.
5. Remove the allowlist entry, reload, and repeat step 3.
6. Toggle global blocking off and on; reload after each change. Rules should disappear/reappear without errors.
7. Set a known test-list URL and choose **Update list**. A failed URL/update must leave the prior `last successful update` and prior working dynamic rules unchanged.
8. Add `example.test##.advertisement` through a test list, visit an HTTP(S) page at that host with `<div class="advertisement">`, and confirm it hides. Allowlist the domain and confirm it does not hide.
9. Close/reopen Chrome, then confirm global setting, allowlist, subscription URL, and last-successful metadata persist.
10. In the service-worker inspector, force an invalid/oversized update (for example through a development fixture) and verify the UI shows an error and previously installed rules remain present.
11. For a list larger than Chrome's dynamic-rule quota, open the target site and reload once after updating the list. Site-targeted rules are prioritized during the tab-navigation reconciliation; inspect the worker console for any DNR error.
12. Click **Check for Adblock Plus conflict**. Chrome should request the optional management permission. If Adblock Plus is enabled, ClearBlock should show a warning and offer to pause only itself; it must not modify Adblock Plus.

Do not treat the unit tests as a replacement for these browser checks.
