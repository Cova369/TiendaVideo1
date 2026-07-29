const express = require("express");
const router = express.Router();
const Orden = require("../models/Orden");
const { verificarToken, verificarRol } = require("../middlewares/auth");

// GET — cualquier usuario logueado puede ver órdenes.
// El cliente ve solo LAS SUYAS; el admin ve TODAS (para poder administrarlas).
router.get("/", verificarToken, async(req, res, next) => {
    try {
        const filtro = req.usuario.rol === "admin" ? {} : { "usuario.id": req.usuario.id };
        const ordenes = await Orden.find(filtro).sort({ createdAt: -1 });
        res.json(ordenes);
    } catch (error) {
        next(error);
    }
});

// POST — el CLIENTE crea su propia orden. Tomamos el id/nombre del usuario
// directo del token (req.usuario), no de lo que mande el body, para que
// nadie pueda crear una orden a nombre de otra persona.
router.post("/", verificarToken, verificarRol("cliente"), async(req, res, next) => {
    try {
        const { items, total } = req.body;
        if (!items || items.length === 0 || total === undefined) {
            return res.status(400).json({ mensaje: "faltan campos por llenar" });
        }

        const nuevaOrden = new Orden({
            usuario: {
                id: req.usuario.id,
                nombre: req.usuario.nombreCompleto
            },
            items,
            total,
            estado: "pendiente" // toda orden nueva nace en este estado
        });
        const ordenGuardada = await nuevaOrden.save();
        res.status(201).json({ mensaje: "se agregó correctamente la orden", orden: ordenGuardada });
    } catch (error) {
        next(error);
    }
});

// PUT /:id/estado — SOLO el administrador puede cambiar el estado de una orden
router.put("/:id/estado", verificarToken, verificarRol("admin"), async(req, res, next) => {
    try {
        const { estado } = req.body;
        const estadosValidos = ["pendiente", "completado", "cancelado"];
        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({ mensaje: "Estado inválido. Usa: " + estadosValidos.join(", ") });
        }

        const ordenAct = await Orden.findByIdAndUpdate(
            req.params.id, { estado }, { new: true, runValidators: true }
        );
        if (!ordenAct) {
            return res.status(404).json({ mensaje: "No se encontró la orden" });
        }
        res.json({ mensaje: "Estado de la orden actualizado", orden: ordenAct });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
