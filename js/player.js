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
  tabs = require('./tabs'),
  generateTimecode = require('./timecode').generate,
  parseTimecode = require('./timecode').parse,
  handleCookies = require('./cookie'),
  checkCurrentURL = function () {
    var deepLink = require('./url').checkCurrent ();
    if (!deepLink) { return; }
    startAtTime = deepLink[0];
    stopAtTime = deepLink[1];
  },
  setFragmentURL = require('./url').setFragment,
  share = require('./tabs/share'),
  downloads = require('./tabs/downloads'),
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
            handleCookies.setItem('podloveWebPlayerTime-' + params.permalink, player.currentTime);
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
        handleCookies.setItem('podloveWebPlayerTime-' + params.permalink, '', new Date(2000, 1, 1));
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

function playerStarted(player) {
  return ((typeof player.currentTime === 'number') && (player.currentTime > 0));
}

function checkForChapters(params) {
  return params.chapters && (
    (typeof params.chapters === 'string' && params.chapters.length > 10) ||
    (typeof params.chapters === 'object' && params.chapters.length > 1)
    );
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
        features: ['playpause', 'current', 'progress', 'duration', 'tracks', 'volume', 'fullscreen'],
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
        summaryActive,
        chapterBox,
        metaElement = $('<div class="podlovewebplayer_meta"></div>'),
        togglerElement = $('<div class="togglers"></div>'),
        storageKey;
      //fine tuning params
      params.width = normalizeWidth(params.width);
      //audio params
      if (player.tagName === 'AUDIO') {
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
        //video params
      } else if (player.tagName === 'VIDEO') {
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
        if (params[key] !== undefined) {
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
          metaElement.prepend('<a class="bigplay" title="Play Episode" href="#"></a>');
          var poster = params.poster || jqPlayer.attr('poster');
          metaElement.append(renderPoster(poster));
        }
        if (player.tagName === "VIDEO") {
          wrapper.prepend('<div class="podlovewebplayer_top"></div>');
          wrapper.append(metaElement);
        }

        metaElement.append(renderTitle(params.title, params.permalink));
        metaElement.append(renderSubTitle(params.subtitle));

        if (params.subtitle && params.title && params.title.length < 42 && !params.poster) {
            wrapper.addClass('podlovewebplayer_smallplayer');
        }

        //always render toggler buttons wrapper
        metaElement.append(togglerElement);

        if (params.summary !== undefined) {
          summaryActive = (params.summaryVisible === true) ? " active" : "";
          var summary = $('<div class="summary' + summaryActive + '">' + params.summary + '</div');
          var infoToggle = tabs.createToggleButton("pwp-icon-info-circle", "More information about this");
          var summaryActive = false;
          togglerElement.append(infoToggle);
          infoToggle.click(function (evt) {
            evt.preventDefault();
            summary.toggleClass('active');
            summaryActive = !summaryActive;
            summary.css('height', summaryActive ? 'auto' : '0');
          });
          metaElement.after(summary);
          $(document).ready(function () {
            summary.css('height', '0');
          });
        }

        if (params.hidetimebutton !== true) {
          var timeToggle = tabs.createToggleButton("pwp-icon-clock", "Show/hide time navigation tabs");
          togglerElement.append(timeToggle);
        }
      }

      /**
       * Timecontrols
       */
      if (params.chapters !== undefined && params.chapters.length > 1) {
        var timeControlElement = tabs.createControlBox('podlovewebplayer_timecontrol', !!params.timecontrolsVisible);
        timeToggle.on('click', function () {
          timeControlElement.toggleClass('active');
          shareTab.removeClass('active');
          downloadTab.removeClass('active');
          return false;
        });
        wrapper.append(timeControlElement);

        var prevButton = tabs.createToggleButton("pwp-icon-to-start", "Jump backward to previous chapter");
        timeControlElement.append(prevButton);
        prevButton.click(function (evt) {
          evt.preventDefault();
          if (playerStarted(player)) {
            var activeChapter = chapterBox.find('.active');
            if (player.currentTime > activeChapter.data('start') + 10) {
              return player.setCurrentTime(activeChapter.data('start'));
            }
            return player.setCurrentTime(activeChapter.prev().data('start'));
          }
          return player.play();
        });

        var nextButton = tabs.createToggleButton("pwp-icon-to-end", "Jump to next chapter");
        timeControlElement.append(nextButton);
        nextButton.click(function (evt) {
          evt.preventDefault();
          if (playerStarted(player)) {
            player.setCurrentTime(chapterBox.find('.active').next().data('start'));
          }
          return player.play();
        });
      }

      var rewindButton = tabs.createToggleButton("pwp-icon-fast-bw", "Rewind 30 seconds");
      timeControlElement.append(rewindButton);
      rewindButton.click(function (evt) {
        evt.preventDefault();
        if (playerStarted(player)) {
          return player.setCurrentTime(player.currentTime - 30);
        }
        return player.play();
      });

      var forwardButton = tabs.createToggleButton("pwp-icon-fast-fw", "Fast forward 30 seconds");
      timeControlElement.append(forwardButton);
      forwardButton.click(function (evt) {
        evt.preventDefault();
        if (playerStarted(player)) {
          return player.setCurrentTime(player.currentTime + 30);
        }
        return player.play();
      });

      /**
       * -- TABS --
       * FIXME timecontrols are treated as a tab
       * FIXME share and downloads should be equally important to chapters
       * FIXME info must be treated as a tab as well
       */

      /**
       * Share
       */
      if (params.permalink && params.hidesharebutton !== true) {
        var shareToggle = share.createToggleButton();
        togglerElement.append(shareToggle);
        var episode = {
          title: params.title,
          titleEncoded: encodeURIComponent(params.title),
          url: params.permalink,
          urlEncoded: encodeURIComponent(params.permalink)
        };
        var shareTab = share.createControlBox(episode, !!params.sharebuttonsVisible);
        wrapper.append(shareTab);
        shareToggle.on('click', function (evt) {
          evt.preventDefault();
          shareTab.toggleClass('active');
          timeControlElement.removeClass('active');
          downloadTab.removeClass('active');
        });
      }

      /**
       * Downloads
       */
      if (((params.downloads !== undefined) || (params.sources !== undefined)) && (params.hidedownloadbutton !== true)) {
        var downloadTab = downloads.createTab(params);
        wrapper.append(downloadTab);
        var downloadToggle = downloads.createToggle();
        togglerElement.append(downloadToggle);
        downloadToggle.on('click', function () {
          downloadTab.toggleClass('active');
          shareTab.removeClass('active');
          timeControlElement.removeClass('active');
          return false;
        });
      }

      /**
       * Chapters
       */
      //build chapter table
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


      if (richplayer || hasChapters) {
        wrapper.append('<div class="podlovewebplayer_tableend"></div>');
      }

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
        storageKey = 'podloveWebPlayerTime-' + params.permalink;
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

