'use strict';

describe('Module: timeline', function () {
  var timeline, options, mockPlayer;

  beforeEach(function () {
    var Timeline = require('../../src/js/timeline');
    mockPlayer = require('../mock/player.mock.js');
    options = {
      duration: 100,
      chapters: []
    };
    timeline = new Timeline(mockPlayer, options);
  });

  describe('Method: playRange()', function () {
    describe('with start time only', function () {

      beforeEach(function () {
        timeline.playRange([10, false]);
      });

      it('sets the correct start time', function () {
        expect(timeline.currentTime).toBe(10);
      });

      it('stops at the end of the timeline', function () {
        expect(timeline.endTime).toBe(100);
      });

    });
    describe('with wrong parameters', function () {

      it('negative start time', function () {
        timeline.playRange([-10, false]);
        expect(timeline.currentTime).toBe(-1);
      });

      it('only end time', function () {
        timeline.playRange([false, 100]);
        expect(timeline.currentTime).toBe(-1);
        expect(timeline.endTime).toBe(100);
      });

      it('end time after end of timeline ', function () {
        timeline.playRange([1, 101]);
        expect(timeline.currentTime).toBe(1);
        expect(timeline.endTime).toBe(100);
      });

    });

    describe('with start and end time', function () {

      beforeEach(function () {
        timeline.playRange([10, 20]);
      });

      it('sets the correct start time', function () {
        expect(timeline.currentTime).toBe(10);
      });

      it('stops at the end time', function () {
        expect(timeline.endTime).toBe(20);
      });

    });
  });
});