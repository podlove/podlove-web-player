require('../../bower_components/jquery.i18n/src/jquery.i18n.js');
require('../../bower_components/jquery.i18n/src/jquery.i18n.messagestore.js');
/**
 * Load all the string translations (en + de)
 */
function loadTranslations() {
  // define translations
  $.i18n({locale:'de'}).load({
    'de': '/i18n/de.json'
  });
  //-> possibility of manually overriding the language, en is fallback
}

module.exports = loadTranslations;
