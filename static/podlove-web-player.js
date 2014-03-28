(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var tc = require('./timecode'),
  url = require('./url');

/**
 * chapter handling
 */
module.exports = {

  /**
   * update the chapter list when the data is loaded
   * @param {object} player
   * @param {object} marks
   **/
  update: function (player, marks) {
    var coverImg = marks.closest('.podlovewebplayer_wrapper').find('.coverimg');
    marks.each(function () {
      var isBuffered, chapterimg = null,
        mark = $(this),
        startTime = mark.data('start'),
        endTime = mark.data('end'),
        isEnabled = mark.data('enabled'),
        isActive = player.currentTime > startTime - 0.3 && player.currentTime <= endTime;
      // prevent timing errors
      if (player.buffered.length > 0) {
        isBuffered = player.buffered.end(0) > startTime;
      }
      if (isActive) {
        chapterimg = url.validate(mark.data('img'));
        if ((chapterimg !== null) && (mark.hasClass('active'))) {
          if ((coverImg.attr('src') !== chapterimg) && (chapterimg.length > 5)) {
            coverImg.attr('src', chapterimg);
          }
        } else {
          if (coverImg.attr('src') !== coverImg.data('img')) {
            coverImg.attr('src', coverImg.data('img'));
          }
        }
        mark.addClass('active').siblings().removeClass('active');
      }
      if (!isEnabled && isBuffered) {
        $(mark).data('enabled', true).addClass('loaded').find('a[rel=player]').removeClass('disabled');
      }
    });
  },

  /**
   * Given a list of chapters, this function creates the chapter table for the player.
   * @param {object} params
   * @returns {HTMLDivElement}
   */
  generateTable: function (params) {
    var div, table, tbody, tempchapters, maxchapterstart, forceHours,  next, chapterImages, rowDummy, scroll = '';
    if (params.chapterHeight !== "") {
      if (typeof parseInt(params.chapterHeight, 10) === 'number') {
        scroll = 'style="overflow-y: auto; max-height: ' + parseInt(params.chapterHeight, 10) + 'px;"';
      }
    }
    div = $('<div class="podlovewebplayer_chapterbox showonplay" ' + scroll + '><table><caption>Podcast Chapters</caption><thead><tr><th scope="col">Chapter Number</th><th scope="col">Start time</th><th scope="col">Title</th><th scope="col">Duration</th></tr></thead><tbody></tbody></table></div>');
    if ((params.chaptersVisible === 'true') || (params.chaptersVisible === true)) {
      div.addClass('active');
    }

    table = div.children('table');
    table.addClass('podlovewebplayer_chapters');
    if (params.chapterlinks !== 'false') {
      table.addClass('linked linked_' + params.chapterlinks);
    }

    tbody = table.children('tbody');

    //prepare row data
    tempchapters = prepareRowData(params.chapters);

    //second round: collect more information
    maxchapterstart = getMaxChapterStart(tempchapters, next);

    //this is a "template" for each chapter row
    chapterImages = tempchapters.reduce(function (result, next) {
      if (next.image !== "" && next.image !== undefined) {
        chapterImages = true;
      }
      return (result || next);
    }, false);

    rowDummy = getDummyRow(chapterImages);

    //third round: build actual dom table
    forceHours = (maxchapterstart >= 3600);
    $.each(tempchapters, buildChapter);

    function buildChapter(i) {
      var finalchapter = !tempchapters[i + 1],
        duration = Math.round(this.end - this.start),
        row = rowDummy.clone();
      //make sure the duration for all chapters are equally formatted
      if (!finalchapter) {
        this.duration = tc.generate([duration], false);
      } else {
        if (params.duration === 0) {
          this.end = 9999999999;
          this.duration = '…';
        } else {
          this.end = params.duration;
          this.duration = tc.generate([Math.round(this.end - this.start)], false);
        }
      }
      if (i % 2) {
        row.addClass('oddchapter');
      }
      //deeplink, start and end
      row.attr({
        'data-start': this.start,
        'data-end': this.end,
        'data-img': (this.image !== undefined) ? this.image : ''
      });
      //if there is a chapter that starts after an hour, force '00:' on all previous chapters
      //insert the chapter data
      row.find('.starttime > span').text(tc.generate([Math.round(this.start)], true, forceHours));

      var timeSpan = '<span>' + this.code + '</span>';
      if (this.href !== undefined && this.href !== "") {
        timeSpan += ' <a href="' + this.href + '"></a>';
      }
      row.find('.chaptername').html(timeSpan);

      row.find('.timecode > span').html('<span>' + this.duration + '</span>');

      if (chapterImages && this.image !== undefined && this.image !== "") {
        row.find('.chapterimage').html('<img src="' + this.image + '"/>');
      }
      row.appendTo(tbody);
    }

    return div;
  }


};

function getMaxChapterStart(tempchapters, next) {
  return Math.max.apply(Math,
    $.map(tempchapters, function (value, i) {
      next = tempchapters[i + 1];
      // we use `this.end` to quickly calculate the duration in the next round
      if (next) {
        value.end = next.start;
      }
      // we need this data for proper formatting
      return value.start;
    }));
}

function getDummyRow (withImage) {
  var rowStart = '<tr class="chaptertr" data-start="" data-end="" data-img=""><td class="starttime"><span></span></td>';
  var rowEnd = '<td class="chaptername"></td><td class="timecode">\n<span></span>\n</td>\n</tr>';
  var chapterImage = '<td class="chapterimage"></td>';
  var template = rowStart + (withImage ? chapterImage : '') + rowEnd;
  return $(template);
}

function prepareRowData(chapterData) {
  function chapterFromString (chapter) {
    var line = $.trim(chapter);
    //exit early if this line contains nothing but whitespace
    if (line === '') {
      return {};
    }
    //extract the timestamp
    var parts = line.split(' ', 2);
    var tc = getStartTimecode(parts[0]);
    var chaptitle = $.trim(parts[1]);
    return { start: tc, code: chaptitle };
  }
  function transformChapter (chapter) {
    chapter.code = chapter.title;
    if (typeof chapter.start === 'string') {
      chapter.start = getStartTimecode(chapter.start);
    }
    return chapter;
  }
  function getStartTimecode(start) {
    return tc.parse(start)[0];
  }
  var chapters;

  //first round: kill empty rows and build structured object
  if (typeof chapterData === 'string') {
    chapters = chapterData.split("\n").map(chapterFromString);
  } else {
    // assume array of objects
    chapters = chapterData.map(transformChapter);
  }
  // order is not guaranteed: http://podlove.org/simple-chapters/
  return chapters.sort(function (a, b) {
    return a.start - b.start;
  });
}

},{"./timecode":5,"./url":6}],2:[function(require,module,exports){
/**
 * cookiehandling
 * FIXME: replace with jQuery.cookie
 */
module.exports = {
    getItem: function (sKey) {
      return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
    },
    setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
      if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
      var sExpires = "";
      if (vEnd) {
        switch (vEnd.constructor) {
          case Number:
            sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
            break;
          case String:
            sExpires = "; expires=" + vEnd;
            break;
          case Date:
            sExpires = "; expires=" + vEnd.toUTCString();
            break;
        }
      }
      document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
      return true;
    },
    removeItem: function (sKey, sPath, sDomain) {
      if (!sKey || !this.hasItem(sKey)) { return false; }
      document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + ( sDomain ? "; domain=" + sDomain : "") + ( sPath ? "; path=" + sPath : "");
      return true;
    },
    hasItem: function (sKey) {
      return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
    },
    keys: /* optional method: you can safely remove it! */ function () {
      var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
      for (var nIdx = 0; nIdx < aKeys.length; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
      return aKeys;
    }
};


},{}],3:[function(require,module,exports){
// everything for an embedded player
var
  players = require('./player').players,
  lastHeight = 0,
  $body;

function init($) {
  $body = $(document.body);
  $(window).on('message', messageListener);
  pollHeight();
}

function postToOpener(obj) {
  console.debug('postToOpener', obj);
  window.parent.postMessage(obj, '*');
}

function messageListener (event) {
  var orig = event.originalEvent;

  if (orig.data.action == 'pause') {
    players.forEach(function (player) {
      player.pause();
    });
  }
}

function pollHeight() {
  var newHeight = $body.height();
  if (lastHeight != newHeight) {
    postToOpener({
      action: 'resize',
      arg: newHeight
    });
  }

  lastHeight = newHeight;
  requestAnimationFrame(pollHeight, document.body);
}

module.exports = {
  postToOpener: postToOpener,
  init: init
};

},{"./player":4}],4:[function(require,module,exports){
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
  updateChapterMarks = require('./chapter').update,
  generateChapterTable = require('./chapter').generateTable,
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
        embed.postToOpener({
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
        embed.postToOpener({
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

module.exports = {
  players: players
};


},{"./chapter":1,"./cookie":2,"./embed":3,"./timecode":5,"./url":6}],5:[function(require,module,exports){
/**
 * Timecode as described in http://podlove.org/deep-link/
 *  and http://www.w3.org/TR/media-frags/#fragment-dimensions
 */
var timecodeRegExp = /(?:(\d+):)?(\d+):(\d+)(\.\d+)?([,\-](?:(\d+):)?(\d+):(\d+)(\.\d+)?)?/;

/**
 * return number as string lefthand filled with zeros
 * @param number number
 * @param width number
 * @return string
 **/
var zeroFill = function (number, width) {
  var s = number.toString();
  while (s.length < width) {
    s = "0" + s;
  }
  return s;
};

/**
 * convert an array of string to timecode
 * @param {Array} parts
 * @returns {number}
 */
function extractTime(parts) {
  var time = 0;
  // hours
  time += parts[1] ? parseInt(parts[1], 10) * 60 * 60 : 0;
  // minutes
  time += parseInt(parts[2], 10) * 60;
  // seconds
  time += parseInt(parts[3], 10);
  // milliseconds
  time += parts[4] ? parseFloat(parts[4]) : 0;
  // no negative time
  time = Math.max(time, 0);
  return time;
}


module.exports = {

  /**
   * accepts array with start and end time in seconds
   * returns timecode in deep-linking format
   * @param {Array} times
   * @param {Boolean} leadingZeros
   * @param {Boolean} forceHours (optional)
   * @return {string}
   **/
  generate: function (times, leadingZeros, forceHours) {
    function generatePart(time) {
      var part,
        hours,
        minutes,
        seconds,
        milliseconds;

      // prevent negative values from player
      if (!time || time <= 0) {
        return (leadingZeros || !time) ? (forceHours ? '00:00:00' : '00:00') : '--';
      }
      hours = Math.floor(time / 60 / 60);
      minutes = Math.floor(time / 60) % 60;
      seconds = Math.floor(time % 60) % 60;
      milliseconds = Math.floor(time % 1 * 1000);
      if (leadingZeros) {
        // required (minutes : seconds)
        part = zeroFill(minutes, 2) + ':' + zeroFill(seconds, 2);
        hours = zeroFill(hours, 2);
        hours = hours === '00' && !forceHours ? '' : hours + ':';
      } else {
        part = hours ? zeroFill(minutes, 2) : minutes.toString();
        part += ':' + zeroFill(seconds, 2);
        hours = hours ? hours + ':' : '';
      }
      milliseconds = milliseconds ? '.' + zeroFill(milliseconds, 3) : '';
      return hours + part + milliseconds;
    }

    if (times[1] > 0 && times[1] < 9999999 && times[0] < times[1]) {
      return generatePart(times[0]) + ',' + generatePart(times[1]);
    }
    return generatePart(times[0]);
  },


  /**
   * parses time code into seconds
   * @param {String} timecode
   * @return {Array}
   **/
  parse: function (timecode) {
    var parts, startTime, endTime;
    if (!timecode) {
      return false;
    }

    parts = timecode.match(timecodeRegExp);
    if (!parts || parts.length < 10) {
      return false;
    }
    startTime = extractTime(parts);

    // if there only a startTime but no endTime
    if (parts[5] === undefined) {
      return [startTime, false];
    }

    endTime = extractTime(parts.splice(6));

    return (endTime > startTime) ? [startTime, endTime] : [startTime, false];
  }

};

},{}],6:[function(require,module,exports){
var tc = require('./timecode');

/**
 * url handling
 */
module.exports = {

  checkCurrent: function () {
    return tc.parse(window.location.href);
  },

  validate: function (url) {
    // uncomment next three lines to validate URLs, if you want use relative paths leave it so.
    //var urlregex = /(^|\s)((https?:\/\/)?[\w\-]+(\.[\w\-]+)+\.?(:\d+)?(\/\S*)?)/gi;
    //url = url.match(urlregex);
    //return (url !== null) ? url[0] : url;
    return url.trim();
  },

  /**
   * add a string as hash in the adressbar
   * @param {string} fragment
   **/
  setFragment: function (fragment) {
    console.debug('setting url fragment', fragment);
    window.location.hash = '#' + fragment;
  }
};

},{"./timecode":5}],7:[function(require,module,exports){
/*jslint browser: true, plusplus: true, unparam: true, indent: 2 */
/*global jQuery, console */

// FIXME put in compat mode module
if (typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function () {
    "use strict";
    return this.replace(/^\s+|\s+$/g, '');
  };
}

$.cookieHandler = require('./js/cookie');
$.chapters = require('./js/chapter');


var pwp = {
  tc: require('./js/timecode'),
  players: require('./js/player').players,
  embed: require('./js/embed')
};

pwp.embed.init($, pwp.players);

module.exports = pwp;

},{"./js/chapter":1,"./js/cookie":2,"./js/embed":3,"./js/player":4,"./js/timecode":5}]},{},[7])