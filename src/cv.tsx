import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Cv from './pages/Cv'
import Seo from './components/Seo'
import './index.css'
import './cv.css'

const container = document.getElementById('root')
if (!container) throw new Error('Root container #root was not found in cv/index.html')

createRoot(container).render(
  <StrictMode>
    {import.meta.env.DEV && <Seo page="cv" />}
    <Cv />
  </StrictMode>
)
