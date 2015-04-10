'use strict';

var tc = require('../timecode')
  , url = require('../url')
  , Tab = require('../tab')
  , Timeline = require('../timeline');

var ACTIVE_CHAPTER_THRESHHOLD = 0.1;

function transformChapter(chapter) {
  chapter.code = chapter.title;
  if (typeof chapter.start === 'string') {
    chapter.start = tc.getStartTimeCode(chapter.start);
  }
  return chapter;
}

/**
 * add `end` property to each simple chapter,
 * needed for proper formatting
 * @param {number} duration
 * @returns {function}
 */
function addEndTime(duration) {
  return function (chapter, i, chapters) {
    var next = chapters[i + 1];
    chapter.end = next ? next.start : duration;
    console.log('duration', duration, chapter.end);
    return chapter;
  };
}

function render(html) {
  return $(html);
}

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
  return render(
    '<tr class="chapter">' +
      '<td class="chapter-number"><span class="badge">' + (index + 1) + '</span></td>' +
      '<td class="chapter-name"><span>' + chapter.code + '</span></td>' +
      '<td class="chapter-duration"><span>' + chapter.duration + '</span></td>' +
    '</tr>'
  );
}

/**
 *
 * @param {Array} chapters
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
  var activeChapter = this.getActiveChapter()
    , currentTime = timeline.getTime();

  console.debug('Chapters', 'update', this, activeChapter, currentTime);
  if (isActiveChapter(activeChapter, currentTime)) {
    console.log('Chapters', 'update', 'already set', this.currentChapter);
    return;
  }
  function markChapter (chapter, i) {
    var isActive = isActiveChapter(chapter, currentTime);
    if (isActive) {
      this.setCurrentChapter(i);
    }
  }
  this.chapters.forEach(markChapter, this);
}

/**
 * chapter handling
 * @params {Timeline} params
 * @return {Chapters} chapter module
 */
function Chapters (timeline, params) {

  if (!timeline || !timeline.hasChapters) {
    return null;
  }
  if (timeline.duration === 0) {
    console.warn('Chapters', 'constructor', 'Zero length media?', timeline);
  }

  this.timeline = timeline;
  this.duration = timeline.duration;
  this.chapterlinks = !!timeline.chapterlinks;
  this.currentChapter = 0;
  this.chapters = this.parseSimpleChapter(params);
  this.data = this.chapters;

  this.tab = new Tab({
    icon: 'pwp-chapters',
    title: 'Show/hide chapters',
    headline: 'Chapters',
    name: 'podlovewebplayer_chapterbox'
  });

  this.tab
    .createMainContent('')
    .append(this.generateTable());

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

  maxchapterstart = getMaxChapterStart(this.chapters);
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
Chapters.prototype.addEventhandlers = function () {
  var player = this.timeline.player;
  function onClick(e) {
    // enable external links to be opened in a new tab or window
    // cancels event to bubble up
    if (e.target.className === 'pwp-outgoing button button-toggle') {
      return true;
    }
    //console.log('chapter#clickHandler: start chapter at', chapterStart);
    e.preventDefault();
    // Basic Chapter Mark function (without deeplinking)
    console.log('Chapter', 'clickHandler', 'setCurrentChapter to', e.data.index);
    e.data.module.setCurrentChapter(e.data.index);
    // flash fallback needs additional pause
    if (player.pluginType === 'flash') {
      player.pause();
    }
    e.data.module.playCurrentChapter();
    return false;
  }

  function addClickHandler (chapter, index) {
    chapter.element.on('click', {module: this, index: index}, onClick);
  }

  this.chapters.forEach(addClickHandler, this);
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
    next = this.setCurrentChapter(current + 1);
  if (current === next) {
    console.log('Chapters', 'next', 'already in last chapter');
    return current;
  }
  console.log('Chapters', 'next', 'chapter', this.currentChapter);
  this.playCurrentChapter();
  return next;
};

Chapters.prototype.previous = function () {
  var current = this.currentChapter,
    previous = this.setCurrentChapter(current - 1);
  if (current === previous) {
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

Chapters.prototype.parseSimpleChapter = function (params) {
  var chapters = params.chapters;
  if (!chapters) {
    return [];
  }

  return chapters
    .map(transformChapter)
    .map(addEndTime(this.duration))
    .sort(function (a, b) { // order is not guaranteed: http://podlove.org/simple-chapters/
      return a.start - b.start;
    });
};

module.exports = Chapters;
