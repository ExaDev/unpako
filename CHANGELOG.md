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
