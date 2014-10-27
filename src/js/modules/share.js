var Tab = require('../tab')
  , SocialButtonList = require('../social-button-list')
  , services = ['twitter', 'adn', 'email']
  , shareOptions = [
    {name: "Show", value: "show"},
    {name: "Episode", value: "episode"},
    {name: "Chapter", value: "chapter"},
    {name: "Exactly this part here", value: "timed"}
  ];

// module globals
var shareTab, selectedOption, shareButtons, episodeData;

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

function createOption(option) {
  return '<label><input type="radio" name="share" value="' + option.value + '" />' + option.name + '</label>';
}

/**
 *
 * @returns {string}
 */
function createShareOptions() {
  var form = $('<form>' +
    '<fieldset>' +
    '<legend>What would you like to share?</legend>' +
      shareOptions.map(createOption).join('') +
    '</fieldset>' +
    '</form>');
  form.on('change', function (event) {
    console.log('sharing options changed', event);
    episodeData.text = 'changed';
    shareButtons.update(episodeData);
  });
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

  shareTab.createMainContent(
    createPoster(params.poster) +
    createPoster(params.show.poster)
  ).append(createShareOptions());

  shareButtons = new SocialButtonList(services, episodeData);
  shareTab.createFooter('').append(shareButtons.list);

  return shareTab;
}

module.exports = function Share(params) {
  episodeData = {
    title: encodeURIComponent(params.title),
    url: encodeURIComponent(params.permalink)
  };
  selectedOption = 'episode';
  shareTab = createShareTab(params);
  this.tab = shareTab;
};

