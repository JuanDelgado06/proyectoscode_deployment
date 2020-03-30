const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

//Referencia al modelo donde vamos a autenticar
const Usuarios = require('../models/Usuarios');

// Local Strategy - Login con credenciales propias (usuario-pass)
passport.use(
    new LocalStrategy(
        //Por default passport espera un usuario y password
        //Como se tengan los nombres en el modelo se deben de poner como por ejemplo { usernameField: 'email}
        {
            usernameField: 'email',
            passwordField: 'password'
        },
        //Consulta a la base de datos para ver si es una cuenta que existe o no, o si el password esta bien o no
        async(email, password, done) => {
            try {
                const usuario = await Usuarios.findOne({
                    where: { 
                        email,
                        activo: 1
                    }
                });
                //El usuario existe, password incorrecto
                if(!usuario.verificarPassword(password)) {
                    return done(null, false, {
                        message : 'Contraseña incorrecta'
                    })
                }
                //caso contratio quiere decir que email existe y el password es correcto
                return done(null, usuario);
            } catch (error) {
                //El usuario no existe
                return done(null, false, {
                    message : 'La cuenta no existe o no esta activada'
                })
            }
        }
    )
);

//Serializar el usuario
passport.serializeUser((usuario, callback) => {
    callback(null, usuario);
});

//Desserializar el usuario
passport.deserializeUser((usuario, callback) => {
    callback(null, usuario);
});

//Exportar
module.exports = passport;