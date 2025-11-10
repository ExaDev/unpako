# [1.6.0](https://github.com/ExaDev/unpako/compare/v1.5.0...v1.6.0) (2025-11-10)


### Bug Fixes

* correct Playwright base URL for production preview server ([3c4313c](https://github.com/ExaDev/unpako/commit/3c4313c0b03a3203b4fa8dc7b153647622264c9b))
* revert Playwright to use dev server for better reliability ([2f2bbf5](https://github.com/ExaDev/unpako/commit/2f2bbf57d84d041ea5c3dbf2eefeb9c27621f159))
* update e2e test selectors for changed placeholder text ([770cf8f](https://github.com/ExaDev/unpako/commit/770cf8f9d41b6018e9f90bcf31e19927a923d779))
* update e2e tests for new button labels in full-viewport layout ([6c94959](https://github.com/ExaDev/unpako/commit/6c9495981b51fc363e2ffc615f8a431a6a7c1621))


### Features

* enhance editor with professional typography and full-page experience ([4066e8b](https://github.com/ExaDev/unpako/commit/4066e8b69a80b414fa8f7e8705b42c533b8563f8))
* transform main layout to full-viewport design ([3821b22](https://github.com/ExaDev/unpako/commit/3821b22fcabdbff255cb731cb313def8b6bed454))


### Performance Improvements

* optimize e2e test timeouts for faster execution ([0b4b0a0](https://github.com/ExaDev/unpako/commit/0b4b0a07f83cfba5f7c914a5b85ce7e22d065721))

# [1.5.0](https://github.com/ExaDev/unpako/compare/v1.4.0...v1.5.0) (2025-11-10)


### Features

* add Turborepo configuration for task orchestration ([5b03922](https://github.com/ExaDev/unpako/commit/5b03922aa144e1dff3fa0d1cb2c9858dea516dd8))
* integrate Turborepo for task orchestration and caching ([321975f](https://github.com/ExaDev/unpako/commit/321975ff89fa01ad70099e2b51633faf88a409a5))

# [1.4.0](https://github.com/ExaDev/unpako/compare/v1.3.1...v1.4.0) (2025-11-10)


### Bug Fixes

* **ci:** enable releases without disabled staging tests ([f5fb5be](https://github.com/ExaDev/unpako/commit/f5fb5bea51140132e3e10cbf69d588940afee9f4))
* **ci:** resolve staging E2E tests cache key issue ([bf682ab](https://github.com/ExaDev/unpako/commit/bf682aba20c66fac479bd6216a72cc7bb15c393e))
* **e2e:** correct staging URL from 404 to actual deployment ([4668f1c](https://github.com/ExaDev/unpako/commit/4668f1cdfe981370ea8325b59187a437723751a8))
* **e2e:** increase global test timeout for staging tests ([91d4421](https://github.com/ExaDev/unpako/commit/91d442135f2f3a4cfe6f53d480a33d9a9d645353))
* **e2e:** increase timeout for staging tests ([ed1b96b](https://github.com/ExaDev/unpako/commit/ed1b96bbb3ea5fe1106510e0cb1bc26f78eaae04))
* **e2e:** increase timeout for staging tests to 60s ([dfb77f3](https://github.com/ExaDev/unpako/commit/dfb77f3bf989b671fe3fe22d088cfd802ddcd44a))
* **e2e:** replace unreliable theme selector with stable CSS selector ([87e067b](https://github.com/ExaDev/unpako/commit/87e067b36bf60f4608f803ae217b74007a43fffc))
* prevent duplicate file versions during page refresh ([94646e6](https://github.com/ExaDev/unpako/commit/94646e66059bcff72ffca580339d688ecdef3782))
* resolve E2E test timeout in CI ([c2486f6](https://github.com/ExaDev/unpako/commit/c2486f6c6bdc3cd9adab4cbd01e9fef07a8b7cd7))


### Features

* **ci:** implement staging deployment pipeline with automated rollback ([f2ae204](https://github.com/ExaDev/unpako/commit/f2ae20441df2643f9cf56ce9964bf9303f04f599))


### Reverts

* **ci:** disable staging E2E tests and rollback selector changes ([efc66a6](https://github.com/ExaDev/unpako/commit/efc66a6c9b75f9c0f68f9209996293b4ad32b6ff))

## [1.3.1](https://github.com/ExaDev/unpako/compare/v1.3.0...v1.3.1) (2025-11-09)


### Bug Fixes

* prevent infinite version creation on file selection ([376afa7](https://github.com/ExaDev/unpako/commit/376afa7265df0cff1c012e3b10d52e9a10194bec))
* resolve E2E test logic and timeout issues ([8f3aa49](https://github.com/ExaDev/unpako/commit/8f3aa49c3563eacbf9d7e1d703155ecca431b93b))
* resolve E2E test selector and timing issues ([cf01d93](https://github.com/ExaDev/unpako/commit/cf01d93b6e8d6435b3cb6893c9961a4e9cfff385))
* resolve ESLint template literal formatting issues ([737883a](https://github.com/ExaDev/unpako/commit/737883a71495116f1d8984e16c91830ee4496d13))
* resolve TypeScript errors in E2E test files ([72d53ff](https://github.com/ExaDev/unpako/commit/72d53fffcc5b7004c0a4576acf55ac4fd3880e69))

# [1.3.0](https://github.com/ExaDev/unpako/compare/v1.2.1...v1.3.0) (2025-11-08)


### Features

* add version number and release link to footer ([204995f](https://github.com/ExaDev/unpako/commit/204995fdae05bac1dfb038456f776dae0f85c178))

## [1.2.1](https://github.com/ExaDev/unpako/compare/v1.2.0...v1.2.1) (2025-11-08)


### Bug Fixes

* move loadVersions declaration before useEffect to resolve build error ([d441d84](https://github.com/ExaDev/unpako/commit/d441d847a3f3c01b6fd0e8dd89aef1bf1959e39a))
* resolve CI warnings ([d96e182](https://github.com/ExaDev/unpako/commit/d96e1828644294a7a96cd735d2e7608939200b69))

# [1.2.0](https://github.com/ExaDev/unpako/compare/v1.1.2...v1.2.0) (2025-11-08)


### Bug Fixes

* **db:** resolve type issues in database migration ([0064259](https://github.com/ExaDev/unpako/commit/0064259541c02b01de49f0107736eaa27ea94b78))


### Features

* integrate path-based file identification and version history UI ([16e2a2f](https://github.com/ExaDev/unpako/commit/16e2a2f43b2f327f6de005237752c9d792c6a64c))
* **storage:** implement FileVersionStorage with path-based IDs ([b53d63c](https://github.com/ExaDev/unpako/commit/b53d63c41d3759c672b9e7c851d2ab86d95d5fa4))
* **ui:** add VersionHistoryModal for file version management ([7b2c2c2](https://github.com/ExaDev/unpako/commit/7b2c2c2771959b89d0d1bf9f455fbbdd8419ae5e))

## [1.1.2](https://github.com/ExaDev/unpako/compare/v1.1.1...v1.1.2) (2025-11-08)


### Bug Fixes

* reduce coverage artifact retention to 14 days ([489c46e](https://github.com/ExaDev/unpako/commit/489c46e5253a102e44b670624b6a961c8f5523a0))
* resolve CI warnings and improve code quality ([c13a1a5](https://github.com/ExaDev/unpako/commit/c13a1a5e5c226e56fed50b44e7b7d7d48c8167f1))
* **storage:** remove obsolete type validation from import methods ([4a25d52](https://github.com/ExaDev/unpako/commit/4a25d52df5e84bdb14dc2fdb250d3957c2d3928d))
* **ui:** prevent filetree data corruption during search operations ([db23804](https://github.com/ExaDev/unpako/commit/db238049a44e64532d8868c26e7366f700257857))

## [1.1.1](https://github.com/ExaDev/unpako/compare/v1.1.0...v1.1.1) (2025-11-08)

# [1.1.0](https://github.com/ExaDev/unpako/compare/v1.0.1...v1.1.0) (2025-11-08)


### Features

* **components:** add file tree sidebar components ([ef5edb6](https://github.com/ExaDev/unpako/commit/ef5edb6652b810ae362e7c90df60d4928a2df866))
* **components:** add FileEditor with automatic URL updates ([df305f9](https://github.com/ExaDev/unpako/commit/df305f9fbdd006a4826ec875a450af6a553ed19e))
* **utils:** enhance storage utilities and compression functions ([11c9c9d](https://github.com/ExaDev/unpako/commit/11c9c9dc1d07d8de5bc4b429d4fbd39e38534deb))

## [1.0.1](https://github.com/ExaDev/unpako/compare/v1.0.0...v1.0.1) (2025-11-08)

# 1.0.0 (2025-11-08)


### Bug Fixes

* add MantineProvider to resolve component rendering error ([c782053](https://github.com/ExaDev/unpako/commit/c782053faa5b3af50c636b9be1a0451803328e61))
* **ci:** correct Playwright cache key path ([dcfc21e](https://github.com/ExaDev/unpako/commit/dcfc21efc47d9cd2487e18779ab6b3d86c9291a6))
* convert Jest syntax to Vitest in unit tests ([1a3275a](https://github.com/ExaDev/unpako/commit/1a3275ac011353a7807f290cd32675ffd439e7f2))
* correct Playwright cache key in CI workflow ([e09a984](https://github.com/ExaDev/unpako/commit/e09a9844b4e03e08e7adc701e69bc01ab3d0f221))
* **husky:** remove deprecated shebang and husky.sh from commit-msg hook ([1efbf34](https://github.com/ExaDev/unpako/commit/1efbf340b4698fd56ee3e378aa84cf2737fd9fbc))
* rename .releaserc.js to .releaserc.cjs for ES module compatibility ([7934ad1](https://github.com/ExaDev/unpako/commit/7934ad120a449b7324280dc294fe8d3b93e4631a))
* resolve build and test issues for Mantine v8 compatibility ([021e801](https://github.com/ExaDev/unpako/commit/021e8019d74a2eb66297b3cab8c34bf5cfa32195))
* resolve TypeScript errors and build issues ([fdd78a6](https://github.com/ExaDev/unpako/commit/fdd78a637aa428d6d5fc8e44cd316ba905076c68))
* **storage:** resolve TypeScript compatibility in legacy storage ([84a6123](https://github.com/ExaDev/unpako/commit/84a61232d28c47369488550dd9247fe8bb9d2712))
* **styles:** add missing Mantine core styles import ([2001ffb](https://github.com/ExaDev/unpako/commit/2001ffb735feb214e54a307c2becd9ccee308275))


### Features

* add AppContent component with Mantaine integration ([5b97d6f](https://github.com/ExaDev/unpako/commit/5b97d6f913c20ffd627d4acc2977336407ba8f39))
* add CodeHighlightAdapterProvider to app root ([71ccd2c](https://github.com/ExaDev/unpako/commit/71ccd2c6cc93dddac6981139c28e693dc0b0e84f))
* add core dependencies with pnpm ([18a52b1](https://github.com/ExaDev/unpako/commit/18a52b15ced7f0335385b2fa2870c83a9e32b3b2))
* add CSS-in-JS styling with Vanilla Extract ([d56eff1](https://github.com/ExaDev/unpako/commit/d56eff18c138b5d58dbf5289f1d4d334f4ed1a1f))
* add language detection utility for syntax highlighting ([826de31](https://github.com/ExaDev/unpako/commit/826de31841331d3ab8c324c9b6b4168225efc8e7))
* add shiki dependency for syntax highlighting ([56f982f](https://github.com/ExaDev/unpako/commit/56f982f0e2fa9c0a25522c2518b0fcd0d355f6cc))
* add syntax highlighting toggle to text editor ([8e4c6e8](https://github.com/ExaDev/unpako/commit/8e4c6e857015db4cfe953cf4651efedae8beb35f))
* add ThemeContext with 3-state theme system ([16e1298](https://github.com/ExaDev/unpako/commit/16e1298e663bc97f1836dc879ea13e81b37fcaa7))
* add ThemeToggle component with icon system ([eab0d53](https://github.com/ExaDev/unpako/commit/eab0d5324291a85b07e60367097f7665e0290b42))
* add useTheme hook for theme context access ([ddc37c5](https://github.com/ExaDev/unpako/commit/ddc37c5e0339299b2730c959ed39a297eb0d23c1))
* **compression:** replace filename with filepath for hierarchy ([b78a20d](https://github.com/ExaDev/unpako/commit/b78a20d491e00c2293ec6d79b5c791691ffeb117))
* configure Vite with PWA and Vanilla Extract ([48f83c2](https://github.com/ExaDev/unpako/commit/48f83c2651db979b756657e19ba9cc5896b44164))
* **db:** migrate schema to support createdAt and modifiedAt ([1bb079f](https://github.com/ExaDev/unpako/commit/1bb079f2209417b71bdb53954ac0b1edbbe8f006))
* implement core file compression utilities ([ba55251](https://github.com/ExaDev/unpako/commit/ba5525147e21e7c01847c7cd2d796ca87cdcca97))
* implement file download component with URL processing ([999af7f](https://github.com/ExaDev/unpako/commit/999af7fbf9629a7d99c07b91f3e0fbae9a903d83))
* implement file upload component with Mantaine UI ([d3d1fe1](https://github.com/ExaDev/unpako/commit/d3d1fe1111a6c357ce68a8f21b48677aa877e7cc))
* implement history storage system ([d82a0c0](https://github.com/ExaDev/unpako/commit/d82a0c0ccfe67bc29c103496ef1a0d94cf31c82c))
* implement history view component with management features ([9e00346](https://github.com/ExaDev/unpako/commit/9e003468e8e2d769826a1b4ae6d55905e6f97c00))
* implement main application with navigation and layout ([ed3b8c7](https://github.com/ExaDev/unpako/commit/ed3b8c714852b3b991b86a78032a22d230241f93))
* **storage:** add Dexie IndexedDB wrapper dependency ([9cf9b47](https://github.com/ExaDev/unpako/commit/9cf9b47631c90e90f7aba0cd22d290efb0b48e5c))
* **storage:** add filepath migration and backward compatibility ([ad848fa](https://github.com/ExaDev/unpako/commit/ad848fa8533cdc01940eed61404d8716dce3e5b7))
* **storage:** create Dexie database configuration and setup ([000ae1c](https://github.com/ExaDev/unpako/commit/000ae1cc3001f42b9dac8bba9b644001651eed7b))
* **storage:** implement Dexie-based async history storage ([dee15b8](https://github.com/ExaDev/unpako/commit/dee15b835b6389529477d8c990e15088e87cfaeb))
* **theme:** implement 3-state theme toggle with system/light/dark modes ([358cfb2](https://github.com/ExaDev/unpako/commit/358cfb2d932a48584c6679fa80580cbbc973a834))
* **theme:** implement 3-state theme toggle with system/light/dark modes ([2b681b8](https://github.com/ExaDev/unpako/commit/2b681b85811f1779790edc0e13de8e8c55a430ce))
* **ui:** add dual timestamp display and sorting options ([bfbcdbf](https://github.com/ExaDev/unpako/commit/bfbcdbf31a87efc6fa3747c58975a54417e4ab59))
* **ui:** implement real-time URL generation and content loading ([12f5d56](https://github.com/ExaDev/unpako/commit/12f5d560f3fe6cec12b201ce870a017d35449a8a))
* **ui:** replace file upload with text compression interface ([f8b7de1](https://github.com/ExaDev/unpako/commit/f8b7de16074032fde46590d88f0c9d804aaaa805))
* **ui:** update components to support filepath input and display ([278b44c](https://github.com/ExaDev/unpako/commit/278b44c6ab96701d67a30dbe22a6549c7dc7553b))


### Performance Improvements

* **e2e:** add Playwright browser caching to CI pipeline ([9fbea0c](https://github.com/ExaDev/unpako/commit/9fbea0c836f0f2d4dbc9c3fd0af104939d2612e1))


### BREAKING CHANGES

* **db:** Database schema migrated from timestamp to createdAt/modifiedAt
