/**
 * player
 */
'use strict';
var startAtTime = false,
  stopAtTime = false,
// Keep all Players on site - for inline players
// embedded players are registered in podlove-webplayer-moderator in the embedding page
  players = [],
// all used functions
  embed = require('./embed'),
  TabRegistry = require('./tabregistry'),
  tabs = new TabRegistry(),
  generateTimecode = require('./timecode').generate,
  parseTimecode = require('./timecode').parse,
  handleCookies = require('./cookie'),
  Controls = require('./controls'),
  checkCurrentURL = function () {
    var deepLink = require('./url').checkCurrent ();
    if (!deepLink) { return; }
    startAtTime = deepLink[0];
    stopAtTime = deepLink[1];
  },
  setFragmentURL = require('./url').setFragment,
  infoTab = require('./tabs/info'),
  shareTab = require('./tabs/share'),
  downloadsTab = require('./tabs/downloads'),
  chapterTab = require('./modules/chapter'),
  _playerDefaults = {
    chapterlinks: 'all',
    width: '100%',
    duration: false,
    chaptersVisible: false,
    timecontrolsVisible: false,
    sharebuttonsVisible: false,
    downloadbuttonsVisible: false,
    summaryVisible: false,
    hidetimebutton: false,
    hidedownloadbutton: false,
    hidesharebutton: false,
    sharewholeepisode: false,
    sources: []
  },
  checkTime,
  addressCurrentTime,
  addBehavior;

  checkTime = function (e) {
    if (players.length > 1) {
      return;
    }
    var player = e.data.player;
    //Kinda hackish: Make sure that the timejump is at least 1 second (fix for OGG/Firefox)
    if (startAtTime !== false && (player.lastCheck === undefined || Math.abs(startAtTime - player.lastCheck) > 1)) {
      player.setCurrentTime(startAtTime);
      player.lastCheck = startAtTime;
      startAtTime = false;
    }
    if (stopAtTime !== false && player.currentTime >= stopAtTime) {
      player.pause();
      stopAtTime = false;
    }
  };

  addressCurrentTime = function (e) {
    var fragment;
    if (players.length === 1) {
      fragment = 't=' + generateTimecode([e.data.player.currentTime]);
      setFragmentURL(fragment);
    }
  };

  /**
   * add chapter behavior and deeplinking: skip to referenced
   * time position & write current time into address
   * @param {object} player
   * @param {object} params
   * @param {object} wrapper
   */
  addBehavior = function (player, params, wrapper) {
    var jqPlayer = $(player),
      layoutedPlayer = jqPlayer,
      canplay = false,
      metaElement;

    // expose the player interface
    wrapper.data('podlovewebplayer', {
      player: jqPlayer
    });

    /**
     * The `player` is an interface. It provides the play and pause functionality. The
     * `layoutedPlayer` on the other hand is a DOM element. In native mode, these two
     * are one and the same object. In Flash though the interface is a plain JS object.
     */
    if (players.length === 1) {
      // check if deeplink is set
      checkCurrentURL();
    }
    // get things straight for flash fallback
    if (player.pluginType === 'flash') {
      layoutedPlayer = $('#mep_' + player.id.substring(9));
      console.log(layoutedPlayer);
    }
    // cache some jQ objects
    metaElement = wrapper.find('.titlebar');
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
      canplay = true;
      // add duration of final chapter
      if (player.duration) {
        /*
        marks.find('.timecode code').eq(-1).each(function () {
          var start, end;
          start = Math.floor($(this).closest('tr').data('start'));
          end = Math.floor(player.duration);
          $(this).text(generateTimecode([end - start]));
        });
        */
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
      .on('error', removeUnplayableMedia)    // This might be a fix to some Firefox AAC issues.
      .on('timeupdate', function (event) {
        tabs.update(event);
      })
      // update play/pause status
      .on('play', function (event) {
        //console.log('Player.play fired', event);
        //player.setCurrentTime(0);
      })
      .on('playing', function (event) {
        //console.log('Player.playing fired', event);
        playButton.addClass('playing');
        embed.postToOpener({ action: 'play', arg: player.currentTime });
      })
      .on('pause', function () {
        //console.log('Player.pause playButton', playButton);
        playButton.removeClass('playing');
        embed.postToOpener({ action: 'pause', arg: player.currentTime });
      })
      .on('ended', function () {
        embed.postToOpener({ action: 'stop', arg: player.currentTime });
        player.setCurrentTime(0);
      });
  };

$.fn.podlovewebplayer = function (options) {
    // MEJS options default values
    var mejsoptions = {
        defaultVideoWidth: 480,
        defaultVideoHeight: 270,
        videoWidth: -1,
        videoHeight: -1,
        audioWidth: -1,
        audioHeight: 30,
        startVolume: 0.8,
        loop: false,
        enableAutosize: true,
        features: ['playpause', 'current', 'progress', 'duration', 'tracks', 'fullscreen'],
        alwaysShowControls: false,
        iPadUseNativeControls: false,
        iPhoneUseNativeControls: false,
        AndroidUseNativeControls: false,
        alwaysShowHours: false,
        showTimecodeFrameCount: false,
        framesPerSecond: 25,
        enableKeyboard: true,
        pauseOtherPlayers: true,
        duration: false,
        plugins: ['flash', 'silverlight'],
        pluginPath: './static/',
        flashName: 'flashmediaelement.swf',
        silverlightName: 'silverlightmediaelement.xap'
      },
    // Additional parameters default values
      params = $.extend({}, _playerDefaults, options);
    // turn each player in the current set into a Podlove Web Player
    return this.each(function (index, player) {
      var jqPlayer,
        richplayer = false,
        hasChapters = checkForChapters(params),
        metaElement = $('<div class="titlebar"></div>'),
        playerType = getPlayerType(player),
        secArray,
        orig,
        deepLink,
        wrapper,
        controls,
        controlBox,
        storageKey,
        autoplay;
      //audio params

      //fine tuning params
      params.width = normalizeWidth(params.width);
      if (playerType === 'audio') {
        if (params.audioWidth !== undefined) {
          params.width = params.audioWidth;
        }
        mejsoptions.audioWidth = params.width;
        //kill fullscreen button
        $.each(mejsoptions.features, function (i) {
          if (this === 'fullscreen') {
            mejsoptions.features.splice(i, 1);
          }
        });
      }
      else if (playerType === 'video') {
        //video params
        if (params.height !== undefined) {
          mejsoptions.videoWidth = params.width;
          mejsoptions.videoHeight = params.height;
        }
        // FIXME
        if ($(player).attr('width') !== undefined) {
          params.width = $(player).attr('width');
        }
      }

      //duration can be given in seconds or in NPT format
      if (params.duration && params.duration !== parseInt(params.duration, 10)) {
        secArray = parseTimecode(params.duration);
        params.duration = secArray[0];
      }

      //Overwrite MEJS default values with actual data
      $.each(mejsoptions, function (key) {
        if (key in params) {
          mejsoptions[key] = params[key];
        }
      });

      //wrapper and init stuff
      if (params.width.toString().trim() === parseInt(params.width, 10).toString().trim()) {
        params.width = params.width.toString().trim() + 'px';
      }

      orig = player;
      player = $(player).clone().wrap('<div class="container" style="width: ' + params.width + '"></div>')[0];
      jqPlayer = $(player);
      wrapper = jqPlayer.parent();
      players.push(player);
      //add params from html fallback area and remove them from the DOM-tree
      jqPlayer.find('[data-pwp]').each(function () {
        var $this = $(this);
        params[$this.data('pwp')] = $this.html();
        $this.remove();
      });
      //add params from audio and video elements
      jqPlayer.find('source').each(function () {
        if (!params.sources) {
          params.sources = [];
        }
        params.sources.push($(this).attr('src'));
      });
      //build rich player with meta data
      if (params.chapters !== undefined || params.title !== undefined || params.subtitle !== undefined || params.summary !== undefined || params.poster !== undefined || jqPlayer.attr('poster') !== undefined) {
        //set status variable
        richplayer = true;
        wrapper.addClass('podlovewebplayer_' + playerType);

        if (playerType === "audio") {
          removePlayPause(mejsoptions);
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

        if (params.subtitle && params.title && params.title.length < 42 && !params.poster) {
            wrapper.addClass('podlovewebplayer_smallplayer');
        }

        /**
         * Timecontrols
         */
        controls = new Controls(player);
        controlBox = controls.box;
        //always render toggler buttons wrapper
        wrapper.append(controlBox);
      }

      /**
       * -- TABS --
       * FIXME enable chapter tab
       */
      controlBox.append(tabs.togglebar);
      wrapper.append(tabs.container);

      tabs.add(infoTab(params));
      tabs.add(shareTab(params));
      tabs.add(downloadsTab(params));
      var chapters;
      if (hasChapters) {
        chapters = new chapterTab(player, params);
        tabs.addModule(chapters);
        if ((params.chaptersVisible === 'true') || (params.chaptersVisible === true)) {
          tabs.open(chapters.tab);
        }
      }
      chapters.addEventhandlers(player);
      controls.createTimeControls(chapters);

      if (richplayer || hasChapters) {
        wrapper.append('<div class="podlovewebplayer_tableend"></div>');
      }

      // parse deeplink
      deepLink = parseTimecode(window.location.href);
      if (deepLink !== false && players.length === 1) {
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
        if (handleCookies.getItem(storageKey)) {
          jqPlayer.one('canplay', function () {
            var time = handleCookies.getItem(storageKey);
            //console.debug(time);
            this.currentTime = time;
          });
        }
      }

      // init MEJS to player
      mejsoptions.success = function (player) {
        addBehavior(player, params, wrapper);
        if (deepLink !== false && players.length === 1) {
          $('html, body').delay(150).animate({
            scrollTop: $('.container:first').offset().top - 25
          });
        }
      };

      $(orig).replaceWith(wrapper);
      jqPlayer.mediaelementplayer(mejsoptions);
    });
  };

/**
 * remove 'px' unit, set witdth to 100% for 'auto'
 * @param {string} width
 * @returns {string}
 */
function normalizeWidth(width) {
  if (width.toLowerCase() === 'auto') {
    return '100%';
  }
  return width.replace('px', '');
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
  return '<p class="subtitle">' + text + '</p>';
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
 * audio or video tag
 * @param {HTMLElement} player
 * @returns {string} 'audio' | 'video'
 */
function getPlayerType (player) {
  return player.tagName.toLowerCase();
}

/**
 * kill play/pause button from miniplayer
 * @param options
 */
function removePlayPause(options) {
  $.each(options.features, function (i) {
    if (this === 'playpause') {
      options.features.splice(i, 1);
    }
  });
}

/**
 * player error handling function
 * will remove the topmost mediafile from src or source list
 * possible fix for Firefox AAC issues
 */
function removeUnplayableMedia() {
  var $this = $(this);
  if ($this.attr('src')) {
    $this.removeAttr('src');
    return;
  }
  var sourceList = $this.children('source');
  if (sourceList.length) {
    sourceList.first().remove();
  }
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

module.exports = {
  players: players
};

