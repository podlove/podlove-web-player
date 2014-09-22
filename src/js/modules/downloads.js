'use strict';
var Tab = require('../tab');

function formatSize(size) {
  if (!size) {
    return ' -- ';
  }
  return (parseInt(size, 10) < 1048704) ?
    Math.round(parseInt(size, 10) / 100) / 10 + 'kB' :
    Math.round(parseInt(size, 10) / 1000 / 100) / 10 + 'MB';
}

var createRow = function (element) {
  var row = $('<dt class="filename">' + element.assetTitle+ '</dt>' +
    '<dd class="size">' + formatSize(element.size) + '</dd>');
  //render and append
  this.append(row);
  var openFileButton = createListButton("file-open", "pwp-icon-link-ext", "Open");
  this.append(openFileButton);
  openFileButton.click(function () {
    window.open(element.url, 'Podlove Popup', 'width=550,height=420,resizable=yes');
    return false;
  });

  var fileInfoButton = createListButton("file-info", "pwp-icon-info-circle", "Info");
  this.append(fileInfoButton);
  fileInfoButton.click(function () {
    window.prompt('file URL:', element.downloadUrl);
    return false;
  });

};

var createListButton = function(className, icon, title) {
  return $('<dd class="' + className + '">' +
      '<a href="#" class="button button-toggle ' + icon + '" title="' + title + '"></a>' +
    '</dd>');
};

/**
 *
 * @param {object} params
 * @constructor
 */
function Downloads (params) {
  this.list = this.createList(params);
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
      icon: "pwp-icon-link",
      title: "Show/hide download bar",
      name: 'downloads',
      headline: 'Download',
      active: !!params.downloadbuttonsVisible
    }),
    $listElement = downloadTab.createSection('<dl></dl>');

  this.list.forEach(createRow, $listElement);
  downloadTab.box.append($listElement);

  return downloadTab;
};

Downloads.prototype.createList = function (params) {
  if (params.downloads && params.downloads[0].assetTitle) {
    return params.downloads
  }

  if (params.downloads) {
      return params.downloads.map(function (element) {
          return {
            "assetTitle": element.name,
            "downloadUrl": element.dlurl,
            "url": element.url
          };
      });
  }
  // build from source elements
  return params.sources.map(function (element) {
    var parts = element.split('.');
    return {
      url: element,
      dlurl: element,
      name: parts[parts.length - 1]
    };
  });
};

module.exports = Downloads;

