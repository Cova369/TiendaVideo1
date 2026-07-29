const mongoose = require('mongoose');

const categoriaSchema = new mongoose.Schema({
    nombre: { type: String, required: true, unique: true, trim: true },
    descripcion: { type: String, required: true }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("Categoria", categoriaSchema, "categorias");