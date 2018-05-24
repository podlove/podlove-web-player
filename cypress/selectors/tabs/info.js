module.exports = cy => ({
  container: () => cy.get('#tab-info'),
  episode: {
    title: () => cy.get('#tab-info--episode-title'),
    meta: () => cy.get('#tab-info--episode-meta'),
    subtitle: () => cy.get('#tab-info--episode-subtitle'),
    summary: () => cy.get('#tab-info--episode-summary'),
    link: () => cy.get('#tab-info--episode-link')
  },
  show: {
    title: () => cy.get('#tab-info--show-title'),
    poster: () => cy.get('#tab-info--show-poster'),
    summary: () => cy.get('#tab-info--show-summary'),
    link: () => cy.get('#tab-info--show-link')
  },
  speakers: () => cy.get('#tab-info--speakers')
})
