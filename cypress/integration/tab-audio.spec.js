/* eslint-env mocha */
/* globals cy, expect */
const { setState } = require('../helpers/state')

describe('Audio Tab', () => {
  beforeEach(cy.bootstrap)

  describe('Volume', () => {
    it('renders a volume slider at 100%', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('audio')
      cy.contains('#tab-audio--volume--current', '100%')
    })

    it('sets the volume to 0% when input set to 0', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('audio')
      cy.contains('#tab-audio--volume--current', '100%')
      cy.get('#tab-audio--volume--input input').invoke('val', 0).trigger('input')
      cy.contains('#tab-audio--volume--current', '0%')
    })

    it('mutes the audio when the mute button is pressed', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('audio')
      cy.contains('#tab-audio--volume--current', '100%')
      cy.get('#tab-audio--volume--mute').click()
      cy.contains('#tab-audio--volume--current', '0%')
    })

    it('resets the audio to the previous state when mute is pressed twice', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('audio')
      cy.contains('#tab-audio--volume--current', '100%')
      cy.get('#tab-audio--volume--input input').invoke('val', 0.5).trigger('input')
      cy.contains('#tab-audio--volume--current', '50%')
      cy.get('#tab-audio--volume--mute').click()
      cy.contains('#tab-audio--volume--current', '0%')
      cy.get('#tab-audio--volume--mute').click()
      cy.contains('#tab-audio--volume--current', '50%')
    })
  })

  describe('Rate', () => {
    it('renders a rate slider at 100%', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('audio')
      cy.contains('#tab-audio--rate--current', '100%')
    })

    it('sets the rate to 50% when input set to 0', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('audio')
      cy.contains('#tab-audio--rate--current', '100%')
      cy.get('#tab-audio--rate--input input').invoke('val', 0).trigger('input')
      cy.contains('#tab-audio--rate--current', '50%')
    })

    it('sets the rate to 400% when input set to 1', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('audio')
      cy.contains('#tab-audio--rate--current', '100%')
      cy.get('#tab-audio--rate--input input').invoke('val', 1).trigger('input')
      cy.contains('#tab-audio--rate--current', '400%')
    })

    it('rate plus button increases the rate by 5%', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('audio')
      cy.contains('#tab-audio--rate--current', '100%')
      cy.get('#tab-audio--rate--increase').click()
      cy.contains('#tab-audio--rate--current', '105%')
    })

    it('rate plus button rounds odd rates by 5%', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('audio')
      cy.contains('#tab-audio--rate--current', '100%')
      cy.get('#tab-audio--rate--input input').invoke('val', 0.51).trigger('input')
      cy.contains('#tab-audio--rate--current', '106%')
      cy.get('#tab-audio--rate--increase').click()
      cy.contains('#tab-audio--rate--current', '110%')
    })

    it('rate minus button decreases the rate by 5%', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('audio')
      cy.contains('#tab-audio--rate--current', '100%')
      cy.get('#tab-audio--rate--decrease').click()
      cy.contains('#tab-audio--rate--current', '95%')
    })

    it('rate minus button rounds odd rates by 5%', function () {
      cy.window().then(setState(this.episode, this.audio, this.show, this.chapters))
      cy.tab('audio')
      cy.contains('#tab-audio--rate--current', '100%')
      cy.get('#tab-audio--rate--input input').invoke('val', 0.51).trigger('input')
      cy.contains('#tab-audio--rate--current', '106%')
      cy.get('#tab-audio--rate--decrease').click()
      cy.contains('#tab-audio--rate--current', '100%')
    })
  })
})
