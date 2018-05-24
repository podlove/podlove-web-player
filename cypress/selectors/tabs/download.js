module.exports = cy => ({
  container: () => cy.get('#tab-download'),
  poster: {
    container: () => cy.get('#tab-download--poster'),
    image: () => cy.get('#tab-download--poster img')
  },
  meta: () => cy.get('#tab-download--meta'),
  selection: {
    container: () => cy.get('#tab-download--select'),
    option: () => cy.get('#tab-download--select option')
  },
  downloadButton: () => cy.get('#tab-download--button')
})
