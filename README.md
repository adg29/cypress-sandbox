## Cypress Sandbox

### Setup

Create your own `cypress.env.json` file that Cypress will automatically check. Values in here will overwrite conflicting environment variables in the default configuration file `cypress.json`.

This strategy is useful because `cypress.env.json` is in the `.gitignore` file, and the values in here can be different for each developer machine.

See https://docs.cypress.io/guides/guides/environment-variables.html#Option-2-cypress-env-json

### Install

- `npm install`

### Run

- `npm run cypress:open`


## Wishlist

### Continuous Integration

Setting `env` vars via exports per machine will be useful for CI environments.
