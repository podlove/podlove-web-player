/* eslint-env mocha */
/* globals cy,expect */
const { capitalize } = require('lodash')
const { setState } = require('../helpers/state')
const domSelectors = require('../selectors')

describe('Share Tab', () => {
  let selectors

  beforeEach(cy.bootstrap)
  beforeEach(() => {
    selectors = domSelectors(cy)
  })

  describe('Content', () => {
    it('has a button that selects the show', function () {
      cy.window().then(setState(this.episode, this.audio, this.show))
      cy.tab('share')
      selectors.tabs.share.content.show().click().should('have.class', 'active')
      selectors.tabs.share.content.show().contains(this.show.show.title)
    })

    it('has no button that selects the show if the show link is missing', function () {
      cy.window().then(setState(this.episode, this.audio))
      cy.tab('share')
      selectors.tabs.share.content.show().should('not.exist')
    })

    it('has a button that selects the episode', function () {
      cy.window().then(setState(this.episode, this.audio, this.show))
      cy.tab('share')
      selectors.tabs.share.content.episode().click().should('have.class', 'active')
      selectors.tabs.share.content.episode().contains(this.episode.title)
    })

    it('has a button that selects the current chapter', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 8000 }))
      cy.tab('share')
      selectors.tabs.share.content.chapter().click().should('have.class', 'active')
      selectors.tabs.share.content.chapter().contains(this.chapters.chapters[1].title)
    })

    it(`has no current chapter button if chapters aren't available`, function () {
      cy.window().then(setState(this.episode, this.audio, this.show))
      cy.tab('share')
      selectors.tabs.share.content.chapter().should('not.exist')
    })

    it(`has a button that selects the current playtime`, function () {
      cy.window().then(setState(this.episode, this.audio, this.show, { playtime: 8000 }))
      cy.tab('share')
      selectors.tabs.share.content.time().click().should('have.class', 'active')
      selectors.tabs.share.content.time().contains('00:08')
    })
  })

  describe('Channels', () => {
    Object.keys(domSelectors(cy).tabs.share.channels).filter(channel => channel !== 'embed').forEach(channel => {
      describe(capitalize(channel), () => {
        it('renders a link', function () {
          cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 8000 }))
          cy.tab('share')
          selectors.tabs.share.channels[channel]()
        })

        it('creates a share link for the show', function () {
          cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 8000 }))
          cy.tab('share')
          selectors.tabs.share.content.show().click()
          selectors.tabs.share.channels[channel]().then(link => {
            expect(link.attr('href')).to.contain(this.show.show.link)
          })
        })

        it('creates a share link for the episode', function () {
          cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 8000 }))
          cy.tab('share')
          selectors.tabs.share.content.episode().click()
          selectors.tabs.share.channels[channel]().then(link => {
            expect(link.attr('href')).to.contain(this.episode.link)
          })
        })

        it('creates a share link for the current chapter', function () {
          cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 8000 }))
          cy.tab('share')
          selectors.tabs.share.content.chapter().click()
          selectors.tabs.share.channels[channel]().then(link => {
            expect(link.attr('href')).to.contain(`${this.episode.link}?t=00:08,00:10`)
          })
        })

        it('creates a share link for the current playtime', function () {
          cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 8000 }))
          cy.tab('share')
          selectors.tabs.share.content.time().click()
          selectors.tabs.share.channels[channel]().then(link => {
            expect(link.attr('href')).to.contain(`${this.episode.link}?t=00:08`)
          })
        })
      })
    })

    describe('Embed', () => {
      it(`renders when a reference is available`, function () {
        cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 8000 }, this.reference))
        cy.tab('share')
        selectors.tabs.share.content.episode().click()
        selectors.tabs.share.channels.embed()
      })

      it(`doesn't render when no reference is available`, function () {
        cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 8000 }))
        cy.tab('share')
        selectors.tabs.share.content.episode().click()
        selectors.tabs.share.channels.embed().should('not.exist')
      })

      it(`doesn't render when a reference is available but show is selected`, function () {
        cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 8000 }, this.reference))
        cy.tab('share')
        selectors.tabs.share.content.show().click()
        selectors.tabs.share.channels.embed().should('not.exist')
      })
    })
  })

  describe('Share Overlay', () => {
    const embedCode = (url, width = '320', height = '400') => `<iframe title="Podlove Web Player: Belligerent and numerous. - And until then, I can never die?" width="${width}" height="${height}" src="http://localhost:8080/share?${url}" frameborder="0" scrolling="no" tabindex="0"></iframe>`

    it(`opens when the embed link is clicked`, function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 8000 }, this.reference))
      cy.tab('share')
      selectors.tabs.share.content.episode().click()
      selectors.tabs.share.channels.embed().click()
      selectors.tabs.share.overlay.modal()
    })

    it(`opens when the embed link is clicked`, function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 8000 }, this.reference))
      cy.tab('share')
      selectors.tabs.share.content.episode().click()
      selectors.tabs.share.channels.embed().click()
      selectors.tabs.share.overlay.modal().should('have.class', 'open')
    })

    it(`closes the overlay when the close button is clicked`, function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 8000 }, this.reference))
      cy.tab('share')
      selectors.tabs.share.content.episode().click()
      selectors.tabs.share.channels.embed().click()
      selectors.tabs.share.overlay.modal()
      selectors.tabs.share.overlay.close().then(item => {
        item.click()
        selectors.tabs.share.overlay.modal().should('not.have.class', 'open')
      })
    })

    describe('Content', () => {
      it(`creates a embed link for the episode`, function () {
        cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 8000 }, this.reference))
        cy.tab('share')
        selectors.tabs.share.content.episode().click()
        selectors.tabs.share.channels.embed().click()
        selectors.tabs.share.overlay.code().should('have.value', embedCode('episode=//localhost:8080/fixtures/example.json'))
      })

      it(`creates a embed link for the chapter`, function () {
        cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 8000 }, this.reference))
        cy.tab('share')
        selectors.tabs.share.content.chapter().click()
        selectors.tabs.share.channels.embed().click()
        selectors.tabs.share.overlay.code().should('have.value', embedCode('episode=//localhost:8080/fixtures/example.json&t=00:08,00:10'))
      })

      it(`creates a embed link for the playtime`, function () {
        cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 8000 }, this.reference))
        cy.tab('share')
        selectors.tabs.share.content.time().click()
        selectors.tabs.share.channels.embed().click()
        selectors.tabs.share.overlay.code().should('have.value', embedCode('episode=//localhost:8080/fixtures/example.json&t=00:08'))
      })
    })

    describe('Dimensions', () => {
      const dimensions = ['250x400', '320x400', '375x400', '600x290', '768x290']

      dimensions.forEach(dimension => {
        it(`adapts the embed code to a dimension of ${dimension}`, function () {
          const [width, height] = dimension.split('x')
          cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 8000 }, this.reference))
          cy.tab('share')
          selectors.tabs.share.content.episode().click()
          selectors.tabs.share.channels.embed().click()
          selectors.tabs.share.overlay.size().select(dimension)
          selectors.tabs.share.overlay.code().should('have.value', embedCode('episode=//localhost:8080/fixtures/example.json', width, height))
        })
      })
    })

    describe('Copy Link', () => {
      it('renders with the show link', function () {
        cy.window().then(setState(this.episode, this.audio, this.show))
        cy.tab('share')
        selectors.tabs.share.content.show().click()
        selectors.tabs.share.overlay.input().should('have.value', this.show.show.link)
      })

      it('renders episode link', function () {
        cy.window().then(setState(this.episode, this.audio, this.show))
        cy.tab('share')
        selectors.tabs.share.content.episode().click()
        selectors.tabs.share.overlay.input().should('have.value', this.episode.link)
      })

      it('renders episode link with current chapter time stamps', function () {
        cy.window().then(setState(this.episode, this.audio, this.chapters, this.show, { playtime: 8000 }))
        cy.tab('share')
        selectors.tabs.share.content.chapter().click()
        selectors.tabs.share.overlay.input().should('have.value', `${this.episode.link}?t=00:08,00:10`)
      })

      it('renders episode link with current time stamp', function () {
        cy.window().then(setState(this.episode, this.audio, this.show, { playtime: 8000 }))
        cy.tab('share')
        selectors.tabs.share.content.time().click()
        selectors.tabs.share.overlay.input().should('have.value', `${this.episode.link}?t=00:08`)
      })

      it('does not render the episode input if no episode url is available', function () {
        delete this.episode.link
        cy.window().then(setState(this.episode, this.audio, this.show))
        cy.tab('share')
        selectors.tabs.share.content.episode().click()
        selectors.tabs.share.overlay.input().should('not.exist')
      })
    })
  })
})
