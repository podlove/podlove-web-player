var Tab = require('../tab')
  , SocialButtonList = require('../social-button-list')
  , services = ['twitter', 'adn', 'tumblr', 'email']
  , shareOptions = [
    {name: "Show", value: "show"},
    {name: "Episode", value: "episode", default: true},
    {name: "Chapter", value: "chapter", disabled:true},
    {name: "Exactly this part here", value: "timed", disabled:true}
  ];

// module globals
var shareTab, selectedOption, shareButtons, shareData, linkInput;

function getShareData(value) {
  var type = value === 'show' ? 'show' : 'episode';
  var data = shareData[type];
  if (value === 'chapter') {
    // todo add chapter start and end time to url
  }
  if (value === 'timed') {
    // todo add selected start and end time to url
  }
  return data;
}

function updateUrls(data) {
  shareButtons.update(data);
  linkInput.update(data);
}

function onShareOptionChangeTo (element, value) {
  var data = getShareData(value);

  return function (event) {
    console.log('sharing options changed', value);
    selectedOption.removeClass('selected');
    element.addClass('selected');
    selectedOption = element;
    event.preventDefault();
    updateUrls(data);
  };
}

/**
 * Creates an html div element containing an image
 * @param {string} type
 * @returns {string}
 */
function createPosterFor(type) {
  var data = shareData[type];
  if (!type || !data || !data.poster) {
    console.warn('cannot create poster for', type);
    return '';
  }
  console.log('create poster for', type, ' > url', data.poster);
  return '<img src="' + data.poster + '" data-img="' + data.poster + '" alt="Poster Image">';
}

/**
 *
 * @param option
 * @returns {*}
 */
function createOption(option) {
  if (option.disabled) {
    return null;
  }

  var element = $('<div class="share-select-option">' +
    createPosterFor(option.value) +
    '<span>Share this ' + option.name + '</span>' +
    '</div>');
  if (option.default) {
    selectedOption = element;
    element.addClass('selected');
    var data = getShareData(option.value);
    updateUrls(data);
  }
  element.on('click', onShareOptionChangeTo(element, option.value));
  return element;
}

/**
 * Creates an html div element to wrap all share buttons
 * @returns {jQuery|HTMLElement}
 */
function createShareButtonWrapper() {
  var div = $('<div class="share-button-wrapper"></div>');
  div.append(shareOptions.map(createOption));

  return div;
}

/**
 *
 * @returns {string}
 */
function createShareOptions() {
  var form = $('<form>' +
    '<legend>What would you like to share?</legend>' +
  '</form>');
  form.append(createShareButtonWrapper);
  return form;
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

  var shareTab = new Tab({
    icon: "pwp-share2",
    title: "Show/hide sharing tabs",
    name: "podlovewebplayer_share",
    headline: 'Share',
    active: !!params.sharebuttonsVisible
  });

  shareButtons = new SocialButtonList(services, getShareData('episode'));
  linkInput = $('<h3>Link</h3>' +
    '<input type="url" name="share-link-url" readonly>');
  linkInput.update = function(data) {
    this.val(data.rawUrl);
  };

  shareTab.createMainContent('').append(createShareOptions());
  shareTab.createFooter('<h3>Share via ...</h3>').append(shareButtons.list).append(linkInput);

  return shareTab;
}

module.exports = function Share(params) {
  shareData = {
    episode: {
      poster: params.poster,
      title: encodeURIComponent(params.title),
      url: encodeURIComponent(params.permalink),
      rawUrl: params.permalink,
      text: encodeURIComponent(params.title + ' ' + params.permalink)
    },
    show: {
      poster: params.show.poster,
      title: encodeURIComponent(params.show.title),
      url: encodeURIComponent(params.show.url),
      rawUrl: params.show.url,
      text: encodeURIComponent(params.show.title + ' ' + params.show.url)
    },
    chapters: params.chapters
  };
  selectedOption = 'episode';
  shareTab = createShareTab(params);
  this.tab = shareTab;
};

