/* eslint-env mocha */
/* globals cy, expect */
const { setState } = require('../helpers/state')
const domSelectors = require('../selectors')

describe('Audio Tab', () => {
  let selectors

  beforeEach(cy.bootstrap)
  beforeEach(() => {
    selectors = domSelectors(cy)
  })

  describe('Volume', () => {
    it('renders a volume slider at 100%', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('audio')
      selectors.tabs.audio.volume.current().should('have.value', '100')
    })

    it('sets the volume to 0% when input set to 0', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('audio')
      selectors.tabs.audio.volume.current().should('have.value', '100')
      selectors.tabs.audio.volume.input().invoke('val', 0).trigger('input')
      selectors.tabs.audio.volume.current().should('have.value', '0')
    })

    it('mutes the audio when the mute button is pressed', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('audio')
      selectors.tabs.audio.volume.current().should('have.value', '100')
      selectors.tabs.audio.volume.mute().click()
      selectors.tabs.audio.volume.current().should('have.value', '0')
    })

    it('resets the audio to the previous state when mute is pressed twice', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('audio')
      selectors.tabs.audio.volume.current().should('have.value', '100')
      selectors.tabs.audio.volume.input().invoke('val', 0.5).trigger('input')
      selectors.tabs.audio.volume.current().should('have.value', '50')
      selectors.tabs.audio.volume.mute().click()
      selectors.tabs.audio.volume.current().should('have.value', '0')
      selectors.tabs.audio.volume.mute().click()
      selectors.tabs.audio.volume.current().should('have.value', '50')
    })

    it('sets the volume to 100% when the input slider is double Clicked', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('audio')
      selectors.tabs.audio.volume.current().should('have.value', '100')
      selectors.tabs.audio.volume.input().invoke('val', 0.5).trigger('input')
      selectors.tabs.audio.volume.current().should('have.value', '50')
      selectors.tabs.audio.volume.input().dblclick()
      selectors.tabs.audio.volume.current().should('have.value', '100')
    })
  })

  describe('Rate', () => {
    it('renders a rate slider at 100%', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('audio')
      selectors.tabs.audio.rate.current().should('have.value', '1.00')
    })

    it('sets the rate to 50% when input set to 0', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('audio')
      selectors.tabs.audio.rate.current().should('have.value', '1.00')
      selectors.tabs.audio.rate.input().invoke('val', 0).trigger('input')
      selectors.tabs.audio.rate.current().should('have.value', '0.50')
    })

    it('sets the rate to 400% when input set to 1', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('audio')
      selectors.tabs.audio.rate.current().should('have.value', '1.00')
      selectors.tabs.audio.rate.input().invoke('val', 1).trigger('input')
      selectors.tabs.audio.rate.current().should('have.value', '4.00')
    })

    it('sets the rate to 100% when the input slider is double Clicked', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('audio')
      selectors.tabs.audio.rate.current().should('have.value', '1.00')
      selectors.tabs.audio.rate.input().invoke('val', 0.25).trigger('input')
      selectors.tabs.audio.rate.current().should('have.value', '0.75')
      selectors.tabs.audio.rate.input().dblclick()
      selectors.tabs.audio.rate.current().should('have.value', '1.00')
    })
  })

  describe('Channels', () => {
    it('sets stereo on default', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('audio')
      selectors.tabs.audio.channels.mono().should('not.have.attr', 'active')
      selectors.tabs.audio.channels.stereo().should('have.attr', 'active')
    })

    it('sets the channel to mono', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('audio')
      selectors.tabs.audio.channels.mono().click()
      selectors.tabs.audio.channels.mono().should('have.attr', 'active')
      selectors.tabs.audio.channels.stereo().should('not.have.attr', 'active')
    })

    it('sets the channel to stereo', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('audio')
      selectors.tabs.audio.channels.mono().click()
      selectors.tabs.audio.channels.mono().should('have.attr', 'active')
      selectors.tabs.audio.channels.stereo().should('not.have.attr', 'active')
      selectors.tabs.audio.channels.stereo().click()
      selectors.tabs.audio.channels.mono().should('not.have.attr', 'active')
      selectors.tabs.audio.channels.stereo().should('have.attr', 'active')
    })
  })
})
