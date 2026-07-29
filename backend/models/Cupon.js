const mongoose = require('mongoose');

const cuponSchema = new mongoose.Schema({
    codigo: { type: String, required: true, unique: true, trim: true },
    porcentajeDescuento: { type: Number, required: true, min: 1, max: 100 },
    activo: { type: Boolean, required: true, default: true },
    fechaExpiracion: { type: Date, required: true }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("Cupon", cuponSchema, "cupones");