const API_URL = "http://localhost:8000/colaboradores/"; 
let token = sessionStorage.getItem("access_token"); // JWT almacenado
const menu = document.querySelector(".menu ul");
const tbody = document.getElementById("colaboradores-body");

let paginaActual = 1;
const size = 10;
let totalPaginas = 1;

// --------------------
// Verificar sesión y rol
// --------------------
async function verificarSesion() {
  if (!token) {
    await Swal.fire({
      icon: "error",
      title: "No autorizado",
      text: "Debes iniciar sesión."
    });
    window.location.href = "../index.html";
    return null;
  }

  try {
    const res = await fetch("http://localhost:8000/auth/me/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("No autorizado");

    const user = await res.json();

    if (user.rol !== "admin") {
      await Swal.fire({
        icon: "error",
        title: "Acceso no autorizado",
        text: "Solo los administradores pueden acceder a esta página."
      });
      window.location.href = "../index.html";
      return null;
    }

    return user;

  } catch (err) {
    console.error("Error al verificar sesión:", err);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "No tienes autorización para acceder."
    });
    window.location.href = "../index.html";
    return null;
  }
}

// --------------------
// Inicializar página
// --------------------
verificarSesion().then(user => {
  if (!user) return;

  // Configurar menú
  if (menu) {
    menu.innerHTML = '<li><img src="../../public/img/logo.png" alt="Logo" class="logo"></li>';
    menu.innerHTML += `
      <li><a href="../views/solicitudes.html">Solicitudes</a></li>
      <li><a href="../views/agenda.html">Agenda</a></li>
      <li><a href="../views/inventario.html">Inventario</a></li>
      <li><a href="../views/colaboradores.html" class="active">Colaboradores</a></li>
      <li><a href="../views/login.html" id="logout">Cerrar sesión</a></li>
    `;
  }

  // Logout
  const logout = document.getElementById("logout");
  if (logout) {
    logout.addEventListener("click", async function(e) {
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
        sessionStorage.clear();
        await Swal.fire({
          icon: "success",
          title: "Sesión cerrada",
          text: "Has cerrado sesión correctamente."
        });
        window.location.href = "../index.html";
      }
    });
  }

  // Cargar primera página
  cargarColaboradores(paginaActual);

  // Botón "Cargar más"
  document.getElementById("cargar-mas")?.addEventListener("click", () => {
    if (paginaActual < totalPaginas) {
      paginaActual++;
      cargarColaboradores(paginaActual, true); // append=true
    }
  });
});

// --------------------
// Cargar colaboradores con SweetAlert de carga
// --------------------
async function cargarColaboradores(pagina = 1, append = false) {
  try {
    // Mostrar SweetAlert de carga
    Swal.fire({
      title: 'Cargando colaboradores...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const res = await fetch(`${API_URL}?page=${pagina}&size=${size}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("Error al cargar colaboradores");

    const data = await res.json();
    totalPaginas = data.total_pages || 1;

    if (!append) tbody.innerHTML = "";

    (data.colaboradores || []).forEach(colab => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${colab.nombre}</td>
        <td>${colab.id_colaborador}</td>
        <td>${colab.especialidad}</td>
        <td>${colab.pago_hora}</td>
      `;
      tbody.appendChild(row);
    });

    document.getElementById("cargar-mas").style.display = (paginaActual < totalPaginas) ? "block" : "none";

    Swal.close(); // Cerrar SweetAlert de carga

  } catch (err) {
    Swal.close(); // Asegurarse de cerrar el loading
    Swal.fire("Error", err.message, "error");
  }
}
// --------------------
// Modales
// --------------------
function abrirModal(tipo) {
  document.getElementById(`modal-${tipo}`).style.display = "block";
  document.getElementById(`overlay-${tipo}`).style.display = "block";
}
function cerrarModal(tipo) {
  document.getElementById(`modal-${tipo}`).style.display = "none";
  document.getElementById(`overlay-${tipo}`).style.display = "none";

  // Limpiar inputs
  if(tipo === "agregar") {
    document.getElementById("nombre").value = "";
    document.getElementById("id").value = "";
    document.getElementById("especialidad").value = "";
    document.getElementById("pago").value = "";
  }
  if(tipo === "eliminar") {
    document.getElementById("id-eliminar").value = "";
  }
}

document.getElementById("btn-agregar")?.addEventListener("click", () => abrirModal("agregar"));
document.getElementById("btn-eliminar")?.addEventListener("click", () => abrirModal("eliminar"));

// --------------------
// Agregar colaborador
// --------------------
document.getElementById("guardar-colaborador")?.addEventListener("click", async () => {
  const nuevo = {
    id_colaborador: parseInt(document.getElementById("id").value, 10),
    nombre: document.getElementById("nombre").value.trim(),
    especialidad: document.getElementById("especialidad").value.trim(),
    pago_hora: parseFloat(document.getElementById("pago").value),
  };

  if (!nuevo.nombre || !nuevo.id_colaborador || !nuevo.especialidad || !nuevo.pago_hora) {
    Swal.fire("Error", "Por favor, completa todos los campos.", "warning");
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(nuevo)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Error al guardar colaborador");
    }

    paginaActual = 1;
    await cargarColaboradores(paginaActual);
    cerrarModal("agregar");
    Swal.fire("Éxito", "Colaborador agregado correctamente", "success");

  } catch (err) {
    Swal.fire("Error", err.message, "error");
  }
});

// --------------------
// Eliminar colaborador
// --------------------
document.getElementById("confirmar-eliminar")?.addEventListener("click", async () => {
  const idEliminar = document.getElementById("id-eliminar").value;

  if (!idEliminar) {
    Swal.fire("Error", "Por favor ingresa un ID", "warning");
    return;
  }

  try {
    const res = await fetch(`${API_URL}${idEliminar}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Error al eliminar colaborador");
    }

    paginaActual = 1;
    await cargarColaboradores(paginaActual);
    cerrarModal("eliminar");
    Swal.fire("Éxito", "Colaborador eliminado correctamente", "success");

  } catch (err) {
    Swal.fire("Error", err.message, "error");
  }
});
