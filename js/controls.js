/**
 * @type {Tab}
 */
var Tab = require('./tab');

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
 * @param {Tab} chapterTab
 */
Controls.prototype.createTimeControls = function (chapterTab) {
  if (!chapterTab) {
    console.info('Controls#createTimeControls: no chapterTab found');
  }
  var chapterBox = chapterTab instanceof Tab ? chapterTab.box : null;
  if (chapterBox) {
    this.createButton("pwp-icon-to-start", "Jump backward to previous chapter", function () {
      var activeChapter = chapterBox.find('.active');
      var newTime = (this.player.currentTime > activeChapter.data('start') + 10)
        ? activeChapter.data('start')
        : activeChapter.prev().data('start');
      this.player.setCurrentTime(newTime);
    });
  }

  this.createButton("pwp-icon-fast-bw", "Rewind 30 seconds", function () {
    this.player.setCurrentTime(this.player.currentTime - 30);
  });

  this.createButton("pwp-icon-fast-fw", "Fast forward 30 seconds", function () {
    this.player.setCurrentTime(this.player.currentTime + 30);
  });

  if (chapterBox) {
    this.createButton("pwp-icon-to-end", "Jump to next chapter", function () {
      this.player.setCurrentTime(chapterBox.find('.active').next().data('start'));
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
    console.log(evt);
    evt.preventDefault();
    if (playerStarted(this.player)) {
      callback.bind(this);
    }
    return this.player.play();
  };
}

function createTimeControls() {
  return $('<div class="timecontrolbar"></div>');
}

function createBox() {
  return $('<div class="controlbox"></div>');
}

function playerStarted(player) {
  return ((typeof player.currentTime === 'number') && (player.currentTime > 0));
}
