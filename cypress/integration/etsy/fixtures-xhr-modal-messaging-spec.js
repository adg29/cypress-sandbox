/// <reference types="cypress" />
import 'cypress-pipe'
describe('XHR Messaging via Modal using fixtures', function () {
  const LISTINGS_FILENAME = 'fixtures/etsy-listings-favoritedBy-alangalan.json'
  const LISTINGS_FIXTURE = require('../../fixtures/etsy-listings-favoritedBy-alangalan')
  const listings = LISTINGS_FIXTURE 
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
      cy.route('GET', '*api*', {}).as('routeApiXHR')
      cy.route('*match*', {}).as('routeMatch')
      cy.route('*bcn*', {}).as('routeBcn')
      cy.route('*framelog*', {}).as('routeFramelog')
    })

    let isLoggedIn = false;
    it('isLoggedIn', () => {
      cy.visit('/')

    // this only works if there's 100% guarantee
    // body has fully rendered without any pending changes
    // to its state
    cy.get('body').then(($body) => {
        // synchronously ask for the body's text
        // and do something based on whether it includes
        // another string
        if ($body.text().includes('Welcome back')) {
          isLoggedIn = true
        }
      })
    });

      it('successfully renders homepage', function() {
        if (isLoggedIn) {
          this.skip()
        } else {
          cy.get('.signin-header-action').as('modal')
            .click()
          cy.get('form#join-neu-form input[name=email]').type(username)
          cy.get('form#join-neu-form input[name=password]').type(password)
          cy.get('form#join-neu-form').submit()

          // we should be in
          cy.get('[data-appears-component-name*="WelcomeRow"]').should('contain', 'cypress')
        }
      })

    listings.favoritedBy.forEach((favorite) => {
      if (favorite.User && !favorite.User.marketing_outreach_status) {
        const userLogin = `${favorite["User"].login_name}`
        it(`Contacts ${userLogin}`, () => {
          cy.visit(`/people/${userLogin}`)
          cy.get('.convo-overlay-trigger', {timeout: 30000}).filter(':visible').last().as('messageTrigger')
            .click()

          const type = chatBox => {
            cy.wait(1000)
            cy.wrap(chatBox)
              .type(Cypress.env('MARKETING_MESSAGE'))
              .should('have.value', Cypress.env('MARKETING_MESSAGE'))
            return cy.wrap(chatBox)
          }
          cy.get('form#chat-ui-composer textarea', {timeout: 60000})
            .pipe(type)
          cy.log(`${userLogin} ready to message`)
          cy.get('form#chat-ui-composer button[aria-label="Send chat message"]')
            .should('be.visible')
            .click()

          const threadText = $thread => {
            return $thread.text()
          }
          cy.get('.convo-details .thread')
            .pipe(threadText)
            .should('contain', Cypress.env('MARKETING_MESSAGE'))

            favorite.User.marketing_outreach_status = 'completed'
            cy.writeFile(`cypress/${LISTINGS_FILENAME}`, listings)
        })
      }
    })
  })
})
