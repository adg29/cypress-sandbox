/// <reference types="cypress" />

describe('XHR Messaging via Modal using fixtures', function () {
  const listings = require('../../fixtures/etsy-listings-favoritedBy')
  // sensitive information like username and password
  // should be passed via environment variables
  const username = Cypress.env('ETSY_USERNAME') 
  const password = Cypress.env('ETSY_PASSWORD') 
  Cypress.Cookies.debug(true)

  context('XHR form submission', function () {

    beforeEach(function () {
      // Start Cypress' server to hook into XHR requests
      cy.server()
      // Override calls to URLs starting with activities/ and use the
      // content of activities.json as the response
      cy.route('GET', 'api/*', {}).as('apiXHR')
    })

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
          cy.get('.convo-overlay-trigger', {timeout: 30000}).filter(':visible').last().as('messageTrigger')
            .click()
          cy.get('form#chat-ui-composer textarea', {timeout: 60000}).type(Cypress.env('MARKETING_MESSAGE'))
          cy.get('form#chat-ui-composer button[aria-label="Send chat message"]').should('be.visible')
          cy.log(`${userLogin} ready to message`)
        })
      }
    })
  })
})
