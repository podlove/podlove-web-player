module.exports = cy => ({
  progressbar: () => cy.get('#progress-bar'),
  timers: {
    left: () => cy.get('#progress-bar--timer-left'),
    current: () => cy.get('#progress-bar--timer-current')
  },
  chapter: {
    current: () => cy.get('#progress-bar--current-chapter'),
    title: () => cy.get('#progress-bar--current-chapter .chapter-title')
  },
  progress: {
    bar: () => cy.get('#progress-bar--progress'),
    range: () => cy.get('#progress-bar--progress .progress-range'),
    chapters: () => cy.get('#progress-bar--progress .chapters-progress .indicator')
  }
})
