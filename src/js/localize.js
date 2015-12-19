'use strict';

require('../../bower_components/jquery.i18n/src/jquery.i18n.js');
require('../../bower_components/jquery.i18n/src/jquery.i18n.messagestore.js');
/**
 * Load all the string translations (en + de + eo)
 */
var locales = {
   'de': require('../i18n/de.json'),
   'en': require('../i18n/en.json'),
   'eo': require('../i18n/eo.json')
};

$.i18n({ locale: 'de' }).load(locales);

function setLocale (languageCode) {
  if (languageCode in locales) {
    $.i18n().locale = languageCode;
    return;
  }
  console.warn('localize', 'setLocale', 'Could not find translations for', languageCode);
}

module.exports = setLocale;
