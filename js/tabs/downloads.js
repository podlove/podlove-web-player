'use strict';
var Tab = require('../tab');

function formatSize(size) {
  return (parseInt(size, 10) < 1048704) ?
    Math.round(parseInt(size, 10) / 100) / 10 + 'kB' :
    Math.round(parseInt(size, 10) / 1000 / 100) / 10 + 'MB';
}

function createFileSelect(params) {
  var i, name, size;

  var $select = $('<select name="downloads" class="fileselect" size="1"></select>');

  if (params.downloads !== undefined) {
    for (i = 0; i < params.downloads.length; i += 1) {
      size = formatSize(params.downloads[i].size);
      $select.append('<option value="' + params.downloads[i].url + '" data-url="' + params.downloads[i].url + '" data-dlurl="' + params.downloads[i].dlurl + '">' + params.downloads[i].name + ' (' + size + ')</option>');
    }
  } else {
    for (i = 0; i < params.sources.length; i += 1) {
      name = params.sources[i].split('.');
      name = name[name.length - 1];
      $select.append('<option value="' + params.sources[i] + '" data-url="' + params.sources[i] + '" data-dlurl="' + params.sources[i] + '">' + name + '</option>');
    }
  }

  $select.on('change', function () {
    var dlurl, dlname, $this = $(this);
    $this.parent().find(".fileselect option:selected").each(function () {
      dlurl = $(this).data('dlurl');
    });
    $this.parent().find(".downloadbutton").each(function () {
      dlname = dlurl.split('/');
      dlname = dlname[dlname.length - 1];
      $(this).attr('href', dlurl);
      $(this).attr('download', dlname);
    });
    this.value = this.options[this.selectedIndex].value;
    return false;
  });

  return $select;
}

/**
 *
 * @param {object} params
 * @returns {null|Tab} download tab
 */
function createDownloadTab(params) {
  if ((!params.downloads && !params.sources) || params.hidedownloadbutton === true) {
    return null;
  }
  var downloadTab = new Tab({
      icon: "pwp-icon-link",
      title: "Show/hide download bar",
      name: 'podlovewebplayer_downloadbuttons',
      active: !!params.downloadbuttonsVisible
  });

  var openFileButton = downloadTab.createToggleButton("pwp-icon-link-ext", "Open");
  openFileButton.click(function () {
    $(this).parent().find(".fileselect option:selected").each(function () {
      window.open($(this).data('url'), 'Podlove Popup', 'width=550,height=420,resizable=yes');
    });
    return false;
  });
  downloadTab.box.append(openFileButton);

  var fileInfoButton = downloadTab.createToggleButton("pwp-icon-info-circle", "Info");
  fileInfoButton.click(function () {
    $(this).parent().find(".fileselect option:selected").each(function () {
      window.prompt('file URL:', $(this).val());
    });
    return false;
  });
  downloadTab.box.append(fileInfoButton);

  downloadTab.box.append(createFileSelect(params));

  return downloadTab;
}

module.exports = createDownloadTab;
