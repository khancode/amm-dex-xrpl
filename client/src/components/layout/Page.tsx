import React, { createContext, useEffect, useState } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { Header } from './Header'

import { Login } from '../../screens/Login'
import { Swap } from '../../screens/Swap'
import { Pool } from '../../screens/Pool'
import { Vote } from '../../screens/Vote'
import { Charts } from '../../screens/Charts'
import { login } from '../../util/apiRequests'
import { LoginResponse } from '../../util/apiModels'
import { PASSWORD, USERNAME } from '../../util/constants'

// @ts-expect-error
export const UserContext = createContext<{
  user: LoginResponse
  loading: boolean
}>()

export const Page: React.FC<{}> = () => {
  const [user, setUser] = useState<LoginResponse>()
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    login(USERNAME, PASSWORD).then((loginResponse) => {
      setUser(loginResponse)
      setLoading(false)
    })
  }, [])

  return (
    <UserContext.Provider value={{ user: user!, loading }}>
      <HashRouter>
        <Header />
        <Routes>
          <Route path="/swap" element={<Swap />} />
          <Route path="/pool" element={<Pool />} />
          <Route path="/vote" element={<Vote />} />
          <Route path="/charts" element={<Charts />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </HashRouter>
    </UserContext.Provider>
  )
}
