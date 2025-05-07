# Changelog

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
