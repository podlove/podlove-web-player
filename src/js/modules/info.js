var Tab = require('../tab');

function Info(params) {
  this.tab = createInfoTab(params);
}

/**
 *
 * @param {object} params
 * @returns {null|Tab} infoTab
 */
function createInfoTab(params) {
  if (!params.summary) {
    return null;
  }
  var infoTab = new Tab({
    icon:"pwp-icon-info-circle",
    title:"More information about this",
    headline: 'Info',
    name:'info',
    active: !!params.summaryVisible
  });

  infoTab.createSection(
      '<section><h2>'
      + params.title
      + '</h2><p>Veröffentlicht: ' + params.publicationDate + '</p><h4>'
      + params.subtitle
      + '</h4><p>'
      + params.summary
      + '</p><p>Dauer: '
      + params.duration
      + '</p><p>Weblink dieser Episode:<br><a href="'
      + params.permalink
      + '">'
      + params.permalink
      + '</a></p></section>');

  infoTab.createAside(
    '<h2>'
    + params.show.title
    + '</h2><div class="coverart"><img class="coverimg" src="'
    + params.poster
    + '" data-img="'
    + params.poster
    + '" alt="Poster Image"></div><form><input type="submit" value="'
    + params.show.title
    + ' abonnieren" aria-label="'
    + params.show.title
    + 'abonnieren"></form><p>'
    + params.show.subtitle
    + '</p><p>Weblink dieser Show: <br><a href="'
    + params.show.url
    + '">'
    + params.show.url
    + '</a></p>');

  infoTab.createFooter(
      '<p>The show "'
    + params.show.title
    + '" is licenced under<br><a href="'
    + params.license.url
    + '">'
    + params.license.name
    + '</a></p>');

  return infoTab;
}

module.exports = Info;
