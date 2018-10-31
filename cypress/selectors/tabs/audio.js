module.exports = cy => ({
  header: () => cy.get(`#tabs [rel="audio"]`),
  container: () => cy.get('#tab-audio'),
  volume: {
    current: () => cy.get('#tab-audio--volume--value'),
    input: () => cy.get('#tab-audio--volume--input input'),
    mute: () => cy.get('#tab-audio--volume--mute')
  },
  rate: {
    current: () => cy.get('#tab-audio--rate--value'),
    input: () => cy.get('#tab-audio--rate--input input')
  }
})
