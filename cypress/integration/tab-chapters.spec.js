/* eslint-env mocha */
/* globals cy, expect */
const { setState } = require('../helpers/state')
const domSelectors = require('../selectors')

describe('Chapters Tab', () => {
  let selectors

  beforeEach(cy.bootstrap)
  beforeEach(() => {
    selectors = domSelectors(cy)
  })

  describe('List', () => {
    it('renders a list of chapters', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('chapters')
      selectors.tabs.chapters.entries().should('have.length', this.chapters.chapters.length)
    })

    it('renders the chapter indices in the correct order', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('chapters')
      selectors.tabs.chapters.indices().then(nodes => {
        this.chapters.chapters.forEach((chapter, index) => {
          expect(nodes.get(index).textContent).to.equal(`${index + 1}`)
        })
      })
    })

    it('renders the chapter title in the correct order', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('chapters')
      selectors.tabs.chapters.titles().then(nodes => {
        this.chapters.chapters.forEach((chapter, index) => {
          expect(nodes.get(index).textContent).to.equal(chapter.title)
        })
      })
    })
  })

  describe('Timers', () => {
    it('renders the remaining time on the active chapter', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('chapters')
      selectors.tabs.chapters.activeTimer().contains('-00:08')
    })

    it('renders the runtime on inactive chapters', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('chapters')
      selectors.tabs.chapters.timers().not('.active').should('contain', '00:02')
    })
  })

  describe('Interactions', () => {
    it('plays the chapter on click', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('chapters')
      selectors.tabs.chapters.entries().first().click()
      selectors.controls.playButton.pause()
    })

    it('starts playing the chapter on players start time', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('chapters')
      selectors.tabs.chapters.entries().eq(1).click().then(cy.pause)
      selectors.timers.current().contains('00:08')
    })
  })
})
