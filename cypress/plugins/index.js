/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const fs = require('fs')
const path = require('path')
const axios = require('axios')
const browserify = require('@cypress/browserify-preprocessor')

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  const LISTING_ID = config.env.LISTING_ID
  const FILENAME_TO_PREPEND_DATA = 'favorite-related-marketing-message'
  const baseSpecFilePath = path.resolve(__dirname, `../integration/etsy/${FILENAME_TO_PREPEND_DATA}-template.js`)
  const runSpecFilePath = path.resolve(__dirname, `../integration/etsy/${FILENAME_TO_PREPEND_DATA}-spec.js`)

  on('file:preprocessor', (file) => {
    if (!file.filePath.includes(FILENAME_TO_PREPEND_DATA)) {
        return browserify()(file)
    }

    return new Promise((resolve, reject) => {
      const LISTINGS_FILENAME = `results/etsy-listing-${LISTING_ID}-favoritedBy.json`
      fs.readFile(LISTINGS_FILENAME, { encoding: 'utf-8'}, (err, data) => {
        let json
        try {
          json = JSON.parse(data)
        } catch (e) { reject(e) }
        fs.readFile(baseSpecFilePath, { encoding: 'utf-8'}, (err, data) => {
            if (!err) {
                const stream = fs.createWriteStream(runSpecFilePath)
                stream.once('open', () => {
                    let jsonString = JSON.stringify(json, null, 5)
                    stream.write(`let favoritersStore = ${jsonString}\n`)
                    stream.write(`\n`)
                    stream.write(data)
                    stream.end()
                    resolve(runSpecFilePath)
                })
            } else {
                reject(err)
            }
        })
      })
    })
  })
}
