const token = sessionStorage.getItem("access_token") || "";
let currentPage = 1;
const pageSize = 10;
let totalPages = 1;
const tbody = document.getElementById("agenda-body");
const loadMoreContainer = document.getElementById("load-more-container");

// --------------------
// Verificar sesión y usuario
// --------------------
async function verificarSesion() {
  try {
    if (!token) throw new Error("No token");

    const response = await fetch("http://localhost:8000/auth/me/", {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
    });

    if (!response.ok) throw new Error("No autorizado");

    const user = await response.json();

    if (user.rol !== "admin") {
      await Swal.fire({
        icon: "error",
        title: "Acceso no autorizado",
        text: "Solo los administradores pueden acceder a esta página."
      });
      window.location.href = "../index.html";
      return null;
    }

    // Configurar menú dinámico
    const menu = document.querySelector(".menu ul");
    if (menu) {
      menu.innerHTML = `
        <li><img src="../../public/img/logo.png" alt="Logo" class="logo"></li>
        <li><a href="../views/solicitudes.html">Solicitudes</a></li>
        <li><a href="../views/agenda.html" class="active">Agenda</a></li>
        <li><a href="../views/inventario.html">Inventario</a></li>
        <li><a href="../views/colaboradores.html">Colaboradores</a></li>
        <li><a href="../views/login.html" id="logout">Cerrar sesión</a></li>
      `;
    }

    // Logout con confirmación
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

// --------------------
// Cargar agenda desde API con paginación
// --------------------
async function cargarAgenda(page = 1) {
  try {
    const response = await fetch(`http://localhost:8000/solicitud?estado=aceptada&page=${page}&size=${pageSize}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Error al cargar la agenda");
    }

    const data = await response.json();
    const agenda = data.solicitudes || [];
    totalPages = data.total_pages;

    if (page === 1) {
      tbody.innerHTML = ""; // limpiar tabla solo en la primera carga
    }

    if (agenda.length === 0 && page === 1) {
      const row = document.createElement("tr");
      row.innerHTML = '<td colspan="7" style="text-align: center;">No hay servicios agendados</td>';
      tbody.appendChild(row);
      return;
    }

    // Renderizar filas
    agenda.forEach(item => {
      const row = document.createElement("tr");
      const fechaFormateada = item.fecha ? new Date(item.fecha).toLocaleDateString("es-ES") : "Sin fecha";

      row.innerHTML = `
        <td>${fechaFormateada}</td>
        <td>${item.nombre || "Sin nombre"}</td>
        <td>${item.telefono || "Sin contacto"}</td>
        <td>${item.tipo_trabajo || "Sin servicio"}</td>
        <td>${item.descripcion || "Sin descripción"}</td>
        <td>${item.origen || "Sin origen"}</td>
        <td>${item.destino || "Sin destino"}</td>
      `;
      tbody.appendChild(row);
    });

    // Mostrar u ocultar botón "Cargar más"
    renderLoadMoreButton();

  } catch (error) {
    console.error("Error:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo cargar la agenda."
    });
  }
}

// --------------------
// Botón de "Cargar más"
// --------------------
function renderLoadMoreButton() {
  if (!loadMoreContainer) return;

  loadMoreContainer.innerHTML = "";

  if (currentPage < totalPages) {
    const btn = document.createElement("button");
    btn.textContent = "Cargar más";
    btn.classList.add("btn", "btn-primary");
    btn.addEventListener("click", () => {
      currentPage++;
      cargarAgenda(currentPage);
    });
    loadMoreContainer.appendChild(btn);
  }
}

// --------------------
// Inicializar
// --------------------
(async function init() {
  const user = await verificarSesion();
  if (user) {
    cargarAgenda(currentPage);
  }
})();
