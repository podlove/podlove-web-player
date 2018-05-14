/* eslint-env mocha */
/* globals cy */
const { setState } = require('../helpers/state')

describe('Progressbar', () => {
  beforeEach(cy.bootstrap)

  it('is not visible on init', function () {
    cy.window().then(setState(this.episode, this.audio, this.show))
    cy.get('#progress-bar--progress').should('not.exist')
  })

  describe('Range', () => {
    it('renders on play', function () {
      cy.window().then(setState(this.episode, this.audio, this.show))
      cy.play()
      cy.get('#progress-bar--progress .progress-range')
    })
  })

  describe('Buffer', () => {
    it('renders on play', function () {
      cy.window().then(setState(this.episode, this.audio, this.show))
      cy.play()
      cy.get('#progress-bar--progress .progress-range')
    })
  })

  describe('Chapter Indicator', () => {
    it('only renders when chapters are available', function () {
      cy.window().then(setState(this.episode, this.audio, this.show))
      cy.play()
      cy.get('#progress-bar--progress .chapters-progress').find('.indicator').should('not.exist')
    })

    it('renders chapter dividers', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.play()
      cy.get('#progress-bar--progress .chapters-progress').find('.indicator').should('have.length', 3)
    })
  })

  describe('Current Chapter', () => {
    it('only renders when chapters are available', function () {
      cy.window().then(setState(this.episode, this.audio, this.show))
      cy.play()
      cy.get('#progress-bar--current-chapter .chapter-title').should('not.exist')
    })

    it('displays the current chapter title', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.play()
      cy.contains('#progress-bar--current-chapter .chapter-title', this.chapters.chapters[0].title)
    })

    it('displays the chapter on a given playtime', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 8000 }))
      cy.play()
      cy.contains('#progress-bar--current-chapter .chapter-title', this.chapters.chapters[1].title)
    })
  })

  describe('Timer', () => {
    it('renders the current playtime', function () {
      cy.window().then(setState(this.episode, this.audio, this.show))
      cy.play()
      cy.pause()
      cy.contains('#progress-bar--timer-current', '00:00')
    })

    it('renders a given playtime', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, { playtime: 8000 }))
      cy.play()
      cy.pause()
      cy.contains('#progress-bar--timer-current', '00:08')
    })

    it('renders a given remaining playtime', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, { playtime: 8000 }))
      cy.play()
      cy.pause()
      cy.contains('#progress-bar--timer-left', '00:04')
    })
  })
})
