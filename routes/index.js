const express = require('express')
const router = express.Router()

//importar express validator
const {body} = require('express-validator/check')

//Importar controladores
const proyectosController = require('../controllers/proyectosController')
const tareasController = require('../controllers/tareasController')
const usuariosController = require('../controllers/usuariosController')
const authController = require('../controllers/authController')

module.exports = function () {
    //Ruta para el Home
    router.get('/',  authController.usuarioAuthenticado, proyectosController.proyectosHome );

    router.get('/nuevo-proyecto', authController.usuarioAuthenticado, proyectosController.formularioProyecto);
    //Ruta para crear un proyecto    
    router.post('/nuevo-proyecto', 
        authController.usuarioAuthenticado,
        body('nombre').not().isEmpty().trim().escape(),
        proyectosController.nuevoProyecto);

    //Listar proyecto
    router.get('/proyectos/:url', authController.usuarioAuthenticado, proyectosController.proyectoPorUrl);

    //Actualizar proyecto
    router.get('/proyecto/editar/:id', authController.usuarioAuthenticado, proyectosController.formularioEditar);
    //Actualizar nombre del proyecto
    router.post('/nuevo-proyecto/:id', 
        authController.usuarioAuthenticado,
        body('nombre').not().isEmpty().trim().escape(),
        proyectosController.actualizarProyecto);
    //Eliminar proyecto
    router.delete('/proyectos/:url', authController.usuarioAuthenticado, proyectosController.eliminarProyecto);

    //Tareas
    router.post('/proyectos/:url', authController.usuarioAuthenticado, tareasController.agregarTarea);
    //Actualizar tarea
    router.patch('/tareas/:id', authController.usuarioAuthenticado, tareasController.cambiarEstadoTarea);
    //Eliminar tarea
    router.delete('/tareas/:id', authController.usuarioAuthenticado, tareasController.eliminarTarea);

    //Crear nueva cuenta
    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    router.post('/crear-cuenta', usuariosController.crearCuenta);
    router.get('/confirmar/:correo', usuariosController.confirmarCuenta);
    //Iniciar Sesión
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarUsuario);
    //Cerrar sesión
    router.get('/cerrar-sesion', authController.cerrarSesion);
    //Reestablecer contraseña
    router.get('/reestablecer', usuariosController.formRestablecerPassword);
    router.post('/reestablecer', authController.enviarToken);
    router.get('/reestablecer/:token', authController.resetPasswordForm);
    router.post('/reestablecer/:token', authController.actualizarPassword);

    return router
}
