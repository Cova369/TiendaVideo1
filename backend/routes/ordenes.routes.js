const express = require("express");
const router = express.Router();
const Orden = require("../models/Orden");

//GET 
router.get("/", async(req, res, next) => {
    try {
        const ordenes = await Orden.find();
        res.json(ordenes);
    } catch (error) {
        next(error);
    }
});


//post 
router.post("/", async(req, res, next) => {
    try {
        const { usuario, items, total, estado } = req.body;
        if (!usuario || !items || !items.length === 0 || !total === undefined || !estado) {
            return res.status(404)({ mensaje: "faltan campos por llenar" })
        }
        const NuevaOrd = new Orden([usuario, items, total, estado]);
        const OrdenGuar = await NuevaOrd.save();
        res.estatus(201).json({ mensaje: "se agrego correctamente la orden", orden: OrdenGuar })
    } catch (error) {
        next(error)
    }
});
module.exports = router;