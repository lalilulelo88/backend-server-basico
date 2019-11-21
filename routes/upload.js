var express = require("express");

var fileUpload = require("express-fileupload");
var fs = require("fs");

var app = express();

var Usuario = require("../models/usuario");
var Hospital = require("../models/hospital");
var Medico = require("../models/medico");

// default options
app.use(fileUpload());

// Rutas
app.put("/:tipo/:id", (req, res, next) => {
  var tipo = req.params.tipo;
  var id = req.params.id;

  if (!req.files) {
    res.status(400).json({
      ok: false,
      mensaje: "No selecciono archivo",
      error: { message: "Debe seleccionar archivo" }
    });
  }

  //Obtener nombre del archivo

  var archivo = req.files.imagen;
  var nombreCorto = archivo.name.split(".");
  var extensionArchivo = nombreCorto[nombreCorto.length - 1];
  //tipos de coleccion

  var tiposValidos = ["hospitales", "medicos", "usuarios"];

  if (tiposValidos.indexOf(tipo) < 0) {
    res.status(400).json({
      ok: false,
      mensaje: "Tipo coleccion no valida",
      error: { message: "Tipo coleccion no valida" }
    });
  }

  //extesiones permitidas
  var extensionesValidas = ["png", "jpg", "gif", "jpeg"];

  if (extensionesValidas.indexOf(extensionArchivo) < 0) {
    res.status(400).json({
      ok: false,
      mensaje: "Extension no valida",
      error: {
        message: "La extensiones validas son " + extensionesValidas.join(", ")
      }
    });
  }

  //nombre archivo personalizado
  var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

  //mover archivo del tmp al path
  var path = `./uploads/${tipo}/${nombreArchivo}`;

  archivo.mv(path, err => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al mover archivo",
        errors: err
      });
    }

    subirPorTipo(tipo, id, nombreArchivo, res);
  });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
  if (tipo === "usuarios") {
    Usuario.findById(id, (err, usuario) => {
      var pathViejo = "./uploads/usuarios/" + usuario.img;

      if (!usuario) {
        return res.status(400).json({
          ok: true,
          mensaje: "Usuario no existe",
          errors: { message: "Usuario no existe" }
        });
      }

      // si existe elimina la imagen anterior
      if (fs.existsSync(pathViejo)) {
        fs.unlinkSync(pathViejo);
      }

      usuario.img = nombreArchivo;
      usuario.save((err, usuarioActualizado) => {
        usuarioActualizado.password = ":)";

        return res.status(200).json({
          ok: true,
          mensaje: "Imagen de usuario actualizada",
          usuario: usuarioActualizado
        });
      });
    });
  }

  if (tipo === "hospitales") {
    Hospital.findById(id, (err, hospital) => {
        var pathViejo = "./uploads/hospitales/" + hospital.img;
  
        if (!hospital) {
          return res.status(400).json({
            ok: true,
            mensaje: "Hospital no existe",
            errors: { message: "Hospital no existe" }
          });
        }
  
        // si existe elimina la imagen anterior
        if (fs.existsSync(pathViejo)) {
          fs.unlinkSync(pathViejo);
        }
  
        hospital.img = nombreArchivo;
        hospital.save((err, hospitalActualizado) => {
  
          return res.status(200).json({
            ok: true,
            mensaje: "Imagen de hospital actualizada",
            hospital: hospitalActualizado
          });
        });
      });
  }

  if (tipo === "medicos") {
    
    Medico.findById(id, (err, medico) => {
        var pathViejo = "./uploads/medicos/" + medico.img;
  
        if (!medico) {
          return res.status(400).json({
            ok: true,
            mensaje: "medico no existe",
            errors: { message: "medico no existe" }
          });
        }
  
        // si existe elimina la imagen anterior
        if (fs.existsSync(pathViejo)) {
          fs.unlinkSync(pathViejo);
        }
  
        medico.img = nombreArchivo;
        medico.save((err, medicoActualizado) => {
  
          return res.status(200).json({
            ok: true,
            mensaje: "Imagen de medico actualizada",
            medico: medicoActualizado
          });
        });
      });
  }
}

module.exports = app;
