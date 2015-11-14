# Podlove Web Player

[![Code Climate](https://codeclimate.com/github/podlove/podlove-web-player/badges/gpa.svg)](https://codeclimate.com/github/podlove/podlove-web-player)

[![Build Status](https://travis-ci.org/podlove/podlove-web-player.svg)](https://travis-ci.org/podlove/podlove-web-player)

## About

HTML5 Goodness for Podcasting

**Podlove** Web Player is a Podcast-optimized, HTML5-based video and audio player with Flash fallback.
It can be used as a WordPress plugin or within a static HTML/JavaScript context.

The **Podlove** Web Player supports almost every modern browser and also does captions, chapters and much more.
Thanks to MediaElement.js for providing the foundation.

* [Official Site on podlove.org](http://podlove.org/podlove-web-player/)
* [WordPress Plugin Page](http://wordpress.org/plugins/podlove-web-player/)

## Usage

The release version should have the application, the moderator their dependencies and necessary styles and fonts
ready in the `dist` folder.
Along with them there is a running example that shows you how to integrate the player in any webpage.
Either directly as in `embed.html` or as an iframe/ embedded player as in `index.html`.

## Installation

Clone the repository and install all dependencies with

    bower install
    npm install
    npm install -g gulp

## Install autoprefixer

Install autoprefixer to parse CSS and add vendor prefixes to rules fetched from 'Can I Use'
[https://github.com/ai/autoprefixer](https://github.com/ai/autoprefixer)

    sudo npm install --global autoprefixer

## Build the CSS file

There is a gulp task for that, processing a version with line comments as well as a minified one

    gulp styles

## Build Distribution Package

Make is now replaced by [gulp](https://github.com/gulpjs/gulp/blob/master/docs/README.md)

Just run the default task to build the distribution package to `dist` folder.

    gulp

### For production

    npm install -g uglifyify minifyify

smallest possible code (>50kB)

    browserify -g uglifyify js/app.js > static/podlove-web-player.js

with sourcemaps (~250kB)

    browserify -d js/app.js | minifyify > static/podlove-web-player.js

## Development

Build, serve and watch the local repository version. With livereload on top

    gulp serve

## Test

Some automated tests are written and can be found in the *spec* folder.
Install [PhantomJS](http://phantomjs.org/) to be able to run them on your machine.

Run them with

    gulp test

Each commit pushed to the repo will automatically launch the tests on TravisCI.

## Info

**Important!**
The Wordpress-plugin that includes the Podlove-Webplayer alone will be moved to its own repo.

## Contributing

Fork it

Create your feature branch

    git checkout -b my-new-feature

Commit your changes

    git commit -am 'Added some feature'

Push to the branch

    git push origin my-new-feature

Create new Pull Request

## Release

  git checkout release

  git merge dev

Copy the commit messages from the editor to clipboard for later use.

  gulp build

  git add . -f

  git commit "release <version>"

  git push

Go to https://github.com/podlove/podlove-web-player/releases/new

Use version as the tagname. Versions follow semantic versioning http://semver.org .

Paste the contents of your clipboard into the description field and edit them
to be a human readable changelog.

## Contributors

[Gerrit van Aaken](https://github.com/gerritvanaaken/), [Simon Waldherr](https://github.com/simonwaldherr/),
[Frank Hase](https://github.com/Kambfhase/), [Eric Teubert](https://github.com/eteubert/),
[Juri Leino](https://github.com/line-o), [Alexandra von Criegern](https://github.com/plutonik-a) and [others](https://github.com/podlove/podlove-web-player/contributors)

## Version
3.0.0-beta.3

## License
[BSD 2-Clause License](http://opensource.org/licenses/BSD-2-Clause)
