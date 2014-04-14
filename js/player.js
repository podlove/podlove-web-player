/**
 * player
 */
'use strict';
var startAtTime = false,
  stopAtTime = false,
// Keep all Players on site - for inline players
// embedded players are registered in podlove-webplayer-moderator in the embedding page
  players = [],
  ignoreHashChange = false,
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
  updateChapterMarks = require('./tabs/chapter').update,
  generateChapterTable = require('./tabs/chapter').generateTable,
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
      metaElement,
      list,
      marks;

    // expose the player interface
    wrapper.data('podlovewebplayer', {
      player: jqPlayer
    });

    // This might be a fix to some Firefox AAC issues.
    jqPlayer.on('error', removeUnplayableMedia);

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
    metaElement = wrapper.find('.podlovewebplayer_meta');
    list = wrapper.find('table');
    marks = list.find('tr');
    // fix height of summary for better togglability

    if (metaElement.length === 1) {
      metaElement.find('.bigplay').on('click', function () {
        var $this = $(this);
        if (!$this.hasClass('bigplay')) {
          return false;
        }
        var playButton = $this.parent().find('.bigplay');
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
            $this.parent().parent().find('.mejs-time-buffering').show();
          }
          // flash fallback needs additional pause
          if (player.pluginType === 'flash') {
            player.pause();
          }
          player.play();
        }
      });


    }

    // chapters list
    list
      .show()
      .delegate('.chaptertr', 'click', function (e) {
        if ($(this).closest('table').hasClass('linked_all') || $(this).closest('tr').hasClass('loaded')) {
          e.preventDefault();
          var mark = $(this).closest('tr'),
            startTime = mark.data('start');
          //endTime = mark.data('end');
          // If there is only one player also set deepLink
          if (players.length === 1) {
            // setFragmentURL('t=' + generateTimecode([startTime, endTime]));
            setFragmentURL('t=' + generateTimecode([startTime]));
          } else {
            if (canplay) {
              // Basic Chapter Mark function (without deeplinking)
              player.setCurrentTime(startTime);
            } else {
              jqPlayer.one('canplay', function () {
                player.setCurrentTime(startTime);
              });
            }
          }
          // flash fallback needs additional pause
          if (player.pluginType === 'flash') {
            player.pause();
          }
          player.play();
        }
        return false;
      });
    list
      .show()
      .delegate('.chaptertr a', 'click', function (e) {
        if ($(this).closest('table').hasClass('linked_all') || $(this).closest('td').hasClass('loaded')) {
          e.preventDefault();
          window.open($(this)[0].href, '_blank');
        }
        return false;
      });
    // wait for the player or you'll get DOM EXCEPTIONS
    // And just listen once because of a special behaviour in firefox
    // --> https://bugzilla.mozilla.org/show_bug.cgi?id=664842
    jqPlayer.one('canplay', function () {
      canplay = true;
      // add duration of final chapter
      if (player.duration) {
        marks.find('.timecode code').eq(-1).each(function () {
          var start, end;
          start = Math.floor($(this).closest('tr').data('start'));
          end = Math.floor(player.duration);
          $(this).text(generateTimecode([end - start]));
        });
      }
      // add Deeplink Behavior if there is only one player on the site
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
    });
    // always update Chaptermarks though
    jqPlayer
      .on('timeupdate', function () {
        updateChapterMarks(player, marks);
      })
      // update play/pause status
      .on('play playing', function () {
        if (!player.persistingTimer) {
          embed.postToOpener({
            action: 'play',
            arg: player.currentTime
          });
          player.persistingTimer = window.setInterval(function () {
            if (players.length === 1) {
              ignoreHashChange = true;
              console.debug('time', generateTimecode([player.currentTime, false]));
              window.location.replace('#t=' + generateTimecode([player.currentTime, false]));
            }
            console.debug(player.currentTime);
            handleCookies.setItem(params.permalink, player.currentTime);
          }, 5000);
        }
        list.find('.paused').removeClass('paused');
        if (metaElement.length === 1) {
          metaElement.find('.bigplay').addClass('playing');
        }
      })
      .on('pause', function () {
        window.clearInterval(player.persistingTimer);
        player.persistingTimer = null;
        if (metaElement.length === 1) {
          metaElement.find('.bigplay').removeClass('playing');
        }
        embed.postToOpener({
          action: 'pause',
          arg: player.currentTime
        });
      })
      .on('ended', function () {
        handleCookies.removeItem( params.permalink);
        embed.postToOpener({
          action: 'stop',
          arg: player.currentTime
        });
      });
  };

function renderTitle(text, link) {
  var titleBegin = '<h3 class="episodetitle">',
    titleEnd = '</h3>';
  if (text !== undefined && link !== undefined) {
    text = '<a href="' + link + '">' + text + '</a>';
  }
  return titleBegin + text + titleEnd;
}

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

