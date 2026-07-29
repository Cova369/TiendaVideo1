const express = require("express");
const router = express.Router();
const Cupon = require("../models/Cupon");
const { verificarToken, verificarRol } = require("../middlewares/auth");

// GET — cualquiera puede ver los cupones (por ejemplo, para aplicarlos en el carrito)
router.get("/", async(req, res, next) => {
    try {
        const cupones = await Cupon.find();
        res.json(cupones);
    } catch (error) {
        next(error);
    }
});

// POST — SOLO el administrador puede crear cupones.
// Los nombres de campos aquí deben coincidir EXACTAMENTE con el modelo
// Cupon (codigo, porcentajeDescuento, activo, fechaExpiracion).
router.post("/", verificarToken, verificarRol("admin"), async(req, res, next) => {
    try {
        const { codigo, porcentajeDescuento, activo, fechaExpiracion } = req.body;
        if (!codigo || porcentajeDescuento === undefined || !fechaExpiracion) {
            return res.status(400).json({ mensaje: "faltan campos por llenar" });
        }

        const nuevoCupon = new Cupon({ codigo, porcentajeDescuento, activo, fechaExpiracion });
        const cuponGuardado = await nuevoCupon.save();
        res.status(201).json({ mensaje: "cupon agregado correctamente ", cupon: cuponGuardado });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ mensaje: "Ya existe un cupón con ese código" });
        }
        next(error);
    }
});

// PUT — SOLO admin puede modificar un cupón (ej. desactivarlo)
router.put("/:id", verificarToken, verificarRol("admin"), async(req, res, next) => {
    try {
        const { codigo, porcentajeDescuento, activo, fechaExpiracion } = req.body;
        const cuponAct = await Cupon.findByIdAndUpdate(
            req.params.id, { codigo, porcentajeDescuento, activo, fechaExpiracion }, { new: true, runValidators: true }
        );
        if (!cuponAct) {
            return res.status(404).json({ mensaje: "No se encontró el cupón" });
        }
        res.json({ mensaje: "Cupón actualizado correctamente", cupon: cuponAct });
    } catch (error) {
        next(error);
    }
});

// DELETE — SOLO admin
router.delete("/:id", verificarToken, verificarRol("admin"), async(req, res, next) => {
    try {
        const cuponElim = await Cupon.findByIdAndDelete(req.params.id);
        if (!cuponElim) {
            return res.status(404).json({ mensaje: "No se encontró el cupón a eliminar" });
        }
        res.json({ mensaje: "Se eliminó el cupón correctamente" });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
