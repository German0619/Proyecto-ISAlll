const token = sessionStorage.getItem("access_token") || "";
const userType = localStorage.getItem("usuario");
const menu = document.querySelector(".menu ul");
const tbody = document.getElementById("agenda-body");

// --------------------
// Menú dinámico
// --------------------
if (menu) {
  menu.innerHTML = '<li><img src="../public/logo.png" alt="Logo" class="logo"></li>';

  if ("admin" === "admin") {
    menu.innerHTML += `
      <li><a href="../views/solicitudes.html">Solicitudes</a></li>
      <li><a href="../views/agenda.html" class="active">Agenda</a></li>
      <li><a href="../views/inventario.html">Inventario</a></li>
      <li><a href="../views/colaboradores.html">Colaboradores</a></li>
      <li><a href="../views/login.html" id="logout">Cerrar sesión</a></li>
    `;
  } else {
    Swal.fire({
      icon: "error",
      title: "Acceso no autorizado",
      text: "No tienes permisos para acceder a esta página."
    }).then(() => {
      window.location.href = "../index.html";
    });
  }
}

// --------------------
// Logout
// --------------------
const logout = document.getElementById("logout");
if (logout) {
  logout.addEventListener("click", function () {
    localStorage.removeItem("usuario");
    sessionStorage.removeItem("access_token");
    window.location.href = "../login.html";
  });
}

// --------------------
// Cargar agenda desde API con SweetAlert de carga
// --------------------
async function cargarAgenda() {
  try {
    // 🌀 Mostrar alerta de carga antes de hacer la petición
    Swal.fire({
      title: "Cargando agenda...",
      text: "Por favor espera un momento.",
      allowOutsideClick: false, // Evita que se cierre al hacer clic fuera
      didOpen: () => {
        Swal.showLoading(); // Muestra el spinner
      }
    });

    const response = await fetch("http://localhost:8000/solicitud/?estado=aceptada", {
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

    tbody.innerHTML = "";

    // ✅ Cerrar el SweetAlert de carga antes de renderizar
    Swal.close();

    if (agenda.length === 0) {
      const row = document.createElement("tr");
      row.innerHTML = '<td colspan="7" style="text-align: center;">No hay servicios agendados</td>';
      tbody.appendChild(row);
      return;
    }

    // Ordenar por fecha ascendente
    agenda.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    // Renderizar filas
    agenda.forEach(item => {
      const row = document.createElement("tr");
      const fechaFormateada = item.fecha
        ? new Date(item.fecha).toLocaleDateString("es-ES")
        : "Sin fecha";

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

  } catch (error) {
    console.error("Error:", error);

    // ❌ Cerrar la alerta de carga en caso de error
    Swal.close();

    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo cargar la agenda."
    });
  }
}

cargarAgenda();
