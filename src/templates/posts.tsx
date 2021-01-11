import { Link } from 'gatsby'
import React from 'react'
import { Helmet } from 'react-helmet'

import { css } from '@emotion/core'
import styled from '@emotion/styled'

import Layout from '../components/Layout'
import PostCell from '../components/PostCell'
import Profile from '../components/Profile'

const title = css`
  display: flex;
  margin-right: auto;
  margin-bottom: 2.625rem;
  line-height: 4.375rem;

  > a {
    color: rgba(26, 32, 44, 0.88);
    text-decoration: none;
    font-family: Montserrat,sans-serif;
    font-weight: 900;
    font-size: 3.95285rem;
    line-height: 4.375rem;
    display: flex;
    padding: 16px;
    margin: -16px;
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
`

const IndexPage = ({ pageContext, location }: any) => {
  const { group, index, first, last, additionalContext } = pageContext
  const previousUrl = index - 1 === 1 ? '/' : `/page/${index - 1}`
  const nextUrl = `/page/${index + 1}`
  const { tag, category } = additionalContext

  return (
    <Layout location={location}>
      <Helmet title={`On Blahfe`}>
        <meta
          name="description"
          content={
            'Emacsianでアート好き、ランニング好きなnabinnoが記事を書いています。'
          }
        />
      </Helmet>
      <Container>
        <MainColumn>
          <h1 css={title}>
            <Link to={'/'}>On Blahfe</Link>
          </h1>
          <Profile />

          {(tag || category) && (
            <Title>
              {tag || category}
              <small>に関する記事</small>
            </Title>
          )}
          {group.map(({ node }: any) => (
            <PostCell key={node.number || node.link} post={node} />
          ))}
          <Pagination>
            {!first && <Link to={previousUrl}>{'< Previous'}</Link>}
            {!last && (
              <Link style={{ marginLeft: 'auto' }} to={nextUrl}>
                {'Next >'}
              </Link>
            )}
          </Pagination>
        </MainColumn>
      </Container>
    </Layout>
  )
}

export const Container = styled.div`
  /* max-width: 980px; */
  /* margin: 0 auto; */
  display: flex;
  flex-direction: column;

  @media (min-width: 980px) {
    flex-direction: row;
  }
`

export const MainColumn = styled.div`
  max-width: 620px;
  width: 100%;
  margin: 20px auto;
`

const Pagination = styled.div`
  display: flex;
  width: 100%;
  margin: 24px 0;
  padding: 0 12px;
`

const Title = styled.h1`
  margin: 24px 0;
  font-size: 22px;
  text-align: center;
  small {
    font-size: 13px;
    font-weight: 400;
    margin-left: 4px;
    opacity: 0.6;
  }
`

export default IndexPage
