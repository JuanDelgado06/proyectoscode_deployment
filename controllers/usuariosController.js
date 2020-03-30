const Usuarios = require('../models/Usuarios');
const enviarEmail = require('../handlers/email')

exports.formCrearCuenta = (req, res) => {
    res.render('crearCuenta', {
        nombrePagina: 'Crear Cuenta en Uptask'
    })
}
exports.formIniciarSesion = (req, res) => {
    const { error }  = res.locals.mensajes;
    res.render('iniciarSesion', {
        nombrePagina: 'Iniciar Sesión en Uptask',
        error : error
    })
}
exports.crearCuenta = async (req, res) => {
    //Leer los datos
    const {email, password} = req.body;
    //Crear un usuario
    try {
        await Usuarios.create({
            email,
            password
        });
        //Crear una Url de Confirmar
        const confirmarUrl = `http://${req.headers.host}/confirmar/${email}`;
        //Crear el objeto de usuario
        const usuario = {
            email
        }
         // enviar email
         await enviarEmail.enviar({
            usuario,
            subject: 'Confirma tu cuenta UpTask', 
            confirmarUrl, 
            archivo : 'confirmar-cuenta'
        });
        // redirigir al usuario
        req.flash('correcto', 'Enviamos un correo, confirma tu cuenta');
        res.redirect('/iniciar-sesion');
    } catch (error) {
        req.flash('error', error.errors.map(error => error.message));
        res .render('crearCuenta', {
            mensajes: req.flash(),
            nombrePagina: 'Crear Cuenta en Uptask',
            email,
            password
        })
    }
}
exports.formRestablecerPassword = (req, res) => {
    res.render('reestablecer', {
        nombrePagina: 'Reestablecer tu contraseña'
    })
}
//Cambiar estado de una cuenta a activa o inactiva
exports.confirmarCuenta =  async (req, res) => {
    const usuario = await Usuarios.findOne({
        where: {
            email: req.params.correo
        }
    });
    //Si no existe el usuario
    if(!usuario) {
        req.flash('error', 'No Valido');
        res.redirect('/crear-cuenta');
    }
    usuario.activo = 1;
    await usuario.save();

    req.flash('correcto', 'Ya puedes ingresar con tu cuenta de uptask');
    res.redirect('/iniciar-sesion')
}