//Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Inicializar variables
var app = express();

// middleware CORS

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    req.header("Access-Control-Allow-Methods","POST,GET,PUT,DELETE,OPTIONS");
    next();
  });


// Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// importar Rutas

var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');

// Conexion a BD
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', {useNewUrlParser: true, useUnifiedTopology: true,useCreateIndex: true }, (err, res) =>{
    
    if(err) throw err;

    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');

} );


// Rutas
app.use('/usuario',usuarioRoutes);
app.use('/hospital',hospitalRoutes);
app.use('/medico',medicoRoutes);
app.use('/login',loginRoutes);
app.use('/busqueda',busquedaRoutes);
app.use('/upload',uploadRoutes);
app.use('/img',imagenesRoutes);


app.use('/',appRoutes);


//Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});
