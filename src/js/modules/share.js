var Tab = require('../tab');

var shareOptions = [
  {name: "Show", value: "show"},
  {name: "Episode", value: "episode"},
  {name: "Chapter", value: "chapter"},
  {name: "Exactly this part here", value: "timed"}
];

/**
 * Creates the main content
 * @param shareTab
 * @param params
 */
function createContentContainer(shareTab, params) {
  shareTab.createMainContent(
    createShareOptions() +
    createPoster(params.poster) +
    createPoster(params.show.poster)
  );
}

/**
 * Creates an html div element containing an image
 * @param poster
 * @returns {string}
 */
function createPoster(poster) {
  if (!poster) {
    return '';
  }
  return '<div class="poster-image">' +
    '<img src="' + poster + '" data-img="' + poster + '" alt="Poster Image">' +
    '</div>';
}

/**
 *
 * @returns {string}
 */
function createShareOptions() {
  return'<form method="post">' +
    '<fieldset>' +
    '<legend>What would you like to share?</legend>' +
    '<input type="radio" name="share" value="Show" />Show<br />' +
    '<input type="radio" name="share" value="Episode" />Episode<br />' +
    '<input type="radio" name="share" value="Chapter" />Chapter<br />' +
    '<input type="radio" name="share" value="Exactly this part here" />Exactly this part here<br />' +
    '</fieldset>' +
    '</form>';
}

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
    button = $('<li><a target="_blank" href="' + options.link + '"' +
      'class="button-toggle ' + options.icon + '" title="' + options.title + '"></a></li>');
  //button.on('click', clickHandler);
  return button;
}

/**
 * pass episode url and name
 * @param {Tab} shareTab
 * @param {object} episode
 */
function createShareButtons(shareTab, episode) {
  var list = $('<ul></ul>')
    , currentButton = createShareButton({
      icon: "pwp-share2",
      title: "Get URL for this",
      clickHandler: function () {
        window.prompt('This URL directly points to this episode', episode.url);
        return false;
      }
    })
    ;
  list.append(currentButton);
  var tweetButton = createShareButton({
    icon: "pwp-twitter",
    title: "Share this on Twitter",
    windowTitle: "tweet it",
    link: 'https://twitter.com/share?text=' + episode.titleEncoded + '&url=' + episode.urlEncoded
  });
  list.append(tweetButton);

  /*
   var fbButton = createShareButton({
   icon: "pwp-facebook",
   title:"Share this on Facebook",
   windowTitle: 'share it',
   link: 'http://www.facebook.com/share.php?t=' + episode.titleEncoded + '&u=' + episode.urlEncoded
   });
   list.append(fbButton);

   var gPlusButton = createShareButton({
   icon: "pwp-gplus",
   title: "Share this on Google+",
   link: 'https://plus.google.com/share?title=' + episode.titleEncoded + '&url=' + episode.urlEncoded,
   windowTitle: 'plus it'
   });
   list.append(gPlusButton);
   */

  var adnButton = createShareButton({
    icon: "pwp-adn-alpha",
    title: "Share this on App.net",
    link: 'https://alpha.app.net/intent/post?text=' + episode.titleEncoded + '%20' + episode.urlEncoded,
    windowTitle: 'post it'
  });
  list.append(adnButton);

  var mailButton = createShareButton({
    icon: "pwp-mail",
    title: "Share this via e-mail",
    windowTitle: "",
    clickHandler: function () {
      window.location = 'mailto:?subject=' + episode.titleEncoded + '&body=' + episode.titleEncoded + '%20%3C' +
        episode.urlEncoded + '%3E';
      return false;
    }
  });
  list.append(mailButton);
  shareTab.createFooter('').append(list);
}

/**
 *
 * @param params
 * @returns {*}
 */
function createShareTab(params) {
  if (!params.permalink || params.hidesharebutton === true) {
    return null;
  }

  var episode = {
    title: params.title,
    titleEncoded: encodeURIComponent(params.title),
    url: params.permalink,
    urlEncoded: encodeURIComponent(params.permalink)
  };
  var shareTab = new Tab({
    icon: "pwp-share2",
    title: "Show/hide sharing tabs",
    name: "podlovewebplayer_sharebuttons",
    headline: 'Share',
    active: !!params.sharebuttonsVisible
  });

  createShareButtons(shareTab, episode);
  return shareTab;
}

function Share(params) {
  this.tab = createShareTab(params);
  createContentContainer(this.tab, params);
  //this.shareOption = params.;
  this.sharelink = params.url;
}

module.exports = Share;
