'use strict';

var Tab = require('../tab')
  , SocialButtonList = require('../social-button-list');

var services = ['twitter', 'facebook', 'gplus', 'tumblr', 'email']
  , shareOptions = [
    {name: 'Show', value: 'show'},
    {name: 'Episode', value: 'episode', default: true},
    {name: 'Chapter', value: 'chapter', disabled: true},
    {name: 'Exactly this part here', value: 'timed', disabled: true}
  ]
  , shareData = {};

// module globals
var selectedOption, shareButtons, linkInput;

function getShareData(value) {
  if (value === 'show') {
    return shareData.show;
  }
  var data = shareData.episode;
  // todo add chapter start and end time to url
  //if (value === 'chapter') {
  //}
  // todo add selected start and end time to url
  //if (value === 'timed') {
  //}
  return data;
}

function updateUrls(data) {
  shareButtons.update(data);
  linkInput.update(data);
}

function onShareOptionChangeTo (element, value) {
  var data = getShareData(value);
  var radio = element.find('[type=radio]');

  return function () {
    selectedOption.removeClass('selected');

    radio.prop('checked', true);
    element.addClass('selected');
    selectedOption = element;
    console.log('sharing options changed', element, value);

    updateUrls(data);
  };
}

/**
 * create sharing button
 * @param {object} option sharing option definition
 * @returns {jQuery} share button reference
 */
function createOption(option) {
  if (option.disabled) {
    console.log('Share', 'createOption', 'omit disabled option', option.name);
    return null;
  }

  var data = getShareData(option.value);

  if (!data) {
    console.log('Share', 'createOption', 'omit option without data', option.name);
    return null;
  }

  var element = $('<tr class="share-select-option">' +
    '<td class="share-description">' + option.name + '</td>' +
    '<td class="share-radio"><input type="radio" id="share-option-' + option.name + '" name="r-group" value="' + option.title + '"></td>' +
    '<td class="share-label"><label for="share-option-' + option.name + '">' + option.title + '</label></td>' +
    '</tr>'
  );
  var radio = element.find('[type=radio]');

  if (option.default) {
    selectedOption = element;
    element.addClass('selected');
    radio.prop('checked', true);
    updateUrls(data);
  }
  var changeHandler = onShareOptionChangeTo(element, option.value);
  element.on('click', changeHandler);
  return element;
}

/**
 * Creates an html table element to wrap all share buttons
 * @returns {jQuery|HTMLElement} share button wrapper reference
 */
function createShareList(params) {
  shareOptions[0].title = params.show.title;
  shareOptions[1].title = params.title;
  var table = $('<table class="share-button-wrapper" data-toggle="buttons"><caption>Podcast teilen</caption><tbody></tbody</table>');
  table.append(shareOptions.map(createOption));
  return table;
}

/**
 * create sharing buttons in a form
 * @returns {jQuery} form element reference
 */
function createShareOptions(params) {
  var form = $('<form>' +
    '<h3>Was möchtest du teilen?</h3>' +
  '</form>');
  form.append(createShareList(params));
  return form;
}

/**
 * build and return tab instance for sharing
 * @param {object} params player configuration
 * @returns {null|Tab} sharing tab instance or null if permalink missing or sharing disabled
 */
function createShareTab(params) {
  if (!params.permalink || params.hidesharebutton === true) {
    return null;
  }

  var shareTab = new Tab({
    icon: 'pwp-share',
    title: 'Teilen anzeigen / verbergen',
    name: 'share',
    headline: 'Teilen'
  });

  shareButtons = new SocialButtonList(services, getShareData('episode'));
  linkInput = $('<h3>Direkter Link</h3>' +
    '<input type="url" name="share-link-url" readonly>');
  linkInput.update = function(data) {
    this.val(data.rawUrl);
  };

  shareTab.createMainContent('')
    .append(createShareOptions(params))
    .append('<h3>Teilen via ...</h3>')
    .append(shareButtons.list);
  shareTab.createFooter('').append(linkInput);

  return shareTab;
}

module.exports = function Share(params) {
  shareData.episode = {
    poster: params.poster,
    title: encodeURIComponent(params.title),
    url: encodeURIComponent(params.permalink),
    rawUrl: params.permalink,
    text: encodeURIComponent(params.title + ' ' + params.permalink)
  };
  shareData.chapters = params.chapters;

  if (params.show.url) {
    shareData.show = {
      poster: params.show.poster,
      title: encodeURIComponent(params.show.title),
      url: encodeURIComponent(params.show.url),
      rawUrl: params.show.url,
      text: encodeURIComponent(params.show.title + ' ' + params.show.url)
    };
  }

  selectedOption = 'episode';
  this.tab = createShareTab(params);
};
