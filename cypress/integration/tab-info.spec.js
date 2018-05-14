/* eslint-env mocha */
/* globals cy */
const { setState } = require('../helpers/state')

describe('Info Tab', () => {
  beforeEach(cy.bootstrap)

  describe('Episode', () => {
    describe('Title', () => {
      it('renders', function () {
        cy.window().then(setState(this.episode, this.audio, this.show))
        cy.tab('info')
        cy.contains('#tabs--info--episode-title', this.episode.title)
      })

      it(`doesn't render if not set`, function () {
        delete this.episode.title
        cy.window().then(setState(this.episode, this.audio, this.show))
        cy.tab('info')
        cy.get('#tabs--info--episode-title').should('not.exist')
      })
    })

    describe('Release Date', () => {
      it('renders', function () {
        cy.window().then(setState(this.episode, this.audio, this.show))
        cy.tab('info')
        cy.contains('#tabs--info--episode-meta', '02')
        cy.contains('#tabs--info--episode-meta', '11')
        cy.contains('#tabs--info--episode-meta', '2999')
      })

      it(`doesn't render if not set`, function () {
        delete this.episode.publicationDate
        cy.window().then(setState(this.episode, this.audio, this.show))
        cy.tab('info')
        cy.get('#tabs--info--episode-meta').should('not.contain', '02')
        cy.get('#tabs--info--episode-meta').should('not.contain', '11')
        cy.get('#tabs--info--episode-meta').should('not.contain', '2999')
      })
    })

    describe('Duration', () => {
      it('renders', function () {
        cy.window().then(setState(this.episode, this.audio, this.show))
        cy.tab('info')
        cy.contains('#tabs--info--episode-meta', '0')
      })

      it(`doesn't render if not set`, function () {
        delete this.episode.duration
        delete this.episode.publicationDate
        cy.window().then(setState(this.episode, this.audio, this.show))
        cy.tab('info')
        cy.get('#tabs--info--episode-meta').should('not.contain', '0')
      })
    })

    describe('Subtitle', () => {
      it('renders', function () {
        cy.window().then(setState(this.episode, this.audio, this.show))
        cy.tab('info')
        cy.contains('#tabs--info--episode-subtitle', this.episode.subtitle)
      })

      it(`doesn't render if not set`, function () {
        delete this.episode.subtitle

        cy.window().then(setState(this.episode, this.audio, this.show))
        cy.tab('info')
        cy.get('#tabs--info--episode-subtitle').should('not.exist')
      })
    })

    describe('Summary', () => {
      it('renders', function () {
        cy.window().then(setState(this.episode, this.audio, this.show))
        cy.tab('info')
        cy.contains('#tabs--info--episode-summary', this.episode.summary)
      })

      it(`doesn't render if not set`, function () {
        delete this.episode.summary

        cy.window().then(setState(this.episode, this.audio, this.show))
        cy.tab('info')
        cy.get('#tabs--info--episode-summary').should('not.exist')
      })
    })

    describe('Link', () => {
      it('renders', function () {
        cy.window().then(setState(this.episode, this.audio, this.show))
        cy.tab('info')
        cy.get('#tabs--info--episode-link').should('have.attr', 'href', this.episode.link)
      })

      it(`doesn't render if not set`, function () {
        delete this.episode.link

        cy.window().then(setState(this.episode, this.audio, this.show))
        cy.tab('info')
        cy.get('#tabs--info--episode-link').should('not.exist')
      })
    })
  })

  describe('Show', () => {
    describe('Title', () => {
      it('renders', function () {
        cy.window().then(setState(this.episode, this.audio, this.show))
        cy.tab('info')
        cy.contains('#tabs--info--show-title', this.show.show.title)
      })

      it(`doesn't render if not set`, function () {
        delete this.show.show.title
        cy.window().then(setState(this.show, this.audio, this.show))
        cy.tab('info')
        cy.get('#tabs--info--show-title').should('not.exist')
      })
    })

    describe('Poster', () => {
      it('renders', function () {
        cy.window().then(setState(this.episode, this.audio, this.show))
        cy.tab('info')
        cy.get('#tabs--info--show-poster').should('have.attr', 'src', this.show.show.poster)
      })

      it(`doesn't render if not set`, function () {
        delete this.show.show.poster
        cy.window().then(setState(this.show, this.audio, this.show))
        cy.tab('info')
        cy.get('#tabs--info--show-poster').should('not.exist')
      })
    })

    describe('Summary', () => {
      it('renders', function () {
        cy.window().then(setState(this.episode, this.audio, this.show))
        cy.tab('info')
        cy.contains('#tabs--info--show-summary', this.show.show.summary)
      })

      it(`doesn't render if not set`, function () {
        delete this.show.show.summary
        cy.window().then(setState(this.show, this.audio, this.show))
        cy.tab('info')
        cy.get('#tabs--info--show-summary').should('not.exist')
      })
    })

    describe('Link', () => {
      it('renders', function () {
        cy.window().then(setState(this.episode, this.audio, this.show))
        cy.tab('info')
        cy.get('#tabs--info--show-link').should('have.attr', 'href', this.show.show.link)
      })

      it(`doesn't render if not set`, function () {
        delete this.show.show.link

        cy.window().then(setState(this.show, this.audio, this.show))
        cy.tab('info')
        cy.get('#tabs--info--show-link').should('not.exist')
      })
    })
  })

  describe('Contributors', () => {
    it('renders a list', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.contributors))
      cy.tab('info')
      cy.get('#tabs--info--speakers').find('li').should('have.length', this.contributors.contributors.length)
    })

    it(`doesn't render if not set`, function () {
      cy.window().then(setState(this.episode, this.audio, this.show))
      cy.tab('info')
      cy.get('#tabs--info--speakers').should('not.exist')
    })
  })
})
