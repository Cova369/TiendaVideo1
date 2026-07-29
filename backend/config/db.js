const mongoose = require("mongoose");

// Se cachea la conexión para que funciones serverless (Vercel) no abran
// una conexión nueva en cada request.
let conexion = null;

async function conectarDB() {
    if (conexion) return conexion;

    const uri = process.env.MONGO_URI;

    if (!uri) {
        console.error("Falta la variable de entorno MONGO_URI. Revisa tu archivo .env");
        throw new Error("MONGO_URI no configurada");
    }

    conexion = await mongoose.connect(uri);
    console.log("Conectado correctamente a MongoDB Atlas");
    return conexion;
}

module.exports = conectarDB;