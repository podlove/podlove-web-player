/* eslint-env mocha */
/* globals cy */
const { setState } = require('../helpers/state')

describe('Header', () => {
  beforeEach(cy.bootstrap)

  describe('Showtitle', () => {
    it('renders when available', function () {
      cy.window().then(setState(this.episode, this.audio, this.show))
      cy.contains('#header-showtitle', this.show.show.title)
    })

    it('hides the container if not set', function () {
      delete this.show.show.title
      cy.window().then(setState(this.episode, this.audio, this.show))
      cy.get('#header-showtitle').should('not.exist')
    })
  })

  describe('Title', () => {
    it('renders when available', function () {
      cy.window().then(setState(this.episode, this.audio))
      cy.contains('#header-title', this.episode.title)
    })

    it('hides the container if not set', function () {
      delete this.episode.title
      cy.window().then(setState(this.episode, this.audio))
      cy.get('#header-title').should('not.exist')
    })
  })

  describe('Subtitle', () => {
    it('renders when available', function () {
      cy.window().then(setState(this.episode, this.audio))
      cy.contains('#header-subtitle', this.episode.subtitle)
    })

    it('hides the container if not set', function () {
      delete this.episode.subtitle
      cy.window().then(setState(this.episode, this.audio))
      cy.get('#header-subtitle').should('not.exist')
    })
  })

  describe('Poster', () => {
    it('renders the episode cover when available', function () {
      cy.window().then(setState(this.episode, this.audio, this.show))
      cy.get('#header-poster img').should('have.attr', 'src', this.episode.poster)
    })

    it('renders the show cover when episode cover not set', function () {
      delete this.episode.poster

      cy.window().then(setState(this.episode, this.audio, this.show))
      cy.get('#header-poster img').should('have.attr', 'src', this.show.show.poster)
    })

    it('hides the container if show and episode cover is not set', function () {
      delete this.episode.poster
      delete this.show.show.poster

      cy.window().then(setState(this.episode, this.audio, this.show))
      cy.get('#header-poster').should('not.exist')
    })
  })
})
