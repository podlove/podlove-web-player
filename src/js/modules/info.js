var Tab = require('../tab')
  , timeCode = require('../timecode')
  , types = {
    'twitter': {
      'className': 'twitter',
      'title': 'Twitter',
      'image': 'img/twitter-128.png'
    },
    'flattr': {
      'className': 'flattr',
      'title': 'Flattr',
      'image': 'img/flattr-128.png'
    },
    'facebook': {
      'className': 'facebook',
      'title': 'Facebook',
      'image': 'img/facebook-128.png'
    },
    'adn': {
      'className': 'adn',
      'title': 'Twitter',
      'image': 'img/twitter-128.png'
    },
    'email': {
      'className': 'email',
      'title': 'E-Mail',
      'image': 'img/email-128.png'
    },
    'googleplus': {
      'className': 'google',
      'title': 'Google+',
      'image': 'img/googleplus-128.png'
    }
  }
  ;

function createEpisodeInfo(tab, params) {
  var date = new Date(params.publicationDate);

  tab.createSection(
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
  return '<div class="image-container">' +
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

function createSocialLink(type, url) {
  if (!(type in types)) {
    console.warn('createSocialLink called with unknown type', type);
    return '';
  }
  return '<li><a class="' + types[type].className + '" title="' + types[type].title + '" href="' + url + '">' +
      '<img src="' + types[type].image + '"><span>' + types[type].title + '</span></a></li>';
}

function createSocialInfo(social) {
  if (!social) {
    return '';
  }
  return '<div class="social-links">' +
      '<h3>Stay in touch</h3>' +
      '<ul>' + social.links.map(createSocialLink).join('') + '</ul>' +
    '</div>';
}

function createSocialAndLicenseInfo (tab, params) {
  if (!params.license && !params.social) {
    return;
  }
  tab.createFooter(
    createSocialInfo(params.social) +
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
