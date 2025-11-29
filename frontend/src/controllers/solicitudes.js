const token = sessionStorage.getItem("access_token") || "";

// --------------------
// Variables de paginación y control
// --------------------
let paginaPendientes = 1;
let paginaRechazadas = 1;
const tamañoPagina = 10;
let cargandoPendientes = false;
let cargandoRechazadas = false;

// --------------------
// Verificar sesión y usuario (solo admin)
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
    const menu = document.getElementById("menu-lista");
    if (menu) {
      menu.innerHTML = `
        <li><img src="../../public/img/logo.png" alt="Logo" class="logo"></li>
        <li><a href="../views/solicitudes.html" class="active">Solicitudes</a></li>
        <li><a href="../views/agenda.html">Agenda</a></li>
        <li><a href="../views/inventario.html">Inventario</a></li>
        <li><a href="../views/colaboradores.html">Colaboradores</a></li>
        <li><a href="../views/login.html" id="logout">Cerrar sesión</a></li>
      `;
    }

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
    console.error(err);
    await Swal.fire({ icon: "error", title: "No autorizado", text: "No tienes autorización para acceder." });
    window.location.href = "../index.html";
    return null;
  }
}

// --------------------
// Obtener solicitudes desde API con animación de carga
// --------------------
async function obtenerSolicitudes(estado, page = 1) {
  let swalCargando;
  try {
    // Mostrar animación de carga
    swalCargando = Swal.fire({
      title: 'Cargando solicitudes...',
      html: 'Por favor espera',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const res = await fetch(`http://localhost:8000/solicitud/?estado=${estado}&page=${page}&size=${tamañoPagina}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Error al obtener solicitudes");

    const data = await res.json();
    return data.solicitudes || [];
  } catch (err) {
    console.error(err);
    Swal.fire({ icon: "error", title: "Error", text: err.message });
    return [];
  } finally {
    // Cerrar animación de carga
    if (swalCargando) Swal.close();
  }
}

// --------------------
// Renderizar solicitudes en contenedor específico
// --------------------
async function renderSolicitudes(contenedorId, estado) {
  const contenedor = document.getElementById(contenedorId);
  let pagina, cargando;

  if (estado === "pendiente") {
    pagina = paginaPendientes;
    if (cargandoPendientes) return;
    cargandoPendientes = true;
  } else {
    pagina = paginaRechazadas;
    if (cargandoRechazadas) return;
    cargandoRechazadas = true;
  }

  const solicitudes = await obtenerSolicitudes(estado, pagina);

  // Si no hay solicitudes
  if (solicitudes.length === 0 && pagina === 1) {
    contenedor.innerHTML = `<p class="sin-solicitudes">No hay solicitudes ${estado}</p>`;
  } else {
    solicitudes.forEach(solicitud => {
      const card = document.createElement("div");
      card.className = "solicitud-card";

      const fechaFormateada = solicitud.fecha ? new Date(solicitud.fecha).toLocaleDateString("es-ES") : "Sin fecha";

      card.innerHTML = `
        <h3>${solicitud.nombre}</h3>
        <p><strong>Contacto:</strong> ${solicitud.telefono || "No especificado"}</p>
        <p><strong>Fecha:</strong> ${fechaFormateada}</p>
        <p><strong>Servicio:</strong> ${solicitud.tipo_trabajo}</p>
        <p><strong>Descripción:</strong> ${solicitud.descripcion || "Sin descripcion"}</p>
        <p><strong>Origen:</strong> ${solicitud.origen}</p>
        <p><strong>Destino:</strong> ${solicitud.destino}</p>
        <p><strong>Total cotizado:</strong> $${solicitud.total}</p>
      `;

      if (estado === "pendiente") {
        const aceptarBtn = document.createElement("button");
        aceptarBtn.textContent = "Aceptar";
        aceptarBtn.className = "aceptar";
        aceptarBtn.onclick = () => abrirModalColaboradores(solicitud.id_solicitud);

        const rechazarBtn = document.createElement("button");
        rechazarBtn.textContent = "Rechazar";
        rechazarBtn.className = "rechazar";
        rechazarBtn.onclick = () => actualizarEstado(solicitud.id_solicitud, "rechazada");

        card.appendChild(aceptarBtn);
        card.appendChild(rechazarBtn);
      } else {
        const eliminarBtn = document.createElement("button");
        eliminarBtn.textContent = "Eliminar";
        eliminarBtn.className = "eliminar";
        eliminarBtn.onclick = () => eliminarSolicitud(solicitud.id_solicitud);
        card.appendChild(eliminarBtn);
      }

      contenedor.appendChild(card);
    });

    // Agregar botón "Cargar más"
    const btnId = `btn-cargar-${estado}`;
    let btn = document.getElementById(btnId);
    if (!btn) {
      btn = document.createElement("button");
      btn.id = btnId;
      btn.textContent = "Cargar más";
      btn.className = "btn-cargar";
      btn.onclick = () => renderSolicitudes(contenedorId, estado);
      contenedor.appendChild(btn);
    }
  }

  // Actualizar página y bandera
  if (estado === "pendiente") {
    cargandoPendientes = false;
    if (solicitudes.length === tamañoPagina) paginaPendientes++;
  } else {
    cargandoRechazadas = false;
    if (solicitudes.length === tamañoPagina) paginaRechazadas++;
  }
}

// --------------------
// Actualizar estado vía API
// --------------------
async function actualizarEstado(id, nuevoEstado) {
  try {
    const res = await fetch(`http://localhost:8000/solicitud/${id}?estado=${nuevoEstado}`, {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Error al actualizar estado");
    }

    await Swal.fire({ icon: "success", title: `Solicitud ${nuevoEstado}` });

    // Reiniciar contenedores y páginas
    document.getElementById("pendientes-container").innerHTML = "";
    document.getElementById("rechazadas-container").innerHTML = "";
    paginaPendientes = 1;
    paginaRechazadas = 1;

    renderSolicitudes("pendientes-container", "pendiente");
    renderSolicitudes("rechazadas-container", "rechazada");

  } catch (err) {
    console.error(err);
    Swal.fire({ icon: "error", title: "Error", text: err.message });
  }
}

// --------------------
// Eliminar solicitud
// --------------------
async function eliminarSolicitud(id) {
  const confirm = await Swal.fire({
    title: "¿Eliminar solicitud?",
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  });

  if (!confirm.isConfirmed) return;

  try {
    const res = await fetch(`http://localhost:8000/solicitud/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Error al eliminar solicitud");

    await Swal.fire({ icon: "success", title: "Solicitud eliminada" });

    document.getElementById("rechazadas-container").innerHTML = "";
    paginaRechazadas = 1;
    renderSolicitudes("rechazadas-container", "rechazada");

  } catch (err) {
    console.error(err);
    Swal.fire({ icon: "error", title: "Error", text: err.message });
  }
}

let solicitudSeleccionada = null;
let colaboradorSeleccionado = null;

// Abrir modal con colaboradores disponibles
async function abrirModalColaboradores(idSolicitud) {
  solicitudSeleccionada = idSolicitud;
  const modal = document.getElementById("modal-colaboradores");
  const tbody = document.getElementById("tbody-colaboradores");

  tbody.innerHTML = `
    <tr><td colspan="5">Cargando...</td></tr>
  `;

  modal.style.display = "block";

  try {
    const res = await fetch("http://localhost:8000/colaboradores/disponibles", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Error al cargar colaboradores");

    const data = await res.json();
    const colaboradores = data.colaboradores || [];

    tbody.innerHTML = "";

    if (colaboradores.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5">No hay colaboradores disponibles</td></tr>`;
      return;
    }

    colaboradores.forEach(col => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${col.id_colaborador}</td>
        <td>${col.nombre}</td>
        <td>${col.especialidad || "N/A"}</td>
        <td>$${col.pago_hora}</td>
        <td>
          <button class="seleccionar-btn" onclick="seleccionarColaborador('${col.id_colaborador}')">
            Seleccionar
          </button>
        </td>
      `;

      tbody.appendChild(row);
    });

  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="5">Error al cargar colaboradores</td></tr>`;
  }
}

// Cerrar modal
document.querySelector(".cerrar-modal").onclick = () => {
  document.getElementById("modal-colaboradores").style.display = "none";
};

async function seleccionarColaborador(idColaborador) {
  colaboradorSeleccionado = idColaborador;

  const confirm = await Swal.fire({
    title: "¿Asignar colaborador?",
    text: `Asignar colaborador ${idColaborador} a esta solicitud`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, asignar",
    cancelButtonText: "Cancelar"
  });

  if (!confirm.isConfirmed) return;

  // Enviar PATCH al backend
  try {
    const res = await fetch(`http://localhost:8000/solicitud/${solicitudSeleccionada}?estado=aceptada&colaborador=${idColaborador}`, {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) {
      const e = await res.json();
      throw new Error(e.detail);
    }

    await Swal.fire({ icon: "success", title: "Colaborador asignado" });

    // Cerrar modal
    document.getElementById("modal-colaboradores").style.display = "none";

    // Recargar solicitudes
    document.getElementById("pendientes-container").innerHTML = "";
    paginaPendientes = 1;
    renderSolicitudes("pendientes-container", "pendiente");

  } catch (err) {
    Swal.fire({ icon: "error", title: "Error", text: err.message });
  }
}

// --------------------
// Inicializar
// --------------------
verificarSesion().then(user => {
  if (!user) return;
  renderSolicitudes("pendientes-container", "pendiente");
  renderSolicitudes("rechazadas-container", "rechazada");
});
