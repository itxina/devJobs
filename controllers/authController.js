const passport = require('passport');
const Vacante = require('../models/Vacantes');


exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son Obligatorios'
})

// Revisar sí el usuario esta Autenticado
exports.verificarUsuario = (req,res,next) =>{
    // Revisar el Usuario
    if(req.isAuthenticated()){
        return next();// Esta Autenticado
    }
    //Redireccionar
    res.redirect('/iniciar-sesion');
}

exports.mostrarPanel = async (req,res) => {
    // Consultar el Usuario Autenticado
    const vacantes = await Vacante.find({autor: req.user._id}).lean();

    res.render('administracion', {
        nombrePagina: 'Panel de Administracion',
        tagline: 'Crea y Administra tus Vacantes desde Aqui',
        cerrarSesion: true,
        nombre: req.user.nombre,
        vacantes
    })
}

exports.cerrarSesion = (req,res) => {
    req.logout();
    req.flash('correcto', 'Cerraste sesion Correctamente');

    return res.redirect('/iniciar-sesion');
}

