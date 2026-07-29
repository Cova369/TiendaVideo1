const express = require("express");
const router = express.Router();
const Cupones = require("../models/Cupon");
const Cupon = require("../models/Cupon");

//get 
router.get("/", async(req, res, next) => {
    try {
        const Cupones = await Cupon.find();
        res.json(Cupones);
    } catch (error) {
        next(error);
    }
});

//post 

router.post("/", async(req, res, next) => {
    try {
        const { codigo, porcentajedesc, activo, fechaexp } = req.body
        if (!codigo || !porcentajedesc === undefined || !fechaexp) {
            return res.status(400).json({ mensaje: "faltan campos por llenar" });
        }

        const nuevoCupon = new({ codigo, porcentajedesc, activo, fechaexp });
        const cuponGuard = await nuevoCupon.save();
        res.status(201).json({ mensaje: "cupon agregado correctamente ", Cupon: cuponGuard })
    } catch (error) {
        next(error)
    }
})
module.exports = router;