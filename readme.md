# Podlove Web Player

[![Code Climate](https://codeclimate.com/github/podlove/podlove-web-player/badges/gpa.svg)](https://codeclimate.com/github/podlove/podlove-web-player)

[![Build Status](https://travis-ci.org/podlove/podlove-web-player.svg)](https://travis-ci.org/podlove/podlove-web-player)

## About

HTML5 Goodness for Podcasting

**Podlove** Web Player is a Podcast-optimized, HTML5-based video and audio player with Flash fallback.
It can be used as a WordPress plugin or within a static HTML/JavaScript context.

The **Podlove** Web Player supports almost every modern browser and also does captions, chapters and much more.
Thanks to MediaElement.js for providing the foundation.

* [Web Player Documentation](http://docs.podlove.org/podlove-web-player/)
* [Web Player Wiki](https://github.com/podlove/podlove-web-player/wiki)
* [Official site on podlove.org](http://podlove.org/podlove-web-player/)
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

    git fetch

    git checkout -b release origin/release

    git merge origin/dev

    gulp build

Force add all changes. Otherwise changes to the `dist` folder would not be part
of the release.

    git add dist -f

    git commit "release <version-number>"

    git push

Copy the commit messages from the merge commit to clipboard for later use.

    git show HEAD^

Go to https://github.com/podlove/podlove-web-player/releases/new

Use <version-number> as the tagname. Be sure to add a "v" to the beginning.
Versions follow semantic versioning (for details see http://semver.org).

Find a (funny) name that can be easily remembered by humans.

Paste the contents of your clipboard into the description field and edit them
to be a human readable changelog.

Hit the **save** button.

<hr>
## Send feedback about the Podlove Web Player

### Join the conversation

Become a part of the
* **Podlove community** [community.podlove.org](https://community.podlove.org/), or discuss your
* **Web Player** topics or questions on [community.podlove.org/c/podlove-web-player](https://community.podlove.org/c/podlove-web-player).

If you're interested in discussing podcasting topics in general, please visit [sendegate.de](https://sendegate.de/).

### Podlove Docs

* **Podlove Project:** [podlove.github.com](http://podlove.github.com)
* **Web Player:** [docs.podlove.org/podlove-web-player](http://docs.podlove.org/podlove-web-player/)

### Report an issue
If you encounter a specific problem using the Podlove Web Player that you think is a bug, or you see a problem in the documentation, you can report the issue here:<br>
[github.com/podlove/podlove-web-player/issues](https://github.com/podlove/podlove-web-player/issues)

Also, if you have ideas for new features for player, please submit them as a [Github issue](https://github.com/podlove/podlove-web-player/issues).

Have a look on the Trello board to watch the status and progress of your issues:<br>
[trello.com/b/mFPdgi1P/podlove-web-player](https://trello.com/b/mFPdgi1P/podlove-web-player)

### Update the documentation
For contributing to Podlove Web Player documentation, see:<br>
[github.com/podlove/podlove.github.com](https://github.com/podlove/podlove.github.com)

<hr>

## Contributors

[Gerrit van Aaken](https://github.com/gerritvanaaken/), [Simon Waldherr](https://github.com/simonwaldherr/),
[Frank Hase](https://github.com/Kambfhase/), [Eric Teubert](https://github.com/eteubert/),
[Juri Leino](https://github.com/line-o), [Alexandra von Criegern](https://github.com/plutonik-a) and [others](https://github.com/podlove/podlove-web-player/contributors)

## Version
3.0.0-beta.3

## License
[BSD 2-Clause License](http://opensource.org/licenses/BSD-2-Clause)
