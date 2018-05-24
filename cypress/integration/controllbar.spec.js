/* eslint-env mocha */
/* globals cy */
const { setState } = require('../helpers/state')
const domSelectors = require('../selectors')

describe('Controls', () => {
  let selectors

  beforeEach(cy.bootstrap)
  beforeEach(() => {
    selectors = domSelectors(cy)
  })

  describe('Play Button', () => {
    it('shows the duration button on init', function () {
      cy.window().then(setState(this.episode, this.audio, this.show))
      selectors.controls.playButton.duration().contains('00:12')
    })

    it('shows the loading indicator the play button click', function () {
      cy.window().then(setState(this.episode, this.audio, this.show))
      selectors.controls.playButton.duration()
      cy.play()
    })

    it('shows the pause icon if the episode is playing', function () {
      cy.window().then(setState(this.episode, this.audio, this.show))
      cy.play()
      selectors.controls.playButton.pause()
    })

    it('shows the play icon if the episode is paused', function () {
      cy.window().then(setState(this.episode, this.audio, this.show))
      cy.play()
      selectors.controls.playButton.pause()
      cy.pause()
      selectors.controls.playButton.play()
    })

    it('shows the retry icon of the player reaches the end', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, { playtime: 11000 }))
      cy.play()
      selectors.controls.playButton.replay()
    })
  })

  describe('Stepper Buttons', () => {
    it('are not visible on init', function () {
      cy.window().then(setState(this.episode, this.audio, this.show))
      selectors.controls.steppers.forward().should('not.exist')
      selectors.controls.steppers.back().should('not.exist')
    })

    describe('Forward Button', () => {
      it('winds the player 30 seconds forward if forward button is clicked', function () {
        cy.window().then(setState(this.episode, this.audio, this.show))
        cy.play()
        cy.pause()
        selectors.controls.steppers.forward().click()
        selectors.timers.left().contains('00:00')
      })

      it('does not change the player time if the end was reached', function () {
        cy.window().then(setState(this.episode, this.audio, this.show))
        cy.play()
        cy.pause()
        selectors.controls.steppers.forward().click()
        selectors.timers.left().contains('00:00')
        selectors.controls.steppers.forward().should('have.attr', 'disabled')
      })
    })

    describe('Back Button', () => {
      it('winds the player 15 seconds backwards if forward button is clicked', function () {
        cy.window().then(setState(this.episode, this.audio, this.show, { playtime: 11000 }))
        cy.play()
        cy.pause()
        selectors.controls.steppers.back().click()
        selectors.timers.current().contains('00:00')
      })

      it('does not change the player time if the end was reached', function () {
        cy.window().then(setState(this.episode, this.audio, this.show, { playtime: 11000 }))
        cy.play()
        cy.pause()
        selectors.controls.steppers.back().click()
        selectors.timers.left().contains('00:12')
        selectors.controls.steppers.back().should('have.attr', 'disabled')
      })
    })
  })

  describe('Chapter Buttons', () => {
    it('are not visible on init', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      selectors.controls.chapters.next().should('not.exist')
      selectors.controls.chapters.back().should('not.exist')
    })

    it('are not visible if no chapters are available', function () {
      cy.window().then(setState(this.episode, this.audio, this.show))
      cy.play()
      selectors.controls.chapters.next().should('not.exist')
      selectors.controls.chapters.back().should('not.exist')
    })

    describe('Next Button', () => {
      it('skips to the next chapter on click', function () {
        cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
        cy.play()
        cy.pause()
        selectors.chapter.current().contains(this.chapters.chapters[0].title)

        selectors.controls.chapters.next().click()
        selectors.chapter.current().contains(this.chapters.chapters[1].title)
      })

      it('does nothing when the last chapter was reached', function () {
        cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 11000 }))
        cy.play()
        cy.pause()
        selectors.chapter.current().contains(this.chapters.chapters[2].title)

        selectors.controls.chapters.next().click()
        selectors.chapter.current().contains(this.chapters.chapters[2].title)
        selectors.controls.chapters.next().should('have.attr', 'disabled')
      })
    })

    describe('Back Button', () => {
      it('skips to the previous chapter on click', function () {
        cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 8000 }))
        cy.play()
        cy.pause()
        selectors.chapter.current().contains(this.chapters.chapters[1].title)

        selectors.controls.chapters.back().click()
        selectors.chapter.current().contains(this.chapters.chapters[0].title)
      })

      it('goes to the beginning of the current chapter if it just played les than 2 seconds', function () {
        cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 9000 }))
        cy.play()
        cy.pause()
        selectors.chapter.current().contains(this.chapters.chapters[1].title)

        selectors.controls.chapters.back().click()
        selectors.chapter.current().contains(this.chapters.chapters[1].title)
      })

      it('does nothing when the last chapter was reached', function () {
        cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
        cy.play()
        cy.pause()
        selectors.chapter.current().contains(this.chapters.chapters[0].title)
        selectors.controls.chapters.back().should('have.attr', 'disabled')
      })
    })
  })
})
