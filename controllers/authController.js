const passport = require('passport');
const Usuarios = require('../models/Usuarios');
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const crypto = require('crypto');
const bcrypt = require('bcrypt-nodejs');

const enviarEmail = require('../handlers/email');


exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Los campos son obligatorios'
});

//Funcion para revisar si el usuario esta logueado o no
exports.usuarioAuthenticado = (req, res, next) => {
    //Si el usuario  esta autenticado puede pasar
    if (req.isAuthenticated()) {
        return next()
    }
    //Si no esta autenticado redirigir al formulario
    return res.redirect('/iniciar-sesion')
}
//Funcion para cerrar sesion
exports.cerrarSesion = (req,res,next) => {
    req.session.destroy(() => {
        res.redirect('/iniciar-sesion');  // Al cerrar sesion nos lleva al login
    })
}

//Genera un token si el usuario es valido
exports.enviarToken = async (req, res) => {
    //Verificar que el usuario exista
    const {email} = req.body; 
    const usuario = await Usuarios.findOne({ where:  {email} })

    //Si no existe el usuario
    if(!usuario) {
        req.flash('error', 'No existe esa cuenta'),
        res.redirect('/reestablecer')
    }

    //Usuario existe
    usuario.token = crypto.randomBytes(20).toString('hex');
    //expiracion
    usuario.expiracion = Date.now() + 3600000;

    //Guardar en la base de datos
    await usuario.save();
    //Url de Reset
    const resetUrl = `http://${req.headers.host}/reestablecer/${usuario.token}`;

    //Enviar el Correo con el token
    await enviarEmail.enviar({
        usuario,
        subject: 'Reestablecer Contraseña',
        resetUrl,
        archivo: 'reestablecer-password'
    });
    //Termina   
    req.flash('correcto', 'Se envió un mensaje a tu correo ');
    res.redirect('/iniciar-sesion')

}

exports.resetPasswordForm = async (req, res) => {
    const usuario = await Usuarios.findOne({
        where: {
            token: req.params.token
        }
    });

    //Si no encuentra al usuario
    if(!usuario) {
        req.flash('error', 'No Válido');
        res.redirect('/reestablecer')
    }

    //Formulario para generar un password valido
    res.render('resetPassword', {
        nombrePagina: 'Reestablecer Contraseña'
    })
}
//Cambiar el password por uno nuevo
exports.actualizarPassword = async(req, res) => {
    //Verifica un token valido y la fecha de expiracion
    const usuario = await Usuarios.findOne({
        where: {
            token: req.params.token,
            expiracion: {
                [Op.gte] : Date.now()
            }
        }
    });

    //Verificamos si el usuario existe
    if(!usuario) {
        req.flash('error', 'No Valido');
        res.redirect('/reestablecer');
    }
    //Hashear el nuevo password
    usuario.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10) );
    usuario.token = null;
    usuario.expiracion= null;

    //Guardamos el nuevo password
    await usuario.save();

    req.flash('correcto', 'Tu contraseña se ha modificado correctamente')
    res.redirect('/iniciar-sesion')
}