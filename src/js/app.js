/**!
 * ===========================================
 * Podlove Web Player v3.0.0-alpha
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
  embed = require('./embed'),
  Timeline = require('./timeline'),
  Info = require('./modules/info'),
  Share = require('./modules/share'),
  Downloads = require('./modules/downloads'),
  Chapters = require('./modules/chapter'),
  SaveTime = require('./modules/savetime'),
  Controls = require('./controls'),
  Player = require('./player'),
  ProgressBar = require('./modules/progressbar');

var pwp;

// will expose/attach itself to the $ global
require('../../bower_components/mediaelement/build/mediaelement.js');

/**
 * The most missing feature regarding embedded players
 * @param {string} title the title of the show
 * @param {string} url (optional) the link to the show
 * @returns {string}
 */
function renderShowTitle(title, url) {
  if (!title) {
    return '';
  }
  if (url) {
    title = '<a href="' + url + '" target="_blank" title="Link zur Show">' + title + '</a>';
  }
  return '<h3 class="showtitle">' + title + '</h3>';
}

/**
 * Render episode title HTML
 * @param {string} text
 * @param {string} link
 * @returns {string}
 */
function renderTitle(text, link) {
  var titleBegin = '<h1 class="episodetitle">',
    titleEnd = '</h1>';
  if (text !== undefined && link !== undefined) {
    text = '<a href="' + link + '"  target="_blank" title="Link zur Episode">' + text + '</a>';
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
  return '<h2 class="subtitle">' + text + '</h2>';
}

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
 * Render HTML playbutton
 * @returns {string}
 */
function renderPlaybutton() {
  return $('<a class="play" title="Abspielen" href="javascript:;"></a>');
}

/**
 * Render the poster image in HTML
 * returns an empty string if posterUrl is empty
 * @param {string} posterUrl
 * @returns {string} rendered HTML
 */
function renderPoster(posterUrl) {
  if (!posterUrl) {
    return '';
  }
  return '<div class="coverart"><img class="coverimg" src="' + posterUrl + '" data-img="' + posterUrl + '" alt="Poster Image"></div>';
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

function renderModules(timeline, wrapper, params) {
  var
    tabs = new TabRegistry(),
    hasChapters = timeline.hasChapters,
    controls = new Controls(timeline),
    controlBox = controls.box;

  /**
   * -- MODULES --
   */
  var chapters;
  if (hasChapters) {
    chapters = new Chapters(timeline, params);
    timeline.addModule(chapters);
  }
  controls.createTimeControls(chapters);

  var saveTime = new SaveTime(timeline, params);
  timeline.addModule(saveTime);

  var progressBar = new ProgressBar(timeline);
  timeline.addModule(progressBar);

  var sharing = new Share(params);
  var downloads = new Downloads(params);
  var infos = new Info(params);

  /**
   * -- TABS --
   * The tabs in controlbar will appear in following order:
   */

  if (hasChapters) {
    tabs.add(chapters.tab);
  }

  tabs.add(sharing.tab);
  tabs.add(downloads.tab);
  tabs.add(infos.tab);

  tabs.openInitial(params.activeTab);

  // Render controlbar with togglebar and timecontrols
  var controlbarWrapper = $('<div class="controlbar-wrapper"></div>');
  controlbarWrapper.append(tabs.togglebar);
  controlbarWrapper.append(controlBox);

  // render progressbar, controlbar and tabs
  wrapper
    .append(progressBar.render())
    .append(controlbarWrapper)
    .append(tabs.container);

  progressBar.addEvents();
}

/**
 * add chapter behavior and deeplinking: skip to referenced
 * time position & write current time into address
 * @param {object} player
 * @param {object} params
 * @param {object} wrapper
 */
function addBehavior(player, params, wrapper) {
  var jqPlayer = $(player),
    timeline = new Timeline(player, params),

    metaElement = $('<div class="titlebar"></div>'),
    playerType = params.type,
    playButton = renderPlaybutton(),
    poster = params.poster || jqPlayer.attr('poster');

  var deepLink;

  console.debug('webplayer', 'metadata', timeline.getData());
  jqPlayer.prop({
    controls: null,
    preload: 'metadata'
  });

  /**
   * Build rich player with meta data
   */
  wrapper
    .addClass('podlovewebplayer_' + playerType)
    .data('podlovewebplayer', {
    player: jqPlayer
  });

  if (playerType === 'audio') {
    // Render playbutton in titlebar
    metaElement.prepend(playButton);
    metaElement.append(renderPoster(poster));
    wrapper.prepend(metaElement);
  }

  if (playerType === 'video') {
    var videoPane = $('<div class="video-pane"></div>');
    var overlay = $('<div class="video-overlay"></div>');
    overlay.append(playButton);
    overlay.on('click', function () {
      if (player.paused) {
        playButton.addClass('playing');
        player.play();
        return;
      }
      playButton.removeClass('playing');
      player.pause();
    });

    videoPane
      .append(overlay)
      .append(jqPlayer);

    wrapper
      .append(metaElement)
      .append(videoPane);

    jqPlayer.prop({poster: poster});
  }

  // Render title area with title h2 and subtitle h3
  metaElement.append(renderTitleArea(params));

  // parse deeplink
  deepLink = require('./url').checkCurrent();
  if (deepLink[0] && pwp.players.length === 1) {
    var playerAttributes = {preload: 'auto'};
    if (!isHidden()) {
      playerAttributes.autoplay = 'autoplay';
    }
    jqPlayer.attr(playerAttributes);
    //stopAtTime = deepLink[1];
    timeline.playRange(deepLink);

    $('html, body').delay(150).animate({
      scrollTop: $('.container:first').offset().top - 25
    });
  }

  playButton.on('click', function (evt) {
    evt.preventDefault();
    evt.stopPropagation();

    if (player.currentTime && player.currentTime > 0 && !player.paused) {
      playButton.removeClass('playing');
      player.pause();
      if (player.pluginType === 'flash') {
        player.pause();    // flash fallback needs additional pause
      }
      return;
    }

    if (!playButton.hasClass('playing')) {
      playButton.addClass('playing');
    }
    player.play();
  });

  $(document)
    .on('keydown', function (e) {
      console.log('progress', 'keydown', e);
      /*
       if ((new Date() - lastKeyPressTime) >= 1000) {
       startedPaused = media.paused;
       }
       */
      //  e.preventDefault();
      //  e.stopPropagation();
      var keyCode = e.which,
        duration = timeline.player.duration,
        seekTime = timeline.player.currentTime;

      switch (keyCode) {
        case 37: // left
          seekTime -= 1;
          break;
        case 39: // Right
          seekTime += 1;
          break;
        case 38: // Up
          if (timeline.hasChapters) {
            timeline.modules[0].next();
            return false;
          }
          seekTime += Math.floor(duration * 0.1);
          break;
        case 40: // Down
          if (timeline.hasChapters) {
            timeline.modules[0].previous();
            return false;
          }
          seekTime -= Math.floor(duration * 0.1);
          break;
        case 36: // Home
          seekTime = 0;
          break;
        case 35: // end
          seekTime = duration;
          break;
        case 10: // enter
        case 32: // space
          if (timeline.player.paused) {
            timeline.player.play();
            return false;
          }
            timeline.player.pause();
          return false;
        default:
          return true;
      }

      timeline.setTime(seekTime);
      return false;
    });

  jqPlayer
    .on('timelineElement', function (event) {
      console.log(event.currentTarget.id, event);
    })
    .on('timeupdate progress', function (event) {
      timeline.update(event);
    })
    // update play/pause status
    .on('play', function () {})
    .on('playing', function () {
      playButton.addClass('playing');
      embed.postToOpener({ action: 'play', arg: player.currentTime });
    })
    .on('pause', function () {
      playButton.removeClass('playing');
      embed.postToOpener({ action: 'pause', arg: player.currentTime });
    })
    .on('ended', function () {
      embed.postToOpener({ action: 'stop', arg: player.currentTime });
      // delete the cached play time
      timeline.rewind();
    });

  var delayModuleRendering = !timeline.duration || isNaN(timeline.duration) || timeline.duration <= 0;

  if (!delayModuleRendering) {
    renderModules(timeline, wrapper, params);
  }

  jqPlayer.one('canplay', function () {
    // correct duration just in case
    timeline.duration = player.duration;
    if (delayModuleRendering) {
      renderModules(timeline, wrapper, params);
    }
  });
}

/**
 * return callback function that will attach source elements to the deferred audio element
 * @param {object} deferredPlayer
 * @returns {Function}
 */
function getDeferredPlayerCallBack(deferredPlayer) {
  return function (data) {
    var params = $.extend({}, Player.defaults, data);
    data.sources.forEach(function (sourceObject) {
      $('<source>', sourceObject).appendTo(deferredPlayer);
    });
    Player.create(deferredPlayer, params, addBehavior);
  };
}

/**
 *
 * @param {object} options
 * @returns {jQuery}
 */
$.fn.podlovewebplayer = function webPlayer(options) {
  if (options.deferred) {
    var deferredPlayer = this[0];
    var callback = getDeferredPlayerCallBack(deferredPlayer);
    embed.waitForMetadata(callback);
    embed.postToOpener({action: 'waiting'});
    return this;
  }

  // Additional parameters default values
  var params = $.extend({}, Player.defaults, options);

  // turn each player in the current set into a Podlove Web Player
  return this.each(function (i, playerElement) {
    Player.create(playerElement, params, addBehavior);
  });
};

pwp = { players: Player.players };

embed.init($, Player.players);

window.pwp = pwp;
