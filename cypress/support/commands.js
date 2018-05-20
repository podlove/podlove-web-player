/* global Cypress, cy */

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
  cy.get('#control-bar--play-button').click()
})

Cypress.Commands.add('pause', () => {
  cy.get('#control-bar--play-button').then(button => {
    if (button.find('#control-bar--play-button--pause')) {
      button.click()
    }
  })
})

Cypress.Commands.add('tab', tab => {
  cy.get(`#tabs [rel="${tab}"]`).click()
})
