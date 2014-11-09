'use strict';

describe('Module: url', function () {
  var url;

  beforeEach(function () {
    url = require('../../src/js/url');
  });

  afterEach(function () {
    window.location.hash = ''
  });

  it('exists', function () {
    expect(url).toEqual(jasmine.any(Object));
  });

  it('exposes method checkCurrent', function () {
    expect(url.checkCurrent).toEqual(jasmine.any(Function));
  });

  it('exposes method validate', function () {
    expect(url.validate).toEqual(jasmine.any(Function));
  });

  it('exposes method getFragment', function () {
    expect(url.getFragment).toEqual(jasmine.any(Function));
  });

  it('exposes method setFragment', function () {
    expect(url.setFragment).toEqual(jasmine.any(Function));
  });

  describe('Method: getFragment', function () {

    beforeEach(function () {
      window.location.hash = '#boolean&number=1234&text=asdf&encoded=pod%3c3'
    });

    it('without argument returns false', function () {
      expect(url.getFragment()).toBe(false);
    });

    it('with an empty string returns false', function () {
      expect(url.getFragment('')).toBe(false);
    });

    it('with a key that is not set returns false', function () {
      expect(url.getFragment('notset')).toBe(false);
    });

    it('with a key that is set but has no value returns true', function () {
      expect(url.getFragment('boolean')).toBe(true);
    });

    it('with a key that is set and has a numeric value returns a that value as a string', function () {
      expect(url.getFragment('number')).toBe('1234');
    });

    it('with a key that is set and has a string value returns that string', function () {
      expect(url.getFragment('text')).toBe('asdf');
    });

    it('with a key that is set and has an encoded string returns the decoded string', function () {
      expect(url.getFragment('encoded')).toBe('pod<3');
    });
  });

  describe('Method: checkCurrent', function () {

    var timecode;

    beforeEach(function () {
      timecode = require('../../src/js/timecode');
      spyOn(timecode, 'parse').andCallThrough();
      window.location.hash = '#t=0:00-1:23:45.678';
    });

    it('calls timecode.parse', function () {
      url.checkCurrent();
      expect(timecode.parse).toHaveBeenCalled();
    });

    it('returns the correct start time', function () {
      expect(url.checkCurrent()).toEqual([0, 5025.678]);
    });

  });

});
