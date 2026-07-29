const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    nombreCompleto: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rol: { type: String, enum: ["admin", "cliente"], required: true }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("Usuario", usuarioSchema, "usuarios");