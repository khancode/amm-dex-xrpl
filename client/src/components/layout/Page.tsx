import React from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { Header } from './Header'

import { Login } from '../../screens/Login'
import { Swap } from '../../screens/Swap'
import { Pool } from '../../screens/Pool'
import { Vote } from '../../screens/Vote'
import { Charts } from '../../screens/Charts'

export const Page: React.FC<{}> = () => {
  return (
    <div>
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
    </div>
  )
}
