/**
 * Saving the playtime
 */
var prefix = 'podlove-web-player-playtime-';

module.exports = {
    getItem: function (permalink) {
      return +localStorage[prefix+permalink];
    },
    setItem: function (permalink, value) {
      return localStorage[prefix+permalink] = value;
    },
    removeItem: function (permalink) {
      return localStorage.removeItem(prefix+permalink);
    },
    hasItem: function (permalink) {
      return (prefix+permalink) in localStorage;
    }
};

