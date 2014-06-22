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
    headline: 'Summary',
    name:'summary',
    active: !!params.summaryVisible
  });
  infoTab.box.append(params.summary);
  return infoTab;
}

module.exports = Info;
