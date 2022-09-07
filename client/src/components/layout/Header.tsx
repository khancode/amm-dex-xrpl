import React, { ReactElement, useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { UserContext } from './Page'
import XRPLogo from '../../../static/images/XRPLogo.png'
import './Header.scss'
import { Nav } from 'react-bootstrap'

const SCREENS = new Set<string>([`swap`, `pool`])
const DEFAULT_SCREEN = `swap`

export const Header: React.FC<{}> = () => {
  const { user } = useContext(UserContext)
  const location = useLocation()
  const navigate = useNavigate()
  const [currentScreen, setCurrentScreen] = useState<string>()

  useEffect(() => {
    const getScreen =
      location.pathname === `/`
        ? DEFAULT_SCREEN
        : location.pathname.substring(1)
    setCurrentScreen(getScreen)
  })

  const navHeader = (): ReactElement => {
    return (
      <Nav
        className="navHeader"
        variant="pills"
        activeKey={currentScreen}
        onSelect={(newScreen) => {
          if (newScreen == null) {
            throw Error(`newScreen is null`)
          }
          setCurrentScreen(newScreen)
          navigate(`/${newScreen}`)
        }}
      >
        {Array.from(SCREENS).map((screen) => {
          return (
            <Nav.Item key={screen}>
              <Nav.Link eventKey={screen}>{screen}</Nav.Link>
            </Nav.Item>
          )
        })}
      </Nav>
    )
  }

  return (
    <div className="header container">
      <div className="row headerRow">
        <img src={XRPLogo} className="xrplSwapLogo col-1" />

        <div className="col">{navHeader()}</div>

        <div className="userInfo col-2">
          {/* <div>{user?.user.username}</div> */}
          <div>{user?.user.wallet.address}</div>
        </div>
      </div>
    </div>
  )
}
