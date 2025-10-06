const express = require('express');
const objetoRouterTienda = express.Router();
const mongoose = require('mongoose');


objetoRouterTienda.get('/Categorias',
    async (req, res, next) => {
        try {
            console.log(`parametros en url pasados desde react: ${JSON.stringify(req.query)}`);
            const pathCategoria = req.query.pathCategoria; //parabuscar las categorias primcipales

            await mongoose.connect(process.env.URL_MONGODB);
            let patronBusqueda = pathCategoria === 'principales' ? /^\d+$/ : new RegExp(`^${pathCategoria}-\d+$`);
            let categoriasCursor = await mongoose.connection.db
            .collection('categorias')
            .find({ pathCategoria: patronBusqueda })


         
            let categoriasArray = await categoriasCursor.toArray();
            console.log(`categoriasArray: ${JSON.stringify(categoriasArray)}`);

            res.status(200).send({
                codigo: 0,
                mensaje: 'Categorias obtenidas correctamente',
                categorias: categoriasArray
            });
        } catch (error) {
            console.error('Error al obtener las categorias:', error);
            res.status(200).send({codigo: 5 , 
                mensaje: 'Error al obtener las categorias',
                categorias: []
            });
        }
    }
)

module.exports = objetoRouterTienda;