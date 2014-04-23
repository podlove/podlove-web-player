/**
 * @type {Tab}
 */
var Tab = require('./tab');
/**
 * @type {Chapters}
 */
var Chapters = require('./modules/chapter');

/**
 * instantiate new controls element
 * @params {jQuery|HTMLElement} player
 * @constructor
 */
function Controls (player) {
  this.player = player;
  this.box = createBox();
  this.timeControlElement = createTimeControls();
  this.box.append(this.timeControlElement);
}
module.exports = Controls;

/**
 *
 * @param {Chapters} chapterModule
 */
Controls.prototype.createTimeControls = function (chapterModule) {
  var hasChapters = (chapterModule instanceof Chapters);
  if (!hasChapters) {
    console.info('Controls#createTimeControls: no chapterTab found');
  }
  if (hasChapters) {
    this.createButton("pwp-icon-to-start", "Jump backward to previous chapter", function () {
      var activeChapter = chapterModule.getActiveChapter();
      if (this.player.currentTime > activeChapter.start + 10) {
        console.log('back to chapter', chapterModule.currentChapter, 'start', this.player.currentTime);
        return chapterModule.playCurrentChapter();
      }
      console.log('back to previous chapter', chapterModule.currentChapter);
      return chapterModule.previous();
    });
  }

  this.createButton("pwp-icon-fast-bw", "Rewind 30 seconds", function () {
    console.log('Controls >> rewind before', this.player.currentTime);
    this.player.setCurrentTime(this.player.currentTime - 30);
    console.log('Controls >> rewind after', this.player.currentTime);
  });

  this.createButton("pwp-icon-fast-fw", "Fast forward 30 seconds", function () {
    console.log('Controls >> ffwd before', this.player.currentTime);
    this.player.setCurrentTime(this.player.currentTime + 30);
    console.log('Controls >> ffwd after', this.player.currentTime);
  });

  if (hasChapters) {
    this.createButton("pwp-icon-to-end", "Jump to next chapter", function () {
      console.log('Controls >> next Chapter before', this.player.currentTime);
      chapterModule.next();
      console.log('Controls >> next Chapter after', this.player.currentTime);
    });
  }
};

Controls.prototype.createButton = function createButton(icon, title, callback) {
  var button = $('<a href="#" class="button button-control ' + icon + '" title="' + title + '"></a>');
  this.timeControlElement.append(button);
  var combinedCallback = getCombinedCallback(callback);
  button.on('click', combinedCallback.bind(this));
};

function getCombinedCallback(callback) {
  return function (evt) {
    console.log('controlbutton clicked', evt);
    evt.preventDefault();
    console.log('Player start', playerStarted(this.player));
    if (!playerStarted(this.player)) {
      this.player.play();
    }
    (callback.bind(this))();
  };
}

function createTimeControls() {
  return $('<div class="timecontrolbar"></div>');
}

function createBox() {
  return $('<div class="controlbar"></div>');
}

function playerStarted(player) {
  return ((typeof player.currentTime === 'number') && (player.currentTime > 0));
}
