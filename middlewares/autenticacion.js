var jwt = require("jsonwebtoken");

var SEED = require("../config/config").SEED;

//===================================================
// Verificar Token MIDDLEWARE
//===================================================

exports.verificaToken = function(req, res, next) {
  var token = req.query.token;
  jwt.verify(token, SEED, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        ok: false,
        mensaje: "Token incorrecto",
        errors: err
      });
    }

    req.usuario = decoded.usuario;
    next();
  });
};

//===================================================
// Verificar Admin MIDDLEWARE
//===================================================

exports.verificaADMIN_ROLE = function(req, res, next) {
  var usuario = req.usuario;

  if (usuario.role === "ADMIN_ROLE") {
    next();
    return;
  } else {
    return res.status(401).json({
      ok: false,
      mensaje: "Token incorrecto - Sin privilegios",
      errors: { message: "No es administrador, acceso denegado" }
    });
  }
};
//===================================================
// Verificar Admin o mismo user MIDDLEWARE
//===================================================

exports.verificaADMIN_i_MismoUser = function(req, res, next) {
  var usuario = req.usuario;
  var id = req.params.id;

  if (usuario.role === "ADMIN_ROLE" || usuario.id === id) {
    next();
    return;
  } else {
    return res.status(401).json({
      ok: false,
      mensaje: "Token incorrecto - No es el mismo usuario",
      errors: { message: "No es administrador, acceso denegado" }
    });
  }
};
