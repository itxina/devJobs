const mongoose = require('mongoose');// Otra forma de hacerlo
const Usuarios = mongoose.model('Usuarios');


exports.editarPerfil = async (req,res) => {
    const usuario = await Usuarios.findById(req.user._id);
    console.log(req.user.apellidos);
    console.log(req.body.apellidos);
    usuario.nombre = req.body.nombre;
    usuario.apellidos = req.body.apellidos;
    usuario.email = req.body.email;
    
    if(req.body.password) {
        usuario.password = req.body.password;
    }
    await usuario.save();
    console.log(usuario.apellidos);
    // console.log(usuario);

    req.flash('correcto', 'Cambios Guardados');
    // Redirect
    res.redirect('/administracion');
}

exports.crearUsuario = async (req,res,next) => {
    // Crear el Usuario
    const usuario = new Usuarios(req.body);
    // console.log(usuario);// Se crea la instancia de Usuarios
    
    try {
        await usuario.save();
        res.redirect('/iniciar-sesion');
    } catch (error) {
        req.flash('error', error);
        res.redirect('/crear-cuenta');
    }
}