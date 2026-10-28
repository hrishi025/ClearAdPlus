# Contributing to Clear Ad Plus

Thank you for your interest in contributing to Clear Ad Plus! We welcome contributions from everyone.

## 🤝 How to Contribute

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find that the problem has already been reported.

When creating a bug report, please include:
- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Your browser version and OS
- Extension version

### Suggesting Enhancements

Enhancement suggestions are welcome! Please:
- Use a clear and descriptive title
- Provide a detailed description of the proposed enhancement
- Explain why this enhancement would be useful
- If possible, include mockups or examples

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Add tests** if applicable
5. **Ensure all tests pass** (`npm test`)
6. **Commit your changes** with a clear message
7. **Push to your branch** (`git push origin feature/amazing-feature`)
8. **Open a Pull Request**

### Pull Request Guidelines

- **Keep it small**: Smaller PRs are easier to review and merge
- **Write descriptive commit messages**: Follow conventional commit format
- **Add tests**: Ensure new features have test coverage
- **Update documentation**: Update README and docs as needed
- **Follow the code style**: Match the existing code formatting

## 📋 Development Setup

### Prerequisites
- Node.js 16+
- Chrome 127+ (for Manifest V3 support)
- Git

### Setup
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/ClearAdPlus.git
cd ClearAdPlus

# Install dependencies
npm install

# Run tests
npm test
```

### Building
```bash
# Build static ruleset (optional)
node tools/build-static-ruleset.mjs --input filters.txt --output rules/custom.json
```

## 🏗️ Project Structure

```
clearblock/
├── src/
│   ├── background/      # Service worker and DNR logic
│   ├── content/         # Content scripts for different platforms
│   ├── popup/           # Popup UI
│   └── shared/          # Shared utilities
├── icons/              # Extension icons
├── rules/              # DNR rules
├── test/               # Unit tests
├── tools/              # Build and utility scripts
├── docs/               # Documentation
├── manifest.json       # Extension manifest
├── package.json        # NPM configuration
└── README.md           # Project documentation
```

## 🧪 Testing

### Running Tests
```bash
npm test
```

### Manual Testing
1. Load the extension in Chrome (Developer mode → Load unpacked)
2. Test core functionality:
   - Network blocking
   - Cosmetic filtering
   - Platform-specific ad skipping
   - Popup UI
   - Settings persistence

## 📝 Code Style

- Use ES6+ features
- Follow existing code formatting
- Add comments for complex logic
- Use meaningful variable and function names
- Keep functions small and focused

## 📖 Documentation

- Update README.md for user-facing changes
- Update docs/ for technical documentation
- Add inline comments for complex code
- Keep documentation up to date

## 🎯 Areas for Contribution

We're particularly interested in contributions in these areas:
- **Additional Platform Support**: Add ad skipping for more streaming services
- **Filter List Support**: Support for more filter list formats
- **UI Improvements**: Enhance the popup UI and user experience
- **Performance**: Optimize ad blocking performance
- **Testing**: Add more comprehensive test coverage
- **Documentation**: Improve documentation and examples

## 🐛 Bug Fixing

When fixing bugs:
1. Create an issue describing the bug
2. Reference the issue in your PR
3. Add a test case if possible
4. Explain the fix in the PR description

## 💡 Feature Requests

When proposing new features:
1. Open an issue to discuss the feature first
2. Get feedback from maintainers
3. Implement the feature in a PR
4. Reference the original issue

## 📜 Code of Conduct

### Our Pledge

In the interest of fostering an open and welcoming environment, we pledge to make participation in our project and our community a harassment-free experience for everyone.

### Our Standards

Examples of behavior that contributes to a positive environment:
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

### Unacceptable Behavior

Examples of unacceptable behavior:
- The use of sexualized language or imagery
- Trolling, insulting/derogatory comments, or personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other unethical or unprofessional conduct

## 📧 Contact

If you have questions about contributing, feel free to:
- Open a discussion on GitHub
- Contact maintainers via GitHub issues

Thank you for contributing to Clear Ad Plus! 🎉
