// ============================================================
// sesion.js — se incluye en TODAS las páginas del frontend.
// Centraliza: guardar/leer la sesión (token + datos del usuario),
// cerrar sesión, armar el header Authorization, y pintar la barra
// de navegación con enlaces distintos según si hay sesión o no.
// ============================================================

const API_BASE = "https://tienda-video1.vercel.app/api";

// Lee lo que haya guardado en el navegador. Regresa null si no hay
// sesión activa (nunca truena aunque falte algo).
function obtenerSesion() {
    const token = localStorage.getItem("token");
    const usuarioJSON = localStorage.getItem("usuario");
    if (!token || !usuarioJSON) return null;
    try {
        return { token, usuario: JSON.parse(usuarioJSON) };
    } catch (error) {
        return null;
    }
}

// Se llama justo después de un login exitoso
function guardarSesion(token, usuario) {
    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(usuario));
}

function cerrarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "index.html";
}

// Regresa el objeto de headers listo para mandarse en fetch().
// Si no hay sesión, regresa un objeto vacío (la petición sale sin
// Authorization, y el backend la rechazará si esa ruta lo exige).
function headerAutorizacion() {
    const sesion = obtenerSesion();
    return sesion ? { "Authorization": "Bearer " + sesion.token } : {};
}

// Dibuja la barra de navegación al principio del <body>.
// "paginaActual" es el nombre del archivo (ej. "categorias.html")
// para resaltar en qué página estás.
function renderNav(paginaActual) {
    const sesion = obtenerSesion();

    const enlaces = [
        { href: "index.html", texto: "🎮 Catálogo" },
        { href: "categorias.html", texto: "🏷️ Categorías" },
        { href: "cupones.html", texto: "🎟️ Cupones" },
        { href: "ordenes.html", texto: "🧾 Órdenes" }
    ];

    let html = enlaces.map(function(enlace) {
        const clase = paginaActual === enlace.href ? "nav-link activo" : "nav-link";
        return '<a href="' + enlace.href + '" class="' + clase + '">' + enlace.texto + '</a>';
    }).join("");

    if (sesion) {
        html += '<span class="nav-usuario">👤 ' + sesion.usuario.nombreCompleto +
            ' (' + sesion.usuario.rol + ')</span>';
        html += '<a href="#" class="nav-link" onclick="cerrarSesion(); return false;">Cerrar sesión</a>';
    } else {
        html += '<a href="login.html" class="nav-link">Iniciar sesión</a>';
        html += '<a href="registro.html" class="nav-link">Registrarse</a>';
    }

    const nav = document.createElement("nav");
    nav.className = "nav-principal";
    nav.innerHTML = html;
    document.body.insertBefore(nav, document.body.firstChild);
}