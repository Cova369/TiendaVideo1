const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

// GET de los usuarios (nunca se manda la contraseña, ni siquiera cifrada)
router.get("/", async(req, res, next) => {
    try {
        const usuarios = await Usuario.find().select("-password");
        res.json(usuarios);
    } catch (error) {
        next(error);
    }
});

// POST — registro de un nuevo usuario.
// El cifrado del password ya NO se hace aquí: el modelo Usuario lo hace
// automáticamente en su hook "pre save" (ver models/Usuario.js).
router.post("/", async(req, res, next) => {
    try {
        const { nombreCompleto, email, password, rol } = req.body;
        if (!nombreCompleto || !email || !password || !rol) {
            return res.status(400).json({ mensaje: "faltan datos para poder agregarlo" });
        }
        const nuevoUsu = new Usuario({ nombreCompleto, email, password, rol });
        const usuarioGuardado = await nuevoUsu.save();
        const respuesta = usuarioGuardado.toObject();
        delete respuesta.password;
        res.status(201).json({ mensaje: "Usuario registrado Correctamente ", Usuario: respuesta });

    } catch (error) {
        // Error típico aquí: email duplicado (unique: true en el modelo)
        if (error.code === 11000) {
            return res.status(409).json({ mensaje: "Ya existe un usuario con ese email" });
        }
        next(error);
    }
});

// POST /login — valida credenciales y entrega un token JWT.
// Este token es lo que el frontend guarda y manda en cada petición
// protegida, dentro del header Authorization: Bearer <token>.
router.post("/login", async(req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ mensaje: "Faltan email o contraseña" });
        }

        // Aquí SÍ necesitamos traer el password (el .select de arriba lo
        // excluye por defecto para otras rutas, pero para comparar login
        // necesitamos el hash guardado)
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(401).json({ mensaje: "Credenciales inválidas" });
        }

        const passwordValida = await usuario.compararPassword(password);
        if (!passwordValida) {
            return res.status(401).json({ mensaje: "Credenciales inválidas" });
        }

        const payload = {
            id: usuario._id,
            nombreCompleto: usuario.nombreCompleto,
            rol: usuario.rol
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "8h" });

        res.json({
            mensaje: "Inicio de sesión exitoso",
            token,
            usuario: payload
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
