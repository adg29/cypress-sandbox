/// <reference types="cypress" />

describe('XHR Messaging via Modal using fixtures', function () {
  const listings = require('../../fixtures/etsy-listings-favoritedBy')
  // sensitive information like username and password
  // should be passed via environment variables
  const username = Cypress.env('ETSY_USERNAME') 
  const password = Cypress.env('ETSY_PASSWORD') 

  context('XHR form submission', function () {

    it('successfully logs in', () => {
      cy.visit('/')
      cy.get('.signin-header-action').as('modal')
        .click()

      cy.get('form#join-neu-form input[name=email]').type(username)
      cy.get('form#join-neu-form input[name=password]').type(password)
      cy.get('form#join-neu-form').submit()

      // we should be in
      cy.get('[data-appears-component-name*="WelcomeRow"]').should('contain', 'cypress')
    })

    listings.favoritedBy.forEach((favorite) => {
      if (favorite.User) {
        const userLogin = `${favorite["User"].login_name}`
        it(`Contacts ${userLogin}`, () => {
          cy.visit(`/people/${userLogin}`)
          cy.get('.convo-overlay-trigger', {timeout: 30000}).filter(':visible').as('messageTrigger')
            .click()
          cy.get('form#chat-ui-composer textarea', {timeout: 60000}).type(Cypress.env('MARKETING_MESSAGE'))
          cy.get('form#chat-ui-composer button[aria-label="Send chat message"]').should('be.visible')
          cy.log(`${userLogin} ready to message`)
        })
      }
    })
  })
})
