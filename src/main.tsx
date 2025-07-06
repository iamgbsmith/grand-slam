import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import GrandSlamApp from './GrandSlamApp.tsx'

import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GrandSlamApp />
  </StrictMode>,
)
