const express = require("express");
const router = express.Router();
const Resena = require("../models/Resena");
const { verificarToken, verificarRol } = require("../middlewares/auth");

// GET — cualquiera puede ver las reseñas de un videojuego (público, como en
// cualquier tienda). Filtro opcional por videojuegoId.
router.get("/", async(req, res, next) => {
    try {
        const { videojuegoId } = req.query;
        let query = {};
        if (videojuegoId) query.videojuegoId = videojuegoId;
        const resenas = await Resena.find(query).sort({ createdAt: -1 });
        res.json(resenas);
    } catch (error) {
        next(error);
    }
});

// POST — SOLO un cliente autenticado puede publicar una reseña.
// El usuario que la firma sale del token, no del body (para que nadie
// pueda publicar una reseña a nombre de alguien más).
router.post("/", verificarToken, verificarRol("cliente"), async(req, res, next) => {
    try {
        const { videojuegoId, calificacion, comentario } = req.body;
        if (!videojuegoId || calificacion === undefined || !comentario) {
            return res.status(400).json({ mensaje: "faltan campos por rellenar" });
        }

        const nuevaResena = new Resena({
            videojuegoId,
            usuario: {
                id: req.usuario.id,
                nombre: req.usuario.nombreCompleto
            },
            calificacion,
            comentario
        });
        const resenaGuardada = await nuevaResena.save();
        res.status(201).json({ mensaje: "Reseña publicada", resena: resenaGuardada });
    } catch (error) {
        next(error);
    }
});

// PUT /:id — el cliente puede actualizar SOLO su propia reseña.
router.put("/:id", verificarToken, verificarRol("cliente"), async(req, res, next) => {
    try {
        const { calificacion, comentario } = req.body;

        const resenaExistente = await Resena.findById(req.params.id);
        if (!resenaExistente) {
            return res.status(404).json({ mensaje: "Reseña no encontrada" });
        }

        // Comparamos el dueño real de la reseña contra quien está pidiendo
        // el cambio (dato que viene del token, no del body — no se puede falsificar)
        if (String(resenaExistente.usuario.id) !== String(req.usuario.id)) {
            return res.status(403).json({ mensaje: "No puedes editar la reseña de otro usuario" });
        }

        resenaExistente.calificacion = calificacion !== undefined ? calificacion : resenaExistente.calificacion;
        resenaExistente.comentario = comentario !== undefined ? comentario : resenaExistente.comentario;
        const resenaAct = await resenaExistente.save();

        res.json({ mensaje: "Reseña actualizada", resena: resenaAct });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
