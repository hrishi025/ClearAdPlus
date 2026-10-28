# Security Policy

## Supported Versions

Currently, only the latest version of Clear Ad Plus is supported with security updates.

## Reporting a Vulnerability

If you discover a security vulnerability in Clear Ad Plus, please report it responsibly.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please send an email to: security@clearadplus.com

Include the following information:
- A description of the vulnerability
- Steps to reproduce the vulnerability
- Affected versions
- Potential impact
- If possible, a suggested fix or mitigation

### What to Expect

- We will acknowledge receipt of your report within 48 hours
- We will provide a detailed response within 7 days
- We will work with you to understand and resolve the issue
- We will coordinate a release date with you

### Disclosure Policy

- We will disclose vulnerabilities only after a fix is released
- We will credit you in the release notes (if you wish)
- We will keep you informed throughout the process

## Security Best Practices

### For Users

1. **Keep Updated**: Always use the latest version of the extension
2. **Source Only**: Install from official sources (Chrome Web Store or this repository)
3. **Review Permissions**: Only grant necessary permissions
4. **Report Issues**: Report suspicious behavior immediately

### For Developers

1. **Code Review**: All code changes should be reviewed
2. **Dependencies**: Keep dependencies updated
3. **Testing**: Test for security vulnerabilities
4. **No Secrets**: Never commit secrets or API keys

## Known Security Considerations

### Extension Permissions

Clear Ad Plus requests the following permissions:
- `declarativeNetRequest`: For blocking network requests
- `storage`: For storing settings and filter lists
- `tabs`: For accessing tab information
- `alarms`: For scheduling filter list updates
- Host permissions: `<all_urls>` for blocking on all websites

### Data Collection

Clear Ad Plus does NOT:
- Collect personal data
- Send data to external servers
- Track user behavior
- Include telemetry or analytics

All data is stored locally in Chrome's storage API.

### Filter Lists

Filter lists are downloaded from:
- EasyList (default)
- Custom URLs (user-configured)

We recommend:
- Only use trusted filter list sources
- Review filter list URLs before adding
- Keep filter lists updated

## Security Updates

Security updates will be:
- Released as soon as possible
- Clearly marked in the changelog
- Available through Chrome Web Store auto-updates

## Acknowledgments

We thank all security researchers who help keep Clear Ad Plus secure.
