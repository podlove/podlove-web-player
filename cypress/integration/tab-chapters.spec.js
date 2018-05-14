/* eslint-env mocha */
/* globals cy, expect */
const { setState } = require('../helpers/state')

describe('Chapters Tab', () => {
  beforeEach(cy.bootstrap)

  describe('List', () => {
    it('renders a list of chapters', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('chapters')
      cy.get('#tab-chapters .chapters--entry').should('have.length', this.chapters.chapters.length)
    })

    it('renders the chapter indices in the correct order', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('chapters')
      cy.get('#tab-chapters .chapters--entry .index').then(nodes => {
        this.chapters.chapters.forEach((chapter, index) => {
          expect(nodes.get(index).textContent).to.equal(`${index + 1}`)
        })
      })
    })

    it('renders the chapter title in the correct order', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('chapters')
      cy.get('#tab-chapters .chapters--entry .title').then(nodes => {
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
      cy.contains('#tab-chapters .chapters--entry.active .timer', '-00:08')
    })

    it('renders the runtime on inactive chapters', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('chapters')
      cy.get('#tab-chapters .chapters--entry .timer').not('.active').should('contain', '00:02')
    })
  })

  describe('Interactions', () => {
    it('plays the chapter on click', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('chapters')
      cy.get('#tab-chapters .chapters--entry').first().click()
      cy.get('#control-bar--play-button--pause')
    })

    it('starts playing the chapter on players start time', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('chapters')
      cy.get('#tab-chapters .chapters--entry:nth-child(2)').click()
      cy.pause()
      cy.contains('#progress-bar--timer-current', '00:08')
    })
  })
})
