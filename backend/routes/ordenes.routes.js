const express = require("express");
const router = express.Router();
const Orden = require("../models/Orden");
const Videojuego = require("../models/Videojuego");
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

// POST — el CLIENTE crea su propia orden.
// El frontend solo manda [{ videojuegoId, cantidad }] por cada item — NUNCA
// se confía en un título o precio que venga del cliente (alguien podría
// mandarlo directo por Postman con un precio inventado). Aquí se busca cada
// videojuego real en la base de datos y se usa SU título y SU precio actual.
router.post("/", verificarToken, verificarRol("cliente"), async(req, res, next) => {
    try {
        const { items } = req.body;
        if (!items || items.length === 0) {
            return res.status(400).json({ mensaje: "Agrega al menos un videojuego a la orden" });
        }

        const itemsValidados = [];
        let total = 0;

        for (const item of items) {
            if (!item.videojuegoId || !item.cantidad || item.cantidad < 1) {
                return res.status(400).json({ mensaje: "Cada item necesita un videojuegoId y una cantidad válida" });
            }

            const videojuego = await Videojuego.findById(item.videojuegoId);
            if (!videojuego) {
                return res.status(404).json({ mensaje: "Uno de los videojuegos ya no existe en el catálogo" });
            }

            if (videojuego.stock < item.cantidad) {
                return res.status(400).json({ mensaje: `No hay stock suficiente de "${videojuego.titulo}" (disponibles: ${videojuego.stock})` });
            }

            // El precio y el título salen SIEMPRE del documento real, nunca
            // de lo que mandó el cliente en el body.
            itemsValidados.push({
                videojuegoId: videojuego._id,
                titulo: videojuego.titulo,
                cantidad: item.cantidad,
                precioUnitario: videojuego.precio
            });
            total += videojuego.precio * item.cantidad;
        }

        const nuevaOrden = new Orden({
            usuario: {
                id: req.usuario.id,
                nombre: req.usuario.nombreCompleto
            },
            items: itemsValidados,
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
