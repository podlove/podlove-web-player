'use strict';

describe('Module: url', function () {
  var tc;

  beforeEach(function () {
    tc = require('../../src/js/timecode');
  });

  describe('Method: parse()', function () {
    function testParse(timecode, expected) {
      expect(tc.parse(timecode)).toEqual(expected);
    }

    it('returns the correct start time', function () {
      testParse('1:23.456', [83.456, false]);
    });

    it('returns the correct start time with hours', function () {
      testParse('1:01:23.456', [3683.456, false]);
    });

    it('returns the correct start and end time', function () {
      testParse('0:00.000-1:23.456', [0, 83.456]);
    });

    it('returns the correct start time and end time with hours', function () {
      testParse('0:00.000-1:01:23.456', [0, 3683.456]);
    });

    it('returns the correct start time for t=0', function () {
      testParse('0:00', [0, false]);
    });

  });
});