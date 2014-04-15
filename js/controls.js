

function Controls () {
  this.box = createBox();
}

module.exports = Controls;

Controls.prototype.createTimeControls = function (player, chapterBox) {
  this.timeControlElement = createTimeControls();
  this.box.append(this.timeControlElement);

  this.createButton("pwp-icon-to-start", "Jump backward to previous chapter", function (evt) {
    evt.preventDefault();
    if (playerStarted(player)) {
      var activeChapter = chapterBox.find('.active');
      if (player.currentTime > activeChapter.data('start') + 10) {
        return player.setCurrentTime(activeChapter.data('start'));
      }
      return player.setCurrentTime(activeChapter.prev().data('start'));
    }
    return player.play();
  });

  this.createButton("pwp-icon-to-end", "Jump to next chapter", function (evt) {
    evt.preventDefault();
    if (playerStarted(player)) {
      player.setCurrentTime(chapterBox.find('.active').next().data('start'));
    }
    return player.play();
  });

  this.createButton("pwp-icon-fast-bw", "Rewind 30 seconds", function (evt) {
    evt.preventDefault();
    if (playerStarted(player)) {
      return player.setCurrentTime(player.currentTime - 30);
    }
    return player.play();
  });

  this.createButton("pwp-icon-fast-fw", "Fast forward 30 seconds", function (evt) {
    evt.preventDefault();
    if (playerStarted(player)) {
      return player.setCurrentTime(player.currentTime + 30);
    }
    return player.play();
  });

};

Controls.prototype.createButton = function createButton(icon, title, callback) {
  var button = $('<a href="#" class="controlbutton ' + icon + '" title="' + title + '"></a>');
  this.timeControlElement.append(button);
  $('.podlovewebplayer_timecontrol .' + icon).on('click', callback);
};

function createTimeControls() {
  return $('<div class="podlovewebplayer_timecontrol"></div>');
}

function createBox() {
  return $('<div class="controlbox"></div>');
}

function playerStarted(player) {
  return ((typeof player.currentTime === 'number') && (player.currentTime > 0));
}
