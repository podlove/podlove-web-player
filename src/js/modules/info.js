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

  var date = new Date(params.publicationDate);

  infoTab.createSection(
    '<h2>' + params.title + '</h2>'
    +'<p>Veröffentlicht: ' + date.getDate() + '.' + date.getMonth() + '.' + date.getFullYear() + '</p>'
    +'<em>' + params.subtitle + '</em>'
    +'<p>' + params.summary + '</p>'
    +'<p>Dauer: ' + params.duration + '</p>'
    +'<p>Weblink dieser Episode:<br>'
      +'<a href="' + params.permalink + '">' + params.permalink + '</a>'
    +'</p>');

  infoTab.createAside(
    '<h2>'+ params.show.title+ '</h2>'
    +'<div class="image-container"><img class="" src="' + params.poster + '" data-img="' + params.poster + '" alt="Poster Image"></div>'
      +'<button class="button-subscribe">'
        +'<span class="showtitle-label">' + params.show.title + '</span>'
        +'<span class="submit-label">Abonnieren</span>'
      +'</button>'
    +'<p>'+ params.show.subtitle + '</p>'
    +'<p>Weblink dieser Show: <br><a href="' + params.show.url + '">' + params.show.url + '</a></p>');

  infoTab.createFooter(
    '<div class="social-links">'
      +'<h3>Bleib in Verbindung</h3>'
      +'<ul>'
        +'<li><a class="twitter" title="Twitter" href="https://twitter.com/"><img src="twitter-128.png"><span>Twitter</span></a></li>'
        +'<li><a class="flattr" title="Flattr" href="https://twitter.com/"><img src="flattr-128.png"><span>Flattr</span></a></li>'
        +'<li><a class="google" title="Google+" href="https://twitter.com/"><img src="googleplus-128.png"><span>Google+</span></a></li>'
        +'<li><a class="facebook" title="Facebook" href="https://twitter.com/"><img src="facebook-128.png"><span>Facebook</span></a></li>'
        +'<li><a class="adn" title="App.net" href="https://twitter.com/"><img src="adn-128.png"><span>App.net</span></a></li>'
        +'<li><a class="email" title="E-mail" href="https://twitter.com/"><img src="email-128.png"><span>E-mail</span></a></li>'
      +'</ul>'
    +'</div>'
    +'<p>The show "' + params.show.title + '" is licenced under<br>'
      +'<a href="' + params.license.url + '">' + params.license.name + '</a>'
    +'</p>');

  return infoTab;
}

module.exports = Info;
