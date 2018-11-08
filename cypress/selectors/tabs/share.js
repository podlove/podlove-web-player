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
    mail: () => cy.get(`#tab-share--channels--mail a`),
    pinterest: () => cy.get(`#tab-share--channels--pinterest a`),
    linkedin: () => cy.get(`#tab-share--channels--linkedin a`)
  },
  embed: {
    container: () => cy.get('#tab-share--embed--link'),
    input: () => cy.get('#tab-share--share-embed--input'),
    size: () => cy.get('#tab-share--share-embed--size')
  },
  link: {
    container: () => cy.get('#tab-share--share-link'),
    input: () => cy.get('#tab-share--share-link--input')
  }
})
