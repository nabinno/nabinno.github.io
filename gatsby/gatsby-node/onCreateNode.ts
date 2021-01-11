import { CreateNodeArgs } from 'gatsby'
import dayjs = require('dayjs')

/* eslint-disable @typescript-eslint/no-var-requires */
const h2p = require('html2plaintext')
const cheerio = require('cheerio')

const buildDateNode = ({
  createNodeId,
  nodeId,
  day,
}: {
  createNodeId(input: string): string
  nodeId: string
  day: dayjs.Dayjs
}) => {
  return {
    id: createNodeId(`${nodeId} >>> PublishedDate`),
    published_on: day.toISOString(),
    published_on_unix: day.unix(),
    children: [],
    parent: nodeId,
    internal: {
      contentDigest: createNodeId(`${nodeId} >>> PublishedDate`),
      type: 'PublishedDate',
      owner: '',
    },
  }
}

const DATE_REGEXP = / ?\[(.*?)\] ?/

export const onCreateNode = ({
  node,
  actions,
  createNodeId,
}: CreateNodeArgs<{
  name: string
  body_html: string
  updated_at: string
  pubDate: string
}>) => {
  const { createNode, createParentChildLink, createNodeField } = actions

  let day: any, dateNode: any
  switch (node.internal.type) {
    case 'EsaPost': {
      createNodeField({
        node,
        name: 'title',
        value: node.name.replace(DATE_REGEXP, ''),
      })
      createNodeField({ node, name: 'excerpt', value: h2p(node.body_html) })

      const html = cheerio.load(node.body_html)
      const imageUrl = html('img[alt="thumbnail"]').attr('src')
      createNodeField({ node, name: 'thumbnail', value: imageUrl })

      // Extract the date part from node.name (ex. "[2018-10-08] I participated in Techbook Festival")
      const matched = node.name.match(DATE_REGEXP)
      day = matched ? dayjs(matched[1]) : dayjs(node.updated_at)
      dateNode = buildDateNode({ nodeId: node.id, day, createNodeId })
      createNode(dateNode)
      createParentChildLink({ parent: node, child: dateNode })
      break
    }
    case 'ExternalPostsYaml':
      createNodeField({ node, name: 'title', value: node.title })
      createNodeField({ node, name: 'excerpt', value: node.excerpt })
      createNodeField({ node, name: 'category', value: node.category })

      day = dayjs(node.pubDate)
      dateNode = buildDateNode({ nodeId: node.id, day, createNodeId })
      createNode(dateNode)
      createParentChildLink({ parent: node, child: dateNode })
      break
  }
}
