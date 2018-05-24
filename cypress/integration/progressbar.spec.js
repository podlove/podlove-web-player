/* eslint-env mocha */
/* globals cy */
const { setState } = require('../helpers/state')
const domSelectors = require('../selectors')

describe('Progressbar', () => {
  let selectors

  beforeEach(cy.bootstrap)
  beforeEach(() => {
    selectors = domSelectors(cy)
  })

  it('is not visible on init', function () {
    cy.window().then(setState(this.episode, this.audio, this.show))
    selectors.progress.bar().should('not.exist')
  })

  describe('Range', () => {
    it('renders on play', function () {
      cy.window().then(setState(this.episode, this.audio, this.show))
      cy.play()
      selectors.progress.range()
    })
  })

  describe('Buffer', () => {
    it('renders on play', function () {
      cy.window().then(setState(this.episode, this.audio, this.show))
      cy.play()
      selectors.progress.range()
    })
  })

  describe('Chapter Indicator', () => {
    it('only renders when chapters are available', function () {
      cy.window().then(setState(this.episode, this.audio, this.show))
      cy.play()
      selectors.progress.chapters().should('not.exist')
    })

    it('renders chapter dividers', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.play()
      selectors.progress.chapters().should('have.length', 3)
    })
  })

  describe('Current Chapter', () => {
    it('only renders when chapters are available', function () {
      cy.window().then(setState(this.episode, this.audio, this.show))
      cy.play()
      selectors.chapter.title().should('not.exist')
    })

    it('displays the current chapter title', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.play()
      selectors.chapter.title().contains(this.chapters.chapters[0].title)
    })

    it('displays the chapter on a given playtime', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 8000 }))
      cy.play()
      selectors.chapter.title().contains(this.chapters.chapters[1].title)
    })
  })

  describe('Timer', () => {
    it('renders the current playtime', function () {
      cy.window().then(setState(this.episode, this.audio, this.show))
      cy.play()
      cy.pause()
      selectors.timers.current().contains('00:00')
    })

    it('renders a given playtime', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, { playtime: 8000 }))
      cy.play()
      cy.pause()
      selectors.timers.current().contains('00:08')
    })

    it('renders a given remaining playtime', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, { playtime: 8000 }))
      cy.play()
      cy.pause()
      selectors.timers.left().contains('00:04')
    })
  })
})
