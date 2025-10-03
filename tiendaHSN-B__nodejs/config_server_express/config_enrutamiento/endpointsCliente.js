//modulo de codigo q exporta un objeto Router o de enrutamiento de express
//para gestionar las peticiones http_request q empeiecen por /api/Cliente
const express=require('express');
const objetoRouter=express.Router(); // <---- obtenemos el objeto Router de express para configurar rutas y exportarlo

const mongoose=require('mongoose');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');

//defeinimos las rutas o endpoints del objeto Router
objetoRouter.post('/Registro', async (req,res,next)=>{
       try {
            console.log(`datos mandados en el body por cliente REACT desde el componente Registro: ${JSON.stringify(req.body)}`);
            //-----1º insertar los datos en bd: HSN coleccion clientes (hacer validaciones antes de meter datos!!!!)
            await mongoose.connect(process.env.URL_MONGODB);
            
            //lanzo INSERT usando mongoose como si fuera una query normal ejecutada contra mongodb en la shell...sin usar ESQUEMAS-MODELO
            let resInsert=await mongoose.connection
                                        .collection('clientes')
                                        .insertOne(
                                          {
                                            nombre: req.body.nombre,
                                            apellidos: req.body.apellidos,
                                            genero: req.body.genero,
                                            cuenta: {
                                              email: req.body.email,
                                              password: bcrypt.hashSync( req.body.password, 10),  //<---- almacenamos HASH!!!!
                                              cuentaActivada: false,
                                              iamgenAvatar:'',
                                              fechaCreacionCuenta: Date.now(), //<---- OJO!!! campo fecha siempre en NUMERO MS, nunca string!!!!
                                              telefonoContacto:''
                                            },
                                            direcciones:[],
                                            pedidos:[],
                                            listaFavoritos:[],
                                            pedidoActual: { },
                                            metodosPago: [ ]

                                          }
                                        );
            console.log(`la operacion de registro en teoria ha ido bien, y su resultado es: ${JSON.stringify(resInsert)}`);
            //----- 2º paso envio de email de confirmacion de registro con link para activar cuenta (mailjet)
            // para llamar a la api de mailjet necesitamos:
            // hacer una peticion http_POST usando FETCH al endpoint de mailjet: https://api.mailjet.com/v3.1/send
            // tengo que añadir como cabeceras de la peticion:
            // - la cabecera Authorization con autenticacion basica (Basic Auth) con mi public key y private key de mailjet
            //      Authorization: Basic ....... <---- base64(public_key:private_key)
            //      Content-Type: application/json
            // - en el body de la peticion un json con un formato determinado por la API de mailjet  
            /*
            /*
                {
                      "Messages":[
                        {
                          "From":[
                            {
                              "Email":"pilot@mailjet.com",
                              "Name":"Your Mailjet Pilot"
                            }
                          ],
                          "HTMLPart":"<h3>Dear passenger, welcome to Mailjet!</h3><br />May the delivery force be with you!",
                          "Subject":"Your email flight plan!",
                          "TextPart":"Dear passenger, welcome to Mailjet! May the delivery force be with you!",
                          "To":[
                            {
                              "Email":"passenger@mailjet.com",
                              "Name":"Passenger 1"
                            }
                          ]
                        }
                      ]
                  }
            */ 
           
            const tokenActivacionCuenta=jwt.sign(
                { email: req.body.email,idCliente: resInsert._id},  //<--- 1º parametro payload
                process.env.JWT_SECRET, // <--- 2º parametro clave secreta para cifrar y firmar el token
                { expiresIn: '10min' } // <--- 3º parametro opciones del token (caducidad, algoritmo cifrado...)
              );

            const bodyFetchMailjet={
                      "Messages":[
                        {
                          "From":[
                            {
                              "Email":"pamaruiz69@gmail.com",
                              "Name":"amdinistrador portal tienda HSN"
                            }
                          ],
                          "HTMLPart":`
                          <div style="text-align: center;">
                            <img src="https://www.hsnstore.com/skin/frontend/default/hsnreborn/images/logoHSNReduced.svg" alt="logo tienda HSN" style="width: 150px; height: auto;"/>
                          </div>
                          <div>
                            <p><h3>Gracias por registrarte en nuestra tienda HSN</h3></p>
                            <p>Para finalizar el proceso de registro correctamente, debes ACTIVAR TU CUENTA. Para ello</p>
                            <p>tienes que hacer click en el siguiente enlace: <a href="http://localhost:3000/api/Cliente/ActivarCuenta?email=${req.body.email}&idCliente=${resInsert._id}&token=${tokenActivacionCuenta}">PULSA AQUI</a></p>
                          </div>
                          `,
                          "Subject":"Activacion de cuenta en portal tienda HSN",
                          "TextPart":"",
                          "To":[
                            {
                              "Email": req.body.email,
                              "Name": `${req.body.nombre} ${req.body.apellidos}`
                            }
                          ]
                        }
                      ]
                  }
;
            const petRespMailjet=await fetch('https://api.mailjet.com/v3.1/send', {
              method: 'POST',
              headers: {
                'Authorization':`Basic ${Buffer.from(process.env.MAILJET_PUBLIC_KEY + ':' + process.env.MAILJET_SECRET_KEY).toString('base64')}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(bodyFetchMailjet)
            });

            const datosRespMailjet=await petRespMailjet.json();
            console.log(`respuesta de Mailjet: ${JSON.stringify(datosRespMailjet)}`);
            //a mi solo me interesa de la respuesta la prop.Status de la primera posicion del array Messages 
            // (solo he mandado un email en esta peticion) y ver si es igual a 'success'
            if( datosRespMailjet.Messages[0].Status!=='success') {
             //si lo dejas asi el problema es q ya he insertado el cliente en la bd, pero no ha ido bien el envio del email
             //y al cliente de REACT solo le llega q ha habido un error en el registro...y q lo intente de nuevo 
             //pero en la bd ya esta el email registrado ¿solucion?
             // 1º borrar el cliente insertado en la bd
             // 2º esperar de nuevo un cierto tiempo y volver a intentar el envio del email a los 5min
             //setTimeout( ()=>{ ...envio de email igual q arriba...}, 5*60*1000)
              throw new Error('error en envio de email de activacion de cuenta');
            }

            //----- 3º paso envio respuesta al cliente:
            res.status(200).send({codigo:0, mensaje:'datos recibidos ok..'});
            
          } catch (error) {
            console.log(`error en registro de datos del cliente: ${error}`);
            res.status(200).send({codigo:1, mensaje:`error en registro de datos del cliente: ${error}`});

            
          }    
    }
)

objetoRouter.post('/Login', async (req,res,next)=>{
    try {
        console.log(`datos mandados en el body por cliente REACT desde el componente Login: ${JSON.stringify(req.body)}`);
        //----- 1º paso comprobar si el email existe en la bd...lanzando query de mongo sin usar ESQUEMAS-MODELO
        await mongoose.connect(process.env.URL_MONGODB);
        let resFindEmailCliente=await mongoose.connection
                                            .collection('clientes')
                                            .findOne({ 'cuenta.email': req.body.email });

        if(! resFindEmailCliente) throw new Error('email no existe en bd');
        //----- 2º paso si existe el email, comprobar si el password es correcta (calcular el hash de la password que me pasan
        //y compararlo con el hash almacenado en la bd para ese email)
         if (! bcrypt.compareSync( req.body.password, resFindEmailCliente.cuenta.password) ) throw new Error('password incorrecta');

        //----- 3º paso envio respuesta al cliente de q todo ok con SUS DATOS COMPLETOS (pedidos, direcciones, etc)
        res.status(200).send(
            {
                codigo:0,
                mensaje:'Login ok',
                datosCliente: resFindEmailCliente
            }
        );
    } catch (error) {
        console.log(`error en login de datos del cliente: ${error}`);
        res.status(200).send({codigo:2 , mensaje:`error en login: ${error}`});
    }
});

objetoRouter.get('/ActivarCuenta', async (req,res,next)=>{
  try {
    //1º extraer de la url las variables: email, idCliente, token <---- estan en req.query
    //2º comprobar q el token es correcto(con la clave process.env.JWT_SECRET) y no ha caducado <---metodo jwt.verify()
    //3º si todo ok comprobar q el campo email coincide con el campo email del payload del token (igual para el idCliente)
    //4º si todo ok lanzar un update en la bd para poner cuentaActivada=true para ese cliente
    res.status(200).redirect('http://localhost:5173/Cliente/ActivacionCuentaOK');
    
  } catch (error) {
    console.log(`error en activacion de cuenta del cliente: ${error}`);
    res.status(200).redirect('http://localhost:5173/Cliente/ActivacionCuentaERROR');    
  }
});


module.exports=objetoRouter; // <---- exportamos el objeto Router para usarlo en el modulo server.js