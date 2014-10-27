var Tab = require('../tab')
  , timeCode = require('../timecode')
  , services = require('../social-networks')
  ;

function createEpisodeInfo(tab, params) {
  var date = new Date(params.publicationDate);

  tab.createMainContent(
    '<h2>' + params.title + '</h2>' +
    '<em>' + params.subtitle + '</em>' +
    '<p>' + params.summary + '</p>' +
    '<p>Duration: ' + timeCode.fromTimeStamp(params.duration) + '</p>' +
    '<p>Published: ' + date.getDate() + '.' + date.getMonth() + '.' + date.getFullYear() + '</p>' +
    '<p>' +
      'Permalink for this episode:<br>' +
      '<a href="' + params.permalink + '">' + params.permalink + '</a>' +
    '</p>'
  );
}

function createPosterImage(poster) {
  if (!poster) {
    return '';
  }
  return '<div class="poster-image">' +
    '<img src="' + poster + '" data-img="' + poster + '" alt="Poster Image">' +
    '</div>';
}

function createSubscribeButton(params) {
  if (!params.subscribeButton) {
    return '';
  }
  return '<button class="button-submit">' +
      '<span class="showtitle-label">' + params.show.title + '</span>' +
      '<span class="submit-label">' + params.subscribeButton + '</span>' +
    '</button>';
}

function createShowInfo (tab, params) {
  tab.createAside(
    '<h2>'+ params.show.title+ '</h2>' +
    '<p>' + params.show.subtitle + '</p>' +
    createPosterImage(params.show.poster) +
    createSubscribeButton(params) +
    '<p>Link to the show:<br>' +
      '<a href="' + params.show.url + '">' + params.show.url + '</a></p>'
  );
}

function createSocialLink(options) {
  var service = services.get(options.serviceName);
  return '<li>' + service.getButton(options) + '</li>';
}

function createSocialInfo(profiles) {
  if (!profiles) {
    return '';
  }
  return '<div class="social-links">' +
      '<h3>Stay in touch</h3>' +
      '<ul>' + profiles.map(createSocialLink) + '</ul>' +
    '</div>';
}

function createSocialAndLicenseInfo (tab, params) {
  if (!params.license && !params.profiles) {
    return;
  }
  tab.createFooter(
    createSocialInfo(params.profiles) +
    '<p>The show "' + params.show.title + '" is licenced under<br>' +
      '<a href="' + params.license.url + '">' + params.license.name + '</a>' +
    '</p>'
  );
}

/**
 *
 * @param {object} params
 * @returns {null|Tab} infoTab
 */
function createInfoTab(params) {
  if (!params.summary) {
    return null;
  }
  var infoTab = new Tab({
    icon: 'pwp-info-circled',
    title: 'More information about this',
    headline: 'Info',
    name: 'info',
    active: !!params.summaryVisible
  });

  return infoTab;
}

/**
 *
 * @param {object} params
 * @constructor
 */
function Info(params) {
  this.tab = createInfoTab(params);
  createEpisodeInfo(this.tab, params);
  createShowInfo(this.tab, params);
  createSocialAndLicenseInfo(this.tab, params);
}

module.exports = Info;
