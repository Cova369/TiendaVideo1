const express = require("express");
const router = express.Router();
const Videojuego = require("../models/Videojuego");
const { verificarToken, verificarRol } = require("../middlewares/auth");

//GET con busqueda dinamica por plataforma 
router.get("/", async(req, res, next) => {
    try {
        const { buscar, plataforma } = req.query;
        let query = {};
        if (buscar) {
            query.titulo = { $regex: buscar, $option: "i" };
        }
        if (plataforma) {
            query.plataforms = plataforma;
        }
        const viedojuegos = await Videojuego.find(query);
        res.json(viedojuegos);


    } catch (error) {
        next(error);
    }
});

//Get por el id 
router.get("/:id", async(req, res, next) => {
    try {
        const videojuego = await Videojuego.findById(req.params.id);
        if (!videojuego) {
            return res.status(404).json({ mensaje: "videojuego no encontrado" });
        }
        res.json(videojuego);
    } catch (error) {
        next(error);

    }
});

//Post — SOLO el administrador puede agregar videojuegos al catálogo
router.post("/", verificarToken, verificarRol("admin"), async(req, res, next) => {
    try {
        const { titulo, descripcion, precio, stock, plataformas, imagenUrl, desarrollador, categoria } = req.body;
        //validacion
        if (!titulo || !descripcion || precio === undefined || stock === undefined || !plataformas || !imagenUrl || !desarrollador) {
            return res.status(400).json({ mensaje: "Faltan datos obligatorios del videojuego" });
        }

        const NuevoJuego = new Videojuego({
            titulo,
            descripcion,
            precio,
            stock,
            plataformas,
            imagenUrl,
            desarrollador,
            categoria

        });
        const videojuegoGuard = await NuevoJuego.save();
        res.status(201).json({ mensaje: "video juego agreagado correctamente ", videojuego: videojuegoGuard });

    } catch (error) {
        next(error);
    }

});
//Put actualizar un doc — SOLO admin

router.put("/:id", verificarToken, verificarRol("admin"), async(req, res, next) => {
    try {
        const { titulo, descripcion, precio, stock, plataformas, imagenUrl, desarrolador, categoria } = req.body;
        //validacion
        if (!titulo || !descripcion || precio === undefined || stock === undefined || !plataformas || !imagenUrl || !desarrolador) {
            return res.status(400).json({ mensaje: "Faltan datos para actualizar" });
        }
        const videojuegoAct = await Videojuego.findByIdAndUpdate(
            req.params.id, { titulo, descripcion, precio, stock, plataformas, imagenUrl, desarrollador, categoria }, { new: true, runValidators: true }
        );
        if (!videojuegoAct) {
            return res.status(404).json({ mensaje: "videojuego no encontrado" });
        }
        res.json({ mensaje: "Videojuego Actualizado Correctamente", videojuego: videojuegoAct })
    } catch (error) {
        next(error);
    }
});

// DELETE — SOLO el administrador puede eliminar videojuegos. Un cliente
// jamás debe poder borrar el catálogo, ni siquiera el suyo propio.
router.delete("/:id", verificarToken, verificarRol("admin"), async(req, res, next) => {
    try {
        const videojuegoElim = await Videojuego.findByIdAndDelete(req.params.id);
        if (!videojuegoElim) {
            return res.status(404).json({ mensaje: "Video Juego no encontrado" });

        }
        res.json({ mensaje: "Videojuego eliminado Correctamente" });
    } catch (error) {
        next(error);
    }
});
module.exports = router;