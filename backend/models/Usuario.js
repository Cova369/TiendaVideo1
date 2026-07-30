const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
    nombreCompleto: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rol: { type: String, enum: ["admin", "cliente"], required: true }
}, { timestamps: true, versionKey: false });

// Antes de guardar cualquier usuario, si la contraseña es nueva o cambió,
// la ciframos. "isModified" evita volver a cifrar una contraseña que ya
// estaba cifrada (por ejemplo si solo se actualiza el nombre).
// NOTA: al ser una función "async", Mongoose NO le pasa un "next" — el
// middleware termina solo cuando la función (o su promesa) se resuelve.
// Llamar a next() aquí tronaría con "next is not a function".
usuarioSchema.pre("save", async function() {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Método de instancia para comparar la contraseña en texto plano (la que
// escribe el usuario al iniciar sesión) contra el hash guardado en la BD.
usuarioSchema.methods.compararPassword = function(passwordIngresada) {
    return bcrypt.compare(passwordIngresada, this.password);
};

module.exports = mongoose.model("Usuario", usuarioSchema, "usuarios");