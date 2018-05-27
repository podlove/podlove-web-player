module.exports = cy => ({
  header: () => cy.get(`#tabs [rel="chapters"]`),
  container: () => cy.get('#tab-chapters'),
  entries: () => cy.get('#tab-chapters .chapters--entry'),
  indices: () => cy.get('#tab-chapters .chapters--entry .index'),
  titles: () => cy.get('#tab-chapters .chapters--entry .title'),
  activeTimer: () => cy.get('#tab-chapters .chapters--entry.active .timer'),
  timers: () => cy.get('#tab-chapters .chapters--entry .timer')
})
