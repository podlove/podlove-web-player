'use strict';

var Tab = require('../tab');

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
  return (fileSize < oneMb) ? kBFileSize + ' KB' : mBFileSIze + ' MB';
}

/**
 *
 * @param listElement
 * @returns {string}
 */
function createOption(asset) {
  console.log(asset);
  return '<option value="' + asset.downloadUrl + '">' +
      asset.assetTitle + ' &#8226; ' + formatSize(asset.size) +
    '</option>';
}

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
  var source = (typeof element === 'string') ? element : element.src;
  var parts = source.split('.');
  return {
    assetTitle: parts[parts.length - 1],
    downloadUrl: source,
    url: source,
    size: -1
  };
}

/**
 *
 * @param {Object} params
 * @returns {Array}
 */
function createList (params) {
  if (params.downloads && params.downloads[0].assetTitle) {
    return params.downloads;
  }

  if (params.downloads) {
    return params.downloads.map(normalizeDownload);
  }
  // build from source elements
  return params.sources.map(normalizeSource);
}

/**
 *
 * @param {object} params
 * @constructor
 */
function Downloads (params) {
  this.list = createList(params);
  this.tab = this.createDownloadTab(params);
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
  var downloadTab = new Tab({
    icon: 'pwp-download',
    title: 'Downloads anzeigen / verbergen',
    name: 'downloads',
    headline: 'Download'
  });

  var $tabContent = downloadTab.createMainContent(
    '<div class="download">' +
      '<form action="#">' +
        '<select class="select" name="select-file">' + this.list.map(createOption) + '</select>' +
        '<button class="download button-submit icon pwp-download" name="download-file">' +
          '<span class="download label">Download</span>' +
        '</button>' +
      '</form>' +
    '</div>'
  );
  downloadTab.box.append($tabContent);

  var $button = $tabContent.find('button.pwp-download');
  var $select = $tabContent.find('select.select');

  $button.on('click', function (e) {
    e.preventDefault();
    window.open($select.val(), '_self');
  });

  // Add direct download URL for display to the user
  // to footer of this tab
  var $downloadLinkElement = $('<input name="download-link-url" type="url" readonly>');

  function setUrl () {
    $downloadLinkElement.val($select.val());
  }

  // set initial value
  setUrl();

  // change url whenever the user selects an asset
  $select.on('change', setUrl);

  downloadTab
    .createFooter('<h3>Direkter Link</h3>')
    .append($downloadLinkElement);

  return downloadTab;
};

module.exports = Downloads;
