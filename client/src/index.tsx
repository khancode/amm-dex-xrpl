import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { Login } from './pages/Login'
import { Swap } from './pages/Swap'
import { Pool } from './pages/Pool'
import { Charts } from './pages/Charts'
import './index.scss'

const container = document.getElementById('root')
const root = createRoot(container!)
root.render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/swap" element={<Swap />} />
            <Route path="/pool" element={<Pool />} />
            <Route path="/charts" element={<Charts />} />
        </Routes>
    </BrowserRouter>
)