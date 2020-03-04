/// <reference types="cypress" />

const API_KEY = Cypress.env('ETSY_API_KEY') 
const LISTING_ID = Cypress.env('LISTING_ID')
let initialResponse = null

const LISTINGS_FILENAME = `results/etsy-listing-${LISTING_ID}-favoritedBy.json`

const WAIT_INTERVAL_MIN = Cypress.env('MARKETING_WAIT_INTERVAL_MIN')
const WAIT_INTERVAL_MAX = Cypress.env('MARKETING_WAIT_INTERVAL_MAX')

const randomIntFromInterval = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

describe('Marketing automation related to favorites by users ', function () {
  // sensitive information like username and password
  // should be passed via environment variables
  const username = Cypress.env('ETSY_USERNAME') 
  const password = Cypress.env('ETSY_PASSWORD') 
  Cypress.Cookies.debug(true)

  context('Login and iterate over users to message', function () {

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
      cy.get('[data-appears-component-name*="WelcomeRow"]').then(($welcomeBody) => {
          // synchronously ask for the body's text
          // and do something based on whether it includes
          // another string
          if ($welcomeBody.text().includes('Welcome back')) {
            isLoggedIn = true
            cy.log('Logged In')
            expect(true)
          } else {
            cy.log('Not Logged In')
            expect(false)
          }
        })
    });

    it('successfully renders homepage', function() {
      cy.log(!isLoggedIn ? 'Logging in' : 'Skipping XHR Login')
      if (isLoggedIn) {
        this.skip()
      } else {
        cy.get('.signin-header-action').as('modal')
          .click()
        cy.get('form#join-neu-form input[name=email]').type(username)
        cy.get('form#join-neu-form input[name=password]').type(password)
        cy.get('form#join-neu-form').submit()

        // we should be in
        cy.get('[data-appears-component-name*="WelcomeRow"]').should('contain', 'Welcome back')
      }
    })

    favoritersStore.forEach((favorite) => {
      if (favorite.User && !favorite.User.marketing_outreach_status) {
        const userLogin = `${favorite["User"].login_name}`
        it(`Writes MARKETING_MESSAGE for ${userLogin}`, () => {
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
        })

        if (Cypress.env('MARKETING_SUBMIT')) {
          it(`Submits MARKETING_MESSAGE for ${userLogin}`, function() {
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
              cy.writeFile(`${LISTINGS_FILENAME}`, favoritersStore)

            cy.wait(randomIntFromInterval(WAIT_INTERVAL_MIN, WAIT_INTERVAL_MAX))
          })
        }
      }
    })
  })
})
