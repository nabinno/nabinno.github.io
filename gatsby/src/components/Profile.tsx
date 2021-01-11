import { Link } from 'gatsby'
import React from 'react'

import styled from '@emotion/styled'

const Profile = () => {
  return (
    <Base>
      <div className="heading">
        <img
          className="avatar"
          src="https://pbs.twimg.com/profile_images/1342772423859392512/fMR9l4Sv_400x400.jpg"
          alt="nabinno"
        />
        <div className="description">
          Emacsianでアート好き、ランニング好きな@nabinnoが書いています<br />
          <Link to='https://twitter.com/nabinno'>Twitter</Link>&nbsp;/&nbsp;
          <Link to='https://utagaki.com/nabinno'>Utagaki</Link>
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
      > .name {
        font-size: 16px;
        color: #30627a;
        letter-spacing: 0.5px;
        line-height: 1.7;
      }
    }
  }
`

export default Profile
