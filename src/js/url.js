var tc = require('./timecode');

/*
  "t=1"	[("t", "1")]	simple case
  "t=1&t=2"	[("t", "1"), ("t", "2")]	repeated name
  "a=b=c"	[("a", "b=c")]	"=" in value
  "a&b=c"	[("a", ""), ("b", "c")]	missing value
  "%74=%6ept%3A%310"	[("t", "npt:10")]	unnecssary percent-encoding
  "id=%xy&t=1"	[("t", "1")]	invalid percent-encoding
  "id=%E4r&t=1"	[("t", "1")]	invalid UTF-8
 */

/**
 *
 * @param {string} key
 * @returns {string|boolean}
 */
function getFragment(key) {
  var query = window.location.hash.substring(1),
    pairs = query.split("&");

  if (query.indexOf(key) === -1) {
    return false;
  }

  for (var i = 0, l = pairs.length; i < l; i++) {
    var pair = pairs[i].split("=");
    if (pair[0] !== key) {
      continue;
    }
    if (pair.length === 1) {
      return true;
    }
    return decodeURIComponent(pair[1]);
  }
  return false;
}

/**
 * url handling
 */
module.exports = {

  getFragment: getFragment,

  checkCurrent: function () {
    var t = getFragment('t');
    return tc.parse(t);
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
