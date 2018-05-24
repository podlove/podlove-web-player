/* global Cypress, cy */
const domSelectors = require('../selectors')

Cypress.Commands.add('bootstrap', () => {
  cy.visit('/test.html')
  cy.fixture('episode').as('episode')
  cy.fixture('show').as('show')
  cy.fixture('audio').as('audio')
  cy.fixture('chapters').as('chapters')
  cy.fixture('contributors').as('contributors')
  cy.fixture('reference').as('reference')
  cy.fixture('runtime').as('runtime')
})

Cypress.Commands.add('play', () => {
  const selectors = domSelectors(cy)
  selectors.controls.playButton.button().then(btn => {
    btn.click()
    selectors.controls.playButton.pause()
  })
})

Cypress.Commands.add('pause', () => {
  const selectors = domSelectors(cy)

  selectors.controls.playButton.pause()
  selectors.controls.playButton.button().then(btn => {
    btn.click()
  })
})

Cypress.Commands.add('tab', tab => {
  const selectors = domSelectors(cy)
  cy.get(`#tabs [rel="${tab}"]`).click()
  selectors.tabs[tab].container()
})
