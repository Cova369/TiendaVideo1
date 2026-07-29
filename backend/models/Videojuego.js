const mongoose = require('mongoose');

const videojuegoSchema = new mongoose.Schema({
    titulo: { type: String, required: true, trim: true },
    descripcion: { type: String, required: true },
    precio: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    plataformas: { type: [String], required: true },
    imagenUrl: { type: String, required: true },
    desarrollador: { type: String, required: true },
    categoria: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Categoria" },
        nombre: { type: String }
    }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("Videojuego", videojuegoSchema, "videojuegos");