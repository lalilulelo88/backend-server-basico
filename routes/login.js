var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

var SEED = require("../config/config").SEED;
var app = express();

var Usuario = require("../models/usuario");

const { OAuth2Client } = require("google-auth-library");
var CLIENT_ID = require("../config/config").CLIENT_ID;

const client = new OAuth2Client(CLIENT_ID);

var mdAutenticacion = require("../middlewares/autenticacion");
//===================================================
// Autenticacion de google
//===================================================

app.get("/renuevatoken", mdAutenticacion.verificaToken, (req, res) => {

  var token = jwt.sign({ usuario: req.usuario }, SEED, { expiresIn: 14400 }); // 4hrs expira

  res.status(200).json({
    ok: true,
    token: token
  });

});

//===================================================
// Autenticacion de google
//===================================================

async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });

  const payload = ticket.getPayload();
  //const userid = payload['sub'];
  // If request specified a G Suite domain:
  //const domain = payload['hd'];

  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true
  };
}

app.post("/google", async (req, res) => {
  var token = req.body.token;

  // try{
  //   var googleUser = await verify(token);
  // } catch(error){
  //   res.status(403).json({
  //         ok: false,
  //         mensaje:'Token no valido'

  //       });
  // }

  var googleUser = await verify(token).catch(e => {
    res.status(403).json({
      ok: false,
      mensaje: "Token no valido"
    });
  });

  Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar usuario",
        errors: err
      });
    }

    if (usuarioDB) {
      if (usuarioDB.google === false) {
        return res.status(400).json({
          ok: false,
          mensaje: "Debe usar su autenticación normal"
        });
      } else {
        usuarioDB.password = ":)";
        var token = jwt.sign({ usuario: usuarioDB }, SEED, {
          expiresIn: 14400
        }); // 4hrs expira

        res.status(200).json({
          ok: true,
          usuario: usuarioDB,
          token: token,
          id: usuarioDB.id,
          menu: obtenerMenu(usuarioDB.role)
        });
      }
    } else {
      // usuario no existe
      var usuario = new Usuario();

      usuario.nombre = googleUser.nombre;
      usuario.email = googleUser.email;
      usuario.img = googleUser.img;
      usuario.password = ":)";
      usuario.google = true;

      usuario.save((err, usuarioDB) => {
        usuarioDB.password = ":)";
        var token = jwt.sign({ usuario: usuarioDB }, SEED, {
          expiresIn: 14400
        }); // 4hrs expira

        res.status(200).json({
          ok: true,
          usuario: usuarioDB,
          token: token,
          id: usuarioDB.id,
          menu: obtenerMenu(usuarioDB.role)
        });
      });
    }
  });

  // res.status(200).json({
  //   ok: true,
  //   mensaje: "TODO OK",
  //   googleUser: googleUser
  // });
});

//===================================================
// Autenticacion normal
//===================================================

app.post("/", (req, res) => {
  var body = req.body;

  Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar usuario",
        errors: err
      });
    }

    if (!usuarioDB) {
      return res.status(400).json({
        ok: false,
        mensaje: "Credenciales incorrectas - email",
        errors: err
      });
    }

    if (!bcrypt.compareSync(req.body.password, usuarioDB.password)) {
      return res.status(400).json({
        ok: false,
        mensaje: "Credenciales incorrectas - password",
        errors: err
      });
    }

    // Crear Token
    usuarioDB.password = ":)";
    var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4hrs expira

    res.status(200).json({
      ok: true,
      usuario: usuarioDB,
      token: token,
      id: usuarioDB.id,
      menu: obtenerMenu(usuarioDB.role)
    });
  });
});

function obtenerMenu(ROLE) {
  var menu = [
    {
      titulo: "Principal",
      icono: "mdi mdi-gauge",
      submenu: [
        { titulo: "Dashboard", url: "/dashboard" },
        { titulo: "ProgressBar", url: "/progress" },
        { titulo: "Graficas", url: "/graficas1" },
        { titulo: "Promesas", url: "/promesas" },
        { titulo: "Rxjs", url: "/rxjs" },
        { titulo: "Ajustes", url: "/account-settings" }
      ]
    },
    {
      titulo: "Mantenimiento",
      icono: "mdi mdi-wrench",
      submenu: [
        //{titulo: 'Usuarios', url: '/usuarios'},
        { titulo: "Hospitales", url: "/hospitales" },
        { titulo: "Medicos", url: "/medicos" }
      ]
    }
  ];

  if (ROLE === "ADMIN_ROLE") {
    menu[1].submenu.unshift({ titulo: "Usuarios", url: "/usuarios" });
  } else {
  }

  return menu;
}

module.exports = app;
