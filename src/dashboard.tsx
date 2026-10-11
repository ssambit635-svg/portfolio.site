import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Dashboard from './pages/Dashboard'
import Seo from './components/Seo'
import './index.css'

const container = document.getElementById('root')
if (!container) throw new Error('Root container #root was not found in dashboard/index.html')

createRoot(container).render(
  <StrictMode>
    {import.meta.env.DEV && <Seo page="dashboard" />}
    <Dashboard />
  </StrictMode>
)
