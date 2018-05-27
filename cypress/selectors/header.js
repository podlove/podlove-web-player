module.exports = cy => ({
  show: {
    title: () => cy.get('#header-showtitle')
  },
  episode: {
    title: () => cy.get('#header-title'),
    subtitle: () => cy.get('#header-subtitle')
  },
  headerPosterContainer: () => cy.get('#header-poster'),
  headerPoster: () => cy.get('#header-poster img')
})
