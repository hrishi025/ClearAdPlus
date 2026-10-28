# Changelog

All notable changes to Clear Ad Plus will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Amazon Prime Video ad skipping with 8x speed fast-forward
- JioHotstar/JioCinema ad skipping with 16x speed fast-forward
- Platform-specific enable/disable toggles
- Badge showing blocked count on toolbar icon
- Refresh button in popup for quick page reload
- Professional README with badges and social buttons
- Contributing guidelines
- MIT License

### Changed
- Reorganized repository structure
- Moved documentation to docs/ folder
- Moved utility scripts to tools/ folder
- Improved popup UI with Montserrat typography
- Red-themed branding throughout

### Fixed
- Extension context invalidation errors in content scripts
- Performance issues with MutationObserver

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
