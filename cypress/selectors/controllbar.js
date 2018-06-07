module.exports = cy => ({
  controls: {
    playButton: {
      button: () => cy.get('#control-bar--play-button'),
      duration: () => cy.get('#control-bar--play-button--duration'),
      pause: () => cy.get('#control-bar--play-button--pause'),
      play: () => cy.get('#control-bar--play-button--play'),
      replay: () => cy.get('#control-bar--play-button--replay')
    },
    steppers: {
      forward: () => cy.get('#control-bar--step-forward-button'),
      back: () => cy.get('#control-bar--step-back-button')
    },
    chapters: {
      next: () => cy.get('#control-bar--chapter-next-button'),
      back: () => cy.get('#control-bar--chapter-back-button')
    }
  }
})
