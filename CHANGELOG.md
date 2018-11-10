## [4.2.3](https://github.com/podlove/podlove-web-player/compare/v4.2.2...v4.2.3) (2018-11-10)


### Bug Fixes

* **marquee:** marquee effect now doesn't produce unwanted spacing ([2279476](https://github.com/podlove/podlove-web-player/commit/2279476))



## [4.2.2](https://github.com/podlove/podlove-web-player/compare/v4.2.1...v4.2.2) (2018-11-10)



<a name="4.2.1"></a>
## [4.2.1](https://github.com/podlove/podlove-web-player/compare/v4.2.0...v4.2.1) (2018-11-09)


### Bug Fixes

* **safari:** uses fallback to native audio element ([ba5d2e9](https://github.com/podlove/podlove-web-player/commit/ba5d2e9))
* **styles:** resets number input in firefox and sets width of input-state ([e797522](https://github.com/podlove/podlove-web-player/commit/e797522))



# [4.2.0](https://github.com/podlove/podlove-web-player/compare/v4.1.7...v4.2.0) (2018-11-08)


### Bug Fixes

* **package:** update color to version 3.1.0 ([1d2d304](https://github.com/podlove/podlove-web-player/commit/1d2d304))
* **package:** update iframe-resizer to version 3.6.3 ([d838346](https://github.com/podlove/podlove-web-player/commit/d838346))
* **package:** update query-string to version 6.2.0 ([454ce84](https://github.com/podlove/podlove-web-player/commit/454ce84))
* **package:** update redux-actions to version 2.6.3 ([09257b9](https://github.com/podlove/podlove-web-player/commit/09257b9))
* **package:** update redux-actions to version 2.6.4 ([8ea43de](https://github.com/podlove/podlove-web-player/commit/8ea43de))
* **package:** update vue-i18n to version 8.2.1 ([d5552c0](https://github.com/podlove/podlove-web-player/commit/d5552c0)), closes [#795](https://github.com/podlove/podlove-web-player/issues/795)
* **package:** update vue-i18n to version 8.3.0 ([0710364](https://github.com/podlove/podlove-web-player/commit/0710364))
* **transcripts:** fixes searchbar button alignment in transcript header ([aac2fab](https://github.com/podlove/podlove-web-player/commit/aac2fab))


### Features

* **cleanup-embed:** Cleans embed on init and restores it in case of an error ([43e0c09](https://github.com/podlove/podlove-web-player/commit/43e0c09))
* **files:** adds files tab ([95d92e7](https://github.com/podlove/podlove-web-player/commit/95d92e7))
* **tabs/share, icon:** Add a linkedin share button ([f77fb4b](https://github.com/podlove/podlove-web-player/commit/f77fb4b))



<a name="4.1.7"></a>
## [4.1.7](https://github.com/podlove/podlove-web-player/compare/v4.1.6...v4.1.7) (2018-10-09)


### Bug Fixes

* **bundle:** Use bundled version of audio-driver ([0d022c9](https://github.com/podlove/podlove-web-player/commit/0d022c9))



<a name="4.1.6"></a>
## [4.1.6](https://github.com/podlove/podlove-web-player/compare/v4.1.5...v4.1.6) (2018-09-30)


### Bug Fixes

* add FiraSans-Bold (fira sans v8 600) webfont to improve rendering of bold in safari, change scss for chapter links to explicitly use bold when active ([fe856a8](https://github.com/podlove/podlove-web-player/commit/fe856a8))
* **chapters:** fix alt click interaction over the link part by making it based on the progressContainer vs. the event target ([f52e723](https://github.com/podlove/podlove-web-player/commit/f52e723))
* **chapters:** remove wrong click guard on onChapterClick, change to use linkHover state to guard to be in line with what is displayed ([8e3a3e0](https://github.com/podlove/podlove-web-player/commit/8e3a3e0))
* **package:** update detect-browser to version 3.0.1 ([e035721](https://github.com/podlove/podlove-web-player/commit/e035721))
* **package:** update iframe-resizer to version 3.6.2 ([2fb175e](https://github.com/podlove/podlove-web-player/commit/2fb175e))
* **package:** update lodash to version 4.17.11 ([df4cded](https://github.com/podlove/podlove-web-player/commit/df4cded))
* **package:** update lunr to version 2.3.3 ([ba4042e](https://github.com/podlove/podlove-web-player/commit/ba4042e))
* **package:** update mobile-detect to version 1.4.3 ([d1e74ba](https://github.com/podlove/podlove-web-player/commit/d1e74ba))
* **package:** update vue-i18n to version 8.1.0 ([4a13ecb](https://github.com/podlove/podlove-web-player/commit/4a13ecb))
* **tabs:** remove false 0.5 opacity of transcript icon, unify tab icon stroke widths and positions ([acc4fde](https://github.com/podlove/podlove-web-player/commit/acc4fde))


### Features

* **chapters:** add support for the "href" property in chapters by showing it in the chapters tab ([f7240f2](https://github.com/podlove/podlove-web-player/commit/f7240f2))



<a name="4.1.5"></a>
## [4.1.5](https://github.com/podlove/podlove-web-player/compare/v4.1.4...v4.1.5) (2018-08-25)


### Bug Fixes

* **docs:** Updates base for scripts ([d8b08dd](https://github.com/podlove/podlove-web-player/commit/d8b08dd))



<a name="4.1.4"></a>
## [4.1.4](https://github.com/podlove/podlove-web-player/compare/v4.1.3...v4.1.4) (2018-08-25)


### Bug Fixes

* **documentation:** Refactor docs ([423d811](https://github.com/podlove/podlove-web-player/commit/423d811))
* **package:** update detect-browser to version 3.0.0 ([7ce43dd](https://github.com/podlove/podlove-web-player/commit/7ce43dd))
* **package:** update lunr to version 2.3.1 ([e43d0f9](https://github.com/podlove/podlove-web-player/commit/e43d0f9))
* **package:** update lunr to version 2.3.2 ([5679c5b](https://github.com/podlove/podlove-web-player/commit/5679c5b))
* **package:** update redux-actions to version 2.6.1 ([64bb41a](https://github.com/podlove/podlove-web-player/commit/64bb41a)), closes [#719](https://github.com/podlove/podlove-web-player/issues/719)
* **package:** update vue to version 2.5.17 ([03f4c7c](https://github.com/podlove/podlove-web-player/commit/03f4c7c))
* **store:** Fixes store export ([542d16d](https://github.com/podlove/podlove-web-player/commit/542d16d))
* **transcripts:** Fixes text highlighting ([6d98ef8](https://github.com/podlove/podlove-web-player/commit/6d98ef8))
* **translations:** Fixes german embed translations ([638b3b1](https://github.com/podlove/podlove-web-player/commit/638b3b1))


### Features

* **chapters:** Adds support for chapter images ([f4af652](https://github.com/podlove/podlove-web-player/commit/f4af652))
* **docs:** Updates documentation system ([cfa9784](https://github.com/podlove/podlove-web-player/commit/cfa9784))
* **redux-vuex:** Replace deprecated redux library ([f876ba5](https://github.com/podlove/podlove-web-player/commit/f876ba5))
* **transcripts:** Improve transcripts rendering performance ([822f1d0](https://github.com/podlove/podlove-web-player/commit/822f1d0))



<a name="4.1.3"></a>
## [4.1.3](https://github.com/podlove/podlove-web-player/compare/v4.0.3...v4.1.3) (2018-06-30)


### Bug Fixes

* **build:** Uses babel-env as preset ([3775ed1](https://github.com/podlove/podlove-web-player/commit/3775ed1))
* **bundling:** Extracts vendor and styles ([c9dba2b](https://github.com/podlove/podlove-web-player/commit/c9dba2b))
* **ci:** Fixes cdn publish and deploy-staging step ([fda4b65](https://github.com/podlove/podlove-web-player/commit/fda4b65))
* **ci:** Fixes cdn publish step ([73d0213](https://github.com/podlove/podlove-web-player/commit/73d0213))
* **hls:** Fixes hls integration ([6ae1bcb](https://github.com/podlove/podlove-web-player/commit/6ae1bcb))
* **hls:** Fixes hls support ([9f2e7c3](https://github.com/podlove/podlove-web-player/commit/9f2e7c3))
* **locale:** Adds default locale if not defined ([3be3970](https://github.com/podlove/podlove-web-player/commit/3be3970))
* **localization:** Fixes typo in german translation ([65160cd](https://github.com/podlove/podlove-web-player/commit/65160cd))
* **marquee:** Fixes marquee width calculation ([5851dd8](https://github.com/podlove/podlove-web-player/commit/5851dd8))
* **package:** update [@podlove](https://github.com/podlove)/html5-audio-driver to version 1.1.1 ([451d3b6](https://github.com/podlove/podlove-web-player/commit/451d3b6)), closes [#621](https://github.com/podlove/podlove-web-player/issues/621)
* **package:** update [@podlove](https://github.com/podlove)/html5-audio-driver to version 1.2.0 ([eae8286](https://github.com/podlove/podlove-web-player/commit/eae8286))
* **package:** update binary-search to version 1.3.4 ([3a495f6](https://github.com/podlove/podlove-web-player/commit/3a495f6))
* **package:** update lunr to version 2.3.0 ([b087c67](https://github.com/podlove/podlove-web-player/commit/b087c67))
* **package:** update v-tooltip to version 2.0.0-rc.33 ([88058ac](https://github.com/podlove/podlove-web-player/commit/88058ac))
* **package:** update vue-i18n to version 8.0.0 ([5fcfa00](https://github.com/podlove/podlove-web-player/commit/5fcfa00)), closes [#682](https://github.com/podlove/podlove-web-player/issues/682)
* **tab-header:** Brings back tab uppercase ([c7a71ce](https://github.com/podlove/podlove-web-player/commit/c7a71ce))


### Features

* **extensions:** Adds extensions ([dba0ccf](https://github.com/podlove/podlove-web-player/commit/dba0ccf))
* **hyphens:** Uses hyphens in longer text areas ([e1f345f](https://github.com/podlove/podlove-web-player/commit/e1f345f))

<a name="4.1.0"></a>
# [4.1.0](https://github.com/podlove/podlove-web-player/compare/v4.0.3...v4.1.0) (2018-06-07)


### Bug Fixes

* **build:** Fixes CSS extraction ([a4e6a7f](https://github.com/podlove/podlove-web-player/commit/a4e6a7f))
* **bundling:** Extracts vendor and styles ([c9dba2b](https://github.com/podlove/podlove-web-player/commit/c9dba2b))
* **embedding:** Parses URL parameters also in embed mode ([b33297a](https://github.com/podlove/podlove-web-player/commit/b33297a))
* **package:** update [@podlove](https://github.com/podlove)/html5-audio-driver to version 1.1.1 ([451d3b6](https://github.com/podlove/podlove-web-player/commit/451d3b6)), closes [#621](https://github.com/podlove/podlove-web-player/issues/621)
* **package:** update [@podlove](https://github.com/podlove)/html5-audio-driver to version 1.2.0 ([eae8286](https://github.com/podlove/podlove-web-player/commit/eae8286))
* **package:** update detect-browser to version 2.2.0 ([1d35069](https://github.com/podlove/podlove-web-player/commit/1d35069))
* **package:** update detect-browser to version 2.5.0 ([72cbbec](https://github.com/podlove/podlove-web-player/commit/72cbbec))
* **package:** update detect-browser to version 2.5.1 ([3b5a0ef](https://github.com/podlove/podlove-web-player/commit/3b5a0ef))
* **package:** update iframe-resizer to version 3.6.0 ([71e7b4a](https://github.com/podlove/podlove-web-player/commit/71e7b4a))
* **package:** update iframe-resizer to version 3.6.1 ([1c45ca0](https://github.com/podlove/podlove-web-player/commit/1c45ca0))
* **package:** update lunr to version 2.1.6 ([b7fb3e0](https://github.com/podlove/podlove-web-player/commit/b7fb3e0))
* **package:** update lunr to version 2.2.0 ([84746e9](https://github.com/podlove/podlove-web-player/commit/84746e9))
* **package:** update lunr to version 2.2.1 ([f1aa229](https://github.com/podlove/podlove-web-player/commit/f1aa229))
* **package:** update query-string to version 5.1.1 ([2d6a71e](https://github.com/podlove/podlove-web-player/commit/2d6a71e))
* **package:** update redux-actions to version 2.4.0 ([6823189](https://github.com/podlove/podlove-web-player/commit/6823189)), closes [#607](https://github.com/podlove/podlove-web-player/issues/607)
* **package:** update superagent to version 3.8.3 ([72d4931](https://github.com/podlove/podlove-web-player/commit/72d4931))
* **package:** update v-tooltip to version 2.0.0-rc.32 ([5d400fa](https://github.com/podlove/podlove-web-player/commit/5d400fa))
* **package:** update vue to version 2.5.16 ([3f40833](https://github.com/podlove/podlove-web-player/commit/3f40833)), closes [#550](https://github.com/podlove/podlove-web-player/issues/550)
* **package:** update vue-i18n to version 7.6.0 ([d1fc578](https://github.com/podlove/podlove-web-player/commit/d1fc578)), closes [#554](https://github.com/podlove/podlove-web-player/issues/554)
* **package:** update vue-i18n to version 7.7.0 ([a6d2335](https://github.com/podlove/podlove-web-player/commit/a6d2335))
* **package:** update vue-i18n to version 7.8.0 ([82c3336](https://github.com/podlove/podlove-web-player/commit/82c3336))
* **tests-integration:** fixes controllbar test ([89de52c](https://github.com/podlove/podlove-web-player/commit/89de52c))


### Features

* **accessibility:** Improves accessibility ([76b1cc9](https://github.com/podlove/podlove-web-player/commit/76b1cc9))
* **chapters:** Adds ability to retrieve chapters via url ([55e328d](https://github.com/podlove/podlove-web-player/commit/55e328d))



<a name="4.0.9"></a>
## [4.0.9](https://github.com/podlove/podlove-web-player/compare/v4.0.3...v4.0.9) (2018-04-20)


### Bug Fixes

* **build:** Uses babel-env as preset ([3775ed1](https://github.com/podlove/podlove-web-player/commit/3775ed1))
* **download-tab:** Displays correct duration ([9096834](https://github.com/podlove/podlove-web-player/commit/9096834))
* **ie11:** Polyfills Promise API ([b694a14](https://github.com/podlove/podlove-web-player/commit/b694a14))
* **locale:** Adds default locale if not defined ([3be3970](https://github.com/podlove/podlove-web-player/commit/3be3970))
* **localization:** Fixes typo in german translation ([65160cd](https://github.com/podlove/podlove-web-player/commit/65160cd))
* **marquee:** Fixes marquee width calculation ([5851dd8](https://github.com/podlove/podlove-web-player/commit/5851dd8))
* **package:** update detect-browser to version 2.1.0 ([478db3c](https://github.com/podlove/podlove-web-player/commit/478db3c))
* **package:** update redux-actions to version 2.3.0 ([4410856](https://github.com/podlove/podlove-web-player/commit/4410856))
* **title:** Fixes scrolling issue in title when overflowing ([052ceca](https://github.com/podlove/podlove-web-player/commit/052ceca))
* **transcripts:** Adds custom event for mozilla ([5d05651](https://github.com/podlove/podlove-web-player/commit/5d05651))
* **transcripts:** Single Speaker ([a853f35](https://github.com/podlove/podlove-web-player/commit/a853f35))
* **transcripts-search:** Makes search highlighting more consistent ([4b284e6](https://github.com/podlove/podlove-web-player/commit/4b284e6))
* **window-size:** Fire resize event on content load ([6ca2c9b](https://github.com/podlove/podlove-web-player/commit/6ca2c9b))


### Features

* **chapters:** Adds ability to retrieve chapters via url ([55e328d](https://github.com/podlove/podlove-web-player/commit/55e328d))
* **ci:** Adds preview hook for pull requests ([2e8a385](https://github.com/podlove/podlove-web-player/commit/2e8a385))
* **share:** Adds icons to share tab ([f0e83f1](https://github.com/podlove/podlove-web-player/commit/f0e83f1)), closes [#486](https://github.com/podlove/podlove-web-player/issues/486)
* **stoptime:** Adds ability to stop time at position ([471b7b6](https://github.com/podlove/podlove-web-player/commit/471b7b6))
* **tooltip:** Adds copied tooltip ([f3c9374](https://github.com/podlove/podlove-web-player/commit/f3c9374))



<a name="4.0.7"></a>
## [4.0.7](https://github.com/podlove/podlove-web-player/compare/v4.0.8...v4.0.7) (2018-03-30)



<a name="4.0.6"></a>
## [4.0.6](https://github.com/podlove/podlove-web-player/compare/v4.0.3...v4.0.6) (2018-03-22)


### Bug Fixes

* **build:** Uses babel-env as preset ([3775ed1](https://github.com/podlove/podlove-web-player/commit/3775ed1))
* **locale:** Adds default locale if not defined ([3be3970](https://github.com/podlove/podlove-web-player/commit/3be3970))
* **localization:** Fixes typo in german translation ([65160cd](https://github.com/podlove/podlove-web-player/commit/65160cd))
* **marquee:** Fixes marquee width calculation ([5851dd8](https://github.com/podlove/podlove-web-player/commit/5851dd8))
* **package:** update detect-browser to version 2.1.0 ([478db3c](https://github.com/podlove/podlove-web-player/commit/478db3c))
* **package:** update redux-actions to version 2.3.0 ([4410856](https://github.com/podlove/podlove-web-player/commit/4410856))
* **title:** Fixes scrolling issue in title when overflowing ([052ceca](https://github.com/podlove/podlove-web-player/commit/052ceca))


### Features

* **ci:** Adds preview hook for pull requests ([2e8a385](https://github.com/podlove/podlove-web-player/commit/2e8a385))
* **share:** Adds icons to share tab ([f0e83f1](https://github.com/podlove/podlove-web-player/commit/f0e83f1)), closes [#486](https://github.com/podlove/podlove-web-player/issues/486)
* **stoptime:** Adds ability to stop time at position ([471b7b6](https://github.com/podlove/podlove-web-player/commit/471b7b6))
* **tooltip:** Adds copied tooltip ([f3c9374](https://github.com/podlove/podlove-web-player/commit/f3c9374))



<a name="4.0.5"></a>
## [4.0.5](https://github.com/podlove/podlove-web-player/compare/v4.0.3...v4.0.5) (2018-02-26)


### Bug Fixes

* **locale:** Adds default locale if not defined ([3be3970](https://github.com/podlove/podlove-web-player/commit/3be3970))
* **package:** update detect-browser to version 2.1.0 ([478db3c](https://github.com/podlove/podlove-web-player/commit/478db3c))


### Features

* **share:** Adds icons to share tab ([f0e83f1](https://github.com/podlove/podlove-web-player/commit/f0e83f1)), closes [#486](https://github.com/podlove/podlove-web-player/issues/486)



<a name="4.0.2"></a>
## [4.0.2](https://github.com/podlove/podlove-web-player/compare/v4.0.0-beta.5...v4.0.2) (2018-02-17)


### Bug Fixes

* **current-chapter:** Enable current chapter preview ([9c9b91c](https://github.com/podlove/podlove-web-player/commit/9c9b91c))
* **dom-helper:** Restores curried functions ([8caf337](https://github.com/podlove/podlove-web-player/commit/8caf337))
* **error-reporting:** Removes NETWORK_IDLE from error codes ([42a0e3e](https://github.com/podlove/podlove-web-player/commit/42a0e3e))
* **iframe-resizer:** Load original file ([c84cfbf](https://github.com/podlove/podlove-web-player/commit/c84cfbf)), closes [#469](https://github.com/podlove/podlove-web-player/issues/469)
* **info-tab:** Transform duration milliseconds to minutes and hours ([c5c7b8c](https://github.com/podlove/podlove-web-player/commit/c5c7b8c))
* **loader:** Uses IE compatible APIs ([14deeb1](https://github.com/podlove/podlove-web-player/commit/14deeb1))
* **mock-data:** Adds absolute urls to fixtures ([1ccb4a2](https://github.com/podlove/podlove-web-player/commit/1ccb4a2))
* **storage:** Restores rate and volume from localstorage ([e076681](https://github.com/podlove/podlove-web-player/commit/e076681)), closes [#467](https://github.com/podlove/podlove-web-player/issues/467)
* **tests:** Adapts tests for transcripts ([215bb53](https://github.com/podlove/podlove-web-player/commit/215bb53))
* **time:** Surpress index search errors ([2ac5361](https://github.com/podlove/podlove-web-player/commit/2ac5361))
* **title:** Uses correct directive hook ([529aa36](https://github.com/podlove/podlove-web-player/commit/529aa36))
* **transcripts:** Fixes initial render on tab switch ([2552808](https://github.com/podlove/podlove-web-player/commit/2552808))
* **transcripts:** Fixes name and avatar assignment ([193e93a](https://github.com/podlove/podlove-web-player/commit/193e93a))
* **transcripts:** Fixes scroll bug ([381fa99](https://github.com/podlove/podlove-web-player/commit/381fa99))
* **transcripts-header:** Fix follow button height in Safari ([9341fdc](https://github.com/podlove/podlove-web-player/commit/9341fdc))
* **transcripts-time:** Adapt parser to transform seconds to milliseconds ([7bdc324](https://github.com/podlove/podlove-web-player/commit/7bdc324))
* **vendor-block:** Remove error monitoring to prevent blocking of vendor bundle from iOS and Safari ([1c427c4](https://github.com/podlove/podlove-web-player/commit/1c427c4))
* **viewport-width:** Fixes iframe width to anchor width ([531d816](https://github.com/podlove/podlove-web-player/commit/531d816)), closes [#461](https://github.com/podlove/podlove-web-player/issues/461)


### Features

* **autoplay:** Add autoplay as url parameter ([7352579](https://github.com/podlove/podlove-web-player/commit/7352579))
* **cdn:** Adds ability for dynamic base path ([93c6989](https://github.com/podlove/podlove-web-player/commit/93c6989))
* **cdn:** Deploys assets to KeyCDN ([ec60009](https://github.com/podlove/podlove-web-player/commit/ec60009))
* **cdn-deployment:** Publishes web player artefacts to CDN ([b939863](https://github.com/podlove/podlove-web-player/commit/b939863))
* **info:** Adds ability to use line breaks in description ([164439b](https://github.com/podlove/podlove-web-player/commit/164439b)), closes [#459](https://github.com/podlove/podlove-web-player/issues/459)
* **loader:** Adds loading indicator ([f117dc6](https://github.com/podlove/podlove-web-player/commit/f117dc6))
* **marquee:** Adds marquee effect to title if needed ([0e982a8](https://github.com/podlove/podlove-web-player/commit/0e982a8)), closes [#460](https://github.com/podlove/podlove-web-player/issues/460)
* **time-tracking:** Use milliseconds instead of seconds ([e4a682b](https://github.com/podlove/podlove-web-player/commit/e4a682b))
* **transcripts:** Adds transcripts to episode ([a861b2b](https://github.com/podlove/podlove-web-player/commit/a861b2b))
* **transcripts:** Improve transcripts handling ([f25cd7b](https://github.com/podlove/podlove-web-player/commit/f25cd7b))



<a name="4.0.1"></a>
## [4.0.1](https://github.com/podlove/podlove-web-player/compare/v4.0.0-beta.5...v4.0.1) (2018-01-17)


### Bug Fixes

* **current-chapter:** Enable current chapter preview ([9c9b91c](https://github.com/podlove/podlove-web-player/commit/9c9b91c))
* **error-reporting:** Removes NETWORK_IDLE from error codes ([42a0e3e](https://github.com/podlove/podlove-web-player/commit/42a0e3e))
* **iframe-resizer:** Load original file ([c84cfbf](https://github.com/podlove/podlove-web-player/commit/c84cfbf)), closes [#469](https://github.com/podlove/podlove-web-player/issues/469)
* **info-tab:** Transform duration milliseconds to minutes and hours ([c5c7b8c](https://github.com/podlove/podlove-web-player/commit/c5c7b8c))
* **mock-data:** Adds absolute urls to fixtures ([1ccb4a2](https://github.com/podlove/podlove-web-player/commit/1ccb4a2))
* **storage:** Restores rate and volume from localstorage ([e076681](https://github.com/podlove/podlove-web-player/commit/e076681)), closes [#467](https://github.com/podlove/podlove-web-player/issues/467)
* **tests:** Adapts tests for transcripts ([215bb53](https://github.com/podlove/podlove-web-player/commit/215bb53))
* **transcripts:** Fixes name and avatar assignment ([193e93a](https://github.com/podlove/podlove-web-player/commit/193e93a))
* **transcripts:** Fixes scroll bug ([381fa99](https://github.com/podlove/podlove-web-player/commit/381fa99))
* **transcripts-time:** Adapt parser to transform seconds to milliseconds ([7bdc324](https://github.com/podlove/podlove-web-player/commit/7bdc324))
* **vendor-block:** Remove error monitoring to prevent blocking of vendor bundle from iOS and Safari ([1c427c4](https://github.com/podlove/podlove-web-player/commit/1c427c4))
* **viewport-width:** Fixes iframe width to anchor width ([531d816](https://github.com/podlove/podlove-web-player/commit/531d816)), closes [#461](https://github.com/podlove/podlove-web-player/issues/461)


### Features

* **autoplay:** Add autoplay as url parameter ([7352579](https://github.com/podlove/podlove-web-player/commit/7352579))
* **info:** Adds ability to use line breaks in description ([164439b](https://github.com/podlove/podlove-web-player/commit/164439b)), closes [#459](https://github.com/podlove/podlove-web-player/issues/459)
* **time-tracking:** Use milliseconds instead of seconds ([e4a682b](https://github.com/podlove/podlove-web-player/commit/e4a682b))
* **transcripts:** Adds transcripts to episode ([a861b2b](https://github.com/podlove/podlove-web-player/commit/a861b2b))
* **transcripts:** Improve transcripts handling ([f25cd7b](https://github.com/podlove/podlove-web-player/commit/f25cd7b))



<a name="4.0.0"></a>
# [4.0.0](https://github.com/podlove/podlove-web-player/compare/v4.0.0-beta.5...v4.0.0) (2017-10-29)


### Bug Fixes

* **current-chapter:** Enable current chapter preview ([9c9b91c](https://github.com/podlove/podlove-web-player/commit/9c9b91c))



<a name="4.0.0-beta.4"></a>
# [4.0.0-beta.4](https://github.com/podlove/podlove-web-player/compare/v4.0.0-alpha.6...v4.0.0-beta.4) (2017-10-20)


### Bug Fixes

* **button:** Use inner element for buttons with flexbox ([b4aee42](https://github.com/podlove/podlove-web-player/commit/b4aee42))
* **contributors:** Filter list of contributors ([e3710b7](https://github.com/podlove/podlove-web-player/commit/e3710b7))
* **embedding:** Enable width resizing for iOS ([44b9a80](https://github.com/podlove/podlove-web-player/commit/44b9a80))
* **encoding:** Add UTF-8 encoding meta to embed frame ([24c3f66](https://github.com/podlove/podlove-web-player/commit/24c3f66)), closes [#422](https://github.com/podlove/podlove-web-player/issues/422)
* **header:** Enable truncation for title, subtile and description ([d526db9](https://github.com/podlove/podlove-web-player/commit/d526db9))
* **internet-explorer:** Add babel polyfills ([59c1744](https://github.com/podlove/podlove-web-player/commit/59c1744))
* **responsive, input-button, docs:** Fixes several bugs ([d8f32da](https://github.com/podlove/podlove-web-player/commit/d8f32da))
* **share-tab:** Don't try to display chapter selector if no chapters available. ([3126b60](https://github.com/podlove/podlove-web-player/commit/3126b60))
* **tab-headers:** truncate headers if no space available ([86897b8](https://github.com/podlove/podlove-web-player/commit/86897b8))


### Features

* **app-background:** Use white background to cover alpha levels ([162a980](https://github.com/podlove/podlove-web-player/commit/162a980))
* **download-tab:** Add copy url button ([898264f](https://github.com/podlove/podlove-web-player/commit/898264f))
* **download-tab:** Add download tab ([336cee5](https://github.com/podlove/podlove-web-player/commit/336cee5))
* **info-tab:** Add info tab ([bb32e41](https://github.com/podlove/podlove-web-player/commit/bb32e41))
* **last-action:** Add last action reducer ([1f35ca0](https://github.com/podlove/podlove-web-player/commit/1f35ca0))
* **live-mode:** Add live mode ([c24a817](https://github.com/podlove/podlove-web-player/commit/c24a817))
* **minimal-version:** Harden player for minimal configuration ([5d970f0](https://github.com/podlove/podlove-web-player/commit/5d970f0))
* **share:** Streamline sharing tab ([5a5bf8c](https://github.com/podlove/podlove-web-player/commit/5a5bf8c))
* **tabs:** Increase click areas on tab headers ([1615cfa](https://github.com/podlove/podlove-web-player/commit/1615cfa))
* **tabs:** Optimise tab title truncation ([9848fda](https://github.com/podlove/podlove-web-player/commit/9848fda))
* **visible components:** Add ability to show/hide components ([1f6a0ea](https://github.com/podlove/podlove-web-player/commit/1f6a0ea))


### upgrade

* **styles:** Outsource CSS in dedicated file ([51a0a72](https://github.com/podlove/podlove-web-player/commit/51a0a72))


### BREAKING CHANGES

* **download-tab:** audio files reference format changed, see docs
* **styles:** new file style.css



<a name="4.0.0-beta.1"></a>
# [4.0.0-beta.1](https://github.com/podlove/podlove-web-player/compare/v4.0.0-alpha.6...v4.0.0-beta.1) (2017-09-16)


### Bug Fixes

* **button:** Use inner element for buttons with flexbox ([b4aee42](https://github.com/podlove/podlove-web-player/commit/b4aee42))
* **embedding:** Enable width resizing for iOS ([44b9a80](https://github.com/podlove/podlove-web-player/commit/44b9a80))
* **encoding:** Add UTF-8 encoding meta to embed frame ([24c3f66](https://github.com/podlove/podlove-web-player/commit/24c3f66)), closes [#422](https://github.com/podlove/podlove-web-player/issues/422)
* **header:** Enable truncation for title, subtile and description ([d526db9](https://github.com/podlove/podlove-web-player/commit/d526db9))
* **internet-explorer:** Add babel polyfills ([59c1744](https://github.com/podlove/podlove-web-player/commit/59c1744))
* **responsive, input-button, docs:** Fixes several bugs ([d8f32da](https://github.com/podlove/podlove-web-player/commit/d8f32da))
* **share-tab:** Don't try to display chapter selector if no chapters available. ([3126b60](https://github.com/podlove/podlove-web-player/commit/3126b60))
* **tab-headers:** truncate headers if no space available ([86897b8](https://github.com/podlove/podlove-web-player/commit/86897b8))


### Features

* **app-background:** Use white background to cover alpha levels ([162a980](https://github.com/podlove/podlove-web-player/commit/162a980))
* **download-tab:** Add copy url button ([898264f](https://github.com/podlove/podlove-web-player/commit/898264f))
* **download-tab:** Add download tab ([336cee5](https://github.com/podlove/podlove-web-player/commit/336cee5))
* **info-tab:** Add info tab ([bb32e41](https://github.com/podlove/podlove-web-player/commit/bb32e41))
* **minimal-version:** Harden player for minimal configuration ([5d970f0](https://github.com/podlove/podlove-web-player/commit/5d970f0))
* **share:** Streamline sharing tab ([5a5bf8c](https://github.com/podlove/podlove-web-player/commit/5a5bf8c))
* **tabs:** Increase click areas on tab headers ([1615cfa](https://github.com/podlove/podlove-web-player/commit/1615cfa))


### upgrade

* **styles:** Outsource CSS in dedicated file ([51a0a72](https://github.com/podlove/podlove-web-player/commit/51a0a72))


### BREAKING CHANGES

* **download-tab:** audio files reference format changed, see docs
* **styles:** new file style.css



<a name="4.0.0-alpha"></a>
# [4.0.0-alpha](https://github.com/podlove/podlove-web-player/compare/v4.0.0-alpha.5...v4.0.0-alpha) (2017-07-10)


### Bug Fixes

* **chapters:** Fixing various bugs related to chapters control ([2d5e061](https://github.com/podlove/podlove-web-player/commit/2d5e061)), closes [#390](https://github.com/podlove/podlove-web-player/issues/390) [#389](https://github.com/podlove/podlove-web-player/issues/389)
* **linting:** fix linter errors ([311f324](https://github.com/podlove/podlove-web-player/commit/311f324))
* **play-button:** Dynamic width play button with text mode ([778fc03](https://github.com/podlove/podlove-web-player/commit/778fc03))


### Features

* **chapter:** Add hover effect to chapters ([6bdb5ae](https://github.com/podlove/podlove-web-player/commit/6bdb5ae))
* **chapters:** Rework chapter interaction, introduce play icon in chapter ([9e17747](https://github.com/podlove/podlove-web-player/commit/9e17747))
* **chapters:** Start chapter on touch always from beginning ([6997b64](https://github.com/podlove/podlove-web-player/commit/6997b64))
* **chapters:** Use chapter entries to navigate through playtime ([1fbd4bf](https://github.com/podlove/podlove-web-player/commit/1fbd4bf))
* **chapters:** Use chapter entries to navigate through playtime ([847d69b](https://github.com/podlove/podlove-web-player/commit/847d69b))
* **error-monitor:** Add sentry support with release control ([58ea3c7](https://github.com/podlove/podlove-web-player/commit/58ea3c7))
* **font-face:** Use Fira sans and Fira mono ([935a132](https://github.com/podlove/podlove-web-player/commit/935a132))
* **ghost-chapter:** Add ghost mode to chapters ([0202f50](https://github.com/podlove/podlove-web-player/commit/0202f50))
* **info:** Set links in embed mode ([05b8778](https://github.com/podlove/podlove-web-player/commit/05b8778))
* **keyboard:** Add keyboard effects to control volume ([ba7b88b](https://github.com/podlove/podlove-web-player/commit/ba7b88b))
* **playtime:** Prefix running progress and chapters with minus ([ae23ba2](https://github.com/podlove/podlove-web-player/commit/ae23ba2))
* **progress-track:** Add ghost mode to progress slider ([401c032](https://github.com/podlove/podlove-web-player/commit/401c032))
* **settings-tab:** Add mute/unmute button ([df9eafd](https://github.com/podlove/podlove-web-player/commit/df9eafd))
* **settings-tab:** Add mute/unmute button ([8aacb7b](https://github.com/podlove/podlove-web-player/commit/8aacb7b))
* **speed-slider:** Use two linear functions for better speed sliding ([c37ef85](https://github.com/podlove/podlove-web-player/commit/c37ef85))
* **tab-refinement:** Update color calculation to match also highly saturated colours. ([cec77fb](https://github.com/podlove/podlove-web-player/commit/cec77fb))


### BREAKING CHANGES

* **tab-refinement:** - theme.primary is now called theme.main
- theme.secondary is now called theme.highlight



<a name="4.0.0-alpha"></a>
# [4.0.0-alpha](https://github.com/podlove/podlove-web-player/compare/v4.0.0-alpha.5...v4.0.0-alpha) (2017-06-16)


### Bug Fixes

* Close breakpoint gap in titlebar views ([189121f](https://github.com/podlove/podlove-web-player/commit/189121f))
* Convert absolute bg image path to relative ([e24af7e](https://github.com/podlove/podlove-web-player/commit/e24af7e))
* **style:** Apply strict word-break rule only on links in tabs ([61969bd](https://github.com/podlove/podlove-web-player/commit/61969bd))
* prevent long words from breaking out of layout ([eedd890](https://github.com/podlove/podlove-web-player/commit/eedd890))
* **babelrc:** Fix invalid runtime configuration ([d309623](https://github.com/podlove/podlove-web-player/commit/d309623))
* **baseurl:** Provide base url as asset base ([3052775](https://github.com/podlove/podlove-web-player/commit/3052775))
* **Buttons:** Remove multiple podlove-player--button occasions ([100e041](https://github.com/podlove/podlove-web-player/commit/100e041)), closes [#334](https://github.com/podlove/podlove-web-player/issues/334)
* **Current Chapter:** Calculate minima; width of current chapter ([e0220e5](https://github.com/podlove/podlove-web-player/commit/e0220e5)), closes [#337](https://github.com/podlove/podlove-web-player/issues/337) [#339](https://github.com/podlove/podlove-web-player/issues/339)
* **gh-pages:** Disable GitHub pages temporary ([39dad23](https://github.com/podlove/podlove-web-player/commit/39dad23))
* **github-releases:** Provide all files, also some minor adjustments to bundling and styling ([4794704](https://github.com/podlove/podlove-web-player/commit/4794704))
* **layout:** Fix adaptive font-sizes for large screens ([01f27e3](https://github.com/podlove/podlove-web-player/commit/01f27e3))
* **layout:** Fix overlapping breakpoints for small screens ([5ec57d3](https://github.com/podlove/podlove-web-player/commit/5ec57d3))
* **layout:** One column in info tab on small screens ([423b978](https://github.com/podlove/podlove-web-player/commit/423b978))
* **persist:** Fixes issue with object-hash library, use hashed title as identifier ([32f8a75](https://github.com/podlove/podlove-web-player/commit/32f8a75))
* **publisher-integration:** Several adaptions for web player integration ([546ea4a](https://github.com/podlove/podlove-web-player/commit/546ea4a))
* **slider-thumbs:** Desktop-clicking the timeline is not precise #366 ([635f225](https://github.com/podlove/podlove-web-player/commit/635f225))
* **Steppers:** Enforce float on state ([44edf26](https://github.com/podlove/podlove-web-player/commit/44edf26)), closes [#338](https://github.com/podlove/podlove-web-player/issues/338)
* **Steppers:** Steppers wrong state while playing ([c05ecde](https://github.com/podlove/podlove-web-player/commit/c05ecde)), closes [#336](https://github.com/podlove/podlove-web-player/issues/336)
* **style:** Add margin to info tab paragraphs ([05bec1d](https://github.com/podlove/podlove-web-player/commit/05bec1d))
* **style:** Apply normal word-break rule on p and headings in tabs ([8c2ed7a](https://github.com/podlove/podlove-web-player/commit/8c2ed7a))
* use general margin variable for progress bar margins ([6b8a352](https://github.com/podlove/podlove-web-player/commit/6b8a352))
* **style:** Fix alignment of elements in progress bar ([b57cde6](https://github.com/podlove/podlove-web-player/commit/b57cde6))


### Features

* **improve-bundling:** Streamline .babelrc, adjust tests ([165cb61](https://github.com/podlove/podlove-web-player/commit/165cb61))
* add margin left and right to progress bar so that progress handle / scrubber is completely shown when progess is 0% or 100% ([1016428](https://github.com/podlove/podlove-web-player/commit/1016428))
* **bundling:** Improve bundling ([243f09a](https://github.com/podlove/podlove-web-player/commit/243f09a))
* **deep-linking:** Use podlove deep linking format ([9df558c](https://github.com/podlove/podlove-web-player/commit/9df558c))
* **error-handling:** Handle player load error ([be9ee00](https://github.com/podlove/podlove-web-player/commit/be9ee00))
* **keyboard:** Add keyboard effects ([3957b23](https://github.com/podlove/podlove-web-player/commit/3957b23))
* **l10n:** Add Internationalisation ([3908225](https://github.com/podlove/podlove-web-player/commit/3908225))
* **loader:** Animate opacity on boot time ([e7a37f8](https://github.com/podlove/podlove-web-player/commit/e7a37f8))
* **quantiles:** Only track the users played section ([3b73bd3](https://github.com/podlove/podlove-web-player/commit/3b73bd3))
* **seperation:** Separate docs and statics ([a6b2e0e](https://github.com/podlove/podlove-web-player/commit/a6b2e0e))
* **settings-tab:** Add mute/unmute button ([8aacb7b](https://github.com/podlove/podlove-web-player/commit/8aacb7b))
* use pointer cursor on progress handle / scrubber ([72bf499](https://github.com/podlove/podlove-web-player/commit/72bf499))
* **share-link:** Use a share link ([a2b3fef](https://github.com/podlove/podlove-web-player/commit/a2b3fef))
* **share-tab:** Adapt sharing UI, buttons for volume slider ([60b3f72](https://github.com/podlove/podlove-web-player/commit/60b3f72))
* **speed-slider:** Improve Speed Slider ([7249b0b](https://github.com/podlove/podlove-web-player/commit/7249b0b))
* **speed-slider:** Use two linear functions for better speed sliding ([c37ef85](https://github.com/podlove/podlove-web-player/commit/c37ef85))
* **tests:** Add basic test coverage for utils, store and actions ([93d4906](https://github.com/podlove/podlove-web-player/commit/93d4906))



<a name="3.0.0-beta.6"></a>
# [3.0.0-beta.6](https://github.com/podlove/podlove-web-player/compare/v3.0.0-alpha...v3.0.0-beta.6) (2015-11-18)



<a name="2.0.17"></a>
## [2.0.17](https://github.com/podlove/podlove-web-player/compare/v2.0.16...v2.0.17) (2013-10-28)



<a name="2.0.16"></a>
## [2.0.16](https://github.com/podlove/podlove-web-player/compare/v2.0.15...v2.0.16) (2013-10-19)



<a name="2.0.15"></a>
## [2.0.15](https://github.com/podlove/podlove-web-player/compare/v2.0.14...v2.0.15) (2013-09-07)



<a name="2.0.14"></a>
## [2.0.14](https://github.com/podlove/podlove-web-player/compare/v2.0.13...v2.0.14) (2013-09-05)



<a name="2.0.13"></a>
## [2.0.13](https://github.com/podlove/podlove-web-player/compare/v2.0.12...v2.0.13) (2013-07-11)



<a name="2.0.12"></a>
## [2.0.12](https://github.com/podlove/podlove-web-player/compare/v2.0.11...v2.0.12) (2013-07-08)



<a name="2.0.11"></a>
## [2.0.11](https://github.com/podlove/podlove-web-player/compare/v2.0.10...v2.0.11) (2013-06-11)



<a name="2.0.10"></a>
## [2.0.10](https://github.com/podlove/podlove-web-player/compare/v2.0.9...v2.0.10) (2013-05-22)



<a name="2.0.9"></a>
## [2.0.9](https://github.com/podlove/podlove-web-player/compare/v2.0.8...v2.0.9) (2013-05-22)



<a name="2.0.8"></a>
## [2.0.8](https://github.com/podlove/podlove-web-player/compare/v2.0.7...v2.0.8) (2013-05-22)



<a name="2.0.7"></a>
## [2.0.7](https://github.com/podlove/podlove-web-player/compare/v2.0.6...v2.0.7) (2013-04-09)



<a name="2.0.6"></a>
## [2.0.6](https://github.com/podlove/podlove-web-player/compare/v2.0.5...v2.0.6) (2013-04-04)



<a name="2.0.5"></a>
## [2.0.5](https://github.com/podlove/podlove-web-player/compare/v2.0.4...v2.0.5) (2013-03-07)



<a name="2.0.4"></a>
## [2.0.4](https://github.com/podlove/podlove-web-player/compare/v2.0.3...v2.0.4) (2013-03-03)



<a name="2.0.3"></a>
## [2.0.3](https://github.com/podlove/podlove-web-player/compare/v2.0.2...v2.0.3) (2013-02-28)



<a name="2.0.2"></a>
## [2.0.2](https://github.com/podlove/podlove-web-player/compare/v2.0.1...v2.0.2) (2013-02-14)



<a name="2.0.1"></a>
## [2.0.1](https://github.com/podlove/podlove-web-player/compare/v2.0.0...v2.0.1) (2013-02-14)



<a name="2.0.0"></a>
# [2.0.0](https://github.com/podlove/podlove-web-player/compare/v1.2.0...v2.0.0) (2013-02-14)



<a name="1.2.0"></a>
# [1.2.0](https://github.com/podlove/podlove-web-player/compare/7f4d2d7...v1.2.0) (2012-11-10)


### Bug Fixes

* function_exists takes a string not a constant ([7f4d2d7](https://github.com/podlove/podlove-web-player/commit/7f4d2d7))



