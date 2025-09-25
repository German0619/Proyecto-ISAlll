const userType = localStorage.getItem("usuario");
if (!userType || userType === "admin") {
  alert("Acceso no autorizado.");
  window.location.href = "../index.html";
}
const menu = document.querySelector(".menu ul");
if (menu) {
  menu.innerHTML = '<li><img src="../../public/img/logo.png" alt="Logo" class="logo"></li>';

  if (userType === "cliente") {
    menu.innerHTML += `
      <li><a href="../index.html">Inicio</a></li>
      <li><a href="../views/historial.html" class="active">Mi Historial</a></li>
      <li><a href="../views/cotizar.html">Nueva Cotización</a></li>
      <li><a href="../views/login.html" id="logout">Cerrar sesión</a></li>
    `;
  }
}

const logout = document.getElementById("logout");
if (logout) {
  logout.addEventListener("click", function () {
    localStorage.removeItem("usuario");
    window.location.href = "../views/login.html";
  });
}

function cargarHistorial(filtro = "todos") {
  const tbody = document.getElementById("historial-body");
  tbody.innerHTML = "";
  const usuarioActual = localStorage.getItem("usuarioActual");

  let historial = JSON.parse(localStorage.getItem("historial")) || [];

  historial = historial.filter((item) => item.usuario === usuarioActual);

  if (filtro !== "todos") {
    historial = historial.filter((item) => item.estado === filtro);
  }

  if (historial.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" style="text-align: center;">No hay registros en tu historial</td></tr>';
    return;
  }
  historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  historial.forEach((item) => {
    const row = document.createElement("tr");
    const fechaFormateada = item.fecha
      ? new Date(item.fecha).toLocaleDateString("es-ES")
      : "Sin fecha";

    row.innerHTML = `
      <td>${fechaFormateada}</td>
      <td>${item.servicio || "Sin servicio"}</td>
      <td>${item.descripcion || "Sin descripción"}</td>
      <td class="estado-${item.estado}">${item.estado || "Pendiente"}</td>
      <td>$${item.total || "0"}</td>
    `;
    tbody.appendChild(row);
  });
}

function filtrarHistorial() {
  const filtro = document.getElementById("filtro-estado").value;
  cargarHistorial(filtro);
}

document.addEventListener("DOMContentLoaded", () => {
  cargarHistorial();
});
