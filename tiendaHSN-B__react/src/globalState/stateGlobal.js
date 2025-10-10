//modulo de codigo donde se define el estado global de la aplicacion con ZUSTAND
//para crear el estado global

//1º se crea un store con create de zustand
//te devuelve un hook que se puede usar en cualquier componente
//para acceder a las variables y funciones del estado global

import { create } from 'zustand';

const useGlobalState=create( //<--- el metodo create recibe una funcion que crea el store global
    ( set,get,store)=>{

        console.log(`create con parametros: set = ${set}, get = ${get}, store = ${store}`);

        return { // el return devuelve un objeto con variables(estado) y funciones (acciones para modificar el estado)
            datosCliente: null, //objeto con los datos del cliente logueado o null si no hay cliente logueado
            accessToken: null, //token de jwt del cliente logueado o null si no hay cliente logueado
            carritoCompra:{
                itemsProductos:[], //array de objetos {idProducto, cantidad}
                codigoDescuento:[], //array de codigos de descuento aplicados
                fechaPago:null, //fecha de pago si ya se ha pagado
                fechaEnvio:null, //fecha de envio si ya se ha enviado
                estado:'', //abierto, pagado, enviado, cancelado
                direccionEnvio:null, //direccion de envio seleccionada
                direccionFacturacion:null, //direccion de facturacion seleccionada
                formaPago:null, //forma de pago seleccionada
                subtotal:0,
                gastosEnvio:0,
                totalPagar:0
            },
            //acciones para modificar el estado global
            setAccessToken:(nuevoAccessToken)=>set(state => ({...state, accessToken:nuevoAccessToken})),

            
    }
}
);


export default useGlobalState;