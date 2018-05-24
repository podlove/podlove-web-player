/* eslint-env mocha */
/* globals cy */
const { setState } = require('../helpers/state')
const domSelectors = require('../selectors')

describe('Header', () => {
  let selectors

  beforeEach(cy.bootstrap)
  beforeEach(() => {
    selectors = domSelectors(cy)
  })

  describe('Showtitle', () => {
    it('renders when available', function () {
      cy.window().then(setState(this.episode, this.audio, this.show))
      selectors.show.title().contains(this.show.show.title)
    })

    it('hides the container if not set', function () {
      delete this.show.show.title
      cy.window().then(setState(this.episode, this.audio, this.show))
      selectors.show.title().should('not.exist')
    })
  })

  describe('Title', () => {
    it('renders when available', function () {
      cy.window().then(setState(this.episode, this.audio))
      selectors.episode.title().contains(this.episode.title)
    })

    it('hides the container if not set', function () {
      delete this.episode.title
      cy.window().then(setState(this.episode, this.audio))
      selectors.episode.title().should('not.exist')
    })
  })

  describe('Subtitle', () => {
    it('renders when available', function () {
      cy.window().then(setState(this.episode, this.audio))
      selectors.episode.subtitle().contains(this.episode.subtitle)
    })

    it('hides the container if not set', function () {
      delete this.episode.subtitle
      cy.window().then(setState(this.episode, this.audio))
      selectors.episode.subtitle().should('not.exist')
    })
  })

  describe('Poster', () => {
    it('renders the episode cover when available', function () {
      cy.window().then(setState(this.episode, this.audio, this.show))
      selectors.headerPoster().should('have.attr', 'src', this.episode.poster)
    })

    it('renders the show cover when episode cover not set', function () {
      delete this.episode.poster

      cy.window().then(setState(this.episode, this.audio, this.show))
      selectors.headerPoster().should('have.attr', 'src', this.show.show.poster)
    })

    it('hides the container if show and episode cover is not set', function () {
      delete this.episode.poster
      delete this.show.show.poster

      cy.window().then(setState(this.episode, this.audio, this.show))
      selectors.headerPosterContainer().should('not.exist')
    })
  })
})
