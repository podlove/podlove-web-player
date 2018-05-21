module.exports = cy => ({
  timers: {
    left: () => cy.get('#progress-bar--timer-left'),
    current: () => cy.get('#progress-bar--timer-current')
  },
  currentChapter: () => cy.get('#progress-bar--current-chapter')
})
