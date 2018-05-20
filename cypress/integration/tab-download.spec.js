/* eslint-env mocha */
/* globals cy, expect */
const { setState } = require('../helpers/state')

describe('Download Tab', () => {
  beforeEach(cy.bootstrap)

  describe('Poster', () => {
    it(`doesn't render if the show and the episode cover is not available`, function () {
      delete this.episode.poster
      delete this.show.show.poster
      cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
      cy.tab('download')
      cy.get('#tab-download--poster').should('not.exist')
    })

    it(`renders the episode cover when both are available`, function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
      cy.tab('download')
      cy.get('#tab-download--poster img').should('have.attr', 'src', this.episode.poster)
    })

    it(`renders the show cover when the episode cover is not available`, function () {
      delete this.episode.poster
      cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
      cy.tab('download')
      cy.get('#tab-download--poster img').should('have.attr', 'src', this.show.show.poster)
    })
  })

  describe('Meta', () => {
    it(`doesn't render if the show and the episode cover is not available`, function () {
      delete this.episode.poster
      delete this.show.show.poster
      cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
      cy.tab('download')
      cy.get('#tab-download--meta').should('not.exist')
    })

    it(`renders the publication date`, function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
      cy.tab('download')
      cy.contains('#tab-download--meta', '11/2/2999')
    })

    it(`renders the duration`, function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
      cy.tab('download')
      cy.contains('#tab-download--meta', '0 minutes')
    })
  })

  describe('Download Episode', () => {
    it('renders a dropdown with all audio files', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
      cy.tab('download')
      cy.get('#tab-download--select option').should('have.length', this.audio.audio.length)
    })

    it('renders the dropdown with the correct titles', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
      cy.tab('download')
      cy.get('#tab-download--select option').then(options => {
        this.audio.audio.forEach((audio, index) => {
          expect(options.get(index).text).to.contain(audio.title)
        })
      })
    })

    it('sets the correct download href', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
      cy.tab('download')
      this.audio.audio.forEach(audio => {
        cy.get('#tab-download--select').select(audio.url)
        cy.get('#tab-download--button').should('have.attr', 'href', audio.url)
      })
    })
  })
})
