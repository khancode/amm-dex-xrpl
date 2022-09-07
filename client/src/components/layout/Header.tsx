import React, { ReactElement, useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { UserContext } from './Page'
import XRPLogo from '../../../static/images/XRPLogo.png'
import './Header.scss'
import { Container, Nav, Navbar } from 'react-bootstrap'
import { getUserBalances } from '../../util/apiRequests'
import { UserBalancesResponse } from '../../util/apiModels'

const SCREENS = new Set<string>([`swap`, `pool`])
const DEFAULT_SCREEN = `swap`

export const Header: React.FC<{}> = () => {
  const [userBalances, setUserBalances] = useState<UserBalancesResponse>()
  const { user, loading } = useContext(UserContext)
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

  useEffect(() => {
    if (!loading) {
      getUserBalances(user.user.username).then((getUserBalancesResponse) => {
        setUserBalances(getUserBalancesResponse)
      })
    }
  }, [loading])

  const navHeader = (): ReactElement => {
    return (
      <Nav
        className="navHeader col-8"
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
          const screenCapitalized =
            screen.charAt(0).toUpperCase() + screen.slice(1)
          return (
            <Nav.Item key={screen}>
              <Nav.Link eventKey={screen}>
                <b>{screenCapitalized}</b>
              </Nav.Link>
            </Nav.Item>
          )
        })}
      </Nav>
    )
  }

  const showXRPBalance = (): any => {
    if (userBalances == null) {
      return `Loading...`
    }
    const xrpBalance = userBalances.balances.find(
      ({ currency, value }) => currency === `XRP`
    )

    if (xrpBalance == null) {
      return `Invalid balance`
    }

    return `${xrpBalance.value} XRP`
  }

  return (
    <div className="header container">
      <Navbar className="headerRow" expand="lg" variant="light" bg="light">
        <Container>
          <Navbar.Brand href="#home">
            <img src={XRPLogo} className="xrplLogo col-1" />
          </Navbar.Brand>

          {navHeader()}

          <div className="userInfo">
            <b>{showXRPBalance()}</b>
            <div>{user?.user.wallet.address}</div>
          </div>
        </Container>
      </Navbar>
    </div>
  )
}
