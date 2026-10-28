# Changelog

All notable changes to Clear Ad Plus will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-10-28

### Added
- Amazon Prime Video ad skipping with 8x speed fast-forward and auto-mute
- JioHotstar/JioCinema ad skipping with 16x speed fast-forward and auto-mute
- Platform-specific enable/disable toggles (default: enabled)
- Platform logos (YouTube, Hotstar, Prime Video) in popup
- Supported platforms section in popup
- Dynamic refresh buttons that appear when settings change
- Badge showing blocked count on toolbar icon
- Professional README with badges and social buttons
- Contributing guidelines and issue templates
- MIT License
- GitHub issue templates (bug report, feature request)
- Security policy documentation
- Social footer with GitHub star, Buy me a coffee, and feedback links
- "Built with ❤️ by @hrishi025" attribution

### Changed
- Updated version to 1.0.0 (first stable release)
- Reorganized repository structure (docs/, tools/, .github/)
- Improved popup UI with Montserrat typography
- Red-themed branding throughout
- Enhanced toggle switches with better animations
- Improved statistics with animated counters
- Instant UI response for all toggle changes
- Removed subscription settings from UI (kept in background)
- Fixed logo spacing to prevent clipping
- Added proper hostname error handling for chrome:// pages

### Fixed
- Extension context invalidation errors in content scripts
- Performance issues with MutationObserver (removed for speed)
- Duplicate refresh sections in popup
- Slow refresh button appearance (now instant)
- Hostname errors on special pages (chrome://, edge://)

### Removed
- Manual subscription settings from popup UI
- Extension conflict detection UI
- Rule status display from popup
- Metadata folder from git (build artifacts)

## [0.1.0] - 2026-10-28

### Added
- Initial release
- Core ad blocking via Declarative Net Request
- Cosmetic filtering for element hiding
- YouTube ad skipping
- Filter list support (EasyList)
- Per-site allowlist functionality
- Blocked request statistics
- Modern red-themed UI
- Manifest V3 compliance

### Features
- Network-level blocking
- Element hiding
- Global enable/disable toggle
- Per-site allowlist
- Statistics tracking
- Subscription management
- YouTube ad skipping