function renderSubTitle(text) {
  return '<div class="subtitle">' + text + '</div>';
}
function renderPoster(poster) {
  if (!poster) { return ''; }
  return '<div class="coverart"><img class="coverimg" src="' + poster + '" data-img="' + poster + '" alt="Poster Image"></div>';
}

function checkForChapters(params) {
  return params.chapters && (
    (typeof params.chapters === 'string' && params.chapters.length > 10) ||
    (typeof params.chapters === 'object' && params.chapters.length > 1)
    );
}

function getPlayerType (player) {
  return player.tagName.toLowerCase();
}

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
        secArray,
        orig,
        deepLink,
        wrapper,
        chapterBox,
        metaElement = $('<div class="podlovewebplayer_meta"></div>'),
        controls,
        controlBox,
        storageKey;
      //audio params
      var playerType = getPlayerType(player);

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
      player = $(player).clone().wrap('<div class="podlovewebplayer_wrapper" style="width: ' + params.width + '"></div>')[0];
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
        wrapper.addClass('podlovewebplayer_' + player.tagName.toLowerCase());
        if (player.tagName === "AUDIO") {
          //kill play/pause button from miniplayer
          $.each(mejsoptions.features, function (i) {
            if (this === 'playpause') {
              mejsoptions.features.splice(i, 1);
            }
          });
          wrapper.prepend(metaElement);
          var poster = params.poster || jqPlayer.attr('poster');
          metaElement.append(renderPoster(poster));
        }
        if (player.tagName === "VIDEO") {
          wrapper.prepend('<div class="podlovewebplayer_top"></div>');
          wrapper.append(metaElement);
        }

        metaElement.append(renderTitle(params.title, params.permalink));
        metaElement.append(renderSubTitle(params.subtitle));
        metaElement.append('<a class="bigplay" title="Play Episode" href="#"></a>');

        if (params.subtitle && params.title && params.title.length < 42 && !params.poster) {
            wrapper.addClass('podlovewebplayer_smallplayer');
        }

        /**
         * Timecontrols
         */
        controls = new Controls();
        controlBox = controls.box;
        //always render toggler buttons wrapper
        wrapper.append(controlBox);

      }



      /**
       * -- TABS --
       * FIXME enable chapter tab
       */
      controlBox.append(tabs.toggles);
      wrapper.append(tabs.container);
      tabs.add(infoTab(params));
      tabs.add(shareTab(params));
      tabs.add(downloadsTab(params));

      /**
       * Chapters
       */
      //build chapter table
      /*
      if (hasChapters) {
        chapterBox = generateChapterTable(params);
        chapterBox.appendTo(wrapper);
        $(document).ready(function () {
          var height = 0,
            chapterHeight = chapterBox.height();

          chapterBox.data('height', chapterHeight);
          console.log('chapterBox data.height', chapterHeight);
          if (chapterBox.hasClass('active')) {
            height = chapterHeight;
          }
          chapterBox.height(height + 'px');
        });
        var chapterToggle = tabs.createToggleButton("pwp-icon-list-bullet", "Show/hide chapters");
        togglerElement.append(chapterToggle);
        chapterToggle.click(function (evt) {
          evt.preventDefault();
          chapterBox.toggleClass('active');
          var height = chapterBox.hasClass('active') ? chapterBox.data('height') : 0;
          console.log('set chapterBox height', height);
          chapterBox.height(height + 'px');
        });
      }
*/

      if (richplayer || hasChapters) {
        wrapper.append('<div class="podlovewebplayer_tableend"></div>');
      }

      controls.createTimeControls(player, chapterBox);

      // parse deeplink
      deepLink = parseTimecode(window.location.href);
      if (deepLink !== false && players.length === 1) {
        var playerAttributes = {preload: 'auto'};
        if (!isHidden()) {
          playerAttributes.autoplay = 'autoplay';
        }
        jqPlayer.attr(playerAttributes);
        startAtTime = deepLink[0];
        stopAtTime = deepLink[1];
      } else if (params && params.permalink) {
        console.debug(params);
        storageKey = params.permalink;
        if (handleCookies.getItem(storageKey)) {
          jqPlayer.one('canplay', function () {
            var time = handleCookies.getItem(storageKey);
            console.debug(time);
            this.currentTime = time;
          });
        }
      }

      // init MEJS to player
      mejsoptions.success = function (player) {
        addBehavior(player, params, wrapper);
        if (deepLink !== false && players.length === 1) {
          $('html, body').delay(150).animate({
            scrollTop: $('.podlovewebplayer_wrapper:first').offset().top - 25
          });
        }
      };

      $(orig).replaceWith(wrapper);
      jqPlayer.mediaelementplayer(mejsoptions);
    });
  };

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

function isHidden() {
  var props = [
      'hidden',
      'mozHidden',
      'msHidden',
      'webkitHidden'
    ];

  for (var index in props) {
    if (props[index] in document) {
      return document[props[index]];
    }
  }
  return false;
}

module.exports = {
  players: players
};

