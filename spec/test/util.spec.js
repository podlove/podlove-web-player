'use strict';

describe('Module: util', function () {

  describe('Method: cap', function () {
    var cap;

    beforeEach(function () {
      cap = require('../../src/js/util').cap;
    });

    it('with value inside boundaries returns value', function () {
      var result = cap(1,0,10);
      expect(result).toBe(1);
    });

    it('with value equal to lower boundary returns value', function () {
      var result = cap(0,0,10);
      expect(result).toBe(0);
    });

    it('with value equal to upper boundary returns value', function () {
      var result = cap(10,0,10);
      expect(result).toBe(10);
    });

    it('with value less than lower boundary returns lower boundary', function () {
      var result = cap(-1,0,10);
      expect(result).toBe(0);
    });

    it('with value greater than upper boundary returns upper boundary', function () {
      var result = cap(11,0,10);
      expect(result).toBe(10);
    });

  });

});
