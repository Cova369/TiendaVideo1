const express = require("express");
const router = express.Router();
const Usuario = require("../models/Usuario");

//get de los usuarios
router.get("/", async(req, res, next) => {
    try {
        const usuarios = await Usuario.find().select("-password");
        res.json(usuarios);
    } catch (error) {
        next(error);
    }
});
router.post("/", async(req, res, next) => {
    try {
        const { nombreCompleto, email, password, rol } = req.body;
        if (!nombreCompleto || !email || !password || !rol) {
            return res.status(404).json({ mensaje: "faltan datos para poder agregarlo" });
        }
        const nuevoUsu = new Usuario({ nombreCompleto, email, password, rol });
        const usuarioGuardado = await nuevoUsu.save();
        const respuesta = usuarioGuardado.toObject();
        delete respuesta.password;
        res.status(201).json({ mensaje: "Usuario registrado Correctamente ", Usuario: respuesta })

    } catch (error) {
        next(error)

    }
});
module.exports = router;