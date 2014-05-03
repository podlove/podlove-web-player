# Podlove Web Player

## About

HTML5 Goodness for Podcasting

Podlove Web Player is a Podcast-optimized, HTML5-based video and audio player with Flash fallback.
It can be used as a WordPress plugin or within a static HTML/JavaScript context.

The Podlove Web Player supports almost every modern browser and also does captions, chapters and much more.
Thanks to MediaElement.js for providing the foundation.

* [Official Site on podlove.org](http://podlove.org/podlove-web-player/)
* [WordPress Plugin Page](http://wordpress.org/plugins/podlove-web-player/)

## Build JavaScript

We will replace *make* with *grunt.js* or *gulp.js* in combination with *browserify*.

Install prerequisites for building:

    npm install -g browserify

Create podlove-web-player/static/podlove-web-player.js with

    browserify js/app.js -o static/podlove-web-player.js

## Build CSS

Install autoprefixer to parse CSS and add vendor prefixes to rules by 'Can I Use'
[https://github.com/ai/autoprefixer](https://github.com/ai/autoprefixer)

    sudo npm install --global autoprefixer


### Setting up the ruby environment

       $ gem update --system

### Install SASS

* [Official SASS site](http://sass-lang.com/install)


    gem install sass

or

    sudo gem install sass

Then check your version

    sass -v

### Install SASS CSS Importer

Next you need to installe the [SASS CSS Importer](https://github.com/chriseppstein/sass-css-importer) ruby gem.

    $ gem install --pre sass-css-importer

### Install Compass

* [Official Compass site](http://compass-style.org/install/)

Compass runs on any computer that has ruby installed.

Then install compass

    $ gem install compass

The Compass settings can be found in this file:

    podlove-web-player/config.rb

To enable the debugging comments that display
the original location of your selectors, comment-in following line:

    line_comments = false

### Build the CSS file

In the command line, navigate to your working directory and compile the output css with

    compass compile

For development you should add a watcher with the command

    compass watch

Finally, for a compressed and minified production file, just run the command:

    compass compile --output-style compressed

## Test

No automated tests, yet. Sorry.
But with `http-server` npm module you can serve the repository root directory statically for manual local frontend testing.
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
