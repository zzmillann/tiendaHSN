// src/App.jsx
import './App.css';
import { RouterProvider } from 'react-router-dom';
import router from './router'; // importamos la configuración separada

function App() {
  return <RouterProvider router={router} />;
}

export default App;
