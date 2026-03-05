import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { TableNumberProvider } from './context/TableNumberContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TableNumberProvider>
      <App />
    </TableNumberProvider>
  </StrictMode>,
)
