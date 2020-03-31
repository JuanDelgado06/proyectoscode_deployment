const express = require('express')
const routes = require('./routes')
const path = require('path')
const bodyParser = require('body-parser')
const flash = require('connect-flash')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const passport = require('./config/passport')

//Extraer valores de variables.env
require('dotenv').config({ path: 'variables.env' })

//Helpers con algunas funciones
const helpers = require('./helpers')

//Crear la conexion a la DB
const db = require('./config/db')

//Importar el modelo
require('./models/Proyectos')
require('./models/Tareas')
require('./models/Usuarios')

db.sync()
    .then(() => console.log('Conectado a la base de datos'))
    .catch(err => console.log(err) );

//Crear app de express
const app = express()
// Cargar los archivos estaticos
app.use(express.static('public'))

// Habilitar pug
app.set('view engine', 'pug')

//Habilitar bodyParser para leer datos de un formulario
app.use(bodyParser.urlencoded({extended: true}))

//Añadir la carpeta de las vistas
app.set('views', path.join(__dirname, './views'))

//Agregar flash mesagges
app.use(flash())

app.use(cookieParser())

//Sesiones nos permite navegar en dististas paginas sin volvernos a autenticar
app.use(session({
    secret: 'supersecreto',
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session())

// Añadir los helpers a express
app.use((req, res, next) => {
    res.locals.vardump = helpers.vardump;
    res.locals.mensajes = req.flash();
    res.locals.usuario = {...req.user} || null;
    next();
})

//Usar las rutas
app.use('/', routes())

//Servidor y Puerto
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3000;

app.listen(port, host, () => {
    console.log('El servidor funciona LISTO!!');
})