/// <reference types="cypress" />

const API_KEY = Cypress.env('ETSY_API_KEY') 
const LISTING_ID = Cypress.env('LISTING_ID')
let favoritersStore = []
let initialResponse = null

describe('Marketing automation related to favorites by users ', function () {
  const LISTINGS_FILENAME = `results/etsy-listing-${LISTING_ID}-favoritedBy.json`
  // sensitive information like username and password
  // should be passed via environment variables
  const username = Cypress.env('ETSY_USERNAME') 
  const password = Cypress.env('ETSY_PASSWORD') 
  Cypress.Cookies.debug(true)

  context(`Finds etsy user names for favorited listing ${LISTING_ID}`, function () {
    it('requests page 1 results', function () {
      cy.findAllListingsFavoredBy(LISTING_ID, API_KEY)
        .then(response => {
            if (!initialResponse) {
              initialResponse = response
            }
            cy.expectValidJsonWithCount(response)
        })
    })

    it('requests and stores all paginated results', function () {
      cy.storeIterativePaginationResults(initialResponse, favoritersStore, LISTING_ID, API_KEY)
    })

    it(`adds marketing outreach status to all results`, function() {
      let foundUsers = favoritersStore.filter(f => f.User)
      cy.log(`Found ${foundUsers.length} users for outreach`)
      foundUsers.forEach(fave => {
        fave.User.marketing_outreach_status = ''
      })
      cy.writeFile(`${LISTINGS_FILENAME}`, favoritersStore)
      cy.expect(favoritersStore.length).to.equal(initialResponse.body.count)

    })
  })
})
