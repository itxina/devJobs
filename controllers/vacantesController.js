// const Vacante = require('../models/Vacantes');//Forma habitual
const { body, validationResult } = require('express-validator');

const mongoose = require('mongoose');// Otra forma de hacerlo
const Vacante = mongoose.model('Vacante');

exports.formularioNuevaVacante = (req,res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
        tagline: 'Llena el Formulario y publica una Vacante',
        cerrarSesion: true,
        nombre: req.user.nombre
    })
}

// Metodo que agrega las vacantes nuevas
exports.agregarVacante = async(req,res) => {
    // console.log(req.body.salario);
    const vacante = new Vacante(req.body);
    //Usuario Autor de Vacante
    vacante.autor = req.user._id;
    // Crear Arreglo de hablilidades(skills)
    vacante.skills = req.body.skills.split(',');// Quita las comas y crea un arreglo de skills
    // console.log(vacante);
    // Almacenar en DB
    const nuevaVacante = await vacante.save();
    // Redireccionar 
    res.redirect(`/vacantes/${nuevaVacante.url}`);
}

// Metodo para Mostrar una vacante
exports.mostrarVacante = async(req,res,next) => {
   const vacante = await Vacante.findOne({url: req.params.url}).lean();

   if (!vacante) return next();

   res.render('vacante', {
       vacante,
       nombrePagina: vacante.titulo,
       barra: true
   })
}

exports.formEditarVacante = async (req,res,next) => {
    const vacante = await Vacante.findOne({url:req.params.url}).lean();
    if(!vacante) return next();

    res.render('editar-vacante', {
        vacante,
        nombrePagina: `Editar - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre
    })
}

exports.editarVacante = async (req,res) => {
    const vacanteActualizada = req.body;
    vacanteActualizada.skills = req.body.skills.split(',');
    console.log(vacanteActualizada);
    const vacante = await Vacante.findOneAndUpdate({url: req.params.url}, vacanteActualizada, {
        new: true,// Trae el actualizado
        runValidators: true// Para que tome todo lo que hay en el modelo
    }).lean();
    res.redirect(`/vacantes/${vacante.url}`);
}

// Validar y Sanitizar los campos de las vacantes
exports.validarVacante = async (req,res,next) => {
    // Sanitizar los campos
    const rules = [
        //*****SANITIZAR Y VALIDAR********* */
        // Campo Titulo
        body('titulo').not().isEmpty().withMessage('Agrega un titulo').escape(),

        // Campo 
        body('empresa').not().isEmpty().withMessage('Hay que poner Nombre de Empresa').escape(),

        // Campo Ubicacion
        body('ubicacion').not().isEmpty().withMessage('Pon una Ubicacion').escape(),

        // Campo Salario
        body('salario').escape(),

        // Campo Contrato
        body('contrato').not().isEmpty().withMessage('Elije un tipo de contrato').escape(),

        // Campo Skills
        body('skills').not().isEmpty().withMessage('Agrega una habilidad por lo menos').escape()
    ];
    await Promise.all(rules.map( validation => validation.run(req)));
    const errores = validationResult(req);

    if(errores.isEmpty()){
        return next();
    }
    req.flash('error', errores.array().map(error => error.msg));
    console.log(errores);
    
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
        tagline: 'Llena el Formulario y publica una Vacante',
        cerrarSesion: true,
        nombre: req.user.nombre,
        mensajes:req.flash()
    })
}


// Metodo para Eliminar Vacante
exports.eliminarVacante = async (req,res)  => {
    const { id } = req.params;
    // console.log(id);
    const vacante = await Vacante.findById(id);
    // console.log(vacante);
    if (verificarAutor(vacante, req.user) ) {
        // Usuario ok , se puede eliminar
        vacante.remove();
        res.status(200).send('Vacante Eliminada Correctamente');
    }else{
        // No es el usuario correcto no elimina
        res.status(403).send('Error');
    }
    
}

const verificarAutor = (vacante = {}, usuario= {}) => {
    if(!vacante.autor.equals(usuario._id)) {
        return false;
    }
    return true;
}