const API_URL = "http://localhost:8000/colaboradores/"; // Ajusta si usas otro host/puerto
const token = sessionStorage.getItem("access_token"); // JWT almacenado en sessionStorage
const userType = sessionStorage.getItem("usuario"); // O cualquier dato que guardes para rol
const menu = document.querySelector(".menu ul");
const tbody = document.getElementById("colaboradores-body");

// 📌 Configurar menú según rol
if (menu) {
  menu.innerHTML = '<li><img src="/public/img/logo.png" alt="Logo" class="logo"></li>';

  if (userType === "admin") {
    menu.innerHTML += `
      <li><a href="../views/solicitudes.html">Solicitudes</a></li>
      <li><a href="../views/agenda.html">Agenda</a></li>
      <li><a href="../views/inventario.html">Inventario</a></li>
      <li><a href="../views/colaboradores.html" class="active">Colaboradores</a></li>
      <li><a href="../views/login.html" id="logout">Cerrar sesión</a></li>
    `;
  } else {
    alert("Acceso no autorizado.");
    window.location.href = "../index.html";
  }
}

// 📌 Logout
const logout = document.getElementById("logout");
if (logout) {
  logout.addEventListener("click", function () {
    sessionStorage.clear(); // Eliminar JWT y datos de usuario
    window.location.href = "../views/login.html";
  });
}

// 📌 Cargar colaboradores desde API
async function cargarColaboradores() {
  try {
    const res = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Error al cargar colaboradores");

    const data = await res.json();

    tbody.innerHTML = "";
    (data.colaboradores || []).forEach((colab) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${colab.nombre}</td>
        <td>${colab.id_colaborador}</td>
        <td>${colab.especialidad}</td>
        <td>${colab.pago_hora}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    alert(err.message);
  }
}
cargarColaboradores();

// 📌 Abrir/cerrar modales
function abrirModal(tipo) {
  document.getElementById(`modal-${tipo}`).style.display = "block";
  document.getElementById(`overlay-${tipo}`).style.display = "block";
}

function cerrarModal(tipo) {
  document.getElementById(`modal-${tipo}`).style.display = "none";
  document.getElementById(`overlay-${tipo}`).style.display = "none";
}

document.getElementById("btn-agregar")?.addEventListener("click", () => abrirModal("agregar"));
document.getElementById("btn-eliminar")?.addEventListener("click", () => abrirModal("eliminar"));

// 📌 Guardar nuevo colaborador (POST)
document.getElementById("guardar-colaborador")?.addEventListener("click", async () => {
  const nuevo = {
    id_colaborador: parseInt(document.getElementById("id").value, 10),
    nombre: document.getElementById("nombre").value.trim(),
    especialidad: document.getElementById("especialidad").value.trim(),
    pago_hora: parseFloat(document.getElementById("pago").value),
  };

  if (!nuevo.nombre || !nuevo.id_colaborador || !nuevo.especialidad || !nuevo.pago_hora) {
    alert("Por favor, completa todos los campos.");
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(nuevo),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Error al guardar colaborador");
    }

    await cargarColaboradores();
    cerrarModal("agregar");
  } catch (err) {
    alert(err.message);
  }
});

// 📌 Eliminar colaborador (DELETE)
document.getElementById("confirmar-eliminar")?.addEventListener("click", async () => {
  const idEliminar = document.getElementById("id-eliminar").value;

  if (!idEliminar) {
    alert("Por favor ingresa un ID");
    return;
  }

  try {
    const res = await fetch(`${API_URL}${idEliminar}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Error al eliminar colaborador");
    }

    await cargarColaboradores();
    cerrarModal("eliminar");
  } catch (err) {
    alert(err.message);
  }
});
