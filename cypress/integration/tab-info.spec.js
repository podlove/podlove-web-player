/* eslint-env mocha */
/* globals cy, expect */
const { setState } = require('../helpers/state')
const domSelectors = require('../selectors')

const allowedMarkup = [
  '<strong>bold text</strong>',
  '<em>italic text</em>',
  '<i>also italic text</i>',
  '<br>',
  '<p>A paragraph</p>',
  '<ul>',
  '<li>A unordered list item</li>',
  '<li>Another unordered list item</li>',
  '</ul>',
  '<ol>',
  '<li>An ordered list item</li>',
  '<li>Another ordered list item</li>',
  '</ol>',
  {
    test: '<a href="/path/to/somewhere">A link</a>',
    expected: '<a target="_blank" href="/path/to/somewhere">A link</a>'
  }
]

const prohibitedMarkup = [
  '<script>foo</script>',
  '<iframe />'
]

describe('Info Tab', () => {
  let selectors

  beforeEach(cy.bootstrap)
  beforeEach(() => {
    selectors = domSelectors(cy)
  })

  describe('Episode', () => {
    describe('Title', () => {
      it('renders', function () {
        cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
        cy.tab('info')
        selectors.tabs.info.episode.title().contains(this.episode.title)
      })

      it(`doesn't render if not set`, function () {
        delete this.episode.title
        cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
        cy.tab('info')
        selectors.tabs.info.episode.title().should('not.exist')
      })
    })

    describe('Release Date', () => {
      it('renders', function () {
        cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
        cy.tab('info')
        selectors.tabs.info.episode.meta().contains('11/2/2999')
      })

      it(`doesn't render if not set`, function () {
        delete this.episode.publicationDate
        cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
        cy.tab('info')
        selectors.tabs.info.episode.meta().should('not.contain', '11/2/2999')
      })
    })

    describe('Duration', () => {
      it('renders', function () {
        cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
        cy.tab('info')
        selectors.tabs.info.episode.meta().contains('0')
      })

      it(`doesn't render if not set`, function () {
        delete this.episode.duration
        delete this.episode.publicationDate
        cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
        cy.tab('info')
        selectors.tabs.info.episode.meta().should('not.contain', '0')
      })
    })

    describe('Subtitle', () => {
      it('renders', function () {
        cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
        cy.tab('info')
        selectors.tabs.info.episode.subtitle().contains(this.episode.subtitle)
      })

      it(`doesn't render if not set`, function () {
        delete this.episode.subtitle

        cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
        cy.tab('info')
        selectors.tabs.info.episode.subtitle().should('not.exist')
      })
    })

    describe('Summary', () => {
      it('renders', function () {
        cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
        cy.tab('info')
        selectors.tabs.info.episode.summary().contains(this.episode.summary)
      })

      it(`doesn't render if not set`, function () {
        delete this.episode.summary

        cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
        cy.tab('info')
        selectors.tabs.info.episode.summary().should('not.exist')
      })

      it(`allows custom markup`, function () {
        this.episode.summary = allowedMarkup.map(input => {
          if (typeof input === 'string') {
            return input
          }

          return input.test
        }).join('')

        cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
        cy.tab('info')
        selectors.tabs.info.episode.summary().then($el => {
          const summaryHtml = $el.html()
          allowedMarkup.forEach(markup => {
            let expected
            if (typeof markup === 'string') {
              expected = markup
            } else {
              expected = markup.expected
            }

            expect(summaryHtml).to.contain(expected)
          })
        })
      })

      it(`doesn't allow malicious markup`, function () {
        this.episode.summary = ['foo', ...prohibitedMarkup].join('')

        cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
        cy.tab('info')
        selectors.tabs.info.episode.summary().then($el => {
          const summaryHtml = $el.html()

          prohibitedMarkup.forEach(markup => {
            expect(summaryHtml).not.to.contain(markup)
          })
        })
      })
    })

    describe('Link', () => {
      it('renders', function () {
        cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
        cy.tab('info')
        selectors.tabs.info.episode.link().should('have.attr', 'href', this.episode.link)
      })

      it(`doesn't render if not set`, function () {
        delete this.episode.link

        cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
        cy.tab('info')
        selectors.tabs.info.episode.link().should('not.exist')
      })
    })
  })

  describe('Show', () => {
    describe('Title', () => {
      it('renders', function () {
        cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
        cy.tab('info')
        selectors.tabs.info.show.title().contains(this.show.show.title)
      })

      it(`doesn't render if not set`, function () {
        delete this.show.show.title
        cy.window().then(setState(this.show, this.audio, this.show))
        cy.tab('info')
        selectors.tabs.info.show.title().should('not.exist')
      })
    })

    describe('Poster', () => {
      it('renders', function () {
        cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
        cy.tab('info')
        selectors.tabs.info.show.poster().should('have.attr', 'src', this.show.show.poster)
      })

      it(`doesn't render if not set`, function () {
        delete this.show.show.poster
        cy.window().then(setState(this.show, this.audio, this.show))
        cy.tab('info')
        selectors.tabs.info.show.poster().should('not.exist')
      })
    })

    describe('Summary', () => {
      it('renders', function () {
        cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
        cy.tab('info')
        selectors.tabs.info.show.summary().contains(this.show.show.summary)
      })

      it(`doesn't render if not set`, function () {
        delete this.show.show.summary
        cy.window().then(setState(this.show, this.audio, this.show))
        cy.tab('info')
        selectors.tabs.info.show.summary().should('not.exist')
      })

      it(`allows custom markup`, function () {
        this.show.show.summary = allowedMarkup.map(input => {
          if (typeof input === 'string') {
            return input
          }

          return input.test
        }).join('')

        cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
        cy.tab('info')
        selectors.tabs.info.show.summary().then($el => {
          const summaryHtml = $el.html()
          allowedMarkup.forEach(markup => {
            let expected
            if (typeof markup === 'string') {
              expected = markup
            } else {
              expected = markup.expected
            }

            expect(summaryHtml).to.contain(expected)
          })
        })
      })

      it(`doesn't allow malicious markup`, function () {
        this.show.show.summary = ['foo', ...prohibitedMarkup].join('')

        cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
        cy.tab('info')
        selectors.tabs.info.show.summary().then($el => {
          const summaryHtml = $el.html()

          prohibitedMarkup.forEach(markup => {
            expect(summaryHtml).not.to.contain(markup)
          })
        })
      })
    })

    describe('Link', () => {
      it('renders', function () {
        cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
        cy.tab('info')
        selectors.tabs.info.show.link().should('have.attr', 'href', this.show.show.link)
      })

      it(`doesn't render if not set`, function () {
        delete this.show.show.link

        cy.window().then(setState(this.show, this.audio, this.show))
        cy.tab('info')
        selectors.tabs.info.show.link().should('not.exist')
      })
    })
  })

  describe('Contributors', () => {
    it('renders a list', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.contributors))
      cy.tab('info')
      selectors.tabs.info.speakers().find('li').should('have.length', this.contributors.contributors.length)
    })

    it(`doesn't render if not set`, function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.runtime))
      cy.tab('info')
      selectors.tabs.info.speakers().should('not.exist')
    })
  })
})
