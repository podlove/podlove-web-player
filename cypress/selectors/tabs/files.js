module.exports = cy => ({
  header: () => cy.get(`#tabs [rel="files"]`),
  container: () => cy.get('#tab-files'),
  audio: () => cy.get('#tab-files--audio')
})
