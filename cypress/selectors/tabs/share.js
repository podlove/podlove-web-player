module.exports = cy => ({
  header: () => cy.get(`#tabs [rel="share"]`),
  container: () => cy.get('#tab-share'),
  content: {
    show: () => cy.get('#tab-share--content--show'),
    episode: () => cy.get('#tab-share--content--episode'),
    chapter: () => cy.get('#tab-share--content--chapter'),
    time: () => cy.get('#tab-share--content--time')
  },
  channels: {
    twitter: () => cy.get(`#tab-share--channels--twitter a`),
    reddit: () => cy.get(`#tab-share--channels--reddit a`),
    'google-plus': () => cy.get(`#tab-share--channels--google-plus a`),
    mail: () => cy.get(`#tab-share--channels--mail a`),
    pinterest: () => cy.get(`#tab-share--channels--pinterest a`),
    embed: () => cy.get(`#tab-share--channels--embed a`)
  },
  overlay: {
    modal: () => cy.get('#share-tab--share-overlay'),
    close: () => cy.get('#share-tab--share-overlay .overlay-close'),
    code: () => cy.get('#share-tab--share-overlay--code'),
    size: () => cy.get('#share-tab--share-overlay--size'),
    input: () => cy.get('#tab-share--share-link--input')
  }
})
