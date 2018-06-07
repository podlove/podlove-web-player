/* eslint-env mocha */
/* globals cy,expect */
const {
  setState
} = require('../helpers/state')
const domSelectors = require('../selectors')

const components = exclude => [
  'tabInfo',
  'tabChapters',
  'tabDownload',
  'tabAudio',
  'tabShare',
  'poster',
  'showTitle',
  'episodeTitle',
  'subtitle',
  'progressbar',
  'controlSteppers',
  'controlChapters'
].filter(tab => tab !== exclude)

describe('Visible Components', () => {
  let selectors

  beforeEach(cy.bootstrap)
  beforeEach(() => {
    selectors = domSelectors(cy)
  })

  describe('Default', () => {
    beforeEach(function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.runtime, this.chapters))
    })
    it('renders the info tab', function () {
      selectors.tabs.info.header()
    })

    it('renders the chapters tab', function () {
      selectors.tabs.chapters.header()
    })

    it('renders the audio tab', function () {
      selectors.tabs.audio.header()
    })

    it('renders the download tab', function () {
      selectors.tabs.download.header()
    })

    it('renders the share tab', function () {
      selectors.tabs.share.header()
    })

    it('renders the header poster', function () {
      selectors.headerPosterContainer()
    })

    it('renders the show title', function () {
      selectors.show.title()
    })

    it('renders the subtitle', function () {
      selectors.episode.subtitle()
    })

    it('renders the stepper controls', function () {
      cy.play()
      cy.pause()

      selectors.controls.steppers.forward()
      selectors.controls.steppers.back()
    })

    it('renders the chapter controls', function () {
      cy.play()
      cy.pause()

      selectors.controls.chapters.next()
      selectors.controls.chapters.back()
    })
  })

  describe('Tabs', () => {
    [{
      tab: 'info',
      key: 'tabInfo'
    }, {
      tab: 'chapters',
      key: 'tabChapters'
    }, {
      tab: 'download',
      key: 'tabDownload'
    }, {
      tab: 'audio',
      key: 'tabAudio'
    }, {
      tab: 'share',
      key: 'tabShare'
    }].forEach(item => {
      it(`hides the ${item.tab} tab if '${item.key}' is not specified`, function () {
        cy.window().then(setState(this.episode, this.audio, this.show, this.runtime, this.chapters, {
          visibleComponents: components(item.key)
        }))
        cy.get('#tabs')
        selectors.tabs[item.tab].header().should('not.exist')
      })
    })
  })

  describe('Header', () => {
    it(`hides the Poster if 'poster' is not specified`, function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.runtime, this.chapters, {
        visibleComponents: components('poster')
      }))

      cy.get('#header-info')
      selectors.headerPosterContainer().should('not.exist')
    })

    it(`hides the Show Title if 'showTitle' is not specified`, function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.runtime, this.chapters, {
        visibleComponents: components('showTitle')
      }))

      cy.get('#header-info')
      selectors.show.title().should('not.exist')
    })

    it(`hides the Episode Title if 'episodeTitle' is not specified`, function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.runtime, this.chapters, {
        visibleComponents: components('episodeTitle')
      }))

      cy.get('#header-info')
      selectors.episode.title().should('not.exist')
    })

    it(`hides the Subtitle if 'subtitle' is not specified`, function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.runtime, this.chapters, {
        visibleComponents: components('subtitle')
      }))

      cy.get('#header-info')
      selectors.episode.subtitle().should('not.exist')
    })
  })

  describe('Controllbar', () => {
    it(`hides the stepper controls if 'controlSteppers' is not specified`, function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.runtime, this.chapters, {
        visibleComponents: components('controlSteppers')
      }))

      cy.play()
      cy.pause()

      selectors.controls.steppers.forward().should('not.exist')
      selectors.controls.steppers.back().should('not.exist')
    })

    it(`hides the chapter controls if 'controlChapters' is not specified`, function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.runtime, this.chapters, {
        visibleComponents: components('controlChapters')
      }))

      cy.play()
      cy.pause()

      selectors.controls.chapters.next().should('not.exist')
      selectors.controls.chapters.back().should('not.exist')
    })
  })

  /*
  'progressbar'
  */
  describe('Progressbar', () => {
    it(`hides the progressbar if 'progressbar' is not specified`, function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.runtime, this.chapters, {
        visibleComponents: components('progressbar')
      }))

      cy.play()
      cy.pause()

      selectors.progressbar().should('not.exist')
    })
  })
})
