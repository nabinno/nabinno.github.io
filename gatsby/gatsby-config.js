// const dayjs = require("dayjs")

module.exports = {
  siteMetadata: {
    title: `On Blahfe`,
    author: {
      name: `Nab Inno`,
      summary: `who lives and works in San Francisco building useful things.`,
    },
    description: `A starter blog demonstrating what Gatsby can do.`,
    siteUrl: `https://nabinno.github.io/`,
    social: {
      twitter: `nabinno`,
      github: `nabinno`,
    },
  },
  plugins: [
    {
      resolve: `gatsby-source-esa`,
      options: {
        accessToken: process.env.ESA_TOKEN,
        teamName: process.env.TEAM_NAME,
        q: `in:blog wip:false`,
        baseCategory: "blog",
      },
    },

    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/blog`,
        name: `blog`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/assets`,
        name: `assets`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 630,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          `gatsby-remark-prismjs`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
        ],
      },
    },
    `gatsby-transformer-yaml`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        //trackingId: `ADD YOUR TRACKING ID HERE`,
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `On Blahfe`,
        short_name: `On Blahfe`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `content/assets/gatsby-icon.png`,
      },
    },
    `gatsby-plugin-react-helmet`,

    // {
    //   resolve: `gatsby-plugin-feed`,
    //   options: {
    //     query: `
    //       {
    //         site {
    //           siteMetadata {
    //             title
    //             description
    //             siteUrl
    //             site_url: siteUrl
    //           }
    //         }
    //       }
    //     `,
    //     feeds: [
    //       {
    //         serialize: ({
    //           query: { site, allEsaPost, allExternalPostsYaml },
    //         }) => {
    //           return [...allEsaPost.edges, ...allExternalPostsYaml.edges]
    //             .sort((a, b) => {
    //               const bDate = b.node.pubDate
    //                 ? new Date(b.node.pubDate)
    //                 : new Date(b.node.childPublishedDate.published_on)
    //               const aDate = a.node.pubDate
    //                 ? new Date(a.node.pubDate)
    //                 : new Date(a.node.childPublishedDate.published_on)
    //               return bDate - aDate
    //             })
    //             .map(edge => {
    //               const node = edge.node

    //               switch (node.internal.type) {
    //                 case "EsaPost":
    //                   const day = dayjs(node.childPublishedDate.published_on)
    //                   return {
    //                     date: day.toISOString(),
    //                     pubDate: day.toISOString(),
    //                     url:
    //                       site.siteMetadata.siteUrl + `/posts/${node.number}`,
    //                     guid: node.number,
    //                     title: node.fields.title,
    //                     description: node.fields.excerpt,
    //                   }
    //                   break

    //                 case "ExternalPostsYaml":
    //                   return {
    //                     date: dayjs(
    //                       node.childPublishedDate.published_on
    //                     ).toISOString(),
    //                     pubDate: dayjs(
    //                       node.childPublishedDate.published_on
    //                     ).toISOString(),
    //                     url: node.link,
    //                     guid: node.link,
    //                     title: node.fields.title,
    //                     description: node.fields.excerpt.substring(0, 512),
    //                   }

    //                 default:
    //                   throw `${node.internal.type} is unknown type`
    //               }
    //             })
    //         },
    //         query: `
    //           {
    //             allEsaPost {
    //               edges {
    //                 node {
    //                   number
    //                   fields {
    //                     title
    //                     excerpt
    //                   }
    //                   childPublishedDate {
    //                     published_on
    //                     published_on_unix
    //                   }
    //                   internal {
    //                     type
    //                   }
    //                 }
    //               }
    //             }
    //             allExternalPostsYaml {
    //               edges {
    //                 node {
    //                   link
    //                   fields {
    //                     title
    //                     excerpt
    //                     category
    //                   }
    //                   childPublishedDate {
    //                     published_on
    //                     published_on_unix
    //                   }
    //                   internal {
    //                     type
    //                   }
    //                 }
    //               }
    //             }
    //           }
    //         `,
    //         output: "/rss.xml",
    //       },
    //     ],
    //   },
    // },

    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
}
