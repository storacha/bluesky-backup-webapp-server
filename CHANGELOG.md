# Changelog

## [1.12.0](https://github.com/storacha/bluesky-backup-webapp-server/compare/v1.11.0...v1.12.0) (2025-06-12)


### Features

* add Humanode as an option for plan selection ([#215](https://github.com/storacha/bluesky-backup-webapp-server/issues/215)) ([9388807](https://github.com/storacha/bluesky-backup-webapp-server/commit/9388807738efae234a444f3d8e9c88cdc80c5189))
* make the restore dialogs a lot nicer ([#217](https://github.com/storacha/bluesky-backup-webapp-server/issues/217)) ([a2afcc6](https://github.com/storacha/bluesky-backup-webapp-server/commit/a2afcc622e3f99534c6dd47ff42d24d1ad075916))
* put restore behind a feature flag ([#221](https://github.com/storacha/bluesky-backup-webapp-server/issues/221)) ([ac5f57f](https://github.com/storacha/bluesky-backup-webapp-server/commit/ac5f57f92c9684872021e30483d8ee2fb67e5442))


### Bug Fixes

* a few minor tweaks to onboarding ([#219](https://github.com/storacha/bluesky-backup-webapp-server/issues/219)) ([6f0b319](https://github.com/storacha/bluesky-backup-webapp-server/commit/6f0b31939811f6c5c9bcd9c3162886c04b920ff0))
* add empty line to .env.production.local.tpl ([#216](https://github.com/storacha/bluesky-backup-webapp-server/issues/216)) ([7d4a449](https://github.com/storacha/bluesky-backup-webapp-server/commit/7d4a449ad609e341032e4b0334dfda35038902b3))
* assorted changes from feedback from [@alanshaw](https://github.com/alanshaw) ([#214](https://github.com/storacha/bluesky-backup-webapp-server/issues/214)) ([54d8847](https://github.com/storacha/bluesky-backup-webapp-server/commit/54d884781bffa2ccb1b04ea8f9bf1647aaac16b6))
* **deploy:** remove staging replication ([#220](https://github.com/storacha/bluesky-backup-webapp-server/issues/220)) ([436be82](https://github.com/storacha/bluesky-backup-webapp-server/commit/436be82a841c5334fab471ae325b0bdcf401dccb))
* fix env config for template vars ([#218](https://github.com/storacha/bluesky-backup-webapp-server/issues/218)) ([81fbbaf](https://github.com/storacha/bluesky-backup-webapp-server/commit/81fbbafd571c00df1b09a430153191dbbef862b7))
* **ui:** sidebar should not scroll alongside main content ([#212](https://github.com/storacha/bluesky-backup-webapp-server/issues/212)) ([b219412](https://github.com/storacha/bluesky-backup-webapp-server/commit/b219412c6fd8122375ab94beb2e601e283e19a34))

## [1.11.0](https://github.com/storacha/bluesky-backup-webapp-server/compare/v1.10.1...v1.11.0) (2025-06-10)


### Features

* major improvements to the recovery key dialogs ([#210](https://github.com/storacha/bluesky-backup-webapp-server/issues/210)) ([db72e23](https://github.com/storacha/bluesky-backup-webapp-server/commit/db72e235143395647216c59281e3b1a79e77db55))

## [1.10.1](https://github.com/storacha/bluesky-backup-webapp-server/compare/v1.10.0...v1.10.1) (2025-06-06)


### Bug Fixes

* add template script for db tunnel ([#207](https://github.com/storacha/bluesky-backup-webapp-server/issues/207)) ([0d59046](https://github.com/storacha/bluesky-backup-webapp-server/commit/0d59046fa06e0d622216a586f59d30061a26ca8e))

## [1.10.0](https://github.com/storacha/bluesky-backup-webapp-server/compare/v1.9.0...v1.10.0) (2025-06-05)


### Features

* add 'connect new account' button to identities page ([#194](https://github.com/storacha/bluesky-backup-webapp-server/issues/194)) ([83ef1f8](https://github.com/storacha/bluesky-backup-webapp-server/commit/83ef1f8aed2e9bb52d158c035d73adec8f7704f4))
* add a "copy secret" button to the new key dialog ([#203](https://github.com/storacha/bluesky-backup-webapp-server/issues/203)) ([e1ab0f6](https://github.com/storacha/bluesky-backup-webapp-server/commit/e1ab0f648944e0947071fdaeafc100fa5b8915cf))
* add a route to list all archived backups ([#196](https://github.com/storacha/bluesky-backup-webapp-server/issues/196)) ([27a8430](https://github.com/storacha/bluesky-backup-webapp-server/commit/27a8430dd9c55bf885ae120712a35dde687e6bc3))
* add ability to archive backups ([#170](https://github.com/storacha/bluesky-backup-webapp-server/issues/170)) ([3877bd5](https://github.com/storacha/bluesky-backup-webapp-server/commit/3877bd5faac93ec998383a06ef168942f26dd295))
* add identity reconnection flow ([#178](https://github.com/storacha/bluesky-backup-webapp-server/issues/178)) ([5c7a225](https://github.com/storacha/bluesky-backup-webapp-server/commit/5c7a2252b4b14c4d8f849c18a36a7e458cad4544))
* add x-client header ([#193](https://github.com/storacha/bluesky-backup-webapp-server/issues/193)) ([de3aef0](https://github.com/storacha/bluesky-backup-webapp-server/commit/de3aef0cc940efd4676fd15d116962f194f5d72b))
* delete backup data ([#201](https://github.com/storacha/bluesky-backup-webapp-server/issues/201)) ([18bda3d](https://github.com/storacha/bluesky-backup-webapp-server/commit/18bda3d6b6a7bcf60fe06a40b032919ab7828fe8))
* disable identity transfer for now ([#202](https://github.com/storacha/bluesky-backup-webapp-server/issues/202)) ([8c8915d](https://github.com/storacha/bluesky-backup-webapp-server/commit/8c8915d4bf74d7fe80eeb8b953ef5767d9cb6e45))
* explainers and mobile improvements ([#204](https://github.com/storacha/bluesky-backup-webapp-server/issues/204)) ([190a6c2](https://github.com/storacha/bluesky-backup-webapp-server/commit/190a6c2ccf2c7e9434f329e5e86023c6065144d0))
* Handle delegation expiration ([0336093](https://github.com/storacha/bluesky-backup-webapp-server/commit/03360932307d7ef270333af8e033bc05581fa751))
* recovery key flow polish ([#198](https://github.com/storacha/bluesky-backup-webapp-server/issues/198)) ([5f6653a](https://github.com/storacha/bluesky-backup-webapp-server/commit/5f6653aa9a9aa2fbc6825be984a24f18507a3384))


### Bug Fixes

* pagination issue in the blobs explorer ([#206](https://github.com/storacha/bluesky-backup-webapp-server/issues/206)) ([6bed8e8](https://github.com/storacha/bluesky-backup-webapp-server/commit/6bed8e85292d16365327d9cee5130a29894b70ff))
* **ui:** remove resizable panels on mobile ([#197](https://github.com/storacha/bluesky-backup-webapp-server/issues/197)) ([02546ad](https://github.com/storacha/bluesky-backup-webapp-server/commit/02546adb14ae3db5a27d1f04a17787e984207d35))

## [1.9.0](https://github.com/storacha/bluesky-backup-webapp-server/compare/v1.8.0...v1.9.0) (2025-05-29)


### Features

* Backups can be paused ([313199a](https://github.com/storacha/bluesky-backup-webapp-server/commit/313199a299ff2232944f7c6173cd9ca13be4695f))
* Footer sticks to bottom of viewport ([#185](https://github.com/storacha/bluesky-backup-webapp-server/issues/185)) ([ac4186b](https://github.com/storacha/bluesky-backup-webapp-server/commit/ac4186bc2a4271fb7ad4b05066c61a6e1c452907))
* Use blue wordlogo ([79bb32c](https://github.com/storacha/bluesky-backup-webapp-server/commit/79bb32cf859b3626616e3b63218dd7138a431382))
* Use blue wordlogo ([49a12ed](https://github.com/storacha/bluesky-backup-webapp-server/commit/49a12ed4f27b43c5b3a80160a74ada7d1db886b9))


### Bug Fixes

* add disable switch color ([#184](https://github.com/storacha/bluesky-backup-webapp-server/issues/184)) ([2ea9e01](https://github.com/storacha/bluesky-backup-webapp-server/commit/2ea9e014aebd729bd63e0054653748d9a39af682))
* use client from authenticator in space creator ([#192](https://github.com/storacha/bluesky-backup-webapp-server/issues/192)) ([add571b](https://github.com/storacha/bluesky-backup-webapp-server/commit/add571ba71e5aa72f614fd72120d49c9d1218703))

## [1.8.0](https://github.com/storacha/bluesky-backup-webapp-server/compare/v1.7.1...v1.8.0) (2025-05-22)


### Features

* Accounts are required to create a backup ([0d562b7](https://github.com/storacha/bluesky-backup-webapp-server/commit/0d562b7ba57469fe6d24fd4ad7a35562646afa6a))
* Accounts are required to create a backup ([8c78b1c](https://github.com/storacha/bluesky-backup-webapp-server/commit/8c78b1c5c05c3fbe1f5055d8ef09b4bd2d163108))
* add ability to edit backup names ([c5d5ace](https://github.com/storacha/bluesky-backup-webapp-server/commit/c5d5acea4f4bfebc23c6b48c801e60052ffd7edf))
* Add avatar and spinner to Identities ([#164](https://github.com/storacha/bluesky-backup-webapp-server/issues/164)) ([a1a0eb5](https://github.com/storacha/bluesky-backup-webapp-server/commit/a1a0eb5b960afdb0f379bf342fa33d1d7cd1a6e6))
* add backup name editing functionality ([112ddcf](https://github.com/storacha/bluesky-backup-webapp-server/commit/112ddcf76dcc7ee79da49efb2517c564b9a9d30f))
* Add hover text to `CopyButton` ([87d9c78](https://github.com/storacha/bluesky-backup-webapp-server/commit/87d9c78334dccb5211bf439a7bdb5ccf6ca360ac))
* Add hover text to `CopyButton` ([e50652b](https://github.com/storacha/bluesky-backup-webapp-server/commit/e50652b151f53b64885134948158217da0b95328))
* configure authenticator to send users back to bsky.storage after plan signup ([#179](https://github.com/storacha/bluesky-backup-webapp-server/issues/179)) ([6017b10](https://github.com/storacha/bluesky-backup-webapp-server/commit/6017b101abd70abf38bff28cc12684ba1a5ef2fc))
* list all snapshots ([#171](https://github.com/storacha/bluesky-backup-webapp-server/issues/171)) ([7bfb8d1](https://github.com/storacha/bluesky-backup-webapp-server/commit/7bfb8d15817a67afa11fbdc8dda6936b72b09833))
* Show handles on Bluesky select ([d535d15](https://github.com/storacha/bluesky-backup-webapp-server/commit/d535d15a21091b1bb97c3c52b7c0c04387113d57))


### Bug Fixes

* a few bits of cleanup in the blobs page ([#182](https://github.com/storacha/bluesky-backup-webapp-server/issues/182)) ([561c910](https://github.com/storacha/bluesky-backup-webapp-server/commit/561c910d8819ca1446feac883e3e4864155242b1))
* discarded updateBackupName.ts ([2eb266d](https://github.com/storacha/bluesky-backup-webapp-server/commit/2eb266d686a6a02ef374d37ca63a888d5d2b0a4c))
* Fix broken CSS syntax ([03071e3](https://github.com/storacha/bluesky-backup-webapp-server/commit/03071e30e257d2f8d3851d49898a9296c27919a2))
* formatter ([f9db5f8](https://github.com/storacha/bluesky-backup-webapp-server/commit/f9db5f8ebfd26aa50c5fb8a2d29e7f311e4af225))
* Match footer to storacha.network ([102547b](https://github.com/storacha/bluesky-backup-webapp-server/commit/102547ba2ffd7edc497673283ece7bced4bd4461))
* polish up the bluesky account connection flow ([#181](https://github.com/storacha/bluesky-backup-webapp-server/issues/181)) ([fbffd13](https://github.com/storacha/bluesky-backup-webapp-server/commit/fbffd137ea30bfef3db876fe709ceb3709519413))
* set defaults for snapshots URL ([#180](https://github.com/storacha/bluesky-backup-webapp-server/issues/180)) ([8ed9982](https://github.com/storacha/bluesky-backup-webapp-server/commit/8ed99822d552a44f651fa68ade59f7647099deb9))
* Tell 1Password to ignore `keyMaterial` ([94bccd9](https://github.com/storacha/bluesky-backup-webapp-server/commit/94bccd9c8f11078282c34a49be1ccd0a631358cd))
* Tell 1Password to ignore `keyMaterial` ([36f3af5](https://github.com/storacha/bluesky-backup-webapp-server/commit/36f3af5403a12bd125df353f3752594f6338119b))
* **ui:** once a space is created, select it. ([#158](https://github.com/storacha/bluesky-backup-webapp-server/issues/158)) ([a4ea746](https://github.com/storacha/bluesky-backup-webapp-server/commit/a4ea746fc2170c3299e7f299577bf8f7fd263378))

## [1.7.1](https://github.com/storacha/bluesky-backup-webapp-server/compare/v1.7.0...v1.7.1) (2025-05-16)


### Bug Fixes

* add very barebones snapshots page ([0cc002c](https://github.com/storacha/bluesky-backup-webapp-server/commit/0cc002c5b4380f73a1c418ed35848ed84d15f1ff))
* two small tweaks to the identity manager ([f07061c](https://github.com/storacha/bluesky-backup-webapp-server/commit/f07061c713758f0f29c933759cea6bf9db95d045))
* two small tweaks to the identity manager ([ce465b5](https://github.com/storacha/bluesky-backup-webapp-server/commit/ce465b568a2b084aec8212865deafa055da1a4eb))

## [1.7.0](https://github.com/storacha/bluesky-backup-webapp-server/compare/v1.6.0...v1.7.0) (2025-05-15)


### Features

* add atproto identity manager ([#129](https://github.com/storacha/bluesky-backup-webapp-server/issues/129)) ([f83b366](https://github.com/storacha/bluesky-backup-webapp-server/commit/f83b3666a082720d5a44e6b2adbb90b484851bf0))
* revamp restore flow ([48f7591](https://github.com/storacha/bluesky-backup-webapp-server/commit/48f7591b632b5f198245b3bf07084891695e55e6))


### Bug Fixes

* `Select`s handle `disabled` correctly ([8c840d1](https://github.com/storacha/bluesky-backup-webapp-server/commit/8c840d1e6fdb58741ca7d2456a82167f9786cd16))
* `Select`s handle `disabled` correctly ([fb94431](https://github.com/storacha/bluesky-backup-webapp-server/commit/fb944313b833cfe23243919d9b67ec5dafec729b))
* a few more tweaks and fixes ([972441f](https://github.com/storacha/bluesky-backup-webapp-server/commit/972441f34474fec6714827618a7a9b9b7e9f6170))
* auto appends .bsky.social to user handles ([#156](https://github.com/storacha/bluesky-backup-webapp-server/issues/156)) ([1e8f8a6](https://github.com/storacha/bluesky-backup-webapp-server/commit/1e8f8a6c7e0c4d91f5fca555b1755d25ea4affde))
* bugfixes from PR and screenshare review ([57c4a02](https://github.com/storacha/bluesky-backup-webapp-server/commit/57c4a02ae40252a85e13276630fd1399d16e8d42))
* Make long `Select`s scroll ([cdb4ec3](https://github.com/storacha/bluesky-backup-webapp-server/commit/cdb4ec3e555b0cb8ae4e0dcce8e159925f519e76))
* Make long `Select`s scroll ([d48a82e](https://github.com/storacha/bluesky-backup-webapp-server/commit/d48a82eb2aac6cebbe36dc97657945c6fb929677))
* polish, add verification key icon ([89200dc](https://github.com/storacha/bluesky-backup-webapp-server/commit/89200dc15fac8d8cbbfd830794812daf88230c8c))
* render 'back button' on large screens if teh path is specified ([#155](https://github.com/storacha/bluesky-backup-webapp-server/issues/155)) ([7586699](https://github.com/storacha/bluesky-backup-webapp-server/commit/7586699ac2a3c549108abbe952569d67b4968aef))
* Shouldn't be able to back up nothing ([fadabe8](https://github.com/storacha/bluesky-backup-webapp-server/commit/fadabe8901df6f9cc0233a48b4883741ecc95c82))

## [1.6.0](https://github.com/storacha/bluesky-backup-webapp-server/compare/v1.5.1...v1.6.0) (2025-05-14)


### Features

* Toast copy is more user-oriented ([#149](https://github.com/storacha/bluesky-backup-webapp-server/issues/149)) ([7fda059](https://github.com/storacha/bluesky-backup-webapp-server/commit/7fda05987e31ffa77b32ebbab96357c716a22c54))


### Bug Fixes

* a series of fixes and polish ([1c3acef](https://github.com/storacha/bluesky-backup-webapp-server/commit/1c3acefbd3cbf9d13c786996ee95fbaf50ad910c))
* add footer to login screen ([#142](https://github.com/storacha/bluesky-backup-webapp-server/issues/142)) ([0ac41c0](https://github.com/storacha/bluesky-backup-webapp-server/commit/0ac41c0c9ca05bb0389e2c38dda2bd0504d931ba))
* add storacha logomark to the sidebar ([8aa05cd](https://github.com/storacha/bluesky-backup-webapp-server/commit/8aa05cd3a9bc8eb9a3c4c606abc1840cac3d954f))
* give backup name a default value ([b428129](https://github.com/storacha/bluesky-backup-webapp-server/commit/b428129cd88db1d0e5a4980fd7911acc91c5ad34))
* hide space key by default ([4f16e5f](https://github.com/storacha/bluesky-backup-webapp-server/commit/4f16e5f878f70bc6152d044e64a5687b84ca0a79))
* make disabled work in the dropdowns ([8029f07](https://github.com/storacha/bluesky-backup-webapp-server/commit/8029f077d2fcc4caeaa2c3d1006f9740325e9f7e))
* Spinner for buttons, Loader for pages ([#150](https://github.com/storacha/bluesky-backup-webapp-server/issues/150)) ([7b5cd68](https://github.com/storacha/bluesky-backup-webapp-server/commit/7b5cd686a8babe26065b1aa1592e9df88b574b3d))

## [1.5.1](https://github.com/storacha/bluesky-backup-webapp-server/compare/v1.5.0...v1.5.1) (2025-05-14)


### Bug Fixes

* Actually set the name on the `Select` 🤦‍♀️ ([2767c73](https://github.com/storacha/bluesky-backup-webapp-server/commit/2767c7355213f311b5f7fbe90c6e28e1688c80bf))
* provision spaces on creation ([08db9f9](https://github.com/storacha/bluesky-backup-webapp-server/commit/08db9f9c536648c534caef4c8fb3622abda3ec4d))
* provision spaces on creation ([34d2337](https://github.com/storacha/bluesky-backup-webapp-server/commit/34d2337115400a62a296f914d81a39aedd103e4f))

## [1.5.0](https://github.com/storacha/bluesky-backup-webapp-server/compare/v1.4.0...v1.5.0) (2025-05-13)


### Features

* add "plan gate"  ([#128](https://github.com/storacha/bluesky-backup-webapp-server/issues/128)) ([e88312f](https://github.com/storacha/bluesky-backup-webapp-server/commit/e88312fb4e56496af9fb58b4d53e8de6e76504a2))


### Bug Fixes

* Account selects are clearer and sturdier ([ea630ae](https://github.com/storacha/bluesky-backup-webapp-server/commit/ea630ae55581b797489399b4e68e6c9f077878fd))
* Empty Selects open ([6194eb5](https://github.com/storacha/bluesky-backup-webapp-server/commit/6194eb5c4343e2c9a5ae5868f8456033356a9ba2))
* Select values truncate rather than overflow ([#141](https://github.com/storacha/bluesky-backup-webapp-server/issues/141)) ([dda8b05](https://github.com/storacha/bluesky-backup-webapp-server/commit/dda8b059f7b2e5ec91f69d61b80720a7fa0340c5))

## [1.4.0](https://github.com/storacha/bluesky-backup-webapp-server/compare/v1.3.0...v1.4.0) (2025-05-12)


### Features

* add blobs page ([#130](https://github.com/storacha/bluesky-backup-webapp-server/issues/130)) ([3139b5b](https://github.com/storacha/bluesky-backup-webapp-server/commit/3139b5b767980b151d3b03deb0cf90f9788c7e33))

## [1.3.0](https://github.com/storacha/bluesky-backup-webapp-server/compare/v1.2.3...v1.3.0) (2025-05-09)


### Features

* add repo explorer ([#88](https://github.com/storacha/bluesky-backup-webapp-server/issues/88)) ([2ce934b](https://github.com/storacha/bluesky-backup-webapp-server/commit/2ce934b9a74c66d9dae3d68f5e494f36aa79563f))


### Bug Fixes

* destroy session on logout ([#127](https://github.com/storacha/bluesky-backup-webapp-server/issues/127)) ([fd2aa73](https://github.com/storacha/bluesky-backup-webapp-server/commit/fd2aa73b4b23329179ad051ea1a73935a30bebbf))

## [1.2.3](https://github.com/storacha/bluesky-backup-webapp-server/compare/v1.2.2...v1.2.3) (2025-05-09)


### Bug Fixes

* migration script ([#122](https://github.com/storacha/bluesky-backup-webapp-server/issues/122)) ([8358bc4](https://github.com/storacha/bluesky-backup-webapp-server/commit/8358bc4482e9548d9764492ead001837ad77e719))
* various tweaks and polish ([#123](https://github.com/storacha/bluesky-backup-webapp-server/issues/123)) ([8fd3475](https://github.com/storacha/bluesky-backup-webapp-server/commit/8fd3475445fce6a056a3690a8fca23eba8a81944))

## [1.2.2](https://github.com/storacha/bluesky-backup-webapp-server/compare/v1.2.1...v1.2.2) (2025-05-08)


### Bug Fixes

* production deploy issue ([#120](https://github.com/storacha/bluesky-backup-webapp-server/issues/120)) ([0679584](https://github.com/storacha/bluesky-backup-webapp-server/commit/0679584c4de07b6d2bde89a7e28bf41b2de3c1b4))

## [1.2.1](https://github.com/storacha/bluesky-backup-webapp-server/compare/v1.2.0...v1.2.1) (2025-05-08)


### Bug Fixes

* Create Backup button should show pending state ([f1064d5](https://github.com/storacha/bluesky-backup-webapp-server/commit/f1064d596b3a265569d83175a5cd9667c63aef86))

## [1.2.0](https://github.com/storacha/bluesky-backup-webapp-server/compare/v1.1.6...v1.2.0) (2025-05-07)


### Features

* tweak readme ([#110](https://github.com/storacha/bluesky-backup-webapp-server/issues/110)) ([02a1251](https://github.com/storacha/bluesky-backup-webapp-server/commit/02a125119b55697960fc2c70318e9f00be0b1100))

## [1.1.6](https://github.com/storacha/bluesky-backup-webapp-server/compare/v1.1.5...v1.1.6) (2025-05-07)


### Bug Fixes

* **deploy/app:** attach role to policy ([#107](https://github.com/storacha/bluesky-backup-webapp-server/issues/107)) ([e9a60a9](https://github.com/storacha/bluesky-backup-webapp-server/commit/e9a60a9eacd43a5a13c53f1a0adfe4087daff6d1))

## [1.1.5](https://github.com/storacha/bluesky-backup-webapp-server/compare/v1.1.4...v1.1.5) (2025-05-06)


### Bug Fixes

* Don't blow up on bad UUIDs ([24c4cf6](https://github.com/storacha/bluesky-backup-webapp-server/commit/24c4cf6fe3ce7140691ca29e0a9da89c03148cb5))

## [1.1.4](https://github.com/storacha/bluesky-backup-webapp-server/compare/v1.1.3...v1.1.4) (2025-05-06)


### Bug Fixes

* **cron:** add dead letter queue ([#102](https://github.com/storacha/bluesky-backup-webapp-server/issues/102)) ([f468a5e](https://github.com/storacha/bluesky-backup-webapp-server/commit/f468a5e44fae4c89f8e170a1af4bad2b2ac61aee))

## [1.1.3](https://github.com/storacha/bluesky-backup-webapp-server/compare/v1.1.2...v1.1.3) (2025-05-05)


### Bug Fixes

* **deploy:** allow writes to the file system in the container ([dc4dba9](https://github.com/storacha/bluesky-backup-webapp-server/commit/dc4dba910b767709cf53b74cd5fa23e1499a0672))

## [1.1.2](https://github.com/storacha/bluesky-backup-webapp-server/compare/v1.1.1...v1.1.2) (2025-05-05)


### Bug Fixes

* add some very granular logging to the hourly job ([#92](https://github.com/storacha/bluesky-backup-webapp-server/issues/92)) ([e75fa2e](https://github.com/storacha/bluesky-backup-webapp-server/commit/e75fa2ef7542545c1a32d5015b20eeb6a03f43b4))
* remove two unecessary `use server` directives ([#90](https://github.com/storacha/bluesky-backup-webapp-server/issues/90)) ([c20d510](https://github.com/storacha/bluesky-backup-webapp-server/commit/c20d51038b0cb33596d4f48ecb666fca19fd0dfa))

## [1.1.1](https://github.com/storacha/bluesky-backup-webapp-server/compare/v1.1.0...v1.1.1) (2025-05-03)


### Bug Fixes

* **storoku:** update to versioned storoku ([eae52f9](https://github.com/storacha/bluesky-backup-webapp-server/commit/eae52f9ce9e19e2c151bd01389427436586c56eb))
* **storoku:** update to versioned storoku ([94dc5a3](https://github.com/storacha/bluesky-backup-webapp-server/commit/94dc5a319b6d087bcc1c686b45516397da338c2c))

## [1.1.0](https://github.com/storacha/bluesky-backup-webapp-server/compare/v1.0.2...v1.1.0) (2025-05-02)


### Features

* backup "cronjob" ([#44](https://github.com/storacha/bluesky-backup-webapp-server/issues/44)) ([941fb1f](https://github.com/storacha/bluesky-backup-webapp-server/commit/941fb1ff127b8cc932a7089492a81fa0f9661ec9))
* create Storacha space ([#60](https://github.com/storacha/bluesky-backup-webapp-server/issues/60)) ([7b0c5e5](https://github.com/storacha/bluesky-backup-webapp-server/commit/7b0c5e536d7027c8dfbf308ede10aa1fc2211862))
* get Storybook stories running again ([f5320bc](https://github.com/storacha/bluesky-backup-webapp-server/commit/f5320bc86687507b4c93c5774ce3dba255f18e88))
* Loaders work ([8536ff3](https://github.com/storacha/bluesky-backup-webapp-server/commit/8536ff3496b2cc53d06b71d3a3e41aae74dda0b6))
* snapshot page ([#74](https://github.com/storacha/bluesky-backup-webapp-server/issues/74)) ([e55a134](https://github.com/storacha/bluesky-backup-webapp-server/commit/e55a1344e20bd300e17a1de3a3a480ee0eaca3b3))


### Bug Fixes

* add account_did to backup queries ([#66](https://github.com/storacha/bluesky-backup-webapp-server/issues/66)) ([63c7416](https://github.com/storacha/bluesky-backup-webapp-server/commit/63c74162a1f5270fd40aa75b6974b0bb6fc41377))
* add authorization to a number of endpoints ([6d4e15d](https://github.com/storacha/bluesky-backup-webapp-server/commit/6d4e15d108ede33aac949a0529347bfa0604e9be))
* Give proper labels to the switches ([5953d07](https://github.com/storacha/bluesky-backup-webapp-server/commit/5953d07e06a5222ef02fd3086c74622c3d40d06a))
* imports ([b401d77](https://github.com/storacha/bluesky-backup-webapp-server/commit/b401d77b7960c73e75f38b5ba6955059b88e7677))
* Remove "use client" from Dialog component ([2ce0a38](https://github.com/storacha/bluesky-backup-webapp-server/commit/2ce0a387c3ddf1acf8b53a3ed35075e941fede07))
* revert bluesky account selector for now ([#65](https://github.com/storacha/bluesky-backup-webapp-server/issues/65)) ([028a3df](https://github.com/storacha/bluesky-backup-webapp-server/commit/028a3df8fcc1ae15f97d0074dd25b229a97f0247))
* session initialization ([#70](https://github.com/storacha/bluesky-backup-webapp-server/issues/70)) ([4fc9cf9](https://github.com/storacha/bluesky-backup-webapp-server/commit/4fc9cf9196336ec2c323cdc4b3d2a7fcf50a01b7))

## [1.0.2](https://github.com/storacha/bluesky-backup-webapp-server/compare/v1.0.1...v1.0.2) (2025-04-29)

### Bug Fixes

- **deploy:** use single quotes ([7e6f2f4](https://github.com/storacha/bluesky-backup-webapp-server/commit/7e6f2f489af61889e9c1bea6637afe6c9951bc12))
- **github:** fix prod deploy step ([ab1004c](https://github.com/storacha/bluesky-backup-webapp-server/commit/ab1004c686f02412748253f40c8464e3533bf515))
- **github:** fix prod deploy step ([cb13f9c](https://github.com/storacha/bluesky-backup-webapp-server/commit/cb13f9c251a6835ca03cf6e878e5b6f252312284))

## [1.0.1](https://github.com/storacha/bluesky-backup-webapp-server/compare/v1.0.0...v1.0.1) (2025-04-29)

### Bug Fixes

- **github:** fix last merge ([2e97a35](https://github.com/storacha/bluesky-backup-webapp-server/commit/2e97a35a3f485b474c3620fb8a9a00813008c126))
- **github:** fix last merge ([cf4904e](https://github.com/storacha/bluesky-backup-webapp-server/commit/cf4904e43752e0c985bf5cdeccdd20de0d455fee))
- **release:** testing that release is working properly ([6f01834](https://github.com/storacha/bluesky-backup-webapp-server/commit/6f018349dfd4829b75b4de65a1d89f0c470f19b5))
- **release:** testing that release is working properly ([c410003](https://github.com/storacha/bluesky-backup-webapp-server/commit/c410003a0cda2907f0114e4274d65875f3e1a2ce))

## 1.0.0 (2025-04-29)

### Features

- a bunch of UX polish ([#40](https://github.com/storacha/bluesky-backup-webapp-server/issues/40)) ([1594aa7](https://github.com/storacha/bluesky-backup-webapp-server/commit/1594aa740a87ecfc6d9b4758aed1ff40df2db44b))
- account restore ([#14](https://github.com/storacha/bluesky-backup-webapp-server/issues/14)) ([40df727](https://github.com/storacha/bluesky-backup-webapp-server/commit/40df72733d656d36b2a8a01a25a7ab922d724cbd))
- add backup progress UI ([#11](https://github.com/storacha/bluesky-backup-webapp-server/issues/11)) ([aade6f0](https://github.com/storacha/bluesky-backup-webapp-server/commit/aade6f0813afc53e4fbffa18029b55c3e6bda377))
- add base components for the backup screen and make it resizable ([#23](https://github.com/storacha/bluesky-backup-webapp-server/issues/23)) ([fe5eab9](https://github.com/storacha/bluesky-backup-webapp-server/commit/fe5eab9c7a9827b5cd022de1c75f67c96a338ccb))
- add blob backup ([#24](https://github.com/storacha/bluesky-backup-webapp-server/issues/24)) ([945edbb](https://github.com/storacha/bluesky-backup-webapp-server/commit/945edbb4583254eba99696579ec6e68a0c4f951c))
- add keychain and encrypted backups ([#31](https://github.com/storacha/bluesky-backup-webapp-server/issues/31)) ([9cc5897](https://github.com/storacha/bluesky-backup-webapp-server/commit/9cc58975321834651277af54444471300672c57c))
- add plan selection and preferences backup ([#22](https://github.com/storacha/bluesky-backup-webapp-server/issues/22)) ([1e8860f](https://github.com/storacha/bluesky-backup-webapp-server/commit/1e8860ff1fa0a792a018cff1610363c0fd5e7ae6))
- add session-based auth ([#10](https://github.com/storacha/bluesky-backup-webapp-server/issues/10)) ([40944e7](https://github.com/storacha/bluesky-backup-webapp-server/commit/40944e70caeced7b628322373b78cc4ec5f2f43e))
- add snapshot detail modal ([060309f](https://github.com/storacha/bluesky-backup-webapp-server/commit/060309f501e7865df5250f861ace73ee1233f7d1))
- add snapshot detail modal ([d9bb755](https://github.com/storacha/bluesky-backup-webapp-server/commit/d9bb755cc1c6195c622b10f62c1b406ce881ba40))
- add storybook and build out Dashboard component with it ([#17](https://github.com/storacha/bluesky-backup-webapp-server/issues/17)) ([d6ee7b0](https://github.com/storacha/bluesky-backup-webapp-server/commit/d6ee7b073681f0e1697ff4f985419d76e4834bb0))
- basic backup flow ([#10](https://github.com/storacha/bluesky-backup-webapp-server/issues/10)) ([4af04da](https://github.com/storacha/bluesky-backup-webapp-server/commit/4af04dae8a46237ed1d6f5151ac8cd70cf7efd9c))
- better backups UI! ([#23](https://github.com/storacha/bluesky-backup-webapp-server/issues/23)) ([a4f7d21](https://github.com/storacha/bluesky-backup-webapp-server/commit/a4f7d21431ddfa793faae5eb25cfb0c896460a04))
- can "create" a backup (but it doesn't do anything) ([a989d4c](https://github.com/storacha/bluesky-backup-webapp-server/commit/a989d4ce8c11aef57374311a3c7e4fda7f21a7ad))
- can create and view backup configs ([6a0da06](https://github.com/storacha/bluesky-backup-webapp-server/commit/6a0da060d711e7177eddc17abe018bc25767124a))
- can do a real manual backup of a repo! ([#21](https://github.com/storacha/bluesky-backup-webapp-server/issues/21)) ([4a01711](https://github.com/storacha/bluesky-backup-webapp-server/commit/4a01711df7c991c3997570e6f15d8b7956243552))
- cleanup and tweaks to the snapshots UI ([cbabfab](https://github.com/storacha/bluesky-backup-webapp-server/commit/cbabfabbd762b457bc85bd8b0d6723c8d3862e39))
- Complete Bluesky OAuth loop (minus UCAN auth) ([3309a0e](https://github.com/storacha/bluesky-backup-webapp-server/commit/3309a0ee72def46b9c9adbbd762f9a2f4dafc25e))
- configure cloudflare pages deployment ([#1](https://github.com/storacha/bluesky-backup-webapp-server/issues/1)) ([b6faf8b](https://github.com/storacha/bluesky-backup-webapp-server/commit/b6faf8b652dadd4c3ebed4db76f2fce2fd24b17a))
- convert to an opennextjs-cloudflare project ([66966b1](https://github.com/storacha/bluesky-backup-webapp-server/commit/66966b1634756880ea788a2631ade2c96bc9fd5a))
- convert to an opennextjs-cloudflare project ([40677b8](https://github.com/storacha/bluesky-backup-webapp-server/commit/40677b8f71d536d7f5e1f1f7f1d97608816bd281))
- create space ([#27](https://github.com/storacha/bluesky-backup-webapp-server/issues/27)) ([9762bc1](https://github.com/storacha/bluesky-backup-webapp-server/commit/9762bc16cfb5c94a1d375315a6067f44246d125f))
- **deploy:** add storoku deployment ([3a8de44](https://github.com/storacha/bluesky-backup-webapp-server/commit/3a8de44910171060d756af9ec6153748de14b2eb))
- Deployment with AWS and Terraform ([ce93009](https://github.com/storacha/bluesky-backup-webapp-server/commit/ce93009bfd34fb75246d1e1656a1b1076676fa7b))
- enhances Keychain component ([#37](https://github.com/storacha/bluesky-backup-webapp-server/issues/37)) ([6a14754](https://github.com/storacha/bluesky-backup-webapp-server/commit/6a14754e01dc323a7f2f71075fdcfa1234ef8314))
- extremely rough pass on the restore flow ([b3bdd11](https://github.com/storacha/bluesky-backup-webapp-server/commit/b3bdd11303b904c064f68e545657878fac8ac4ed))
- get bluesky auth working ([#8](https://github.com/storacha/bluesky-backup-webapp-server/issues/8)) ([9a5e5e7](https://github.com/storacha/bluesky-backup-webapp-server/commit/9a5e5e727fb7ee698fc0ca37432541146a1bc31a))
- get restore working ([#19](https://github.com/storacha/bluesky-backup-webapp-server/issues/19)) ([f9735e0](https://github.com/storacha/bluesky-backup-webapp-server/commit/f9735e07491753ba4b7cbee5375781184b21f642))
- **github-ci:** add auto terraform plan and deploy ([b4badc3](https://github.com/storacha/bluesky-backup-webapp-server/commit/b4badc35bf205b2d78de0f12964defe33cbc7d46))
- implement KVNamespace in terms of Postgres ([#22](https://github.com/storacha/bluesky-backup-webapp-server/issues/22)) ([5ce6c89](https://github.com/storacha/bluesky-backup-webapp-server/commit/5ce6c899c8e6df91c6b6fc2d84c5e392c7d65cff))
- make Storacha service information configurable ([#13](https://github.com/storacha/bluesky-backup-webapp-server/issues/13)) ([4f5bd9b](https://github.com/storacha/bluesky-backup-webapp-server/commit/4f5bd9b11be71c29ee578c0d4c8364997d8bf67f))
- move to docker-based deployment ([#18](https://github.com/storacha/bluesky-backup-webapp-server/issues/18)) ([625ebcd](https://github.com/storacha/bluesky-backup-webapp-server/commit/625ebcd81a05dc7e0c7c239d4d43ba18d3848c2e))
- much better restore UI ([#26](https://github.com/storacha/bluesky-backup-webapp-server/issues/26)) ([7b73314](https://github.com/storacha/bluesky-backup-webapp-server/commit/7b73314093b93782fe4563460d7882de8526a522))
- rename "backup" to "snapshot" and "backup config" to "backup" ([#30](https://github.com/storacha/bluesky-backup-webapp-server/issues/30)) ([74d4b45](https://github.com/storacha/bluesky-backup-webapp-server/commit/74d4b457be05ba26b6f1e4ecf73b41187ff9c827))
- some cleanup in the storacha provider ([#20](https://github.com/storacha/bluesky-backup-webapp-server/issues/20)) ([693c40e](https://github.com/storacha/bluesky-backup-webapp-server/commit/693c40ea4b837e30a99f00a760f2a8f1f55cc588))
- store backup metadata locally ([#12](https://github.com/storacha/bluesky-backup-webapp-server/issues/12)) ([131cd56](https://github.com/storacha/bluesky-backup-webapp-server/commit/131cd566a28b930dd6cf59e78df68c0740b9e124))
- storybook improvements ([#25](https://github.com/storacha/bluesky-backup-webapp-server/issues/25)) ([f0f06b7](https://github.com/storacha/bluesky-backup-webapp-server/commit/f0f06b78854d14dbe294c1c46e1312855c002d0b))
- UI enhancements from @Crosstons ([#34](https://github.com/storacha/bluesky-backup-webapp-server/issues/34)) ([35975da](https://github.com/storacha/bluesky-backup-webapp-server/commit/35975dab157867db603e331955647996ba16b181))
- **ui:** add modal component ([#28](https://github.com/storacha/bluesky-backup-webapp-server/issues/28)) ([f6bfecb](https://github.com/storacha/bluesky-backup-webapp-server/commit/f6bfecbc251ffa66dc16f0371da00d557d5feafc))
- **ui:** add SelectField ([a7f99bf](https://github.com/storacha/bluesky-backup-webapp-server/commit/a7f99bf6abff8b5ec225c67921b0f6726bd52d51))
- **ui:** add SelectField [#43](https://github.com/storacha/bluesky-backup-webapp-server/issues/43) from storacha/ui ([6dd35e9](https://github.com/storacha/bluesky-backup-webapp-server/commit/6dd35e95666096529862da33bb36674281835e2b))
- **ui:** create 'add bluesky account' modal ([#36](https://github.com/storacha/bluesky-backup-webapp-server/issues/36)) ([fda25b9](https://github.com/storacha/bluesky-backup-webapp-server/commit/fda25b9eb4b2245f4e63c08136a6bdad4f39ca2a))
- **ui:** use react-aria packages to make the Switch component accessible/controllable via keyboard ([#26](https://github.com/storacha/bluesky-backup-webapp-server/issues/26)) ([deaf2b0](https://github.com/storacha/bluesky-backup-webapp-server/commit/deaf2b01d46a7ed4440f8052e3e542995a4f97cb))
- update environment variables for production deployment ([#35](https://github.com/storacha/bluesky-backup-webapp-server/issues/35)) ([5a25010](https://github.com/storacha/bluesky-backup-webapp-server/commit/5a25010ed4edfb35d0ab6e760265e52573dc770d))
- use camelCase in JavaScript ([#25](https://github.com/storacha/bluesky-backup-webapp-server/issues/25)) ([6a17fd9](https://github.com/storacha/bluesky-backup-webapp-server/commit/6a17fd9ce4a8b33a5ab194b000cfd896f533d2c5))
- use the new Backup component ([#27](https://github.com/storacha/bluesky-backup-webapp-server/issues/27)) ([fdb25ff](https://github.com/storacha/bluesky-backup-webapp-server/commit/fdb25ff2519d340bf250e4a6cd531d15444fb096))

### Bug Fixes

- **.env.production.tpl:** add prod strip information ([ac3f3cf](https://github.com/storacha/bluesky-backup-webapp-server/commit/ac3f3cfb564f017611b163ca61daae06f73af380))
- a bunch of typing errors ([7dfd81f](https://github.com/storacha/bluesky-backup-webapp-server/commit/7dfd81f0db90a7dfc2452caa23137f5957e9abb0))
- add account id to deploy ([9794f9e](https://github.com/storacha/bluesky-backup-webapp-server/commit/9794f9e28d6973dd40e7ce259dfd35f0bfa1de35))
- add missing build script ([6944e56](https://github.com/storacha/bluesky-backup-webapp-server/commit/6944e5601833c3695ed4c97078bee68e01666855))
- Add pending message and disable sign in button on button clicked ([#33](https://github.com/storacha/bluesky-backup-webapp-server/issues/33)) ([9a9b37e](https://github.com/storacha/bluesky-backup-webapp-server/commit/9a9b37e1658d1a40d20a7a1c995423500e42eed2))
- add pnpm build to CI ([a37409d](https://github.com/storacha/bluesky-backup-webapp-server/commit/a37409d678c1a85f7a8a7b01e98d81ef810f497a))
- add pnpm build to CI ([6275391](https://github.com/storacha/bluesky-backup-webapp-server/commit/62753911874602243670aa545551ce4ce5ce70e8))
- bugfixes, polish! ([#42](https://github.com/storacha/bluesky-backup-webapp-server/issues/42)) ([f21e75e](https://github.com/storacha/bluesky-backup-webapp-server/commit/f21e75e2d6fd27364f117729f2a76b0ccd249d6f))
- configure production pricing table ([#39](https://github.com/storacha/bluesky-backup-webapp-server/issues/39)) ([a35e46c](https://github.com/storacha/bluesky-backup-webapp-server/commit/a35e46cbb4bbbac4615281dd7f53382399d11834))
- deactivate old account after activating new ([#46](https://github.com/storacha/bluesky-backup-webapp-server/issues/46)) ([8a8f656](https://github.com/storacha/bluesky-backup-webapp-server/commit/8a8f656d0ce3b8b62868ea4844f06c53e31440a4))
- **deploy:** fix unused variable for cloudflare ([48c7676](https://github.com/storacha/bluesky-backup-webapp-server/commit/48c7676caf7a52610487b9577fe60d5aefc78662))
- **deploy:** fix unused variable for cloudflare ([8e9789c](https://github.com/storacha/bluesky-backup-webapp-server/commit/8e9789caa920f1348ea6b592bd01d77954404a71))
- don't build ([b6c4c15](https://github.com/storacha/bluesky-backup-webapp-server/commit/b6c4c15a34666d8d62fded5cfc28791e4077f567))
- fix scope and handling ([acdba2c](https://github.com/storacha/bluesky-backup-webapp-server/commit/acdba2c2e2d047c5b2fe3a22a449899da08899f5))
- **Makefile:** add env files to plan step ([6b3c631](https://github.com/storacha/bluesky-backup-webapp-server/commit/6b3c63191bfad5ce15d65d235d776068cffafe42))
- merge conflicts from rebase ([#35](https://github.com/storacha/bluesky-backup-webapp-server/issues/35)) ([0b142ff](https://github.com/storacha/bluesky-backup-webapp-server/commit/0b142ff6045c7ba5e35a776f087184d323a434c3))
- move bluesky provider to a dynamic component ([#5](https://github.com/storacha/bluesky-backup-webapp-server/issues/5)) ([cefbb54](https://github.com/storacha/bluesky-backup-webapp-server/commit/cefbb547e06a78d5bba931c33a9b997bb121bf25))
- Move deprecated components in SpaceFinder ([#18](https://github.com/storacha/bluesky-backup-webapp-server/issues/18)) ([a931d04](https://github.com/storacha/bluesky-backup-webapp-server/commit/a931d04dc12e2d390c90db7baa21798d0bd9d9f2))
- name ([d344091](https://github.com/storacha/bluesky-backup-webapp-server/commit/d34409152b42da463e12b565a3fa1d6d8c93b599))
- pin to react 18 for now ([#3](https://github.com/storacha/bluesky-backup-webapp-server/issues/3)) ([ea7683a](https://github.com/storacha/bluesky-backup-webapp-server/commit/ea7683affbb80a232c66ea1ad97b3430c0d7bbff))
- put BackupDetail behind Suspense for now ([3c1df44](https://github.com/storacha/bluesky-backup-webapp-server/commit/3c1df44e7550eb6ed9c73c17e788a594d770cebb))
- remove apostrophes from html ([#4](https://github.com/storacha/bluesky-backup-webapp-server/issues/4)) ([41491ec](https://github.com/storacha/bluesky-backup-webapp-server/commit/41491ec83dee894422195daf962fd376b4a3f094))
- remove broken preview URL stuff ([ec22af1](https://github.com/storacha/bluesky-backup-webapp-server/commit/ec22af1a6406051a017120235bd55d01bf3f3e1a))
- run build in test phase ([de1f8dd](https://github.com/storacha/bluesky-backup-webapp-server/commit/de1f8dd23a293369d7a1ccbd284b0fca95607629))
- Solve a few issues with the Create Snapshot button ([53dfeec](https://github.com/storacha/bluesky-backup-webapp-server/commit/53dfeecbcbd7da380bbc891331ad3131c50dc370))
- try using the wrangler action directly like we do with other workers ([df17c7b](https://github.com/storacha/bluesky-backup-webapp-server/commit/df17c7bbf5894cf227df7d4bfccc8f93374ce6c2))
- Tunnel script correctly adds tunnel to env ([df34784](https://github.com/storacha/bluesky-backup-webapp-server/commit/df34784a558663639cdf5d2932ec97873bb33cd6))
- Tunnel script correctly adds tunnel to env ([ae918d4](https://github.com/storacha/bluesky-backup-webapp-server/commit/ae918d47624b098eb812a07ebcace0aa4e02b358))
- tweak styling ([9cadb7b](https://github.com/storacha/bluesky-backup-webapp-server/commit/9cadb7bcde09784b32329c41c5c6aeb5c5a2ca42))
- two fixes for a broken build ([4ca1bf0](https://github.com/storacha/bluesky-backup-webapp-server/commit/4ca1bf047bdf45a5849bfcc1add0d8ff1db27f7b))
- two fixes for a broken build ([06e867c](https://github.com/storacha/bluesky-backup-webapp-server/commit/06e867c2a30becdde0dde84e4014456650ed829d))
- two minor tweaks for better mobile experience ([#44](https://github.com/storacha/bluesky-backup-webapp-server/issues/44)) ([f6c1f8e](https://github.com/storacha/bluesky-backup-webapp-server/commit/f6c1f8e55d6789b73b7a3a6a8e4456e92ea4f0f6))
- various typing fixes to green the build ([#12](https://github.com/storacha/bluesky-backup-webapp-server/issues/12)) ([e50d1d7](https://github.com/storacha/bluesky-backup-webapp-server/commit/e50d1d738487946694ec110ab974d29be9fa4a18))

## [1.2.3](https://github.com/storacha/bluesky-backup-webapp/compare/blusky-backup-app-v1.2.2...blusky-backup-app-v1.2.3) (2025-03-23)

### Bug Fixes

- deactivate old account after activating new ([#46](https://github.com/storacha/bluesky-backup-webapp/issues/46)) ([8a8f656](https://github.com/storacha/bluesky-backup-webapp/commit/8a8f656d0ce3b8b62868ea4844f06c53e31440a4))

## [1.2.2](https://github.com/storacha/bluesky-backup-webapp/compare/blusky-backup-app-v1.2.1...blusky-backup-app-v1.2.2) (2025-03-23)

### Bug Fixes

- two minor tweaks for better mobile experience ([#44](https://github.com/storacha/bluesky-backup-webapp/issues/44)) ([f6c1f8e](https://github.com/storacha/bluesky-backup-webapp/commit/f6c1f8e55d6789b73b7a3a6a8e4456e92ea4f0f6))

## [1.2.1](https://github.com/storacha/bluesky-backup-webapp/compare/blusky-backup-app-v1.2.0...blusky-backup-app-v1.2.1) (2025-03-23)

### Bug Fixes

- bugfixes, polish! ([#42](https://github.com/storacha/bluesky-backup-webapp/issues/42)) ([f21e75e](https://github.com/storacha/bluesky-backup-webapp/commit/f21e75e2d6fd27364f117729f2a76b0ccd249d6f))

## [1.2.0](https://github.com/storacha/bluesky-backup-webapp/compare/blusky-backup-app-v1.1.0...blusky-backup-app-v1.2.0) (2025-03-22)

### Features

- a bunch of UX polish ([#40](https://github.com/storacha/bluesky-backup-webapp/issues/40)) ([1594aa7](https://github.com/storacha/bluesky-backup-webapp/commit/1594aa740a87ecfc6d9b4758aed1ff40df2db44b))

## [1.1.0](https://github.com/storacha/bluesky-backup-webapp/compare/blusky-backup-app-v1.0.0...blusky-backup-app-v1.1.0) (2025-03-21)

### Features

- enhances Keychain component ([#37](https://github.com/storacha/bluesky-backup-webapp/issues/37)) ([6a14754](https://github.com/storacha/bluesky-backup-webapp/commit/6a14754e01dc323a7f2f71075fdcfa1234ef8314))

### Bug Fixes

- configure production pricing table ([#39](https://github.com/storacha/bluesky-backup-webapp/issues/39)) ([a35e46c](https://github.com/storacha/bluesky-backup-webapp/commit/a35e46cbb4bbbac4615281dd7f53382399d11834))

## 1.0.0 (2025-03-20)

### Features

- account restore ([#14](https://github.com/storacha/bluesky-backup-webapp/issues/14)) ([40df727](https://github.com/storacha/bluesky-backup-webapp/commit/40df72733d656d36b2a8a01a25a7ab922d724cbd))
- add backup progress UI ([#11](https://github.com/storacha/bluesky-backup-webapp/issues/11)) ([aade6f0](https://github.com/storacha/bluesky-backup-webapp/commit/aade6f0813afc53e4fbffa18029b55c3e6bda377))
- add keychain and encrypted backups ([#31](https://github.com/storacha/bluesky-backup-webapp/issues/31)) ([9cc5897](https://github.com/storacha/bluesky-backup-webapp/commit/9cc58975321834651277af54444471300672c57c))
- add plan selection and preferences backup ([#22](https://github.com/storacha/bluesky-backup-webapp/issues/22)) ([1e8860f](https://github.com/storacha/bluesky-backup-webapp/commit/1e8860ff1fa0a792a018cff1610363c0fd5e7ae6))
- add storybook and build out Dashboard component with it ([#17](https://github.com/storacha/bluesky-backup-webapp/issues/17)) ([d6ee7b0](https://github.com/storacha/bluesky-backup-webapp/commit/d6ee7b073681f0e1697ff4f985419d76e4834bb0))
- basic backup flow ([#10](https://github.com/storacha/bluesky-backup-webapp/issues/10)) ([4af04da](https://github.com/storacha/bluesky-backup-webapp/commit/4af04dae8a46237ed1d6f5151ac8cd70cf7efd9c))
- better backups UI! ([#23](https://github.com/storacha/bluesky-backup-webapp/issues/23)) ([a4f7d21](https://github.com/storacha/bluesky-backup-webapp/commit/a4f7d21431ddfa793faae5eb25cfb0c896460a04))
- configure cloudflare pages deployment ([#1](https://github.com/storacha/bluesky-backup-webapp/issues/1)) ([b6faf8b](https://github.com/storacha/bluesky-backup-webapp/commit/b6faf8b652dadd4c3ebed4db76f2fce2fd24b17a))
- create space ([#27](https://github.com/storacha/bluesky-backup-webapp/issues/27)) ([9762bc1](https://github.com/storacha/bluesky-backup-webapp/commit/9762bc16cfb5c94a1d375315a6067f44246d125f))
- get bluesky auth working ([#8](https://github.com/storacha/bluesky-backup-webapp/issues/8)) ([9a5e5e7](https://github.com/storacha/bluesky-backup-webapp/commit/9a5e5e727fb7ee698fc0ca37432541146a1bc31a))
- get restore working ([#19](https://github.com/storacha/bluesky-backup-webapp/issues/19)) ([f9735e0](https://github.com/storacha/bluesky-backup-webapp/commit/f9735e07491753ba4b7cbee5375781184b21f642))
- make Storacha service information configurable ([#13](https://github.com/storacha/bluesky-backup-webapp/issues/13)) ([4f5bd9b](https://github.com/storacha/bluesky-backup-webapp/commit/4f5bd9b11be71c29ee578c0d4c8364997d8bf67f))
- much better restore UI ([#26](https://github.com/storacha/bluesky-backup-webapp/issues/26)) ([7b73314](https://github.com/storacha/bluesky-backup-webapp/commit/7b73314093b93782fe4563460d7882de8526a522))
- some cleanup in the storacha provider ([#20](https://github.com/storacha/bluesky-backup-webapp/issues/20)) ([693c40e](https://github.com/storacha/bluesky-backup-webapp/commit/693c40ea4b837e30a99f00a760f2a8f1f55cc588))
- store backup metadata locally ([#12](https://github.com/storacha/bluesky-backup-webapp/issues/12)) ([131cd56](https://github.com/storacha/bluesky-backup-webapp/commit/131cd566a28b930dd6cf59e78df68c0740b9e124))
- storybook improvements ([#25](https://github.com/storacha/bluesky-backup-webapp/issues/25)) ([f0f06b7](https://github.com/storacha/bluesky-backup-webapp/commit/f0f06b78854d14dbe294c1c46e1312855c002d0b))
- UI enhancements from @Crosstons ([#34](https://github.com/storacha/bluesky-backup-webapp/issues/34)) ([35975da](https://github.com/storacha/bluesky-backup-webapp/commit/35975dab157867db603e331955647996ba16b181))
- update environment variables for production deployment ([#35](https://github.com/storacha/bluesky-backup-webapp/issues/35)) ([5a25010](https://github.com/storacha/bluesky-backup-webapp/commit/5a25010ed4edfb35d0ab6e760265e52573dc770d))

### Bug Fixes

- Add pending message and disable sign in button on button clicked ([#33](https://github.com/storacha/bluesky-backup-webapp/issues/33)) ([9a9b37e](https://github.com/storacha/bluesky-backup-webapp/commit/9a9b37e1658d1a40d20a7a1c995423500e42eed2))
- fix scope and handling ([acdba2c](https://github.com/storacha/bluesky-backup-webapp/commit/acdba2c2e2d047c5b2fe3a22a449899da08899f5))
- move bluesky provider to a dynamic component ([#5](https://github.com/storacha/bluesky-backup-webapp/issues/5)) ([cefbb54](https://github.com/storacha/bluesky-backup-webapp/commit/cefbb547e06a78d5bba931c33a9b997bb121bf25))
- Move deprecated components in SpaceFinder ([#18](https://github.com/storacha/bluesky-backup-webapp/issues/18)) ([a931d04](https://github.com/storacha/bluesky-backup-webapp/commit/a931d04dc12e2d390c90db7baa21798d0bd9d9f2))
- pin to react 18 for now ([#3](https://github.com/storacha/bluesky-backup-webapp/issues/3)) ([ea7683a](https://github.com/storacha/bluesky-backup-webapp/commit/ea7683affbb80a232c66ea1ad97b3430c0d7bbff))
- remove apostrophes from html ([#4](https://github.com/storacha/bluesky-backup-webapp/issues/4)) ([41491ec](https://github.com/storacha/bluesky-backup-webapp/commit/41491ec83dee894422195daf962fd376b4a3f094))

### Other Changes

- add client_metadata ([08bba36](https://github.com/storacha/bluesky-backup-webapp/commit/08bba362c92fea96453c72bd0f4db765c880f787))
- Simplify tunnel usage ([#29](https://github.com/storacha/bluesky-backup-webapp/issues/29)) ([447413d](https://github.com/storacha/bluesky-backup-webapp/commit/447413d66a7d3d08cd45f3e3df26d06a259ff782))
