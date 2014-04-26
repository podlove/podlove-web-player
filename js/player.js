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
  generateTimecode = require('./timecode').generate,
  parseTimecode = require('./timecode').parse,
  handleCookies = require('./cookie'),
  setFragmentURL = require('./url').setFragment,
  checkTime,
  addressCurrentTime;

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
};

function create(player, params, callback) {
  var jqPlayer,
    playerType = getPlayerType(player),
    secArray,
    orig,
    deepLink,
    wrapper,
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
    removePlayPause(mejsoptions);
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

  params.type = playerType;
  // init MEJS to player
  mejsoptions.success = function (player) {
    callback(player, params, wrapper);
    if (deepLink !== false && players.length === 1) {
      $('html, body').delay(150).animate({
        scrollTop: $('.container:first').offset().top - 25
      });
    }
  };

  $(orig).replaceWith(wrapper);
  jqPlayer.mediaelementplayer(mejsoptions);
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
  create: create,
  players: players
};

