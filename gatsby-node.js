/* eslint-env node */
require('ts-node').register()

exports.onCreateNode = require('./gatsby-node/onCreateNode').onCreateNode
exports.createPages = require('./gatsby-node/createPages').createPages
