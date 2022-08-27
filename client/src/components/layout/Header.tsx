import React, { ChangeEvent, ReactElement, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { LoginResponse } from '../../util/apiModels'
import { login } from '../../util/apiRequests'
import { PASSWORD, USERNAME } from '../../util/constants'
import XRPLogo from '../../../static/images/XRPLogo.png'
import './Header.scss'

const SCREENS = new Set<string>([`swap`, `pool`, `vote`, `charts`])
const DEFAULT_SCREEN = `swap`

export const Header: React.FC<{}> = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState<LoginResponse>()
  const [currentScreen, setCurrentScreen] = useState<string>()

  useEffect(() => {
    const getScreen =
      location.pathname === `/`
        ? DEFAULT_SCREEN
        : location.pathname.substring(1)
    setCurrentScreen(getScreen)
  })

  useEffect(() => {
    login(USERNAME, PASSWORD).then((loginResponse) => {
      setUser(loginResponse)
    })
  }, [])

  const createRadioButton = (screen: string): ReactElement => {
    const onChange = (e: ChangeEvent<HTMLInputElement>): void => {
      const newScreen = e.target.id.replace(`Radio`, ``)
      setCurrentScreen(newScreen)
      navigate(`/${newScreen}`)
    }

    const id = `${screen}Radio`
    const isChecked = screen === currentScreen
    return (
      <div key={id} className="">
        <input
          className="form-check-input"
          type="radio"
          name="flexRadioDefault"
          id={id}
          onChange={onChange}
          checked={isChecked}
        />
        <label className="form-check-label" htmlFor={id}>
          {screen}
        </label>
      </div>
    )
  }

  const radioButtons = (): ReactElement => {
    return (
      <div className="screenRadios">
        {Array.from(SCREENS).map((screen) => {
          return createRadioButton(screen)
        })}
      </div>
    )
  }

  return (
    <div className="header container">
      <div className="row headerRow">
        {/* TODO: XRPLswap logo */}
        <img src={XRPLogo} className="xrplSwapLogo col-1" />
        {/* <div className="xrplSwapLogo col-3">XRPLswap logo</div> */}

        {/* TODO: replace with an actual navigation header */}
        <div className="col">{radioButtons()}</div>

        {/* <div>user:</div>
        <div>{user != null && JSON.stringify(user, null, 4)}</div> */}

        {/* NIT: add user avatar and dropdown list for more options */}
        <div className="userInfo col-2">
          <div>{user?.user.username}</div>
          <div>{user?.user.wallet.address}</div>
        </div>
      </div>
    </div>
  )
}
