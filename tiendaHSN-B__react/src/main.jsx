import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
//import App from './App.jsx'
import Registro from './componentes/zonaCliente/RegistroComponet/Registro.jsx'


//import Raiz from './Raiz.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Registro />
  </StrictMode>,
)
