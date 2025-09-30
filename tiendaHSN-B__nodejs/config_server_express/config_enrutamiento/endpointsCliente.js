//modulo de codigo que exporta un objeto Router o enrutamiento de express
//para gestionar las peticiones http_request que empiezan por /api/Cliente

const express=require('express')
const objetosRouter=express.Router(); // <---- obtenemos el objeto router de express para config rutas y exportarlas
const moongoose=require('mongoose');
const bcrypt=require('bcrypt');
const { default: mongoose } = require('mongoose');

//definimos las rutas o endpoints
objetosRouter.post('/Registro', async(req,res,next)=>{
      try{    
      console.log(`datos mandados en el body por cliente REACT desde el componente Registro: ${JSON.stringify(req.body)}`);

            //----- 1º insertar los datos en la bd: HSN coleccion clientes (hacer validaciones antes de meter datos!!!!)
            await mongoose.connect(process.env.URL_MONGODB);


            let resInsert = await mongoose.connection.collection('cliente').insertOne(

              {
                 nombre : req.body.nombre,
                 apellidos : req.body.apellidos,
                 genero : req.body.genero,
                 cuenta : {
                    email: req.body.email,
                    password: bcrypt.hashSync( req.body.password, 10),
                    cuentaActivada : false,
                    imagenAvatae: '',
                    fechacreacioncuenta: Date.now(),
                    
                 },
                 direcciones : [],
                 telefonocontacto:'',
                 pedidos:[],
                 listafavoritos:[],
                 pedidoactual: {},
                 metodospago: [],




              }
            );

            console.log(`la operacion de registro ha ido vien y su resultado es ${JSON.stringify(resInsert)}`)


            res.status(200).send({codigo:0, mensaje:'datos recibidos ok..'});
      }catch(error){
        console.log("error en registro de datos del cliente : ${error}")
        res.status(200).send({codigo: 1, mensaje: "error en registro de datos del cliente: ${error}"})
      }
    });


objetosRouter.post('/Login', async(req,res,next)=>{
    try{
        console.log(`datos mandados en el body por cliente REACT desde el componente Login: ${JSON.stringify(req.body)}`);

        await mongoose.connect(process.env.URL_MONGODB);
        let resFindEmailCLiente =await mongoose.connection
                                                    .collection('cliente')
                                                    .findOne( { 'cuenta.email': req.body.email } );
        //1º paso comprobar si el email existe en la bd
        if(!resFindEmailCLiente) throw new Error('email no existe en la bd');

        //2º  si existe el email comprobar si el password es correcta con el hash 
        if(!bcrypt.compareSync( req.body.password, resFindEmailCLiente.cuenta.password )) throw new Error('password incorrecto');

        
        //3º envio respuesta al cliente  de que todo esta ok
        res.status(200).send({codigo:0, mensaje:'login ok'});

    }catch(error){
        console.log(`error en login de cliente: ${error}`);
        res.status(200).send({codigo: 1, mensaje: `error en login de cliente: ${error}`});
    }







});

module.exports = objetosRouter;
//exportamos el objeto router para que pueda ser usado en otros modulos