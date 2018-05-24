module.exports = cy => ({
  container: () => cy.get('#tab-audio'),
  volume: {
    current: () => cy.get('#tab-audio--volume--current'),
    input: () => cy.get('#tab-audio--volume--input input'),
    mute: () => cy.get('#tab-audio--volume--mute')
  },
  rate: {
    current: () => cy.get('#tab-audio--rate--current'),
    input: () => cy.get('#tab-audio--rate--input input'),
    increase: () => cy.get('#tab-audio--rate--increase'),
    decrease: () => cy.get('#tab-audio--rate--decrease')
  }
})
