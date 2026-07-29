const mongoose = require('mongoose');

const resenaSchema = new mongoose.Schema({
    videojuegoId: { type: mongoose.Schema.Types.ObjectId, ref: "Videojuego", required: true },
    usuario: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
        nombre: { type: String }
    },
    calificacion: { type: Number, required: true, min: 1, max: 5 },
    comentario: { type: String, required: true }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("Resena", resenaSchema, "resenas");