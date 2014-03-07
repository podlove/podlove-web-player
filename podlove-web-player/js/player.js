/**
 * player
 */
(function ($) {
  'use strict';
  var startAtTime = false,
    stopAtTime = false,
  // Keep all Players on site - for inline players
  // embedded players are registered in podlove-webplayer-moderator in the embedding page
    players = [],
    ignoreHashChange = false,
  // all used functions
    generateTimecode = pwp.tc.generate,
    parseTimecode = pwp.tc.parse,
    handleCookies = $.cookieHandler,
    checkCurrentURL = function () {
      var deepLink = $.url.checkCurrent ();
      if (!deepLink) { return; }
      startAtTime = deepLink[0];
      stopAtTime = deepLink[1];
    },
    setFragmentURL = $.url.setFragment,
    updateChapterMarks = $.chapters.update,
    generateChapterTable = $.chapters.generateTable,
    checkTime,
    addressCurrentTime,
    addBehavior;

  pwp.players = players;

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
      metainfo,
      summary,
      podlovewebplayer_timecontrol,
      podlovewebplayer_sharebuttons,
      podlovewebplayer_downloadbuttons,
      chapterBox,
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
    metainfo = wrapper.find('.podlovewebplayer_meta');
    summary = wrapper.find('.summary');
    podlovewebplayer_timecontrol = wrapper.find('.podlovewebplayer_timecontrol');
    podlovewebplayer_sharebuttons = wrapper.find('.podlovewebplayer_sharebuttons');
    podlovewebplayer_downloadbuttons = wrapper.find('.podlovewebplayer_downloadbuttons');
    chapterBox = wrapper.find('.podlovewebplayer_chapterbox');
    list = wrapper.find('table');
    marks = list.find('tr');
    // fix height of summary for better togglability
    summary.each(function () {
      var $this = $(this), height = 0;
      $this.data('height', $this.height() + 10);
      if ($this.hasClass('active')) {
        height = $this.find('div.summarydiv').height() + 10;
      }
      $this.height(height + 'px');
    });

    chapterBox.each(function () {
      var $this = $(this),
        height = 0,
        chapterHeight = $this.find('.podlovewebplayer_chapters').height();

      $this.data('height', chapterHeight);
      if ($this.hasClass('active')) {
        height = chapterHeight;
      }
      $this.height(height + 'px');
    });

    if (metainfo.length === 1) {
      metainfo.find('a.infowindow').click(function () {
        summary.toggleClass('active');
        if (summary.hasClass('active')) {
          summary.height(summary.find('div.summarydiv').height() + 10 + 60 + 'px');
        } else {
          summary.css('height', '0px');
        }
        return false;
      });
      metainfo.find('a.showcontrols').on('click', function () {
        podlovewebplayer_timecontrol.toggleClass('active');
        if (podlovewebplayer_sharebuttons !== undefined) {
          if (podlovewebplayer_sharebuttons.hasClass('active')) {
            podlovewebplayer_sharebuttons.removeClass('active');
          } else if (podlovewebplayer_downloadbuttons.hasClass('active')) {
            podlovewebplayer_downloadbuttons.removeClass('active');
          }
        }
        return false;
      });
      metainfo.find('a.showsharebuttons').on('click', function () {
        podlovewebplayer_sharebuttons.toggleClass('active');
        if (podlovewebplayer_timecontrol.hasClass('active')) {
          podlovewebplayer_timecontrol.removeClass('active');
        } else if (podlovewebplayer_downloadbuttons.hasClass('active')) {
          podlovewebplayer_downloadbuttons.removeClass('active');
        }
        return false;
      });
      metainfo.find('a.showdownloadbuttons').on('click', function () {
        podlovewebplayer_downloadbuttons.toggleClass('active');
        if (podlovewebplayer_timecontrol.hasClass('active')) {
          podlovewebplayer_timecontrol.removeClass('active');
        } else if (podlovewebplayer_sharebuttons.hasClass('active')) {
          podlovewebplayer_sharebuttons.removeClass('active');
        }
        return false;
      });
      metainfo.find('.bigplay').on('click', function () {
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

      wrapper.find('.chaptertoggle').unbind('click').click(function () {
        var height = 0;
        chapterBox.toggleClass('active');
        if (chapterBox.hasClass('active')) {
          height = parseInt(chapterBox.data('height'), 10) + 2;
        }
        chapterBox.height(height + 'px');
        return false;
      });
      wrapper.find('.prevbutton').click(function () {
        if ((typeof player.currentTime === 'number') && (player.currentTime > 0)) {
          if (player.currentTime > chapterBox.find('.active').data('start') + 10) {
            player.setCurrentTime(chapterBox.find('.active').data('start'));
          } else {
            player.setCurrentTime(chapterBox.find('.active').prev().data('start'));
          }
        } else {
          player.play();
        }
        return false;
      });
      wrapper.find('.nextbutton').click(function () {
        if ((typeof player.currentTime === 'number') && (player.currentTime > 0)) {
          player.setCurrentTime(chapterBox.find('.active').next().data('start'));
        } else {
          player.play();
        }
        return false;
      });
      wrapper.find('.rewindbutton').click(function () {
        if ((typeof player.currentTime === 'number') && (player.currentTime > 0)) {
          player.setCurrentTime(player.currentTime - 30);
        } else {
          player.play();
        }
        return false;
      });
      wrapper.find('.forwardbutton').click(function () {
        if ((typeof player.currentTime === 'number') && (player.currentTime > 0)) {
          player.setCurrentTime(player.currentTime + 30);
        } else {
          player.play();
        }
        return false;
      });
      wrapper.find('.currentbutton').click(function () {
        window.prompt('This URL directly points to this episode', $(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').attr('href'));
        return false;
      });

      /**
       * share buttons
       */

      wrapper.find('.tweetbutton').click(function () {
        window.open('https://twitter.com/share?text=' + encodeURIComponent($(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').text()) + '&url=' + encodeURIComponent($(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').attr('href')), 'tweet it', 'width=550,height=420,resizable=yes');
        return false;
      });
      wrapper.find('.fbsharebutton').click(function () {
        window.open('http://www.facebook.com/share.php?t=' + encodeURIComponent($(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').text()) + '&u=' + encodeURIComponent($(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').attr('href')), 'share it', 'width=550,height=340,resizable=yes');
        return false;
      });
      wrapper.find('.gplusbutton').click(function () {
        window.open('https://plus.google.com/share?title=' + encodeURIComponent($(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').text()) + '&url=' + encodeURIComponent($(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').attr('href')), 'plus it', 'width=550,height=420,resizable=yes');
        return false;
      });
      wrapper.find('.adnbutton').click(function () {
        window.open('https://alpha.app.net/intent/post?text=' + encodeURIComponent($(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').text()) + '%20' + encodeURIComponent($(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').attr('href')), 'plus it', 'width=550,height=420,resizable=yes');
        return false;
      });
      wrapper.find('.mailbutton').click(function () {
        window.location = 'mailto:?subject=' + encodeURIComponent($(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').text()) + '&body=' + encodeURIComponent($(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').text()) + '%20%3C' + encodeURIComponent($(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').attr('href')) + '%3E';
        return false;
      });
      wrapper.find('.fileselect').change(function () {
        var dlurl, dlname;
        $(this).parent().find(".fileselect option:selected").each(function () {
          dlurl = $(this).data('dlurl');
        });
        $(this).parent().find(".downloadbutton").each(function () {
          dlname = dlurl.split('/');
          dlname = dlname[dlname.length - 1];
          $(this).attr('href', dlurl);
          $(this).attr('download', dlname);
        });
        return false;
      });
      wrapper.find('.openfilebutton').click(function () {
        $(this).parent().find(".fileselect option:selected").each(function () {
          window.open($(this).data('url'), 'Podlove Popup', 'width=550,height=420,resizable=yes');
        });
        return false;
      });
      wrapper.find('.fileinfobutton').click(function () {
        $(this).parent().find(".fileselect option:selected").each(function () {
          window.prompt('file URL:', $(this).val());
        });
        return false;
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
          $.postToOpener({
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
        if (metainfo.length === 1) {
          metainfo.find('.bigplay').addClass('playing');
        }
      })
      .on('pause', function () {
        window.clearInterval(player.persistingTimer);
        player.persistingTimer = null;
        if (metainfo.length === 1) {
          metainfo.find('.bigplay').removeClass('playing');
        }
        $.postToOpener({
          action: 'pause',
          arg: player.currentTime
        });
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
      params = $.extend({}, {
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
      }, options);
    // turn each player in the current set into a Podlove Web Player
    return this.each(function (index, player) {
      var richplayer = false,
        haschapters = false,
        hiddenTab = false,
        i = 0,
        secArray,
        orig,
        deepLink,
        wrapper,
        summaryActive,
        timecontrolsActive,
        sharebuttonsActive,
        downloadbuttonsActive,
        size,
        name,
        downloadname,
        selectform,
        storageKey;
      //fine tuning params
      if (params.width.toLowerCase() === 'auto') {
        params.width = '100%';
      } else {
        params.width = params.width.replace('px', '');
      }
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
      wrapper = $(player).parent();
      players.push(player);
      //add params from html fallback area and remove them from the DOM-tree
      $(player).find('[data-pwp]').each(function () {
        var $this = $(this);
        params[$this.data('pwp')] = $this.html();
        $this.remove();
      });
      //add params from audio and video elements
      $(player).find('source').each(function () {
        if (!params.sources) {
          params.sources = [];
        }
        params.sources.push($(this).attr('src'));
      });
      //build rich player with meta data
      if (params.chapters !== undefined || params.title !== undefined || params.subtitle !== undefined || params.summary !== undefined || params.poster !== undefined || $(player).attr('poster') !== undefined) {
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
          wrapper.prepend('<div class="podlovewebplayer_meta"></div>');
          var metaElement = wrapper.find('.podlovewebplayer_meta')
          metaElement.prepend('<a class="bigplay" title="Play Episode" href="#"></a>');
          if (params.poster !== undefined) {
            metaElement.append('<div class="coverart"><img class="coverimg" src="' + params.poster + '" data-img="' + params.poster + '" alt=""></div>');
          }
          if ($(player).attr('poster') !== undefined) {
            metaElement.append('<div class="coverart"><img src="' + $(player).attr('poster') + '" alt=""></div>');
          }
        }
        if (player.tagName === "VIDEO") {
          wrapper.prepend('<div class="podlovewebplayer_top"></div>');
          wrapper.append('<div class="podlovewebplayer_meta"></div>');
        }
        if (params.title !== undefined) {
          if (params.permalink !== undefined) {
            wrapper.find('.podlovewebplayer_meta').append('<h3 class="episodetitle"><a href="' + params.permalink + '">' + params.title + '</a></h3>');
          } else {
            wrapper.find('.podlovewebplayer_meta').append('<h3 class="episodetitle">' + params.title + '</h3>');
          }
        }
        if (params.subtitle !== undefined) {
          wrapper.find('.podlovewebplayer_meta').append('<div class="subtitle">' + params.subtitle + '</div>');
        } else {
          if (params.title !== undefined) {
            if ((params.title.length < 42) && (params.poster === undefined)) {
              wrapper.addClass('podlovewebplayer_smallplayer');
            }
          }
          wrapper.find('.podlovewebplayer_meta').append('<div class="subtitle"></div>');
        }
        //always render toggler buttons wrapper
        wrapper.find('.podlovewebplayer_meta').append('<div class="togglers"></div>');
        wrapper.on('playerresize', function () {
          wrapper.find('.podlovewebplayer_chapterbox').data('height', wrapper.find('.podlovewebplayer_chapters').height());
          if (wrapper.find('.podlovewebplayer_chapterbox').hasClass('active')) {
            wrapper.find('.podlovewebplayer_chapterbox').height(parseInt(wrapper.find('.podlovewebplayer_chapterbox').data('height'), 10) + 2 + 'px');
          }
          wrapper.find('.summary').data('height', wrapper.find('.summarydiv').height());
          if (wrapper.find('.summary').hasClass('active')) {
            wrapper.find('.summary').height(wrapper.find('.summarydiv').height() + 'px');
          }
        });
        if (params.summary !== undefined) {
          summaryActive = "";
          if (params.summaryVisible === true) {
            summaryActive = " active";
          }
          wrapper.find('.togglers').append('<a href="#" class="infowindow infobuttons pwp-icon-info-circle" title="More information about this"></a>');
          wrapper.find('.podlovewebplayer_meta').after('<div class="summary' + summaryActive + '"><div class="summarydiv">' + params.summary + '</div></div>');
        }
        if (params.chapters !== undefined) {
          if (((params.chapters.length > 10) && (typeof params.chapters === 'string')) || ((params.chapters.length > 1) && (typeof params.chapters === 'object'))) {
            wrapper.find('.togglers').append('<a href="#" class="chaptertoggle infobuttons pwp-icon-list-bullet" title="Show/hide chapters"></a>');
          }
        }
        if (params.hidetimebutton !== true) {
          wrapper.find('.togglers').append('<a href="#" class="showcontrols infobuttons pwp-icon-clock" title="Show/hide time navigation controls"></a>');
        }
      }
      timecontrolsActive = "";
      if (params.timecontrolsVisible === true) {
        timecontrolsActive = " active";
      }
      sharebuttonsActive = "";
      if (params.sharebuttonsVisible === true) {
        sharebuttonsActive = " active";
      }
      downloadbuttonsActive = "";
      if (params.downloadbuttonsVisible === true) {
        downloadbuttonsActive = " active";
      }
      wrapper.append('<div class="podlovewebplayer_timecontrol podlovewebplayer_controlbox' + timecontrolsActive + '"></div>');
      var timeControlElement = wrapper.find('.podlovewebplayer_timecontrol');
      if (params.chapters !== undefined) {
        if (params.chapters.length > 10) {
          timeControlElement.append('<a href="#" class="prevbutton infobuttons pwp-icon-to-start" title="Jump backward to previous chapter"></a><a href="#" class="nextbutton infobuttons pwp-icon-to-end" title="next chapter"></a>');
          wrapper.find('.controlbox').append('<a href="#" class="prevbutton infobuttons pwp-icon-step-backward" title="previous chapter"></a><a href="#" class="nextbutton infobuttons pwp-icon-to-end" title="Jump to next chapter"></a>');
        }
      }
      timeControlElement.append('<a href="#" class="rewindbutton infobuttons pwp-icon-fast-bw" title="Rewind 30 seconds"></a>')
      timeControlElement.append('<a href="#" class="forwardbutton infobuttons pwp-icon-fast-fw" title="Fast forward 30 seconds"></a>');

      var shareButtonsElement = wrapper.find('.podlovewebplayer_sharebuttons');
      if ((wrapper.closest('.podlovewebplayer_wrapper').find('.episodetitle a').attr('href') !== undefined) && (params.hidesharebutton !== true)) {
        wrapper.append('<div class="podlovewebplayer_sharebuttons podlovewebplayer_controlbox' + sharebuttonsActive + '"></div>');
        wrapper.find('.togglers').append('<a href="#" class="showsharebuttons infobuttons pwp-icon-export" title="Show/hide sharing controls"></a>');
        shareButtonsElement.append('<a href="#" class="currentbutton infobuttons pwp-icon-link" title="Get URL for this"></a>');
        shareButtonsElement.append('<a href="#" target="_blank" class="tweetbutton infobuttons pwp-icon-twitter" title="Share this on Twitter"></a>');
        shareButtonsElement.append('<a href="#" target="_blank" class="fbsharebutton infobuttons pwp-icon-facebook" title="Share this on Facebook"></a>');
        shareButtonsElement.append('<a href="#" target="_blank" class="gplusbutton infobuttons pwp-icon-gplus" title="Share this on Google+"></a>');
        shareButtonsElement.append('<a href="#" target="_blank" class="adnbutton infobuttons pwp-icon-appnet" title="Share this on App.net"></a>');
        shareButtonsElement.append('<a href="#" target="_blank" class="mailbutton infobuttons pwp-icon-mail" title="Share this via e-mail"></a>');
      }
      if (((params.downloads !== undefined) || (params.sources !== undefined)) && (params.hidedownloadbutton !== true)) {
        selectform = '<select name="downloads" class="fileselect" size="1" onchange="this.value=this.options[this.selectedIndex].value;">';
        wrapper.append('<div class="podlovewebplayer_downloadbuttons podlovewebplayer_controlbox' + downloadbuttonsActive + '"></div>');
        wrapper.find('.togglers').append('<a href="#" class="showdownloadbuttons infobuttons pwp-icon-download" title="Show/hide download bar"></a>');
        if (params.downloads !== undefined) {
          for (i = 0; i < params.downloads.length; i += 1) {
            size = (parseInt(params.downloads[i].size, 10) < 1048704) ? Math.round(parseInt(params.downloads[i].size, 10) / 100) / 10 + 'kB' : Math.round(parseInt(params.downloads[i].size, 10) / 1000 / 100) / 10 + 'MB';
            selectform += '<option value="' + params.downloads[i].url + '" data-url="' + params.downloads[i].url + '" data-dlurl="' + params.downloads[i].dlurl + '">' + params.downloads[i].name + ' (' + size + ')</option>';
          }
        } else {
          for (i = 0; i < params.sources.length; i += 1) {
            name = params.sources[i].split('.');
            name = name[name.length - 1];
            selectform += '<option value="' + params.sources[i] + '" data-url="' + params.sources[i] + '" data-dlurl="' + params.sources[i] + '">' + name + '</option>';
          }
        }
        selectform += '</select>';
        var downloadButtons = wrapper.find('.podlovewebplayer_downloadbuttons');
        downloadButtons.append(selectform);
        if (params.downloads !== undefined && params.downloads.length > 0) {
          downloadname = params.downloads[0].url.split('/');
          downloadname = downloadname[downloadname.length - 1];
          downloadButtons.append('<a href="' + params.downloads[0].url + '" download="' + downloadname + '" class="downloadbutton infobuttons pwp-icon-download" title="Download"></a> ');
        }
        downloadButtons.append('<a href="#" class="openfilebutton infobuttons pwp-icon-link-ext" title="Open"></a> ');
        downloadButtons.append('<a href="#" class="fileinfobutton infobuttons pwp-icon-info-circle" title="Info"></a> ');
      }
      //build chapter table
      if (params.chapters !== undefined) {
        if (((params.chapters.length > 10) && (typeof params.chapters === 'string')) || ((params.chapters.length > 1) && (typeof params.chapters === 'object'))) {
          haschapters = true;
          generateChapterTable(params).appendTo(wrapper);
        }
      }
      if (richplayer || haschapters) {
        wrapper.append('<div class="podlovewebplayer_tableend"></div>');
      }
      // parse deeplink
      deepLink = parseTimecode(window.location.href);
      if (deepLink !== false && players.length === 1) {
        if (document.hidden !== undefined) {
          hiddenTab = document.hidden;
        } else if (document.mozHidden !== undefined) {
          hiddenTab = document.mozHidden;
        } else if (document.msHidden !== undefined) {
          hiddenTab = document.msHidden;
        } else if (document.webkitHidden !== undefined) {
          hiddenTab = document.webkitHidden;
        }
        var playerAttributes = {preload: 'auto'};
        if (hiddenTab !== true) {
          playerAttributes.autoplay = 'autoplay';
        }
        $(player).attr(playerAttributes);
        startAtTime = deepLink[0];
        stopAtTime = deepLink[1];
      } else if (params && params.permalink) {
        console.debug(params);
        storageKey = 'podloveWebPlayerTime-' + params.permalink;
        if (handleCookies.getItem(storageKey)) {
          $(player).one('canplay', function () {
            var time = handleCookies.getItem(storageKey);
            console.debug(time);
            this.currentTime = time;
          });
        }
      }
      $(player).on('ended', function () {
        handleCookies.setItem('podloveWebPlayerTime-' + params.permalink, '', new Date(2000, 1, 1));
        $.postToOpener({
          action: 'stop',
          arg: player.currentTime
        });
      });
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
      $(player).mediaelementplayer(mejsoptions);
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
}(jQuery));

