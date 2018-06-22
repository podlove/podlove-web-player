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
      selectors.tabs.audio.volume.current().contains('100%')
    })

    it('sets the volume to 0% when input set to 0', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('audio')
      selectors.tabs.audio.volume.current().contains('100%')
      selectors.tabs.audio.volume.input().invoke('val', 0).trigger('input')
      selectors.tabs.audio.volume.current().contains('0%')
    })

    it('mutes the audio when the mute button is pressed', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('audio')
      selectors.tabs.audio.volume.current().contains('100%')
      selectors.tabs.audio.volume.mute().click()
      selectors.tabs.audio.volume.current().contains('0%')
    })

    it('resets the audio to the previous state when mute is pressed twice', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('audio')
      selectors.tabs.audio.volume.current().contains('100%')
      selectors.tabs.audio.volume.input().invoke('val', 0.5).trigger('input')
      selectors.tabs.audio.volume.current().contains('50%')
      selectors.tabs.audio.volume.mute().click()
      selectors.tabs.audio.volume.current().contains('0%')
      selectors.tabs.audio.volume.mute().click()
      selectors.tabs.audio.volume.current().contains('50%')
    })

    it.only('sets the volume to 100% when the input slider is double Clicked', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('audio')
      selectors.tabs.audio.volume.current().contains('100%')
      selectors.tabs.audio.volume.input().invoke('val', 0.5).trigger('input')
      selectors.tabs.audio.volume.current().contains('50%')
      selectors.tabs.audio.volume.input().dblclick()
      selectors.tabs.audio.volume.current().contains('100%')
    })

  })

  describe('Rate', () => {
    it('renders a rate slider at 100%', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('audio')
      selectors.tabs.audio.rate.current().contains('100%')
    })

    it('sets the rate to 50% when input set to 0', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('audio')
      selectors.tabs.audio.rate.current().contains('100%')
      selectors.tabs.audio.rate.input().invoke('val', 0).trigger('input')
      selectors.tabs.audio.rate.current().contains('50%')
    })

    it('sets the rate to 400% when input set to 1', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('audio')
      selectors.tabs.audio.rate.current().contains('100%')
      selectors.tabs.audio.rate.input().invoke('val', 1).trigger('input')
      selectors.tabs.audio.rate.current().contains('400%')
    })

    it('rate plus button increases the rate by 5%', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('audio')
      selectors.tabs.audio.rate.current().contains('100%')
      selectors.tabs.audio.rate.increase().click()
      selectors.tabs.audio.rate.current().contains('105%')
    })

    it('rate plus button rounds odd rates by 5%', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('audio')
      selectors.tabs.audio.rate.current().contains('100%')
      selectors.tabs.audio.rate.input().invoke('val', 0.51).trigger('input')
      selectors.tabs.audio.rate.current().contains('106%')
      selectors.tabs.audio.rate.increase().click()
      selectors.tabs.audio.rate.current().contains('110%')
    })

    it('rate minus button decreases the rate by 5%', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('audio')
      selectors.tabs.audio.rate.current().contains('100%')
      selectors.tabs.audio.rate.decrease().click()
      selectors.tabs.audio.rate.current().contains('95%')
    })

    it('rate minus button rounds odd rates by 5%', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('audio')
      selectors.tabs.audio.rate.current().contains('100%')
      selectors.tabs.audio.rate.input().invoke('val', 0.51).trigger('input')
      selectors.tabs.audio.rate.current().contains('106%')
      selectors.tabs.audio.rate.decrease().click()
      selectors.tabs.audio.rate.current().contains('100%')
    })

    it('sets the rate to 100% when the input slider is double Clicked', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('audio')
      selectors.tabs.audio.rate.current().contains('100%')
      selectors.tabs.audio.rate.input().invoke('val', 0.5).trigger('input')
      selectors.tabs.audio.rate.current().contains('50%')
      selectors.tabs.audio.volume.input().dblclick()
      selectors.tabs.audio.rate.current().contains('100%')
    })

  })
})
