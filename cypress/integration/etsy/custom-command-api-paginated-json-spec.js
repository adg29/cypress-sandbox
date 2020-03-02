/// <reference types="cypress" />

const API_KEY = Cypress.env('ETSY_API_KEY') 
const LISTING_ID = Cypress.env('LISTING_ID')
let favoriters = []
let initialResponse = null

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
    cy.storeIterativePaginationResults(initialResponse, favoriters, LISTING_ID, API_KEY)
  })

  it(`adds marketing outreach status to all results`, function() {
    let foundUsers = favoriters.filter(f => f.User)
    cy.log(`Found ${foundUsers.length} users for outreach`)
    foundUsers.forEach(fave => {
      fave.User.marketing_outreach_status = ''
    })
    cy.writeFile(`cypress/results/etsy/favorited-by-${LISTING_ID}.json`, favoriters)
    cy.expect(favoriters.length).to.equal(initialResponse.body.count)

  })

})
