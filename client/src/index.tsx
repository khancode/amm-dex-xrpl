import React from 'react'
import { createRoot } from 'react-dom/client'

import './index.scss'
import { Page } from './components/layout/Page'

const container = document.getElementById(`root`)
const root = createRoot(container!)
root.render(<Page />)
