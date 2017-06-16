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



