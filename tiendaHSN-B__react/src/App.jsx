
import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './componentes/zonaTienda/LayOut/Layout'
import Registro from './componentes/zonaCliente/RegistroComponent/Registro.jsx'
import Login from './componentes/zonaCliente/LoginComponent/Login.jsx'
import Home from './componentes/zonaTienda/Inicio/Home.jsx'
import ProductosCat from './componentes/zonaTienda/Productos/ProductosCat.jsx'
//configuramos el modulo de enrutamiento de react , react-router-dom: se encarga de detectar un cambio en la URL del 
//navegador y mostrar el compoente asociado a esa URL. Para hacer eso son dos pasos basicos:
//1. Usando el metodo createBrowserRouter() creamos un objeto router que contiene las rutas de la aplicacion; son objetos ROUTE con
//con propiedades especificas como son : path (ruta URL) , element (componente a rederizar en esa ruta), childeren (rutas hijas)

//2 usando el componente <RouterProvider> QUE SE MIPORTA DE react-router-dom, y pasandole como prop el objeto router creado en el primer 
//paso, hacemos que la aplicacion use ese sistema de enrutamiento.


const router = createBrowserRouter(
  [
    {element: <Layout/>, children: [
      {path:'/', element: <Home />},
      {path: 'Cliente', children: [
      
        {path:'/Cliente/Registro', element:<Registro/>},
        {path:'/Cliente/Login', element:<Login/>}
      ]},
      {path: '*', element: <div><h2>404 - Página no encontrada</h2></div>},
      {path: 'Productos/:pathCat', element: <ProductosCat/>,
        loader: async ({request, params}) => {
        console.log(`ejecutando loader antes de la carga del componente ProductosCat request: ${JSON.stringify(request)} , params: ${JSON.stringify(params)}`);
        let pathCat = params.pathCat;
        let petProductos = await fetch(`http://localhost:3000/api/Tienda/Productos?pathCategoria=${pathCat}`);
        let respuestaProductos = await petProductos.json();
        console.log(`respuestaProductos recibida en el loader del componente ProductosCat: ${JSON.stringify(respuestaProductos)}`);
        return respuestaProductos.productos;
      }}

    ],
      loader: async ({request, params}) => {
        console.log(`ejecutando loader antes de la carga del layout request: ${JSON.stringify(request)} , params: ${JSON.stringify(params)}`);
        let petCategorias = await fetch(`http://localhost:3000/api/Tienda/Categorias?pathCategoria=principales`);
        let respuestaCategorias = await petCategorias.json();
        console.log(`respuestaCategorias recibida en el loader del layout: ${JSON.stringify(respuestaCategorias)}`);
        return respuestaCategorias.categorias;
      }
    }

  ]
)


function App() {
 
  return (
    <>
    <RouterProvider router={router}/>
    </>
  )
}

export default App
