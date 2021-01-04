require("ts-node").register()

const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.createPages = require("./gatsby-node/createPages").createPages
exports.onCreateNode = require("./gatsby-node/onCreateNode").onCreateNode
exports.createSchemaCustomization = require("./gatsby-node/createSchemaCustomization").createSchemaCustomization
