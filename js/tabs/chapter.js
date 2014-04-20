var tc = require('../timecode')
  , url = require('../url')
  , Tab = require('../tab')
  ;


/**
 * chapter handling
 * @params {object} params
 * @return {object} chapter tab
 */
module.exports = Chapters;

function Chapters (player, params) {

  this.player = player;
  if (params.duration === 0) {
    console.warn('Chapters.constructor: Zero length media?', params);
  }
  this.duration = params.duration;
  this.tab = new Tab({
    icon: "pwp-icon-list-bullet",
    title: "Show/hide chapters",
    name: "podlovewebplayer_chapterbox showonplay" // FIXME clean way to add 2 classnames
  })
  ;

  if ((params.chaptersVisible === 'true') || (params.chaptersVisible === true)) {
    this.tab.box.addClass('active');
  }
  this.tab.box.css({"overflow-y":"auto", "max-height": '200px'});

  //build chapter table
  this.chapters = prepareChapterData(params.chapters);

  this.chapterlinks = (params.chapterlinks !== 'false');
  this.tab.box.append(this.generateTable(params));
  this.update = update.bind(this);
}

function prepareChapterData(chapterData) {

  //first round: kill empty rows and build structured object
  var chapters = typeof chapterData === 'string'
    ? chapterData.split("\n").map(chapterFromString)
    : chapterData.map(transformChapter);

  // order is not guaranteed: http://podlove.org/simple-chapters/
  return chapters.sort(function (a, b) {
    return a.start - b.start;
  });
}

function transformChapter (chapter) {
  chapter.code = chapter.title;
  if (typeof chapter.start === 'string') {
    chapter.start = tc.getStartTimeCode(chapter.start);
  }
  return chapter;
}

function chapterFromString (chapter) {
  var line = $.trim(chapter);
  //exit early if this line contains nothing but whitespace
  if (line === '') {
    return {};
  }
  //extract the timestamp
  var parts = line.split(' ', 2);
  var tc = tc.getStartTimeCode(parts[0]);
  var title = $.trim(parts[1]);
  return { start: tc, code: title, title: title };
}

/**
 * update the chapter list when the data is loaded
 * @param {object} player
 */
function update (player) {
  //var coverImg = marks.closest('.podlovewebplayer_wrapper').find('.coverimg');
  $.each(this.chapters, function (i, chapter) {
    console.log('Chapters#update', chapter);
    var isBuffered,
      //chapterimg = null,
      //mark = $(this),
      startTime = chapter.start,
      endTime = chapter.end,
      //isEnabled = mark.data('enabled'),
      isActive = player.currentTime > startTime - 0.3 && player.currentTime <= endTime;
    // prevent timing errors
    if (player.buffered.length > 0) {
      isBuffered = player.buffered.end(0) > startTime;
    }
    if (isActive) {
      /*
      chapterimg = url.validate(mark.data('img'));
      if ((chapterimg !== null) && (mark.hasClass('active'))) {
        if ((coverImg.attr('src') !== chapterimg) && (chapterimg.length > 5)) {
          coverImg.attr('src', chapterimg);
        }
      } else {
        if (coverImg.attr('src') !== coverImg.data('img')) {
          coverImg.attr('src', coverImg.data('img'));
        }
      }
      */
      chapter.element.addClass('active').siblings().removeClass('active');
    }
    /*
    if (!isEnabled && isBuffered) {
      $(mark).data('enabled', true).addClass('loaded').find('a[rel=player]').removeClass('disabled');
    }
    */
  });
}

/*
Chapters.prototype.update = function () {
  return update.bind(this);
};
*/

/**
 * Given a list of chapters, this function creates the chapter table for the player.
 * @returns {jQuery|HTMLDivElement}
 */
