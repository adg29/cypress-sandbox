/// <reference types="cypress" />

describe('XHR Messaging via Modal using fixtures', function () {
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

    it('visits people pages', () => {
      cy.fixture('etsy-listings-favoritedBy.json').then((data) => {
        data.favoritedBy.slice(0,1).forEach((favorite) => {
          cy.visit(`/people/${favorite.User.login_name}`)
          cy.get('.convo-overlay-trigger').filter(':visible').as('messageTrigger')
            .click()
          cy.get('form#chat-ui-composer textarea').type(Cypress.env('MARKETING_MESSAGE'))
        })
      })
    })
  })
})
