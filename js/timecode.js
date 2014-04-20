/**
 * Timecode as described in http://podlove.org/deep-link/
 *  and http://www.w3.org/TR/media-frags/#fragment-dimensions
 */
var timecodeRegExp = /(?:(\d+):)?(\d+):(\d+)(\.\d+)?([,\-](?:(\d+):)?(\d+):(\d+)(\.\d+)?)?/;

/**
 * return number as string lefthand filled with zeros
 * @param number number
 * @param width number
 * @return string
 **/
var zeroFill = function (number, width) {
  var s = number.toString();
  while (s.length < width) {
    s = "0" + s;
  }
  return s;
};

/**
 * convert an array of string to timecode
 * @param {Array} parts
 * @returns {number}
 */
function extractTime(parts) {
  var time = 0;
  // hours
  time += parts[1] ? parseInt(parts[1], 10) * 60 * 60 : 0;
  // minutes
  time += parseInt(parts[2], 10) * 60;
  // seconds
  time += parseInt(parts[3], 10);
  // milliseconds
  time += parts[4] ? parseFloat(parts[4]) : 0;
  // no negative time
  time = Math.max(time, 0);
  return time;
}


module.exports = {

  /**
   * accepts array with start and end time in seconds
   * returns timecode in deep-linking format
   * @param {Array} times
   * @param {Boolean} leadingZeros
   * @param {Boolean} forceHours (optional)
   * @return {string}
   **/
  generate: function (times, leadingZeros, forceHours) {
    function generatePart(time) {
      var part,
        hours,
        minutes,
        seconds,
        milliseconds;

      // prevent negative values from player
      if (!time || time <= 0) {
        return (leadingZeros || !time) ? (forceHours ? '00:00:00' : '00:00') : '--';
      }
      hours = Math.floor(time / 60 / 60);
      minutes = Math.floor(time / 60) % 60;
      seconds = Math.floor(time % 60) % 60;
      milliseconds = Math.floor(time % 1 * 1000);
      if (leadingZeros) {
        // required (minutes : seconds)
        part = zeroFill(minutes, 2) + ':' + zeroFill(seconds, 2);
        hours = zeroFill(hours, 2);
        hours = hours === '00' && !forceHours ? '' : hours + ':';
      } else {
        part = hours ? zeroFill(minutes, 2) : minutes.toString();
        part += ':' + zeroFill(seconds, 2);
        hours = hours ? hours + ':' : '';
      }
      milliseconds = milliseconds ? '.' + zeroFill(milliseconds, 3) : '';
      return hours + part + milliseconds;
    }

    if (times[1] > 0 && times[1] < 9999999 && times[0] < times[1]) {
      return generatePart(times[0]) + ',' + generatePart(times[1]);
    }
    return generatePart(times[0]);
  },


  /**
   * parses time code into seconds
   * @param {String} timecode
   * @return {Array}
   **/
  parse: function (timecode) {
    var parts, startTime, endTime;
    if (!timecode) {
      return [false, false];
    }

    parts = timecode.match(timecodeRegExp);
    if (!parts || parts.length < 10) {
      return [false, false];
    }
    startTime = extractTime(parts);

    // if there only a startTime but no endTime
    if (parts[5] === undefined) {
      return [startTime, false];
    }

    endTime = extractTime(parts.splice(6));

    return (endTime > startTime) ? [startTime, endTime] : [startTime, false];
  },

  getStartTimeCode: function getStartTimecode(start) {
      return this.parse(start)[0];
  }
};
