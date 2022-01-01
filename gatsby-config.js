/* eslint-env node */
const dayjs = require('dayjs')

module.exports = {
  siteMetadata: {
    title: 'On Blahfe',
    author: 'nabinno',
    description:
      'Emacsianでアート好き、ランニング好きなnabinnoが書いているブログです',
    siteUrl: 'https://nabinno.github.io',
  },
  pathPrefix: '/',
  plugins: [
    {
      resolve: `gatsby-source-esa`,
      options: {
        accessToken: process.env.ESA_TOKEN,
        teamName: process.env.TEAM_NAME,
        q: `in:blog wip:false`,
      },
    },
    `gatsby-transformer-yaml`,
    `gatsby-plugin-emotion`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: 'UA-314558-24',
      },
    },
    `gatsby-plugin-react-helmet`,
    'gatsby-plugin-remove-serviceworker',
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: 'On Blahfe',
        short_name: `nabinno`,
        start_url: `/`,
        background_color: `#fff`,
        theme_color: `#fff`,
        display: `minimal-ui`,
        icon: `src/images/logo.png`,
      },
    },
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
                site_url: siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            serialize: ({
              query: { site, allEsaPost, allExternalPostsYaml },
            }) => {
              return [...allEsaPost.edges, ...allExternalPostsYaml.edges]
                .sort((a, b) => {
                  const bDate = b.node.pubDate
                    ? new Date(b.node.pubDate)
                    : new Date(b.node.childPublishedDate.published_on)
                  const aDate = a.node.pubDate
                    ? new Date(a.node.pubDate)
                    : new Date(a.node.childPublishedDate.published_on)
                  return bDate - aDate
                })
                .map((edge) => {
                  const node = edge.node

                  switch (node.internal.type) {
                    case 'EsaPost': {
                      const day = dayjs(node.childPublishedDate.published_on)
                      return {
                        date: day.toISOString(),
                        pubDate: day.toISOString(),
                        url:
                          site.siteMetadata.siteUrl + `/posts/${node.number}`,
                        guid: node.number,
                        title: node.fields.title,
                        description: node.fields.excerpt,
                      }
                    }
                    case 'ExternalPostsYaml': {
                      return {
                        date: dayjs(
                          node.childPublishedDate.published_on,
                        ).toISOString(),
                        pubDate: dayjs(
                          node.childPublishedDate.published_on,
                        ).toISOString(),
                        url: node.link,
                        guid: node.link,
                        title: node.fields.title,
                        description: node.fields.excerpt.substring(0, 512),
                      }
                    }
                    default: {
                      throw `${node.internal.type} is unknown type`
                    }
                  }
                })
            },
            query: `
              {
                allEsaPost {
                  edges {
                    node {
                      number
                      fields {
                        title
                        excerpt
                      }
                      childPublishedDate {
                        published_on
                        published_on_unix
                      }
                      internal {
                        type
                      }
                    }
                  }
                }
                allExternalPostsYaml {
                  edges {
                    node {
                      link
                      fields {
                        title
                        excerpt
                        category
                      }
                      childPublishedDate {
                        published_on
                        published_on_unix
                      }
                      internal {
                        type
                      }
                    }
                  }
                }
              }
            `,
            output: '/rss.xml',
          },
        ],
      },
    },
  ],
}
