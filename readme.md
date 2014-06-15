# Podlove Web Player

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

## Set up CSS pre-processing

### Update ruby environment

       $ gem update --system

### Install SASS

* [Official SASS site](http://sass-lang.com/install)


    gem install sass

or

    sudo gem install sass

Then check your version (should be 3.3.x)

    sass -v

### Install Compass

* [Official Compass site](http://compass-style.org/install/)

Compass runs on any computer that has ruby installed.

Then install compass

    gem install compass

### Install SASS CSS Importer

Next you need to install the [SASS CSS Importer](https://github.com/chriseppstein/sass-css-importer) ruby gem.

    gem install --pre sass-css-importer

### Install autoprefixer

Install autoprefixer to parse CSS and add vendor prefixes to rules fetched from 'Can I Use'
[https://github.com/ai/autoprefixer](https://github.com/ai/autoprefixer)

    sudo npm install --global autoprefixer

### Build the CSS file

There is a grunt task for that, processing a version with line comments as well as a minified one

    gulp styles

## Build Distribution Package

Make is now replaced by [gulp]()

Just run the default task to build the distribution package to *dist* folder.

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

No automated tests, yet. Sorry.
But with `gulp serve` you can serve the repository root directory statically for manual local frontend
testing.
You can then access the examples with your browser via `http://localhost:8080/example/index.html`.

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

Contributors:
[Gerrit van Aaken](https://github.com/gerritvanaaken/), [Simon Waldherr](https://github.com/simonwaldherr/),
[Frank Hase](https://github.com/Kambfhase/), [Eric Teubert](https://github.com/eteubert/),
[Juri Leino](https://github.com/line-o) and [others](https://github.com/podlove/podlove-web-player/contributors)
Version: 2.1.0-alpha
License: [BSD 2-Clause License](http://opensource.org/licenses/BSD-2-Clause)
