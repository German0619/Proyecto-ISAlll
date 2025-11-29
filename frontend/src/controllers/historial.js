const token = sessionStorage.getItem("access_token") || "";
let paginaActual = 1;
const size = 10;
let totalPaginas = 1;

// --------------------
// Verificar sesión y usuario
// --------------------
async function verificarSesion() {
  try {
    if (!token) throw new Error("No token");

    const response = await fetch("http://localhost:8000/auth/me", {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
    });

    if (!response.ok) throw new Error("No autorizado");

    const user = await response.json();

    if (user.rol !== "cliente") {
      await Swal.fire({ icon: "error", title: "Acceso no autorizado", text: "Solo los clientes pueden acceder a esta página." });
      window.location.href = "../index.html";
      return null;
    }

    // Configurar menú
    const menu = document.getElementById("menu-lista");
    if (menu) {
      menu.innerHTML = `
        <li><img src="../../public/img/logo.png" alt="Logo" class="logo"></li>
        <li><a href="../views/historial.html" class="active">Mi Historial</a></li>
        <li><a href="../views/cotizar.html">Nueva Cotización</a></li>
        <li><a href="../views/login.html" id="logout">Cerrar sesión</a></li>
      `;
    }

    // Logout
    document.getElementById("logout")?.addEventListener("click", async (e) => {
      e.preventDefault();
      const result = await Swal.fire({
        title: "¿Cerrar sesión?",
        text: "¿Seguro que quieres cerrar sesión?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, cerrar sesión",
        cancelButtonText: "Cancelar"
      });
      if (result.isConfirmed) {
        sessionStorage.removeItem("access_token");
        await Swal.fire({ icon: "success", title: "Sesión cerrada", text: "Has cerrado sesión correctamente." });
        window.location.href = "../index.html";
      }
    });

    return user;

  } catch (err) {
    console.error("Error al verificar sesión:", err);
    await Swal.fire({ icon: "error", title: "No autorizado", text: "No tienes autorización para acceder." });
    window.location.href = "../index.html";
    return null;
  }
}

async function cargarHistorial(filtro = "todas", append = false) {
  const tbody = document.getElementById("historial-body");
  if (!append) tbody.innerHTML = "";

  try {
    const url = new URL("http://localhost:8000/solicitud/me/");
    url.searchParams.append("page", paginaActual);
    url.searchParams.append("size", size);
    url.searchParams.append("estado", filtro); // enviar filtro al backend

    const response = await fetch(url, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
    });

    if (!response.ok) throw new Error("Error al obtener el historial");

    const data = await response.json();
    totalPaginas = data.total_pages || 1;
    const historial = data.solicitudes || [];

    if (historial.length === 0 && !append) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No hay registros en tu historial</td></tr>';
      return;
    }

    historial.forEach(item => {
      const row = document.createElement("tr");
      const fechaFormateada = item.fecha ? new Date(item.fecha).toLocaleDateString("es-ES") : "Sin fecha";
      row.innerHTML = `
        <td>${fechaFormateada}</td>
        <td>${item.tipo_trabajo || "Sin servicio"}</td>
        <td>${item.descripcion || "Sin descripción"}</td>
        <td class="estado-${item.estado}">${item.estado || "Pendiente"}</td>
        <td>$${item.total || 0}</td>
      `;
      tbody.appendChild(row);
    });

    // Mostrar u ocultar botón "Cargar más"
    const btnCargarMas = document.getElementById("cargar-mas");
    if (btnCargarMas) {
      btnCargarMas.style.display = (paginaActual < totalPaginas) ? "block" : "none";
    }

  } catch (error) {
    console.error(error);
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">${error.message}</td></tr>`;
  }
}

// --------------------
// Función para filtrar historial
// --------------------
function filtrarHistorial() {
  const filtro = document.getElementById("filtro-estado").value || "todas";
  paginaActual = 1;
  cargarHistorial(filtro);
}


// --------------------
// Botón "Cargar más"
// --------------------
document.getElementById("cargar-mas")?.addEventListener("click", () => {
  paginaActual++;
  cargarHistorial(document.getElementById("filtro-estado")?.value || "todos", true);
});

// --------------------
// Inicialización
// --------------------
verificarSesion().then(user => {
  if (!user) return;
  cargarHistorial();
});
