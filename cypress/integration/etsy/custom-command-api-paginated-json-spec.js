/// <reference types="cypress" />

// see https://on.cypress.io/custom-commands
//
// typically we'd put this in cypress/support/commands.js
// but because this custom command is specific to this example
// we'll keep it here

let LISTING_ID = Cypress.env('LISTING_ID')
let favoriters = []
let initialResponse = null
const API_KEY = Cypress.env('ETSY_API_KEY') 

Cypress.Commands.add('findAllListingsFavoredBy', (listingId, options = {}) => {
  Cypress.log({
    name: 'findAllListingsFavoredBy',
    message: `${listingId}`,
  })

  let url = `https://openapi.etsy.com/v2/listings/${LISTING_ID}/favored-by?api_key=${API_KEY}&includes=User&limit=100`
  if (options.page) url += `&page=${options.page}`
  cy.request({
    method: 'GET',
    url: url 
  })
})

Cypress.Commands.add('expectIterativePaginationResults', (response) => {
  favoriters.push(...response.body.results)
  if(response.body.pagination.next_page) {
    cy.findAllListingsFavoredBy(LISTING_ID, {page: response.body.pagination.next_page})
      .then(cy.expectIterativePaginationResults)
  } else {
    expect(true)
  }
})

Cypress.Commands.add('expectValidJsonWithCount', (response, length = 0) => {
  expect(response.status).to.eq(200)
  expect(response.body).to.not.be.null
  // Ensure certain properties are included in response body
  expect(response.body).to.include.keys('count', 'pagination')
})

context(`Finds etsy user names for favorited listing ${LISTING_ID}`, function () {
  it('requests page 1 results', function () {
    cy.findAllListingsFavoredBy(LISTING_ID)
      .then(response => {
          if (!initialResponse) {
            initialResponse = response
          }
          cy.expectValidJsonWithCount(response)
      })
  })

  it('requests all paginated results', function () {
    cy.expectIterativePaginationResults(initialResponse, favoriters)
  })

  it(`adds marketing outreach status to all results`, function() {
    let foundUsers = favoriters.filter(f => f.User)
    cy.log(`Found ${foundUsers.length} users for outreach`)
    foundUsers.forEach(fave => {
      fave.User.marketing_outreach_status = ''
    })
    cy.writeFile(`data/etsy/favorited-by-${LISTING_ID}.json`, favoriters)
    cy.expect(favoriters.length).to.equal(initialResponse.body.count)

  })

})
