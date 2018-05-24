/* eslint-env mocha */
/* globals cy, expect */
const { setState } = require('../helpers/state')
const domSelectors = require('../selectors')

describe('Download Tab', () => {
  let selectors

  beforeEach(cy.bootstrap)
  beforeEach(() => {
    selectors = domSelectors(cy)
  })

  describe('Poster', () => {
    it(`doesn't render if the show and the episode cover is not available`, function () {
      delete this.episode.poster
      delete this.show.show.poster
      cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
      cy.tab('download')
      selectors.tabs.download.poster.container().should('not.exist')
    })

    it(`renders the episode cover when both are available`, function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
      cy.tab('download')
      selectors.tabs.download.poster.image().should('have.attr', 'src', this.episode.poster)
    })

    it(`renders the show cover when the episode cover is not available`, function () {
      delete this.episode.poster
      cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
      cy.tab('download')
      selectors.tabs.download.poster.image().should('have.attr', 'src', this.show.show.poster)
    })
  })

  describe('Meta', () => {
    it(`doesn't render if the show and the episode cover is not available`, function () {
      delete this.episode.poster
      delete this.show.show.poster
      cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
      cy.tab('download')
      selectors.tabs.download.meta().should('not.exist')
    })

    it(`renders the publication date`, function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
      cy.tab('download')
      selectors.tabs.download.meta().contains('11/2/2999')
    })

    it(`renders the duration`, function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
      cy.tab('download')
      selectors.tabs.download.meta().contains('0 minutes')
    })
  })

  describe('Download Episode', () => {
    it('renders a dropdown with all audio files', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
      cy.tab('download')
      selectors.tabs.download.selection.option().should('have.length', this.audio.audio.length)
    })

    it('renders the dropdown with the correct titles', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
      cy.tab('download')
      selectors.tabs.download.selection.option().then(options => {
        this.audio.audio.forEach((audio, index) => {
          expect(options.get(index).text).to.contain(audio.title)
        })
      })
    })

    it('sets the correct download href', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
      cy.tab('download')
      this.audio.audio.forEach(audio => {
        selectors.tabs.download.selection.container().select(audio.url)
        selectors.tabs.download.downloadButton().should('have.attr', 'href', audio.url)
      })
    })
  })
})