Chapters.prototype.generateTable = function () {
  var table, tbody, maxchapterstart, forceHours;

  table = renderChapterTable();
  tbody = table.children('tbody');

  if (this.chapterlinks !== 'false') {
    table.addClass('linked linked_' + this.chapterlinks);
  }

  //second round: collect more information
  maxchapterstart = getMaxChapterStart(this.chapters, this.duration);

  //third round: build actual dom table
  forceHours = (maxchapterstart >= 3600);

  function buildChapter(i) {
    var duration = Math.round(this.end - this.start),
      row;
    //make sure the duration for all chapters are equally formatted
    this.duration = tc.generate([duration], false);

    //if there is a chapter that starts after an hour, force '00:' on all previous chapters
    //insert the chapter data
    this.startTime = tc.generate([Math.round(this.start)], true, forceHours);

    row = renderRow(this);
    if (i % 2) {
      row.addClass('oddchapter');
    }
    row.appendTo(tbody);
    this.element = row;
  }

  $.each(this.chapters, buildChapter);
  return table;
};

/**
 *
 * @param {Array} chapters
 * @param {number} duration
 * @returns {number}
 */
function getMaxChapterStart(chapters, duration) {
  var mappedChapters = $.map(chapters, function (chapter, i) {
    var next = chapters[i + 1];
    // we use `this.end` to quickly calculate the duration in the next round
    chapter.end = next ? next.start : duration;
    // we need this data for proper formatting
    return chapter.start;
  });
  return Math.max.apply(Math, mappedChapters);
}

/**
 *
 * @param {object} chapter
 * @returns {jQuery|HTMLElement}
 */
function renderRow (chapter) {
  //console.log('chapter to render row from ', chapter);
  return render('<tr class="chaptertr">' +
    '<td class="starttime"><span>' + chapter.startTime + '</span></td>' +
    '<td class="chapterimage">' + renderChapterImage(chapter.image) + '</td>' +
    '<td class="chaptername"><span>' + chapter.code + '</span> ' +
      renderExternalLink(chapter.href) + '</td>' +
    '<td class="timecode"><span>' + chapter.duration + '</span></td>' +
    '</tr>');
}

function renderExternalLink(href) {
  if (!href || href === "") {
    return '';
  }
  return '<a class="pwp-icon-link-ext" target="_blank" href="' + href + '"></a>';
}

function renderChapterImage(imageSrc) {
  if (!imageSrc || imageSrc === "") {
    return '';
  }
  return '<img src="' + imageSrc + '"/>';
}

function render(html) {
  return $(html);
}

/**
 * render HTMLTableElement for chapters
 * @returns {jQuery|HTMLElement}
 */
function renderChapterTable() {
  return $('<table class="podlovewebplayer_chapters"><caption>Podcast Chapters</caption>' +
    '<thead><tr>' +
      '<th scope="col">Chapter Number</th>' +
      '<th scope="col">Start time</th>' +
      '<th scope="col">Title</th>' +
      '<th scope="col">Duration</th>' +
    '</tr></thead>' +
    '<tbody></tbody>' +
    '</table>');
}

/**
 *
 * @param {object} chapter
 * @returns {function} clickhandler
 */
Chapters.prototype.getChapterClickHandler = function(chapter) {
  var player = this.player;
  return function (e) {
    e.preventDefault();
    // Basic Chapter Mark function (without deeplinking)
    player.setCurrentTime(chapter.start);
    // flash fallback needs additional pause
    if (player.pluginType === 'flash') {
      player.pause();
    }
    player.play();
    return false;
  };
};

/**
 *
 * @param {mejs.HtmlMediaElement} player
 */
Chapters.prototype.addEventhandlers = function (player) {
  //console.log('Chapters#addEventHandler: Player:', player);
  var addClickHandler = function() {
    var chapterStart = this.start;
    this.element.on('click', function (e) {
      //console.log(e.target.className);
      if (e.target.className === 'pwp-icon-link-ext') {
        return true;
      }
      //console.log('chapter#clickHandler: start chapter at', chapterStart);
      e.preventDefault();
      // Basic Chapter Mark function (without deeplinking)
      player.setCurrentTime(chapterStart);
      // flash fallback needs additional pause
      if (player.pluginType === 'flash') {
        player.pause();
      }
      player.play();
      return false;
    });
  };

  $.each(this.chapters, addClickHandler);
};
