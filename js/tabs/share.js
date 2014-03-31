var tabs = require('../tabs');

/**
 *
 * @param options
 * @returns {*}
 */
function getButtonClickHandler(options) {
  if ('clickHandler' in options && typeof options.clickHandler === 'function') {
    return options.clickHandler;
  }
  var windowFeatures = 'width=550,height=420,resizable=yes';
  return function () {
    window.open(options.link, options.windowTitle, windowFeatures);
    return false;
  };
}

/**
 *
 * @param options
 * @returns {*|jQuery|HTMLElement}
 */
function createShareButton(options) {
  var clickHandler = getButtonClickHandler(options),
    button = $('<a href="#" target="_blank" ' +
      'class="infobuttons ' + options.icon + '" title="' + options.title + '"></a>');
  button.on('click', clickHandler);
  return button;
}

/**
 * pass episode url and name
 * @param {object} episode
 * @param {boolean} shareButtonsActive
 */
function createShareButtons(episode, shareButtonsActive) {
  var shareButtonsControlBox = createShareButtonControlBox(shareButtonsActive);

  var currentButton = createShareButton({
    icon: "pwp-icon-link",
    title: "Get URL for this",
    clickHandler: function () {
      window.prompt('This URL directly points to this episode', episode.url);
      return false;
    }
  });
  shareButtonsControlBox.append(currentButton);

  var tweetButton = createShareButton({
    icon: "pwp-icon-twitter",
    title: "Share this on Twitter",
    windowTitle: "tweet it",
    link: 'https://twitter.com/share?text=' + episode.titleEncoded + '&url=' + episode.urlEncoded
  });
  shareButtonsControlBox.append(tweetButton);

  var fbButton = createShareButton({
    icon: "pwp-icon-facebook",
    title:"Share this on Facebook",
    windowTitle: 'share it',
    link: 'http://www.facebook.com/share.php?t=' + episode.titleEncoded + '&u=' + episode.urlEncoded
  });
  shareButtonsControlBox.append(fbButton);

  var gPlusButton = createShareButton({
    icon: "pwp-icon-gplus",
    title: "Share this on Google+",
    link: 'https://plus.google.com/share?title=' + episode.titleEncoded + '&url=' + episode.urlEncoded,
    windowTitle: 'plus it'
  });
  shareButtonsControlBox.append(gPlusButton);

  var adnButton = createShareButton({
    icon: "pwp-icon-appnet",
    title: "Share this on App.net",
    link: 'https://alpha.app.net/intent/post?text=' + episode.titleEncoded + '%20' + episode.urlEncoded,
    windowTitle: 'post it'
  });
  shareButtonsControlBox.append(adnButton);

  var mailButton = createShareButton({
    icon: "pwp-icon-mail",
    title: "Share this via e-mail",
    windowTitle: "",
    clickHandler: function () {
      window.location = 'mailto:?subject=' + episode.titleEncoded + '&body=' + episode.titleEncoded + '%20%3C' +
        episode.urlEncoded + '%3E';
      return false;
    }
  });
  shareButtonsControlBox.append(mailButton);
  return shareButtonsControlBox;
}

module.exports.createControlBox = createShareButtons;

/**
 *
 * @param {*|jQuery|HTMLElement} parent
 */
function createShowShareButton() {
  return tabs.createToggleButton("pwp-icon-export", "Show/hide sharing tabs");
}

module.exports.createToggleButton = createShowShareButton;

/**
 *
 * @param {boolean} shareButtonsActive
 * @returns {*|jQuery|HTMLElement}
 */
function createShareButtonControlBox(shareButtonsActive) {
  return tabs.createControlBox("podlovewebplayer_sharebuttons", shareButtonsActive);
}
