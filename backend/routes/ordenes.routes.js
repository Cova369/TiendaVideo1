const express = require("express");
const router = express.Router();
const Orden = require("../models/Orden");
const Videojuego = require("../models/Videojuego");
const Cupon = require("../models/Cupon");
const { verificarToken, verificarRol } = require("../middlewares/auth");
//get para ver las ordenes de todos si eres admin y si eres cleinte solo ves la tuya 
router.get("/", verificarToken, async(req, res, next) => {
    try {
        const filtro = req.usuario.rol === "admin" ? {} : { "usuario.id": req.usuario.id };
        if (req.query.estado) {
            filtro.estado = req.query.estado;
        }
        const ordenes = await Orden.find(filtro).sort({ createdAt: -1 });
        res.json(ordenes);
    } catch (error) {
        next(error);
    }
});
//post creacion de una nueva orden solo un cliente puede hacer una orden
router.post("/", verificarToken, verificarRol("cliente"), async(req, res, next) => {
    try {
        const { items, codigoCupon } = req.body;
        if (!items || items.length === 0) {
            return res.status(400).json({ mensaje: "Agrega al menos un videojuego a la orden" });
        }

        const itemsValidados = [];
        let subtotal = 0;

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
            //datos de qeu se obtienen desde videojuegos
            itemsValidados.push({
                videojuegoId: videojuego._id,
                titulo: videojuego.titulo,
                cantidad: item.cantidad,
                precioUnitario: videojuego.precio
            });
            subtotal += videojuego.precio * item.cantidad;
        }

        //agregacion del cupon
        let cuponAplicado = undefined;
        let descuento = 0;

        if (codigoCupon) {
            const cupon = await Cupon.findOne({ codigo: codigoCupon.trim() });

            if (!cupon) {
                return res.status(404).json({ mensaje: "El cupón ingresado no existe" });
            }
            if (!cupon.activo) {
                return res.status(400).json({ mensaje: "El cupón ya no está activo" });
            }
            if (cupon.fechaExpiracion < new Date()) {
                return res.status(400).json({ mensaje: "El cupón ya expiró" });
            }

            descuento = Number((subtotal * (cupon.porcentajeDescuento / 100)).toFixed(2));
            cuponAplicado = {
                codigo: cupon.codigo,
                porcentajeDescuento: cupon.porcentajeDescuento
            };
        }

        const total = Number((subtotal - descuento).toFixed(2));

        const nuevaOrden = new Orden({
            usuario: {
                id: req.usuario.id,
                nombre: req.usuario.nombreCompleto
            },
            items: itemsValidados,
            subtotal,
            cupon: cuponAplicado,
            descuento,
            total,
            estado: "pendiente" // toda orden nueva lleva como default este estado
        });
        const ordenGuardada = await nuevaOrden.save();
        res.status(201).json({ mensaje: "se agregó correctamente la orden", orden: ordenGuardada });
    } catch (error) {
        next(error);
    }
});

// PUT solo el administrador puede cambiar el estado de una orden
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
//delete el admin solo puede eliminarlas
router.delete("/:id", verificarToken, verificarRol("admin"), async(req, res, next) => {
    try {
        const ordenElim = await Orden.findByIdAndDelete(req.params.id);
        if (!ordenElim) {
            return res.status(404).json({ mensaje: "No se encontró la orden a eliminar" });
        }
        res.json({ mensaje: "Orden eliminada correctamente" });
    } catch (error) {
        next(error);
    }
});

module.exports = router;