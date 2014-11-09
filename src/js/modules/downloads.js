'use strict';
var Tab = require('../tab')
  , timeCode = require('../timecode')
  ;

/**
 * Calculate the filesize into KB and MB
 * @param size
 * @returns {string}
 */
function formatSize(size) {
  var oneMb = 1048576;
  var fileSize = parseInt(size, 10);
  var kBFileSize = Math.round(fileSize / 1024);
  var mBFileSIze = Math.round(fileSize / 1024 / 1024);
  if (!size) {
    return ' -- ';
  }
  // in case, the filesize is smaller than 1MB,
  // the format will be rendered in KB
  // otherwise in MB
  return (fileSize < oneMb) ?
    kBFileSize  + ' KB' :
    mBFileSIze + ' MB';
}

/**
 *
 * @param listElement
 * @returns {string}
 */
function createOption(listElement) {
  console.log(listElement);
  return '<option>' + listElement.assetTitle + ' ' + formatSize(listElement.size) + '</option>'
}

/**
 *
 * @param {object} params
 * @returns {null|Tab} download tab
 */
Downloads.prototype.createDownloadTab = function (params) {
  if ((!params.downloads && !params.sources) || params.hidedownloadbutton === true) {
    return null;
  }
  var date = new Date(params.publicationDate);
  var downloadTab = new Tab({
      icon: "pwp-download",
      title: "Show/hide download bar",
      name: 'downloads',
      headline: 'Download',
      active: !!params.downloadbuttonsVisible
    });

  var $tabContent = downloadTab.createMainContent('<div class="download">' +
      '<div class="poster-wrapper">' +
        '<div class="download download-overlay"></div>' +
        '<img class="poster-image" src="' + params.poster + '" data-img="' + params.poster + '" alt="Poster Image">' +
      '</div>' +
    '</div>' +
    '<div class="download">' +
      '<h2>' + params.title + '</h2>' +
      '<p>Published: ' + date.getDate() + '.' + date.getMonth() + '.' + date.getFullYear() + '</p>' +
      '<p>Duration: ' + timeCode.fromTimeStamp(params.duration) + '</p>' +
    '</div>'
    );
  downloadTab.box.append($tabContent);

  downloadTab.createFooter('<form action="" method="">' +
    '<button class="download button-submit pwp-download" name="download-file">' +
    '<span class="download label">Download Episode</span>' +
    '</button>' +
    '<select class="select" name="select-file">' + this.list.map(createOption) + '</select></form>'
 );

  return downloadTab;
};

/**
 *
 * @param element
 * @returns {{assetTitle: String, downloadUrl: String, url: String, size: Number}}
 */
function normalizeDownload (element) {
  return {
    assetTitle: element.name,
    downloadUrl: element.dlurl,
    url: element.url,
    size: element.size
  };
}

/**
 *
 * @param element
 * @returns {{assetTitle: String, downloadUrl: String, url: String, size: Number}}
 */
function normalizeSource(element) {
  var parts = element.split('.');
  return {
    assetTitle: parts[parts.length - 1],
    downloadUrl: element,
    url: element,
    size: element.size
  };
}

/**
 *
 * @param {Object} params
 * @returns {Array}
 */
var createList = function (params) {
  if (params.downloads && params.downloads[0].assetTitle) {
    return params.downloads
  }

  if (params.downloads) {
    return params.downloads.map(normalizeDownload);
  }
  // build from source elements
  return params.sources.map(normalizeSource);
};

/**
 *
 * @param {object} params
 * @constructor
 */
function Downloads (params) {
  this.list = createList(params);
  this.tab = this.createDownloadTab(params);
}

module.exports = Downloads;

