import { Link } from 'gatsby'
import React from 'react'

import styled from '@emotion/styled'

const Profile = () => {
  return (
    <Base>
      <div className="heading">
        <img
          className="avatar"
          src="https://pbs.twimg.com/profile_images/1520749534460088320/3suYdv6a_400x400.jpg"
          alt="nabinno"
        />
        <div className="description">
          Emacsianでアート好き、ランニング好きな@nabinnoが書いています<br />
          <a href="https://utagaki.com/nabinno" target="_blank" rel="noopener noreferrer">Utagaki</a>&nbsp;/&nbsp;
          <a href="https://github.com/nabinno" target="_blank" rel="noopener noreferrer">GitHub</a>&nbsp;/&nbsp;
          <a href="https://twitter.com/nabinno" target="_blank" rel="noopener noreferrer">Twitter</a>&nbsp;/&nbsp;
          <a href="https://linkedin.com/in/nabinno" target="_blank" rel="noopener noreferrer">LinkedIn</a>&nbsp;/&nbsp;
          <a href="https://www.wantedly.com/companies/nextinnovation" target="_blank" rel="noopener noreferrer">ネクイノ</a>
        </div>
      </div>
    </Base>
  )
}

const Base = styled.div`
  > .heading {
    display: flex;
    margin-bottom: 4.375rem;
    align-items: center;
    > .avatar {
      height: 50px;
      width: 50;
      margin-right: 8px;
      border-radius: 21px;
    }

    > .description {
      > a {
        color: #58463C;

        &:hover {
          color: #80695F;
        }
      }
    }
  }
`

export default Profile
