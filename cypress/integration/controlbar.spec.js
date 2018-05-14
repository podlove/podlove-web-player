/* eslint-env mocha */
/* globals cy */
const { setState } = require('../helpers/state')

describe('Controls', () => {
  beforeEach(cy.bootstrap)

  describe('PlayButton', () => {
    it('shows the duration button on init', function () {
      cy.window().then(setState(this.episode, this.audio, this.show))
      cy.contains('#control-bar--play-button--duration', '00:12')
    })

    it('shows the loading indicator the play button click', function () {
      cy.window().then(setState(this.episode, this.audio, this.show))
      cy.get('#control-bar--play-button--duration')
      cy.play()
    })

    it('shows the pause icon if the episode is playing', function () {
      cy.window().then(setState(this.episode, this.audio, this.show))
      cy.play()
      cy.get('#control-bar--play-button--pause')
    })

    it('shows the play icon if the episode is paused', function () {
      cy.window().then(setState(this.episode, this.audio, this.show))
      cy.play()
      cy.get('#control-bar--play-button--pause')
      cy.play()
      cy.get('#control-bar--play-button--play')
    })

    it('shows the retry icon of the player reaches the end', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, { playtime: 11000 }))
      cy.play()
      cy.get('#control-bar--play-button--replay')
    })
  })

  describe('StepperButtons', () => {
    it('are not visible on init', function () {
      cy.window().then(setState(this.episode, this.audio, this.show))
      cy.get('#control-bar--step-forward-button').should('not.exist')
      cy.get('#control-bar--step-back-button').should('not.exist')
    })

    describe('Forward Button', () => {
      it('it winds the player 30 seconds forward if forward button is clicked', function () {
        cy.window().then(setState(this.episode, this.audio, this.show))
        cy.play()
        cy.pause()
        cy.get('#control-bar--step-forward-button').click()
        cy.contains('#progress-bar--timer-left', '00:00')
      })

      it('it does not change the player time if the end was reached', function () {
        cy.window().then(setState(this.episode, this.audio, this.show))
        cy.play()
        cy.pause()
        cy.get('#control-bar--step-forward-button').click()
        cy.contains('#progress-bar--timer-left', '00:00')
        cy.get('#control-bar--step-forward-button').should('have.attr', 'disabled')
      })
    })

    describe('Back Button', () => {
      it('it winds the player 15 seconds backwards if forward button is clicked', function () {
        cy.window().then(setState(this.episode, this.audio, this.show, { playtime: 11000 }))
        cy.play()
        cy.pause()
        cy.get('#control-bar--step-back-button').click()
        cy.contains('#progress-bar--timer-left', '00:12')
      })

      it('it does not change the player time if the end was reached', function () {
        cy.window().then(setState(this.episode, this.audio, this.show, { playtime: 11000 }))
        cy.play()
        cy.pause()
        cy.get('#control-bar--step-back-button').click()
        cy.contains('#progress-bar--timer-left', '00:12')
        cy.get('#control-bar--step-back-button').should('have.attr', 'disabled')
      })
    })
  })

  describe('ChapterButtons', () => {
    it('are not visible on init', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.get('#control-bar--chapter-next-button').should('not.exist')
      cy.get('#control-bar--chapter-back-button').should('not.exist')
    })

    it('are not visible if no chapters are available', function () {
      cy.window().then(setState(this.episode, this.audio, this.show))
      cy.play()
      cy.get('#control-bar--chapter-next-button').should('not.exist')
      cy.get('#control-bar--chapter-back-button').should('not.exist')
    })

    describe('Next Button', () => {
      it('skips to the next chapter on click', function () {
        cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
        cy.play()
        cy.pause()
        cy.contains('#progress-bar--current-chapter', this.chapters.chapters[0].title)

        cy.get('#control-bar--chapter-next-button').click()
        cy.contains('#progress-bar--current-chapter', this.chapters.chapters[1].title)
      })

      it('does nothing when the last chapter was reached', function () {
        cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 11000 }))
        cy.play()
        cy.pause()
        cy.contains('#progress-bar--current-chapter', this.chapters.chapters[2].title)

        cy.get('#control-bar--chapter-next-button').click()
        cy.contains('#progress-bar--current-chapter', this.chapters.chapters[2].title)
        cy.get('#control-bar--chapter-next-button').should('have.attr', 'disabled')
      })
    })

    describe('Back Button', () => {
      it('skips to the previous chapter on click', function () {
        cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 8000 }))
        cy.play()
        cy.pause()
        cy.contains('#progress-bar--current-chapter', this.chapters.chapters[1].title)

        cy.get('#control-bar--chapter-back-button').click()
        cy.contains('#progress-bar--current-chapter', this.chapters.chapters[0].title)
      })

      it('goes to the beginning of the current chapter if it just played les than 2 seconds', function () {
        cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 9000 }))
        cy.play()
        cy.pause()
        cy.contains('#progress-bar--current-chapter', this.chapters.chapters[1].title)

        cy.get('#control-bar--chapter-back-button').click()
        cy.contains('#progress-bar--current-chapter', this.chapters.chapters[1].title)
      })

      it('does nothing when the last chapter was reached', function () {
        cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
        cy.play()
        cy.pause()
        cy.contains('#progress-bar--current-chapter', this.chapters.chapters[0].title)

        cy.contains('#progress-bar--current-chapter', this.chapters.chapters[0].title)
        cy.get('#control-bar--chapter-back-button').should('have.attr', 'disabled')
      })
    })
  })
})
