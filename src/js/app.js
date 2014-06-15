/**!
 * ===========================================
 * Podlove Web Player v2.1.0-alpha
 * Licensed under The BSD 2-Clause License
 * http://opensource.org/licenses/BSD-2-Clause
 * ===========================================
 * Copyright (c) 2014, Gerrit van Aaken (https://github.com/gerritvanaaken/), Simon Waldherr (https://github.com/simonwaldherr/), Frank Hase (https://github.com/Kambfhase/), Eric Teubert (https://github.com/eteubert/) and others (https://github.com/podlove/podlove-web-player/contributors)
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 *
 * - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
'use strict';

var TabRegistry = require('./tabregistry'),
  Info = require('./modules/info'),
  Share = require('./modules/share'),
  Downloads = require('./modules/downloads'),
  Chapters = require('./modules/chapter'),
  Controls = require('./controls'),
  SaveTime = require('./modules/savetime'),
  tc = require('./timecode'),
  player = require('./player'),
  autoplay = false;

var startAtTime;
var stopAtTime;

// will expose/attach itself to the $ global
require('../libs/mediaelement/build/mediaelement.js');

// FIXME put in compat mode module
if (typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function () {
    "use strict";
    return this.replace(/^\s+|\s+$/g, '');
  };
}

var checkCurrentURL = function () {
  var deepLink = require('./url').checkCurrent ();
  if (!deepLink) { return; }
  startAtTime = deepLink[0];
  stopAtTime = deepLink[1];
};

/**
 * Render HTML title area
 * @param params
 * @returns {string}
 */
function renderTitleArea(params) {
  return '<header>' +
    renderShowTitle(params.show.title, params.show.url) +
    renderTitle(params.title, params.permalink) +
    renderSubTitle(params.subtitle) +
    '</header>';
}

/**
 * The most missing feature regarding embedded players
 * @param {string} title
 * @param {string} url
 * @returns {string}
 */
function renderShowTitle(title, url) {
  if (!title) {
    return '';
  }
  if (url) {
    title = '<a href="' + url + '">' + title + '</a>';
  }
  return '<h4 class="showtitle">' + title + '</h4>';
}

/**
 * Render episode title HTML
 * @param {string} text
 * @param {string} link
 * @returns {string}
 */
function renderTitle(text, link) {
  var titleBegin = '<h2 class="episodetitle">',
    titleEnd = '</h2>';
  if (text !== undefined && link !== undefined) {
    text = '<a href="' + link + '">' + text + '</a>';
  }
  return titleBegin + text + titleEnd;
}

/**
 * Render HTML subtitle
 * @param {string} text
 * @returns {string}
 */
function renderSubTitle(text) {
  if (!text) {
    return '';
  }
  return '<h3 class="subtitle">' + text + '</h3>';
}

/**
 * Render HTML playbutton
 * @returns {string}
 */
function renderPlaybutton() {
  return '<a class="bigplay" title="Play Episode" href="#"></a>';
}

/**
 * Render the poster image in HTML
 * returns an empty string if posterUrl is empty
 * @param {string} posterUrl
 * @returns {string} rendered HTML
 */
function renderPoster(posterUrl) {
  if (!posterUrl) { return ''; }
  return '<div class="coverart"><img class="coverimg" src="' + posterUrl + '" data-img="' + posterUrl + '" alt="Poster Image"></div>';
}

/**
 *
 * @param {object} params
 * @returns {boolean} true if at least one chapter is present
 */
function checkForChapters(params) {
  return !!params.chapters && (
    (typeof params.chapters === 'string' && params.chapters.length > 10) ||
      (typeof params.chapters === 'object' && params.chapters.length > 1)
    );
}

/**
 * checks if the current window is hidden
 * @returns {boolean} true if the window is hidden
 */
function isHidden() {
  var props = [
    'hidden',
    'mozHidden',
    'msHidden',
    'webkitHidden'
  ];

  for (var index in props) {
    if (props[index] in document) {
      return !!document[props[index]];
    }
  }
  return false;
}

/**
 * add chapter behavior and deeplinking: skip to referenced
 * time position & write current time into address
 * @param {object} player
 * @param {object} params
 * @param {object} wrapper
 */
