const userType = localStorage.getItem("usuario");
const menu = document.querySelector(".menu ul");

if (menu) {
  menu.innerHTML =
    '<li><img src="/public/img/logo.png" alt="Logo" class="logo"></li>';

  if (userType === "admin") {
    menu.innerHTML += `
      <li><a href="/src/solicitudes/solicitudes.html" class="active">Solicitudes</a></li>
      <li><a href="/src/agenda/agenda.html">Agenda</a></li>
      <li><a href="/src/inventario/inventario.html">Inventario</a></li>
      <li><a href="/src/colaboradores/colaboradores.html">Colaboradores</a></li>
      <li><a href="/src/login/login.html" id="logout">Cerrar sesión</a></li>
    `;
  } else {
    alert("Acceso no autorizado.");
    window.location.href = "/src/index.html";
  }
}

const logout = document.getElementById("logout");
if (logout) {
  logout.addEventListener("click", function () {
    localStorage.removeItem("usuario");
    window.location.href = "/src/login/login.html";
  });
}

// Obtener solicitudes de localStorage
let solicitudes = JSON.parse(localStorage.getItem("solicitudes")) || [];

const pendientes = document.getElementById("pendientes-container");
const rechazadas = document.getElementById("rechazadas-container");

function cargarSolicitudes() {
  pendientes.innerHTML = "";
  rechazadas.innerHTML = "";

  if (solicitudes.length === 0) {
    pendientes.innerHTML =
      '<p class="sin-solicitudes">No hay solicitudes pendientes</p>';
    rechazadas.innerHTML =
      '<p class="sin-solicitudes">No hay solicitudes rechazadas</p>';
    return;
  }

  solicitudes.forEach((solicitud) => {
    const card = document.createElement("div");
    card.className = "solicitud-card";

    // Formatear fecha para mostrarla mejor
    const fechaFormateada = solicitud.fecha
      ? new Date(solicitud.fecha).toLocaleDateString("es-ES")
      : "Sin fecha";

    card.innerHTML = `
      <h3>${solicitud.cliente}</h3>
      <p><strong>Contacto:</strong> ${
        solicitud.contacto || "No especificado"
      }</p>
      <p><strong>Fecha:</strong> ${fechaFormateada}</p>
      <p><strong>Servicio:</strong> ${solicitud.servicio}</p>
      <p><strong>Descripción:</strong> ${solicitud.descripcion}</p>
      <p><strong>Origen:</strong> ${solicitud.origen}</p>
      <p><strong>Destino:</strong> ${solicitud.destino}</p>
      <p><strong>Total cotizado:</strong> $${solicitud.total}</p>
    `;

    if (solicitud.estado === "pendiente") {
      const aceptarBtn = document.createElement("button");
      aceptarBtn.textContent = "Aceptar";
      aceptarBtn.className = "aceptar";
      aceptarBtn.onclick = () => aceptarSolicitud(solicitud.id);

      const rechazarBtn = document.createElement("button");
      rechazarBtn.textContent = "Rechazar";
      rechazarBtn.className = "rechazar";
      rechazarBtn.onclick = () => rechazarSolicitud(solicitud.id);

      card.appendChild(aceptarBtn);
      card.appendChild(rechazarBtn);

      pendientes.appendChild(card);
    } else if (solicitud.estado === "rechazada") {
      const eliminarBtn = document.createElement("button");
      eliminarBtn.textContent = "Eliminar";
      eliminarBtn.className = "eliminar";
      eliminarBtn.onclick = () => eliminarSolicitud(solicitud.id);

      card.appendChild(eliminarBtn);
      rechazadas.appendChild(card);
    }
  });
}

function aceptarSolicitud(id) {
  let solicitudes = JSON.parse(localStorage.getItem("solicitudes")) || [];
  let historial = JSON.parse(localStorage.getItem("historial")) || [];

  const solicitudIndex = solicitudes.findIndex((s) => s.id === id);
  if (solicitudIndex !== -1) {
    solicitudes[solicitudIndex].estado = "aceptada";
    localStorage.setItem("solicitudes", JSON.stringify(solicitudes));

    const historialIndex = historial.findIndex((h) => h.id === id);
    if (historialIndex !== -1) {
      historial[historialIndex].estado = "aceptada";
      localStorage.setItem("historial", JSON.stringify(historial));
    }

    let agenda = JSON.parse(localStorage.getItem("agenda")) || [];
    agenda.push({
      ...solicitudes[solicitudIndex],
      estado: "agendado",
    });
    localStorage.setItem("agenda", JSON.stringify(agenda));

    alert("Solicitud aceptada y agregada a la agenda");
    cargarSolicitudes();
  }
}

function rechazarSolicitud(id) {
  let solicitudes = JSON.parse(localStorage.getItem("solicitudes")) || [];
  let historial = JSON.parse(localStorage.getItem("historial")) || [];

  const solicitudIndex = solicitudes.findIndex((s) => s.id === id);
  if (solicitudIndex !== -1) {
    solicitudes[solicitudIndex].estado = "rechazada";
    localStorage.setItem("solicitudes", JSON.stringify(solicitudes));

    const historialIndex = historial.findIndex((h) => h.id === id);
    if (historialIndex !== -1) {
      historial[historialIndex].estado = "rechazada";
      localStorage.setItem("historial", JSON.stringify(historial));
    }

    cargarSolicitudes();
  }
}

function eliminarSolicitud(id) {
  const solicitudIndex = solicitudes.findIndex((s) => s.id === id);
  if (solicitudIndex !== -1) {
    solicitudes.splice(solicitudIndex, 1);
    localStorage.setItem("solicitudes", JSON.stringify(solicitudes));
    cargarSolicitudes();
  }
}

// Cargar solicitudes al iniciar
cargarSolicitudes();