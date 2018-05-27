/* eslint-env mocha */
/* globals cy */

describe('Url Parameters', () => {
  describe('Start Time', () => {
    beforeEach(() => {
      cy.embed({ t: '00:02' })
    })

    it('should show the play button', () => {
      cy.get('iframe').iframe().find('#control-bar--play-button--play')
    })

    it('should start the player at a given time', () => {
      cy.get('iframe').iframe().find('#progress-bar--timer-current').contains('00:02')
    })
  })

  describe('End Time', () => {
    beforeEach(() => {
      cy.embed({ t: '00:01,00:02' })
    })

    it('should show the play button', () => {
      cy.get('iframe').iframe().find('#control-bar--play-button--play')
    })

    it('should start the player at a given time', () => {
      cy.get('iframe').iframe().find('#progress-bar--timer-current').contains('00:01')
    })

    it('should end the player at a given time', () => {
      cy.get('iframe').iframe().find('#control-bar--play-button').click()
      cy.wait(2000)
      cy.get('iframe').iframe().find('#control-bar--play-button--play')
      cy.get('iframe').iframe().find('#progress-bar--timer-current').contains('00:02')
    })
  })

  describe('Autoplay', () => {
    beforeEach(() => {
      cy.embed({ autoplay: true })
    })

    it('should play the episode instantly', () => {
      cy.get('iframe').iframe().find('#control-bar--play-button--pause')
    })
  })
})
