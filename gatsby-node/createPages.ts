import { CreatePagesArgs } from 'gatsby'

/* eslint-disable @typescript-eslint/no-var-requires */
const createPaginatedPages = require('gatsby-paginate')
const path = require('path')

const perPage = 12

interface NodeEdge<T> {
  edges: {
    node: T
  }[]
}

type EsaPostNode = {
  number: number
  relative_category: string
  fields: {
    title: string
    excerpt: string
  }
  name: string
  tags: string[]
  childPublishedDate: {
    published_on: string
    published_on_unix: string
  }
}

type GraphQLResult = {
  allEsaPost: NodeEdge<EsaPostNode>
  allExternalPostsYaml: NodeEdge<any>
}

export const createPages = async ({ graphql, actions }: CreatePagesArgs) => {
  const { createPage, createRedirect } = actions

  const blogList = path.resolve('./src/templates/posts.tsx')
  const blogPost = path.resolve('./src/templates/post.tsx')
  return graphql<GraphQLResult>(`
    {
      allEsaPost {
        edges {
          node {
            number
            relative_category
            fields {
              title
              excerpt
            }
            name
            tags
            childPublishedDate {
              published_on
              published_on_unix
            }
          }
        }
      }

      allExternalPostsYaml {
        edges {
          node {
            fields {
              title
              excerpt
              category
            }
            childPublishedDate {
              published_on
              published_on_unix
            }
            link
          }
        }
      }
    }
  `).then((result) => {
    if (result.errors) {
      console.error(result.errors)
    }
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    const { allEsaPost, allExternalPostsYaml } = result.data!

    createPaginatedPages({
      edges: [...allEsaPost.edges, ...allExternalPostsYaml.edges].sort(
        (a, b) => {
          return (
            b.node.childPublishedDate.published_on_unix -
            a.node.childPublishedDate.published_on_unix
          )
        },
      ),
      createPage,
      pageTemplate: blogList,
      pageLength: perPage,
      pathPrefix: '',
      buildPath: (index: number, pathPrefix: string) =>
        index > 1 ? `${pathPrefix}/page/${index}` : `/${pathPrefix}`,
    })

    const categoryMap = new Map()
    const tagMap = new Map()
    const postEntities: Record<
      number,
      {
        node: EsaPostNode
      }
    > = {}

    allEsaPost.edges.forEach((postEdge: { node: EsaPostNode }) => {
      const post = postEdge.node
      const number = post.number

      post.tags.forEach((tag: string) => {
        tagMap.set(
          tag,
          tagMap.get(tag) ? tagMap.get(tag).concat(number) : [number],
        )
      })

      const category = post.relative_category || 'blog'
      const numbersByCategory = categoryMap.get(category)
      categoryMap.set(
        category,
        numbersByCategory ? numbersByCategory.concat(number) : [number],
      )

      postEntities[post.number] = postEdge
    })

    allEsaPost.edges.forEach((postEdge: { node: EsaPostNode }) => {
      const post = postEdge.node

      createPage({
        path: `posts/${post.number}`,
        component: blogPost,
        context: {
          number: post.number,
        },
      })
    })

    Array.from(categoryMap.keys()).map((category: string) => {
      const postNumbers = categoryMap.get(category)
      createPaginatedPages({
        edges: postNumbers.map((number: number) => postEntities[number]),
        createPage,
        pageTemplate: blogList,
        pageLength: perPage,
        pathPrefix: `categories/${category}`,
        buildPath: (index: number, pathPrefix: string) =>
          index > 1 ? `${pathPrefix}/page/${index}` : `/${pathPrefix}`,
        context: { category },
      })
    })

    Array.from(tagMap.keys()).map((tag: string) => {
      const postNumbers = tagMap.get(tag)
      createPaginatedPages({
        edges: postNumbers.map((number: number) => postEntities[number]),
        createPage,
        pageTemplate: blogList,
        pageLength: perPage,
        pathPrefix: `tags/${tag}`,
        buildPath: (index: number, pathPrefix: string) =>
          index > 1 ? `${pathPrefix}/page/${index}` : `/${pathPrefix}`,
        context: { tag },
      })
    })

    createRedirect({
      fromPath:
        '/f/2017/12/10/wsl-windows_subsystem_for_linux-%E3%81%A7docker%E3%82%92%E3%81%A4%E3%81%8B%E3%81%86.html',
      toPath: '/posts/58',
      isPermanent: true,
    })
    createRedirect({
      fromPath:
        '/f/2019/07/06/WSL2%E6%99%82%E4%BB%A3%E3%81%AEDocker%E9%96%8B%E7%99%BA%E3%82%B9%E3%82%BF%E3%82%A4%E3%83%AB.html',
      toPath: '/posts/64',
      isPermanent: true,
    })
    createRedirect({
      fromPath:
        '/a/2017/02/06/30%E4%BB%A3%E3%81%8B%E3%82%89%E3%81%AE%E8%83%B8%E9%83%AD%E5%A4%89%E5%BD%A2-%E6%BC%8F%E6%96%97%E8%83%B8-%E6%89%8B%E8%A1%93.html',
      toPath: '/posts/50',
      isPermanent: true,
    })
    createRedirect({
      fromPath:
        '/h/2018/12/22/elixir%E3%81%A8raspberry_pi%E3%81%A7pm2.5%E3%81%AA%E3%81%A9%E3%81%AE%E7%92%B0%E5%A2%83%E3%83%87%E3%83%BC%E3%82%BF%E3%82%92%E5%AE%9A%E7%82%B9%E8%A6%B3%E5%AF%9F%E3%81%99%E3%82%8B.html',
      toPath: '/posts/61',
      isPermanent: true,
    })
    createRedirect({
      fromPath:
        '/b/2019/01/01/elixir%E3%81%A7%E3%81%AF%E3%81%A6%E3%81%AA%E3%83%96%E3%83%83%E3%82%AF%E3%83%9E%E3%83%BC%E3%82%AF.html',
      toPath: '/posts/62',
      isPermanent: true,
    })
    createRedirect({
      fromPath: '/f/2018/05/20/%E9%80%A3%E8%BC%89_rails2phoenix_2.html',
      toPath: '/posts/60',
      isPermanent: true,
    })
    createRedirect({
      fromPath: '/f/2018/01/08/%E9%80%A3%E8%BC%89_Rails2Phoenix_1.html',
      toPath: '/posts/59',
      isPermanent: true,
    })
    createRedirect({
      fromPath:
        '/f/2019/03/31/%E3%82%A4%E3%82%B1%E3%81%A6%E3%82%8B%E3%81%97%E3%83%A4%E3%83%90%E3%81%84%E8%A8%80%E8%AA%9Erebol%E3%81%AE%E5%BE%8C%E7%B6%99red%E3%81%A7%E3%82%AF%E3%83%A9%E3%82%A4%E3%82%A2%E3%83%B3%E3%83%88%E3%82%BD%E3%83%95%E3%83%88%E3%82%92%E3%81%A4%E3%81%8F%E3%81%A3%E3%81%9F%E8%A9%B1.html',
      toPath: '/posts/63',
      isPermanent: true,
    })
  })
}
