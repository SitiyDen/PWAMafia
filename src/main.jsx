import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { TableNumberProvider } from './context/TableNumberContext'
import { OBSProvider } from './context/OBSContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TableNumberProvider>
      <OBSProvider>
        <App />
      </OBSProvider>
    </TableNumberProvider>
  </StrictMode>,
)
