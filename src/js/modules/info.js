'use strict';

var Tab = require('../tab')
  , timeCode = require('../timecode')
  , services = require('../social-networks');

function getPublicationDate(rawDate) {
  if (!rawDate) {
    return '';
  }
  var date = new Date(rawDate);
  return '<p>' + $.i18n( 'tab_info_title_published' ) + ': ' + date.getDate() + '.' + date.getMonth() + '.' + date.getFullYear() + '</p>';
}

function createEpisodeInfo(tab, params) {
  tab.createMainContent(
    '<h2>' + params.title + '</h2>' +
    '<h3>' + params.subtitle + '</h3>' +
    '<p>' + params.summary + '</p>' +
    '<p>' + $.i18n( 'tab_info_title_duration' ) + ': ' + timeCode.fromTimeStamp(params.duration) + '</p>' +
     getPublicationDate(params.publicationDate) +
    '<p>' +
      $.i18n( 'tab_info_title_permalink' ) + ':<br>' +
      '<a href="' + params.permalink + '" target="_blank" title="' + $.i18n( 'tab_info_title_link_permalink' ) + '">' + params.permalink + '</a>' +
    '</p>'
  );
}

function createPosterImage(poster) {
  if (!poster) {
    return '';
  }
  return '<div class="poster-image">' +
    '<img src="' + poster + '" data-img="' + poster + '" alt="' + $.i18n( 'alt_coverart' ) + '">' +
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
    '<h2>' + params.show.title + '</h2>' +
    '<h3>' + params.show.subtitle + '</h3>' +
    createPosterImage(params.show.poster) +
    createSubscribeButton(params) +
    '<p>' + $.i18n( 'tab_info_title_link_show' ) + ':<br>' +
      '<a href="' + params.show.url + '" target="_blank" title="' + $.i18n( 'tab_info_title_link_show' ) + '">' + params.show.url + '</a></p>'
  );
}

function createSocialLink(options) {
  var service = services.get(options.serviceName);
  var listItem = $('<li></li>');
  var button = service.getButton(options);
  listItem.append(button.element);
  this.append(listItem);
}

function createSocialInfo(profiles) {
  if (!profiles) {
    return null;
  }

  var profileList = $('<ul></ul>');
  profiles.forEach(createSocialLink, profileList);

  var container = $('<div class="social-links"><h3>' + $.i18n( 'tab_info_title_social' ) + '</h3></div>');
  container.append(profileList);
  return container;
}

function createSocialAndLicenseInfo (tab, params) {
  if (!params.license && !params.profiles) {
    return;
  }
  tab.createFooter(
    '<p>' + $.i18n( 'tab_info_text_license', params.show.title ) + '<br>' +
      '<a href="' + params.license.url + '" target="_blank" title="' + $.i18n( 'tab_info_link_license_title' ) + '">' + params.license.name + '</a>' +
    '</p>'
  ).prepend(createSocialInfo(params.profiles));
}

/**
 * create info tab if params.summary is defined
 * @param {object} params parameter object
 * @returns {null|Tab} info tab instance or null
 */
function createInfoTab(params) {
  if (!params.summary) {
    return null;
  }
  var infoTab = new Tab({
    icon: 'pwp-info',
    title: $.i18n( 'tab_title_message', $.i18n( 'tab_info_name' ), $.i18n( 'tab_title_actions' ) ),
    headline: $.i18n( 'tab_info_name' ),
    name: 'info'
  });

  createEpisodeInfo(infoTab, params);
  createShowInfo(infoTab, params);
  createSocialAndLicenseInfo(infoTab, params);

  return infoTab;
}

/**
 * Information module to display podcast and episode info
 * @param {object} params parameter object
 * @constructor
 */
function Info(params) {
  this.tab = createInfoTab(params);
}

module.exports = Info;
