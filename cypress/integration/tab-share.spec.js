/* eslint-env mocha */
/* globals cy,expect */
const { setState } = require('../helpers/state')

describe('Share Tab', () => {
  beforeEach(cy.bootstrap)

  describe('Content', () => {
    it('has a button that selects the show', function () {
      cy.window().then(setState(this.episode, this.audio, this.show))
      cy.tab('share')
      cy.get('#tab-share--content--show').click().should('have.class', 'active')
      cy.contains('#tab-share--content--show', this.show.show.title)
    })

    it('has no button that selects the show if the show link is missing', function () {
      cy.window().then(setState(this.episode, this.audio))
      cy.tab('share')
      cy.get('#tab-share--content--show').should('not.exist')
    })

    it('has a button that selects the episode', function () {
      cy.window().then(setState(this.episode, this.audio, this.show))
      cy.tab('share')
      cy.get('#tab-share--content--episode').click().should('have.class', 'active')
      cy.contains('#tab-share--content--episode', this.episode.title)
    })

    it('has a button that selects the current chapter', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 8000 }))
      cy.tab('share')
      cy.get('#tab-share--content--chapter').click().should('have.class', 'active')
      cy.contains('#tab-share--content--chapter', this.chapters.chapters[1].title)
    })

    it(`has no current chapter button if chapters aren't available`, function () {
      cy.window().then(setState(this.episode, this.audio, this.show))
      cy.tab('share')
      cy.get('#tab-share--content--chapter').should('not.exist')
    })

    it(`has a button that selects the current playtime`, function () {
      cy.window().then(setState(this.episode, this.audio, this.show, { playtime: 8000 }))
      cy.tab('share')
      cy.get('#tab-share--content--time').click().should('have.class', 'active')
      cy.contains('#tab-share--content--time', '00:08')
    })
  })

  describe('Channels', () => {
    const channels = ['twitter', 'reddit', 'google-plus', 'mail', 'pinterest']

    channels.forEach(channel => {
      describe(channel, () => {
        it('renders a link', function () {
          cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 8000 }))
          cy.tab('share')
          cy.get(`#tab-share--channels--${channel} a`)
        })

        it('creates a share link for the show', function () {
          cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 8000 }))
          cy.tab('share')
          cy.get('#tab-share--content--show').click()
          cy.get(`#tab-share--channels--${channel} a`).then(link => {
            expect(link.attr('href')).to.contain(this.show.show.link)
          })
        })

        it('creates a share link for the episode', function () {
          cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 8000 }))
          cy.tab('share')
          cy.get('#tab-share--content--episode').click()
          cy.get(`#tab-share--channels--${channel} a`).then(link => {
            expect(link.attr('href')).to.contain(this.episode.link)
          })
        })

        it('creates a share link for the current chapter', function () {
          cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 8000 }))
          cy.tab('share')
          cy.get('#tab-share--content--chapter').click()
          cy.get(`#tab-share--channels--${channel} a`).then(link => {
            expect(link.attr('href')).to.contain(`${this.episode.link}?t=00:08,00:10`)
          })
        })

        it('creates a share link for the current playtime', function () {
          cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 8000 }))
          cy.tab('share')
          cy.get('#tab-share--content--time').click()
          cy.get(`#tab-share--channels--${channel} a`).then(link => {
            expect(link.attr('href')).to.contain(`${this.episode.link}?t=00:08`)
          })
        })
      })
    })

    describe('Embed', () => {
      it(`renders when a reference is available`, function () {
        cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 8000 }, this.reference))
        cy.tab('share')
        cy.get('#tab-share--content--episode').click()
        cy.get(`#tab-share--channels--embed a`)
      })

      it(`doesn't render when no reference is available`, function () {
        cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 8000 }))
        cy.tab('share')
        cy.get('#tab-share--content--episode').click()
        cy.get(`#tab-share--channels--embed a`).should('not.exist')
      })

      it(`doesn't render when a reference is available but show is selected`, function () {
        cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 8000 }, this.reference))
        cy.tab('share')
        cy.get('#tab-share--content--show').click()
        cy.get(`#tab-share--channels--embed a`).should('not.exist')
      })
    })
  })

  describe('Share Overlay', () => {
    const embedCode = (url, width = '320', height = '400') => `<iframe width="${width}" height="${height}" src="http://localhost:8080/share?${url}" frameborder="0" scrolling="no"></iframe>`

    it(`opens when the embed link is clicked`, function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 8000 }, this.reference))
      cy.tab('share')
      cy.get('#tab-share--content--episode').click()
      cy.get('#tab-share--channels--embed a').click()
      cy.get('#share-tab--share-overlay')
    })

    it(`opens when the embed link is clicked`, function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 8000 }, this.reference))
      cy.tab('share')
      cy.get('#tab-share--content--episode').click()
      cy.get('#tab-share--channels--embed a').click()
      cy.get('#share-tab--share-overlay').should('have.class', 'open')
    })

    it(`closes the overlay when the close button is clicked`, function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 8000 }, this.reference))
      cy.tab('share')
      cy.get('#tab-share--content--episode').click()
      cy.get('#tab-share--channels--embed a').click()
      cy.get('#share-tab--share-overlay')
      cy.get('#share-tab--share-overlay .overlay-close').then(item => {
        item.click()
        cy.get('#share-tab--share-overlay').should('not.have.class', 'open')
      })
    })

    describe('Content', () => {
      it(`creates a embed link for the episode`, function () {
        cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 8000 }, this.reference))
        cy.tab('share')
        cy.get('#tab-share--content--episode').click()
        cy.get('#tab-share--channels--embed a').click()
        cy.get('#share-tab--share-overlay--code').should('have.value', embedCode('episode=//localhost:8080/fixtures/example.json'))
      })

      it(`creates a embed link for the chapter`, function () {
        cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 8000 }, this.reference))
        cy.tab('share')
        cy.get('#tab-share--content--chapter').click()
        cy.get('#tab-share--channels--embed a').click()
        cy.get('#share-tab--share-overlay--code').should('have.value', embedCode('episode=//localhost:8080/fixtures/example.json&t=00:08,00:10'))
      })

      it(`creates a embed link for the playtime`, function () {
        cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 8000 }, this.reference))
        cy.tab('share')
        cy.get('#tab-share--content--time').click()
        cy.get('#tab-share--channels--embed a').click()
        cy.get('#share-tab--share-overlay--code').should('have.value', embedCode('episode=//localhost:8080/fixtures/example.json&t=00:08'))
      })
    })

    describe('Dimensions', () => {
      const dimensions = ['250x400', '320x400', '375x400', '600x290', '768x290']

      dimensions.forEach(dimension => {
        it(`adapts the embed code to a dimension of ${dimension}`, function () {
          const [width, height] = dimension.split('x')
          cy.window().then(setState(this.episode, this.audio, this.show, this.chapters, { playtime: 8000 }, this.reference))
          cy.tab('share')
          cy.get('#tab-share--content--episode').click()
          cy.get('#tab-share--channels--embed a').click()
          cy.get('#share-tab--share-overlay--size').select(dimension)
          cy.get('#share-tab--share-overlay--code').should('have.value', embedCode('episode=//localhost:8080/fixtures/example.json', width, height))
        })
      })
    })

    describe('Copy Link', () => {
      it('renders with the show link', function () {
        cy.window().then(setState(this.episode, this.audio, this.show))
        cy.tab('share')
        cy.get('#tab-share--content--show').click()
        cy.get('#tab-share--share-link--input').should('have.value', this.show.show.link)
      })

      it('renders episode link', function () {
        cy.window().then(setState(this.episode, this.audio, this.show))
        cy.tab('share')
        cy.get('#tab-share--content--episode').click()
        cy.get('#tab-share--share-link--input').should('have.value', this.episode.link)
      })

      it('renders episode link with current chapter time stamps', function () {
        cy.window().then(setState(this.episode, this.audio, this.chapters, this.show, { playtime: 8000 }))
        cy.tab('share')
        cy.get('#tab-share--content--chapter').click()
        cy.get('#tab-share--share-link--input').should('have.value', `${this.episode.link}?t=00:08,00:10`)
      })

      it('renders episode link with current time stamp', function () {
        cy.window().then(setState(this.episode, this.audio, this.show, { playtime: 8000 }))
        cy.tab('share')
        cy.get('#tab-share--content--time').click()
        cy.get('#tab-share--share-link--input').should('have.value', `${this.episode.link}?t=00:08`)
      })

      it('does not render the episode input if no episode url is available', function () {
        delete this.episode.link
        cy.window().then(setState(this.episode, this.audio, this.show))
        cy.tab('share')
        cy.get('#tab-share--content--episode').click()
        cy.get('#tab-share--share-link--input').should('not.exist')
      })
    })
  })
})
