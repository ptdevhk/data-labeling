## [0.2.5](https://github.com/ptdevhk/data-labeling/compare/v0.2.4...v0.2.5) (2025-12-05)

### Bug Fixes

* Prevent deployment with wrong version due to git fetch failures ([4e62e35](https://github.com/ptdevhk/data-labeling/commit/4e62e35439ef802bfc21428a8ab39d503aa6756d))

## [0.2.4](https://github.com/ptdevhk/data-labeling/compare/v0.2.3...v0.2.4) (2025-12-05)

### Bug Fixes

* Improve deployment scripts for private/public repo support ([444d724](https://github.com/ptdevhk/data-labeling/commit/444d7249e257a99e5f78964c3b8cc22fe1f431c0))

## [0.2.3](https://github.com/ptdevhk/data-labeling/compare/v0.2.2...v0.2.3) (2025-12-05)

### Bug Fixes

* Use repository secrets instead of environment secrets ([df1f6d6](https://github.com/ptdevhk/data-labeling/commit/df1f6d6391d777a33498a565845096d596db7a7d))

## [0.2.2](https://github.com/ptdevhk/data-labeling/compare/v0.2.1...v0.2.2) (2025-12-05)

### Bug Fixes

* Add deploy key setup script and update deployment docs ([d2632d2](https://github.com/ptdevhk/data-labeling/commit/d2632d2d366987fce44914d69dad2bff788d5ed7))

## [0.2.1](https://github.com/ptdevhk/data-labeling/compare/v0.2.0...v0.2.1) (2025-12-05)

### Bug Fixes

* Add deployment automation scripts and workflows ([11dcfc9](https://github.com/ptdevhk/data-labeling/commit/11dcfc94c641b7a81833022f6da8adf69de66c6b))

## [0.2.0](https://github.com/ptdevhk/data-labeling/compare/v0.1.3...v0.2.0) (2025-10-23)

### Features

* Add annotation context and integrate with canvas ([77e1d43](https://github.com/ptdevhk/data-labeling/commit/77e1d439a1704944163c6dd3c553a56176e0d254))
* Add label assignment dialog and shape editing ([bdd07c6](https://github.com/ptdevhk/data-labeling/commit/bdd07c69741f1bf59b9e6d0befa7ec46d02becb1))

### Documentation

* update docs path ([ac66dad](https://github.com/ptdevhk/data-labeling/commit/ac66dad4fb2d21323fa69dfeefa4c1c28c8ca41c))

## [0.1.3](https://github.com/ptdevhk/data-labeling/compare/v0.1.2...v0.1.3) (2025-10-21)

### Code Refactoring

* Update routes to use /console/* namespace ([02a97c0](https://github.com/ptdevhk/data-labeling/commit/02a97c031d1811a7c6331436b41b78e410904f49))

## [0.1.2](https://github.com/ptdevhk/data-labeling/compare/v0.1.1...v0.1.2) (2025-10-21)

### Documentation

* AGENTS.md ([387f121](https://github.com/ptdevhk/data-labeling/commit/387f121f453361b2d371bec60d5879b43fe1f185))
* AGENTS.md [skip ci] ([c45901c](https://github.com/ptdevhk/data-labeling/commit/c45901cdb298793df5a4a737dc49250adee46ab5))

### Code Refactoring

* Add footer component and enhance header UI ([ff6611b](https://github.com/ptdevhk/data-labeling/commit/ff6611b7229737f09648c0afd9de5551a1006469))
* Refactor dashboard to console, improve theme and layout ([debffda](https://github.com/ptdevhk/data-labeling/commit/debffda8d958c190b167ef3066c9a525e5f51910))
* Refactor layout to Console page, improve sidebar/header ([fc1e98c](https://github.com/ptdevhk/data-labeling/commit/fc1e98c0ada3525d876e8366baecf3b1290539c7))
* Revamp Console page layout and styles ([937838d](https://github.com/ptdevhk/data-labeling/commit/937838d4efbf2c54b40fc50732d7f852bc94edfd))

## [0.1.1](https://github.com/ptdevhk/data-labeling/compare/v0.1.0...v0.1.1) (2025-10-20)

### Bug Fixes

* Integrate Tailwind CSS v3 with Semi Design ([7fac8f6](https://github.com/ptdevhk/data-labeling/commit/7fac8f6b9af0b6035babc187e28c88873b25b05c))

## [0.1.0](https://github.com/ptdevhk/data-labeling/compare/v0.0.0...v0.1.0) (2025-10-16)

### Features

* initialize project ([3ee2731](https://github.com/ptdevhk/data-labeling/commit/3ee2731181ef800f897f809d19808e57ba6ac613))
* initialize v0.1.0 release ([cffca10](https://github.com/ptdevhk/data-labeling/commit/cffca10158dc657386ddbbde9003d2a3b8813329))
* initialize v0.1.0 release ([2025f11](https://github.com/ptdevhk/data-labeling/commit/2025f11e7ee2f49239386c43f38a800654575436))
* update ([033aefc](https://github.com/ptdevhk/data-labeling/commit/033aefc72b46dc57f416e48bc9f660abc7c2d799))

### Documentation

* update ([8111c02](https://github.com/ptdevhk/data-labeling/commit/8111c025caf9cb8dd29d38ee0cbd8e7bc8d51efa))
* update docs ([c7420d3](https://github.com/ptdevhk/data-labeling/commit/c7420d3b84fcab3615d813077869cb3382f03f3d))

## [Unreleased]

### Added
- Initial project setup with React frontend and FastAPI backend
- Annotation canvas with rectangle, circle, polygon, line, and select tools
- Theme switching (light/dark mode)
- Internationalization support (EN/VI/ZH)
- JWT authentication
- Docker Compose deployment setup

### Changed
- N/A

### Deprecated
- N/A

### Removed
- N/A

### Fixed
- N/A

### Security
- N/A

---

## [0.1.0] - 2025-10-15

### Added
- Initial release of data-labeling tool
- Web-based image annotation interface
- FastAPI backend with JWT authentication
- React 18 frontend with Semi Design UI
- Fabric.js canvas for annotations
- Basic CRUD operations for projects and datasets
- Docker deployment configuration
- Automated testing and linting setup

[Unreleased]: https://github.com/yourusername/data-labeling/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/yourusername/data-labeling/releases/tag/v0.1.0
