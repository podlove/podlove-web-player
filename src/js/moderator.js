'use strict';

var url = require('./url'),
  cap = require('./util').cap;

var log = require('./logging').getLogger('Moderator');

var IFRAME_HEIGHT_DEFAULT = 300,
    IFRAME_HEIGHT_MIN = 100,
    IFRAME_HEIGHT_MAX = 3000,
    players = {},
    firstPlayer = true,
    metadataList = 'pwp_metadata',
//    autoplay = url.getFragment('autoplay'),
    timerange = url.checkCurrent(); // timecode

var options; // global options

function checkBoundaries(value, min, max) {
  return (value < min || value > max);
}

/**
 * Sanitize player height
 * @param {Number} height Iframe height
 * @returns {Number} sanitized height
 */
function getPlayerHeight(height) {
  if (!height || isNaN(height)) {
    log.info('Set frame height to default');
    return IFRAME_HEIGHT_DEFAULT;
  }
  if (checkBoundaries(height, IFRAME_HEIGHT_MIN, IFRAME_HEIGHT_MAX)) {
    log.debug('Frame height %d out of bounds.', height);
  }
  return cap(height, IFRAME_HEIGHT_MIN, IFRAME_HEIGHT_MAX);
}

/**
 * Sanitize player width
 * @returns {string} defaults to '100%'
 */
function getPlayerWidth() {
  return '100%';
}

/**
 * strip hash from location
 * @param {string} location
 * @returns {string}
 */
function getIdFromLocation(location) {
  var href = location.href,
    hashPosition = href.indexOf('#'),
    to = href.length;

  if (hashPosition >= 0) {
    to = hashPosition;
  }

  return href.substring(0, to);
}

function getStaticEmbedPageSource(id) {
  if (!options.staticEmbedPage) { throw new Error('"staticEmbedPage" parameter missing.'); }
  return options.staticEmbedPage + '?' + id;
}

function getIframeReplacement() {

  var data;
  /*jshint validthis:true */
  var source = this.getAttribute('data-podlove-web-player-source');

  if (!source) {
    var elementId = this.id;
    if (!elementId) { throw new Error('Element without source set needs an ID'); }
    source = getStaticEmbedPageSource(elementId);
    data = window[metadataList][elementId];
    if (!data) { throw new Error('No data found for "' + elementId + '"'); }
  }

  if (firstPlayer && timerange[0]) {
    firstPlayer = false;
    source += '#t=' + url.getFragment('t');
  }

  var frame = document.createElement('iframe');
  frame.src = source;
  frame.height = getPlayerHeight(this.getAttribute('data-podlove-web-player-height'));
  frame.width = getPlayerWidth(this.getAttribute('data-podlove-web-player-width'));
  frame.classList.add('podlove-webplayer-frame');
  frame.setAttribute('style', 'border:none;overflow:hidden;');

  // register player frame
  players[frame.src] = {
    data: data,
    frame: frame,
    state: -1
  };
  log.info('registered player with id', frame.src);

  return frame;
}

/**
 * Pause all registered players except the one with the given ID
 * @param {String} currentPlayerId
 */
function pausePlayersExceptOne(currentPlayerId) {
  var playerData, playerId, message = {action: 'pause'};
  for (playerId in players) {
    if (playerId === currentPlayerId || !players.hasOwnProperty(playerId)) {
      continue;
    }
    playerData = players[playerId];
    if (playerData.state === 0) {
      continue;
    } // nothing to do, it is already paused

    playerData.frame.contentWindow.postMessage(message, playerId);
  }
}

/**
 * decide what to do with a received message
 * @param {jQuery.Event} event
 */
function handleMessage(event) {
  // discard hash - it changes along with the time media is played
  console.log(event);
  var data = event.data,
    action = data.action,
    argumentObject = data.arg,
    id = getIdFromLocation(event.source.location),
    player = players[id];

  log.debug('received message', action, argumentObject);

  if (!player) {
    log.warn('no player found with id', id);
    return;
  }

  if (action === null || argumentObject === null) {
    log.warn('no action or data was given');
    return;
  }

  log.debug('received', action, 'from', id, 'with', argumentObject);

  if (action === 'waiting') {
    player.frame.contentWindow.postMessage({playerOptions: player.data}, '*');
  }

  if (action === 'ready' || action === 'pause') {
    player.state = 0;
  }

  if (action === 'play') {
    player.state = 1;
    pausePlayersExceptOne(id);
  }

  if (action === 'resize') {
    player.frame.height = getPlayerHeight(argumentObject);
  }
}

// receive messages from embedded players
window.addEventListener('message', handleMessage, false);

/**
 * Replace selection of nodes with embedded podlove webplayers and register them internally
 * @param {object} opts
 * @returns {jQuery} jQuery extended HTMLIFrameElement
 */
function replaceWithJQ(opts) {
  if (opts) {
    pwp.options = opts || {};
  }
  return this.replaceWith(getIframeReplacement, pwp.options);
}

/**
 *
 * @param selector default selector '[podlove-web-player-source]'
 */
function getElementsBySelector (selector) {
  if (!selector) {
    return document.querySelectorAll('[data-podlove-web-player-source]');
  }
  return document.querySelectorAll(selector);
}

function replaceAll () {
  var elementList = getElementsBySelector();
  var l = elementList.length;
  var frame, element;
  while (l--) {
    element = elementList[l];
    frame = getIframeReplacement.call(element);
    element.parentElement.insertBefore(frame, element);
  }
}

// decide what to do based on given context
if (!window.jQuery) {
  replaceAll();
}
if (window.jQuery) {
   jQuery.fn.podlovewebplayer = replaceWithJQ;
}

window.pwp = {
  players: players
};
