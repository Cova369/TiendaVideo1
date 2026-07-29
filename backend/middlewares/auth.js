const jwt = require("jsonwebtoken");

// Revisa que la petición traiga un token JWT válido en el header
// "Authorization: Bearer <token>". Si es válido, guarda los datos del
// usuario (id, rol, nombreCompleto) en req.usuario para que las rutas
// siguientes sepan quién está haciendo la petición.
function verificarToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ mensaje: "No se proporcionó un token de acceso" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = payload; // { id, rol, nombreCompleto }
        next();
    } catch (error) {
        return res.status(401).json({ mensaje: "Token inválido o expirado" });
    }
}

// Middleware "de fábrica": recibe la lista de roles permitidos y regresa
// un middleware que solo deja pasar si req.usuario.rol está en esa lista.
// Debe usarse SIEMPRE después de verificarToken (para que req.usuario exista).
function verificarRol(...rolesPermitidos) {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(401).json({ mensaje: "No autenticado" });
        }
        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({ mensaje: "No tienes permisos para realizar esta acción" });
        }
        next();
    };
}

module.exports = { verificarToken, verificarRol };
