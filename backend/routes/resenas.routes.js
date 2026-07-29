const express = require("express");
const router = express.Router();
const Resenas = require("../models/Resena");
const Resena = require("../models/Resena");


//get 
router.get("/", async(req, res, next) => {
    try {
        const { vidojuegoId } = req.query;
        let query = {};
        if (vidojuegoId) query.vidojuegoId = vidojuegoId;
        const resenas = await Resenas.find(query);
        res.json(resenas)
    } catch (error) {
        next(error)
    }

});

//post
router.post("/", async(req, res, next) => {
    try {
        const { vidojuegoId, usuario, califiacion, comentario } = req.body
        if (!vidojuegoId || !usuario || !califiacion === undefined || !comentario) {
            return res.status(404).json({ mensaje: "faltan campos por rellenar" })
        }
        const nueevaRes = new Resenas([vidojuegoId, usuario, califiacion, comentario]);
        const resenaGuar = await nueevaRes.save();
        res.status(201).json({ mensaje: "Reseña pubicada", resena: resenaGuar })

    } catch (error) {
        next(error);
    }
});
module.exports = router;