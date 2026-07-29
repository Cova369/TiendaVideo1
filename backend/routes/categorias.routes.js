const express = require("express");
const router = express.Router();
const Categoria = require("../models/Categoria");
const { verificarToken, verificarRol } = require("../middlewares/auth");


//get lista todas las categorias 

router.get("/", async(req, res, next, ) => {
    try {
        const categorias = await Categoria.find();
        res.json(categorias);


    } catch (error) {
        next(error);
    }
});

//post creacion de documento — SOLO el administrador puede crear categorías
router.post("/", verificarToken, verificarRol("admin"), async(req, res, next) => {
    try {
        const { nombre, descripcion } = req.body;
        if (!nombre || !descripcion) {
            return res.status(400).json({ mensaje: "Falta completar campos" });
        }
        const nuevaCategoria = new Categoria({ nombre, descripcion })
        const categoriaGuard = await nuevaCategoria.save();
        res.status(201).json({ mensaje: "categoria agregada correctamente", categoria: categoriaGuard })

    } catch (error) {
        next(error);
    }
})

//put actualizacion de documento — SOLO admin
router.put("/:id", verificarToken, verificarRol("admin"), async(req, res, next) => {
    try {
        const { nombre, descripcion } = req.body;

        if (!nombre || !descripcion) {
            return res.status(400).json({ mensaje: "Faltan datos para actualizar" });
        }
        const cateoriaAct = await Categoria.findByIdAndUpdate(
            req.params.id, { nombre, descripcion }, { new: true }
        );
        if (!cateoriaAct) {
            return res.status(404).json({ mensaje: "No se encontro la categoria" });
        }
        res.json({ mensaje: "categoria actualizada correctamente", categoria: cateoriaAct });
    } catch (error) {
        next(error)

    }

});

//delete eliminacion de un documento — SOLO admin
router.delete("/:id", verificarToken, verificarRol("admin"), async(req, res, next) => {
    try {
        const categoriaElim = await Categoria.findByIdAndDelete(req.params.id);
        if (!categoriaElim) {
            return res.status(404).json({ mensaje: "No se encontro la categoria a eliminar" })
        }
        res.json({ mensaje: "Se elimino la categoria correactamente" });

    } catch (error) {
        next(error)
    }
});
module.exports = router;