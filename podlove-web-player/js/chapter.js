/**
 * chapter handling
 */
!function($){
  $.chapters = {};

  /**
   * update the chapter list when the data is loaded
   * @param {object} player
   * @param {object} marks
   **/
  $.chapters.update = function (player, marks) {
    var coverImg = marks.closest('.podlovewebplayer_wrapper').find('.coverimg');
    marks.each(function () {
      var isBuffered, chapterimg = null,
        mark = $(this),
        startTime = mark.data('start'),
        endTime = mark.data('end'),
        isEnabled = mark.data('enabled'),
        isActive = player.currentTime > startTime - 0.3 && player.currentTime <= endTime;
      // prevent timing errors
      if (player.buffered.length > 0) {
        isBuffered = player.buffered.end(0) > startTime;
      }
      if (isActive) {
        chapterimg = $.url.validate(mark.data('img'));
        if ((chapterimg !== null) && (mark.hasClass('active'))) {
          if ((coverImg.attr('src') !== chapterimg) && (chapterimg.length > 5)) {
            coverImg.attr('src', chapterimg);
          }
        } else {
          if (coverImg.attr('src') !== coverImg.data('img')) {
            coverImg.attr('src', coverImg.data('img'));
          }
        }
        mark.addClass('active').siblings().removeClass('active');
      }
      if (!isEnabled && isBuffered) {
        $(mark).data('enabled', true).addClass('loaded').find('a[rel=player]').removeClass('disabled');
      }
    });
  };

  /**
   * Given a list of chapters, this function creates the chapter table for the player.
   * @param {object} params
   * @returns {HTMLDivElement}
   */
  $.chapters.generateTable = function (params) {
    var div, table, tbody, tempchapters, maxchapterstart, forceHours, line, tc, chaptitle, next, chapterImages, rowDummy, i, scroll = '';
    if (params.chapterHeight !== "") {
      if (typeof parseInt(params.chapterHeight, 10) === 'number') {
        scroll = 'style="overflow-y: auto; max-height: ' + parseInt(params.chapterHeight, 10) + 'px;"';
      }
    }
    div = $('<div class="podlovewebplayer_chapterbox showonplay" ' + scroll + '><table><caption>Podcast Chapters</caption><thead><tr><th scope="col">Chapter Number</th><th scope="col">Start time</th><th scope="col">Title</th><th scope="col">Duration</th></tr></thead><tbody></tbody></table></div>');
    if ((params.chaptersVisible === 'true') || (params.chaptersVisible === true)) {
      div.addClass('active');
    }

    table = div.children('table');
    table.addClass('podlovewebplayer_chapters');
    if (params.chapterlinks !== 'false') {
      table.addClass('linked linked_' + params.chapterlinks);
    }

    tbody = table.children('tbody');

    //prepare row data
    tempchapters = prepareRowData(params.chapters);

    //second round: collect more information
    maxchapterstart = getMaxChapterStart(tempchapters, next);

    //this is a "template" for each chapter row
    chapterImages = tempchapters.reduce(function (result, next) {
      if (next.image !== "" && next.image !== undefined) {
        chapterImages = true;
      }
      return (result || next);
    }, false);

    rowDummy = getDummyRow(chapterImages);

    //third round: build actual dom table
    forceHours = (maxchapterstart >= 3600);
    $.each(tempchapters, buildChapter);

    function buildChapter(i) {
      var finalchapter = !tempchapters[i + 1],
        duration = Math.round(this.end - this.start),
        row = rowDummy.clone();
      //make sure the duration for all chapters are equally formatted
      if (!finalchapter) {
        this.duration = pwp.tc.generate([duration], false);
      } else {
        if (params.duration === 0) {
          this.end = 9999999999;
          this.duration = '…';
        } else {
          this.end = params.duration;
          this.duration = pwp.tc.generate([Math.round(this.end - this.start)], false);
        }
      }
      if (i % 2) {
        row.addClass('oddchapter');
      }
      //deeplink, start and end
      row.attr({
        'data-start': this.start,
        'data-end': this.end,
        'data-img': (this.image !== undefined) ? this.image : ''
      });
      //if there is a chapter that starts after an hour, force '00:' on all previous chapters
      //insert the chapter data
      row.find('.starttime > span').text(pwp.tc.generate([Math.round(this.start)], true, forceHours));

      var timeSpan = '<span>' + this.code + '</span>';
      if (this.href !== undefined && this.href !== "") {
        timeSpan += ' <a href="' + this.href + '"></a>';
      }
      row.find('.chaptername').html(timeSpan);

      row.find('.timecode > span').html('<span>' + this.duration + '</span>');

      if (chapterImages && this.image !== undefined && this.image !== "") {
        row.find('.chapterimage').html('<img src="' + this.image + '"/>');
      }
      row.appendTo(tbody);
    }

    return div;
  };

  function getMaxChapterStart(tempchapters, next) {
    return Math.max.apply(Math,
      $.map(tempchapters, function (value, i) {
        next = tempchapters[i + 1];
        // we use `this.end` to quickly calculate the duration in the next round
        if (next) {
          value.end = next.start;
        }
        // we need this data for proper formatting
        return value.start;
      }));
  }

  function getDummyRow (withImage) {
    var rowStart = '<tr class="chaptertr" data-start="" data-end="" data-img=""><td class="starttime"><span></span></td>';
    var rowEnd = '<td class="chaptername"></td><td class="timecode">\n<span></span>\n</td>\n</tr>';
    var chapterImage = '<td class="chapterimage"></td>';
    var template = rowStart + (withImage ? chapterImage : '') + rowEnd;
    return $(template);
  }

  function prepareRowData(chapterData) {
    function chapterFromString (chapter) {
      var line = $.trim(chapter);
      //exit early if this line contains nothing but whitespace
      if (line === '') {
        return {};
      }
      //extract the timestamp
      var parts = line.split(' ', 2);
      var tc = getStartTimecode(parts[0]);
      var chaptitle = $.trim(parts[1]);
      return { start: tc, code: chaptitle };
    }
    function transformChapter (chapter) {
      chapter.code = chapter.title;
      if (typeof chapter.start === 'string') {
        chapter.start = getStartTimecode(chapter.start);
      }
      return chapter;
    }
    function getStartTimecode(start) {
      return pwp.tc.parse(start)[0];
    }
    var chapters;

    //first round: kill empty rows and build structured object
    if (typeof chapterData === 'string') {
      chapters = chapterData.split("\n").map(chapterFromString);
    } else {
      // assume array of objects
      chapters = chapterData.map(transformChapter);
    }
    // order is not guaranteed: http://podlove.org/simple-chapters/
    return chapters.sort(function (a, b) {
      return a.start - b.start;
    });
  }

}(jQuery);

