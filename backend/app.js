require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const conectarDB = require("./config/db");

// Inicialización de la aplicación
const app = express();
const PORT = process.env.PORT || 5000;

// Configuración de Middlewares Globales
app.use(cors());
app.use(express.json());
app.use(morgan("common")); // Cambiamos "dev" por "common" para que el formato de los logs en consola sea diferente al del otro equipo

// Middleware de conexión a la Base de Datos NoSQL
app.use(async(req, res, next) => {
    try {
        await conectarDB();
        next();
    } catch (error) {
        console.error("Error de conexión a MongoDB:", error.message);
        res.status(500).json({
            success: false,
            error: "Error de infraestructura",
            message: "No se pudo establecer conexión con el clúster de MongoDB Atlas"
        });
    }
});

// Ruta de diagnóstico (Health Check)
app.get("/", (req, res) => {
    res.json({
        status: "online",
        service: "API Tienda de Videojuegos",
        environment: process.env.NODE_ENV || "development"
    });
});

// Endpoints 
app.use("/api/videojuegos", require("./routes/videojuegos.routes"));
app.use("/api/categorias", require("./routes/categorias.routes"));
app.use("/api/usuarios", require("./routes/usuario.routes"));
app.use("/api/ordenes", require("./routes/ordenes.routes"));
app.use("/api/resenas", require("./routes/resenas.routes"));
app.use("/api/cupones", require("./routes/cupones.routes"));



module.exports = app;