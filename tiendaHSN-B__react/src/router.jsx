// src/router.jsx

import { createBrowserRouter } from 'react-router-dom';
import Layout from './componentes/zonaTienda/LayOut/Layout';
import Registro from './componentes/zonaCliente/RegistroComponent/Registro.jsx';
import Login from './componentes/zonaCliente/LoginComponent/Login.jsx';
import Home from './componentes/zonaTienda/Inicio/Home.jsx';
import ProductosCat from './componentes/zonaTienda/Productos/ProductosCat.jsx';

const router = createBrowserRouter([
  {
    element: <Layout />,
    loader: async () => {
      console.log('→ loader del layout ejecutado');
      const res = await fetch('http://localhost:3000/api/Tienda/Categorias?pathCategoria=principales');
      const data = await res.json();
      return data.categorias;
    },
    children: [
      { path: '/', element: <Home /> },
      {
        path: 'Cliente',
        children: [
          { path: 'Registro', element: <Registro /> },
          { path: 'Login', element: <Login /> },
        ],
      },
      {
        path: 'Productos/:pathCat',
        element: <ProductosCat />,
        loader: async ({ params }) => {
          const pathCat = params.pathCat;
          const res = await fetch(`http://localhost:3000/api/Tienda/Productos?pathCategoria=${pathCat}`);
          const data = await res.json();
          return data.productos;
        },
      },
      {
        path: '*',
        element: <div><h2>404 - Página no encontrada</h2></div>,
      },
    ],
  },
]);

export default router;
