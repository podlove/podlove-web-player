var Tab = require('../tab')
  , SocialButtonList = require('../social-button-list')
  , services = ['twitter', 'adn', 'email']
  , shareOptions = [
    {name: "Show", value: "show"},
    {name: "Episode", value: "episode"},
    {name: "Chapter", value: "chapter", disabled:true},
    {name: "Exactly this part here", value: "timed", disabled:true}
  ];

// module globals
var shareTab, selectedOption, shareButtons, shareData;

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

function onShareOptionChangeTo (value) {
  var data = getShareData(value);
  return function (event) {
    console.log('sharing options changed', value);
    event.preventDefault();
    shareButtons.update(data);
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

function createOption(option) {
  if (option.disabled) {
    return null;
  }
  var element = $('<button class="share-select-option" style="max-width: 200px;">' +
    createPosterFor(option.value) +
    '<span>' + option.name + '</span>' +
    '</button>');

  element.on('click', onShareOptionChangeTo(option.value));
  return element;
}

/**
 *
 * @returns {string}
 */
function createShareOptions() {
  var form = $('<form>' +
    '<legend>What would you like to share?</legend>' +
  '</form>');

  form.append(shareOptions.map(createOption));
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
    name: "podlovewebplayer_sharebuttons",
    headline: 'Share',
    active: !!params.sharebuttonsVisible
  });

  shareTab.createMainContent('').append(createShareOptions());

  shareButtons = new SocialButtonList(services, getShareData('episode'));
  shareTab.createFooter('').append(shareButtons.list);

  return shareTab;
}

module.exports = function Share(params) {
  shareData = {
    episode: {
      poster: params.poster,
      title: encodeURIComponent(params.title),
      url: encodeURIComponent(params.permalink),
      text: encodeURIComponent(params.title + ' ' + params.permalink)
    },
    show: {
      poster: params.show.poster,
      title: encodeURIComponent(params.show.title),
      url: encodeURIComponent(params.show.url),
      text: encodeURIComponent(params.show.title + ' ' + params.show.url)
    },
    chapters: params.chapters
  };
  selectedOption = 'episode';
  shareTab = createShareTab(params);
  this.tab = shareTab;
};

