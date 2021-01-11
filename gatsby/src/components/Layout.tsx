import React from 'react'
import { Helmet } from 'react-helmet'
import 'ress'
import Footer from './Footer'
import Header from './Header'

import styled from '@emotion/styled'

const Template = (props: any) => {
  return (
    <Container>
      <Helmet>
        <html lang="ja" />
        <meta
          name="google-site-verification"
          content=""
        />
      </Helmet>
      <div>{props.children}</div>
    </Container>
  )
}

const Container = styled.div`
  font-family: -apple-system-body, 'Source Han Mono', BlinkMacSystemFont, 'Helvetica Neue',
    'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans Japanese',
    '游ゴシック  Medium', 'Yu Gothic Medium', 'メイリオ', meiryo, sans-serif;
  @media screen and (-webkit-min-device-pixel-ratio: 2),
    screen and (min-resolution: 2dppx) {
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
  }
`

export default Template
