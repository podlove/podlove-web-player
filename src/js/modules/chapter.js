var tc = require('../timecode')
  , url = require('../url')
  , Tab = require('../tab')
  , Timeline = require('../timeline')
  , ACTIVE_CHAPTER_THRESHHOLD = 0.1
  ;

/**
 * render HTMLTableElement for chapters
 * @returns {jQuery|HTMLElement}
 */
function renderChapterTable() {
  return render(
    '<table class="podlovewebplayer_chapters"><caption>Podcast Chapters</caption>' +
      '<thead>' +
        '<tr>' +
          '<th scope="col">Chapter Number</th>' +
          '<th scope="col">Start time</th>' +
          '<th scope="col">Title</th>' +
          '<th scope="col">Duration</th>' +
        '</tr>' +
      '</thead>' +
      '<tbody></tbody>' +
    '</table>'
  );
}

/**
 *
 * @param {object} chapter
 * @returns {jQuery|HTMLElement}
 */
function renderRow (chapter, index) {
  //console.log('chapter to render row from ', chapter);
  return render(
    '<tr class="chapter">' +
      '<td class="chapter-number"><span class="badge">' + (index+1) + '</span></td>' +
      '<td class="chapter-image">' + renderChapterImage(chapter.image) + '</td>' +
      '<td class="chapter-name"><span>' + chapter.code + '</span> ' +
      renderExternalLink(chapter.href) + '</td>' +
      '<td class="chapter-duration"><span>' + chapter.duration + '</span></td>' +
    '</tr>'
  );
}

function renderExternalLink(href) {
  if (!href || href === "") {
    return '';
  }
  return '<a class="pwp-outgoing button button-toggle" target="_blank" href="' + href + '"></a>';
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
 *
 * @param {Array} chapters
 * @param {number} duration
 * @returns {number}
 */
function getMaxChapterStart(chapters) {
  function getStartTime (chapter) {
    return chapter.start;
  }
  return Math.max.apply(Math, $.map(chapters, getStartTime));
}

/**
 *
 * @param {{end:{number}, start:{number}}} chapter
 * @param {number} currentTime
 * @returns {boolean}
 */
function isActiveChapter (chapter, currentTime) {
  if (!chapter) {
    return false;
  }
  return (currentTime > chapter.start - ACTIVE_CHAPTER_THRESHHOLD && currentTime <= chapter.end);
}

/**
 * update the chapter list when the data is loaded
 * @param {Timeline} timeline
 */
function update (timeline) {
  //var coverImg = marks.closest('.container').find('.coverimg');
  var chapters = this,
    chapter = this.getActiveChapter(),
    currentTime = timeline.getTime();

  console.debug('Chapters', 'update', chapters, chapter, currentTime);
  if (isActiveChapter(chapter, currentTime)) {
    console.log('Chapters', 'update', 'already set', this.currentChapter);
    return;
  }
  console.log('Chapters', 'update', 'set new', currentTime);
  $.each(this.chapters, function (i, chapter) {
    //console.log('Chapters#update', chapter);
    var isBuffered,
      //chapterimg = null,
      //mark = $(this),
      startTime = chapter.start,
      endTime = chapter.end,
      //isEnabled = mark.data('enabled'),
      isActive = isActiveChapter(chapter, currentTime);
    // prevent timing errors
    //if (player.buffered.length > 0) {
    //  isBuffered = player.buffered.end(0) > startTime;
    //}
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
      chapters.setCurrentChapter(i);
      console.log('Chapters', 'update', 'set current chapter to', chapters.currentChapter);
    }
    /*
    if (!isEnabled && isBuffered) {
      $(mark).data('enabled', true).addClass('loaded').find('a[rel=player]').removeClass('disabled');
    }
    */
  });
}

/**
 * chapter handling
 * @params {Timeline} params
 * @return {Chapters} chapter module
 */
