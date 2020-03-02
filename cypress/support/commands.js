// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add('findAllListingsFavoredBy', (LISTING_ID, API_KEY, queryParams = {}) => {
  Cypress.log({
    name: 'findAllListingsFavoredBy',
    message: `${LISTING_ID}`,
  })

  let url = `https://openapi.etsy.com/v2/listings/${LISTING_ID}/favored-by?api_key=${API_KEY}&includes=User&limit=100`
  if (queryParams.page) url += `&page=${queryParams.page}`
  cy.request({
    method: 'GET',
    url: url 
  })
})

Cypress.Commands.add('storeIterativePaginationResults', (response, favoritesStore, LISTING_ID, API_KEY) => {
  favoritesStore.push(...response.body.results)
  if(response.body.pagination.next_page) {
    cy.findAllListingsFavoredBy(LISTING_ID, API_KEY, {page: response.body.pagination.next_page})
      .then(function(response) {
        cy.storeIterativePaginationResults(response, favoritesStore, LISTING_ID, API_KEY)
      })
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
