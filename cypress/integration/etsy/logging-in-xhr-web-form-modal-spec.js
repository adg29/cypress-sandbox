/// <reference types="cypress" />

describe('Logging In - XHR Web Form via Modal', function () {
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
  })
})