var addBehavior = function (player, params, wrapper) {
  var jqPlayer = $(player),
    tabs = new TabRegistry(),
    hasChapters = checkForChapters(params),
    metaElement = $('<div class="titlebar"></div>'),
    playerType = params.type,
    controls,
    controlBox,
    deepLink,
    storageKey;

  /**
   * Build rich player with meta data
   */
  wrapper.addClass('podlovewebplayer_' + playerType);

  if (playerType === "audio") {
    // Render playbutton
    metaElement.prepend(renderPlaybutton());
    var poster = params.poster || jqPlayer.attr('poster');
    metaElement.append(renderPoster(poster));
    wrapper.prepend(metaElement);
  }

  if (playerType === "video") {
    wrapper.prepend('<div class="podlovewebplayer_top"></div>');
    wrapper.append(metaElement);
  }

  // Render title area with title h2 and subtitle h3
  metaElement.append(renderTitleArea(params));

  /**
   * Timecontrols
   */
  controls = new Controls(player);
  controlBox = controls.box;
  //always render toggler buttons wrapper
  wrapper.append(controlBox);

  /**
   * -- TABS --
   * FIXME enable chapter tab
   */
  controlBox.append(tabs.togglebar);
  wrapper.append(tabs.container);

  tabs.addModule(new Info(params));
  tabs.addModule(new Share(params));
  var saveTime = new SaveTime(player, params);
  tabs.addModule(saveTime);

  var downloads = new Downloads(params);
  tabs.addModule(downloads);

  var chapters;
  if (hasChapters) {
    chapters = new Chapters(player, params);
    tabs.addModule(chapters);
    if ((params.chaptersVisible === 'true') || (params.chaptersVisible === true)) {
      tabs.open(chapters.tab);
    }
  }
  chapters.addEventhandlers(player);
  controls.createTimeControls(chapters);

  // expose the player interface
  wrapper.data('podlovewebplayer', {
    player: jqPlayer
  });

  // parse deeplink
  deepLink = tc.parse(window.location.href);
  if (deepLink !== false && pwp.players.length === 1) {
    var playerAttributes = {preload: 'auto'};
    if (!isHidden() && autoplay) {
      playerAttributes.autoplay = 'autoplay';
    }
    jqPlayer.attr(playerAttributes);
    startAtTime = deepLink[0];
    stopAtTime = deepLink[1];
  } else if (params && params.permalink) {
    //console.debug(params);
    storageKey = params.permalink;
    if (saveTime.getItem(storageKey)) {
      jqPlayer.one('canplay', function () {
        var time = saveTime.getItem(storageKey);
        //console.debug(time);
        this.currentTime = time;
      });
    }
  }

  if (deepLink !== false && pwp.players.length === 1) {
    $('html, body').delay(150).animate({
      scrollTop: $('.container:first').offset().top - 25
    });
  }

  if (pwp.players.length === 1) {
    // check if deeplink is set
    checkCurrentURL();
  }
  // cache some jQ objects
  //metaElement = wrapper.find('.titlebar');
  var playButton = metaElement.find('.bigplay');
  playButton.on('click', function () {
    var playButton = $(this);
    console.log(playButton);
    if ((typeof player.currentTime === 'number') && (player.currentTime > 0)) {
      if (player.paused) {
        playButton.addClass('playing');
        player.play();
      } else {
        playButton.removeClass('playing');
        player.pause();
      }
    } else {
      if (!playButton.hasClass('playing')) {
        playButton.addClass('playing');
        playButton.parent().parent().find('.mejs-time-buffering').show();
      }
      // flash fallback needs additional pause
      if (player.pluginType === 'flash') {
        player.pause();
      }
      player.play();
    }
  });

  // wait for the player or you'll get DOM EXCEPTIONS
  // And just listen once because of a special behaviour in firefox
  // --> https://bugzilla.mozilla.org/show_bug.cgi?id=664842
  jqPlayer.one('canplay', function () {
    // add duration of final chapter
    if (player.duration) {
    }
    // add Deeplink Behavior if there is only one player on the site
    /*
     if (players.length === 1) {
     jqPlayer
     .bind('play timeupdate', { player: player }, checkTime)
     .bind('pause', { player: player }, addressCurrentTime);
     // disabled 'cause it overrides chapter clicks
     // bind seeked to addressCurrentTime
     checkCurrentURL();
     // handle browser history navigation
     jQuery(window).bind('hashchange onpopstate', function (e) {
     if (!ignoreHashChange) {
     checkCurrentURL();
     }
     ignoreHashChange = false;
     });
     }
     */
  });

  jqPlayer
    .on('timeupdate', function (event) {
      tabs.update(event);
    })
    // update play/pause status
    .on('play', function (event) {
      //console.log('Player.play fired', event);
      //player.setCurrentTime(0);
    })
    .on('playing', function () {
      //console.log('Player.playing fired', event);
      playButton.addClass('playing');
      pwp.embed.postToOpener({ action: 'play', arg: player.currentTime });
    })
    .on('pause', function () {
      //console.log('Player.pause playButton', playButton);
      playButton.removeClass('playing');
      pwp.embed.postToOpener({ action: 'pause', arg: player.currentTime });
    })
    .on('ended', function () {
      pwp.embed.postToOpener({ action: 'stop', arg: player.currentTime });
      player.setCurrentTime(0);
    });
};

/**
 *
 * @param {object} options
 * @returns {jQuery}
 */
$.fn.podlovewebplayer = function webPlayer (options) {
  // Additional parameters default values
  var params = $.extend({}, player.defaults, options);
  // turn each player in the current set into a Podlove Web Player
  return this.each(function (i, playerElement) {
    player.create(playerElement, params, addBehavior);
  });
};

var pwp = {
  tc: require('./timecode'),
  players: player.players,
  embed: require('./embed')
};

//FIXME without embed animations are fluent
pwp.embed.init($, player.players);

window.pwp = pwp;
//module.exports = pwp;