function Chapters (timeline) {

  // FIXME
  this.timeline = timeline;
  if (timeline.duration === 0) {
    console.warn('Chapters', 'constructor', 'Zero length media?', timeline);
  }
  this.duration = timeline.duration;
  this.tab = new Tab({
    icon: "pwp-chapters",
    title: "Show/hide chapters",
    headline: 'Chapters',
    name: "podlovewebplayer_chapterbox showonplay" // FIXME clean way to add 2 classnames
  })
  ;

  //build chapter table
  this.chapters = timeline.getDataByType('chapter');
  this.currentChapter = -1;

  this.chapterlinks = (timeline.chapterlinks !== 'false');
  var main = this.tab.createMainContent('');
  main.append(this.generateTable());
  this.update = update.bind(this);
}

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

  maxchapterstart = getMaxChapterStart(this.chapters, this.duration);
  forceHours = (maxchapterstart >= 3600);

  function buildChapter(i) {
    var duration = Math.round(this.end - this.start),
      row;
    //make sure the duration for all chapters are equally formatted
    this.duration = tc.generate([duration], false);

    //if there is a chapter that starts after an hour, force '00:' on all previous chapters
    //insert the chapter data
    this.startTime = tc.generate([Math.round(this.start)], true, forceHours);

    row = renderRow(this, i);
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
 * @param {mejs.HtmlMediaElement} player
 */
Chapters.prototype.addEventhandlers = function (player) {
  //console.log('Chapters#addEventHandler: Player:', player);
  var chapters = this;

  function addClickHandler (index) {
    this.element.on('click', function (e) {
      // enable external links to be opened in a new tab or window
      // cancels event to bubble up
      if (e.target.className === 'pwp-outgoing button button-toggle') {
        return true;
      }
      //console.log('chapter#clickHandler: start chapter at', chapterStart);
      e.preventDefault();
      // Basic Chapter Mark function (without deeplinking)
      console.log('Chapter', 'clickHandler', 'setCurrentChapter to', index);
      chapters.setCurrentChapter(index);
      // flash fallback needs additional pause
      if (player.pluginType === 'flash') {
        player.pause();
      }
      chapters.playCurrentChapter();
      return false;
    });
  }

  $.each(this.chapters, addClickHandler);
};

Chapters.prototype.getActiveChapter = function () {
  var active = this.chapters[this.currentChapter];
  console.log('Chapters', 'getActiveChapter', active);
  return active;
};

/**
 *
 * @param {number} chapterIndex
 */
Chapters.prototype.setCurrentChapter = function (chapterIndex) {
  if (chapterIndex < this.chapters.length && chapterIndex >= 0) {
    this.currentChapter = chapterIndex;
  }
  this.markActiveChapter();
  console.log('Chapters', 'setCurrentChapter', 'to', this.currentChapter);
};

Chapters.prototype.markActiveChapter = function () {
  var activeChapter = this.getActiveChapter();
  $.each(this.chapters, function () {
    this.element.removeClass('active');
  });
  activeChapter.element.addClass('active');
};

Chapters.prototype.next = function () {
  var current = this.currentChapter,
    next = this.setCurrentChapter(current+1);
  if (current == next) {
    console.log('Chapters', 'next', 'already in last chapter');
    return current;
  }
  console.log('Chapters', 'next', 'chapter', this.currentChapter);
  this.playCurrentChapter();
  return this.next;
};

Chapters.prototype.previous = function () {
  var current = this.currentChapter,
    previous = this.setCurrentChapter(current-1);
  if (current == previous) {
    console.log('Chapters', 'previous', 'already in first chapter');
    this.playCurrentChapter();
    return current;
  }
  console.log('Chapters', 'previous', 'chapter', this.currentChapter);
  this.playCurrentChapter();
  return previous;
};

Chapters.prototype.playCurrentChapter = function () {
  var start = this.getActiveChapter().start;
  console.log('Chapters', '#playCurrentChapter', 'start', start);
  var time = this.timeline.setTime(start);
  console.log('Chapters', '#playCurrentChapter', 'currentTime', time);
};

module.exports = Chapters;
