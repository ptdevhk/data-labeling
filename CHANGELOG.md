## [0.3.0](https://github.com/ptdevhk/data-labeling/compare/v0.2.6...v0.3.0) (2025-12-19)

### Features

* Add annotation list panel and improve annotation state ([c686c67](https://github.com/ptdevhk/data-labeling/commit/c686c673ad3a35fed6ab580cafc1dba13ec9ff3d))
* Add export dialog and annotation export formats ([c7cc5c2](https://github.com/ptdevhk/data-labeling/commit/c7cc5c223c31b970d221d8ba134c81bfe0ab1e4a))
* **annotation:** add save and export functionality to annotation workspace ([508b8ea](https://github.com/ptdevhk/data-labeling/commit/508b8eaf13c38891814a11773cde7ea5428ec79f))
* configure bun workspaces ([05eafa7](https://github.com/ptdevhk/data-labeling/commit/05eafa791b7743e975cd37a38cd9ad2078ac2f56))
* Implement dual zoom modes for annotation canvas ([1780e15](https://github.com/ptdevhk/data-labeling/commit/1780e15a229ea66c1ed6691c6cea07f6590327eb))

### Bug Fixes

* Add MUI and common UI/hooks components to frontend ([bd59944](https://github.com/ptdevhk/data-labeling/commit/bd59944a017a551b40b93b6c1b8515500e6e684c))
* Add tooltips and fit width option to annotation toolbar ([da35eae](https://github.com/ptdevhk/data-labeling/commit/da35eaeaf0cbd8064242ff64f3995bd7f34b778b))
* address build configuration issues during migration ([2c5bfbe](https://github.com/ptdevhk/data-labeling/commit/2c5bfbe6699c404042eb22cbc553e04ea146af31))
* **annotation:** reset zoom on fullscreen exit and preserve aspect ratio ([d7688a2](https://github.com/ptdevhk/data-labeling/commit/d7688a2f299a1b963aebab4b30f887248f97ccb3))
* Downgrade react and react-dom to 18.3.1 and unify imports ([e36a1e3](https://github.com/ptdevhk/data-labeling/commit/e36a1e34c4c7e37637d9df0183320f41c4dc97f6))
* Improve annotation UI layout and hover behavior ([310b27d](https://github.com/ptdevhk/data-labeling/commit/310b27d769f1e9614cf936d62916f98d7000fb55))
* Improve canvas pan constraints and selection handling ([648313c](https://github.com/ptdevhk/data-labeling/commit/648313ca9a8d3ef660feb9e433cb303473174e16))
* Improve canvas zoom, panning, and container handling ([ef24227](https://github.com/ptdevhk/data-labeling/commit/ef2422700d7cc6a6c5b30ee1fd04d8c13e520be4))
* Improve settings page with theme and language handling ([fd96627](https://github.com/ptdevhk/data-labeling/commit/fd9662711ad10ecca5e0365c100b96ae861cda46))
* isolate semantic-release install to avoid workspace:* conflicts ([0b47951](https://github.com/ptdevhk/data-labeling/commit/0b47951fc1c57f6d7b2390eaf7a380fb74208ad2))
* lint ([546f3d5](https://github.com/ptdevhk/data-labeling/commit/546f3d58933abc8e46834b62808bde5bce33d274))
* Refactor header menus to use Semi UI Dropdown ([c547be2](https://github.com/ptdevhk/data-labeling/commit/c547be2d82df09019c190258d4b6b7cd145712fe))
* Refactor Sidebar navigation and update i18n strings ([2a2d160](https://github.com/ptdevhk/data-labeling/commit/2a2d160ef64693ce38d5f5a7eb2ae621df04ab13))
* Refine dropdown and button styles in Header, update CSS reset ([6dcf086](https://github.com/ptdevhk/data-labeling/commit/6dcf0862fa364f6fcf2fcb6f80b3bd2fcc1e4886))
* Replace external image/video URLs with local assets ([0a815db](https://github.com/ptdevhk/data-labeling/commit/0a815db82457b2a9c9260e4dfeda369e570bdfe5))
* resolve multiple React instances in dev mode ([942a2ad](https://github.com/ptdevhk/data-labeling/commit/942a2ad0b2a7915a76d462e140034edbaad6bdab))
* Update annotation selectability and color logic ([a2c0c08](https://github.com/ptdevhk/data-labeling/commit/a2c0c08ab8d5490beba8284be2d1d419d5e17104))
* update backend static path for monorepo structure ([7f722c8](https://github.com/ptdevhk/data-labeling/commit/7f722c815d635ad20e1929e56eac62a2b2f85e00))
* Update dependencies and lockfile ([f35a6d1](https://github.com/ptdevhk/data-labeling/commit/f35a6d1619f28d32c07b5682dd65df6748df63bd))
* Update dependencies in web/package.json ([62364ac](https://github.com/ptdevhk/data-labeling/commit/62364ac30e4b360c25b29641f697704f0dc6bae2))
* use hoisted linker for Bun workspaces ([8357648](https://github.com/ptdevhk/data-labeling/commit/83576486241bd8355adfc14b4e292e36247db652))
* use temp directory for semantic-release to avoid invalid package name ([d4eab14](https://github.com/ptdevhk/data-labeling/commit/d4eab14bff19767ccce1ce5be6b230c2b21b2d41))

### Documentation

* AGENTS.md ([74fb986](https://github.com/ptdevhk/data-labeling/commit/74fb986982084d4095d03ea2cde3f92a6b9b8c67))
* PROJECT.md ([423c779](https://github.com/ptdevhk/data-labeling/commit/423c779d3d386915d42705714d8a10c9e9fd39f0))
* PROJECT.md ([413e182](https://github.com/ptdevhk/data-labeling/commit/413e1825a92e4941671a3acfeed55905d8497f73))
* Replace CLAUDE.md file with symlink to AGENTS.md ([31a15ca](https://github.com/ptdevhk/data-labeling/commit/31a15cae48b7023f631323911d6698ee2ea73dc1))
* update documentation for annotation save/export feature ([69ca693](https://github.com/ptdevhk/data-labeling/commit/69ca693a85916a4fe6cdd0feb2b4180940f45bbc))
* update documentation for monorepo structure ([3fb2ed5](https://github.com/ptdevhk/data-labeling/commit/3fb2ed5b31973ac4155ff66021271c175ae14b02))
* update PROJECT.md AGENTS.md ([85f124a](https://github.com/ptdevhk/data-labeling/commit/85f124aa4b2a48ede6e24184a5068ad1dde0ea14))

### Code Refactoring

* move web to apps/web ([03a3df9](https://github.com/ptdevhk/data-labeling/commit/03a3df913e77a4023d65b29de8947a94246fec56))
* Refactor UI panels and improve i18n for annotation tools ([67d2e7a](https://github.com/ptdevhk/data-labeling/commit/67d2e7a6fde90aaf84159eada1360387b73bf527))
* update build configuration for monorepo ([f5fa1a0](https://github.com/ptdevhk/data-labeling/commit/f5fa1a0738da1e3847318123cc53e98ff3624bf9))
* Update docs for new CardPro layout and architecture ([326b674](https://github.com/ptdevhk/data-labeling/commit/326b674b4eb7017c85078fadee0df4011fcda7b3))

## [0.2.6](https://github.com/ptdevhk/data-labeling/compare/v0.2.5...v0.2.6) (2025-12-05)

### Bug Fixes

* Improve deploy-preview checkout logic and permissions ([5788a54](https://github.com/ptdevhk/data-labeling/commit/5788a544ba141e4ecf0d4c1b5971628ab8cad46a))

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
