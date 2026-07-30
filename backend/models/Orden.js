const mongoose = require('mongoose');

const ordenSchema = new mongoose.Schema({
    usuario: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
        nombre: { type: String }
    },
    items: [{
        videojuegoId: { type: mongoose.Schema.Types.ObjectId, ref: "Videojuego" },
        titulo: { type: String, required: true },
        cantidad: { type: Number, required: true, min: 1 },
        precioUnitario: { type: Number, required: true }
    }],
    subtotal: { type: Number, required: true },
    cupon: {
        codigo: { type: String },
        porcentajeDescuento: { type: Number }
    },
    descuento: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    estado: { type: String, enum: ["pendiente", "completado", "cancelado"], required: true }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("Orden", ordenSchema, "ordenes");