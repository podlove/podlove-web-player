var tc = require('./timecode');

/**
 * url handling
 */
module.exports = {

  checkCurrent: function () {
    return tc.parse(window.location.href);
  },

  validate: function (url) {
    // uncomment next three lines to validate URLs, if you want use relative paths leave it so.
    //var urlregex = /(^|\s)((https?:\/\/)?[\w\-]+(\.[\w\-]+)+\.?(:\d+)?(\/\S*)?)/gi;
    //url = url.match(urlregex);
    //return (url !== null) ? url[0] : url;
    return url.trim();
  },

  /**
   * add a string as hash in the adressbar
   * @param {string} fragment
   **/
  setFragment: function (fragment) {
    console.debug('setting url fragment', fragment);
    window.location.hash = '#' + fragment;
  }
};
