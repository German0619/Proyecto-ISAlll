// --------------------
// Verificar sesión
// --------------------
async function verificarSesion() {
  try {
    const token = sessionStorage.getItem('access_token') || '';
    if (!token) {
      await Swal.fire({
        icon: 'error',
        title: 'No autorizado',
        text: 'No tienes autorización para acceder a esta página.'
      });
      window.location.href = '../index.html';
      return null;
    }

    const response = await fetch('http://localhost:8000/auth/me/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      await Swal.fire({
        icon: 'error',
        title: 'No autorizado',
        text: 'No tienes autorización para acceder a esta página.'
      });
      window.location.href = '../index.html';
      return null;
    }

    const data = await response.json();
    return data; // { id_usuario, nombre, rol, ... }
  } catch (error) {
    console.error('Error al verificar sesión:', error);
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No tienes autorización para acceder a esta página.'
    });
    window.location.href = '../index.html';
    return null;
  }
}
// --------------------
// Inicializar
// --------------------
verificarSesion().then(user => {
  if (user) {
    token = sessionStorage.getItem('access_token');

    // Renderizar menú dinámico
    const menu = document.getElementById('menu-lista');
    if (menu) {
      menu.innerHTML = '<li><img src="../../public/img/logo.png" alt="Logo" class="logo"></li>';

      if (user.rol === 'admin') {
        menu.innerHTML += `
          <li><a href="../views/solicitudes.html">Solicitudes</a></li>
          <li><a href="../views/agenda.html">Agenda</a></li>
          <li><a href="../views/inventario.html" class="active">Inventario</a></li>
          <li><a href="../views/colaboradores.html">Colaboradores</a></li>
          <li><a href="../views/login.html" id="logout">Cerrar sesión</a></li>
        `;
      } else {
        alert('Acceso no autorizado.');
        window.location.href = '../index.html';
      }
    }

    const logout = document.getElementById('logout');
    if (logout) {
      logout.addEventListener('click', async function (e) {
        e.preventDefault(); // prevenir redirección automática

        const result = await Swal.fire({
          title: '¿Cerrar sesión?',
          text: "¿Seguro que quieres cerrar sesión?",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, cerrar sesión',
          cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
          sessionStorage.removeItem('access_token');
          await Swal.fire({
            icon: 'success',
            title: 'Sesión cerrada',
            text: 'Has cerrado sesión correctamente.'
          });
          window.location.href = '../index.html';
        }
      });
    }

    // Cargar inventario solo si es admin
    if (user.rol === 'admin') {
      cargarInventario();
    }
  }
});

// --------------------
// Inventario con API
// --------------------
const API_URL = "http://localhost:8000/Inventario";
const tbody = document.getElementById('inventario-body');
let inventario = [];
let editItemId = null;
let token = "";

// Cargar inventario desde API
async function cargarInventario() {
  try {
    const response = await fetch(`${API_URL}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) throw new Error("Error al cargar inventario");

    const data = await response.json();
    inventario = data.inventario || [];

    tbody.innerHTML = "";
    inventario.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.nombre}</td>
        <td>${item.cantidad}</td>
        <td>
          <button class="edit-button" onclick="editarHerramienta(${item.id_item})">Editar</button>
          <button class="delete-button" onclick="eliminarHerramienta(${item.id_item})">Eliminar</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error("Error:", error);
    alert("No se pudo cargar el inventario.");
  }
}

// Abrir modal para agregar
function abrirModalAgregar() {
  editItemId = null;
  document.getElementById("modal-titulo").textContent = "Añadir Nueva Herramienta";
  document.getElementById("nombre-herramienta").value = "";
  document.getElementById("cantidad-herramienta").value = "";
  document.getElementById("modal").style.display = "block";
  document.getElementById("modal-overlay").style.display = "block";
}

// Abrir modal para editar
function editarHerramienta(id_item) {
  const item = inventario.find((i) => i.id_item === id_item);
  if (!item) return;

  editItemId = id_item;
  document.getElementById("modal-titulo").textContent = "Editar Herramienta";
  document.getElementById("nombre-herramienta").value = item.nombre;
  document.getElementById("cantidad-herramienta").value = item.cantidad;
  document.getElementById("modal").style.display = "block";
  document.getElementById("modal-overlay").style.display = "block";
}

// --------------------
// Guardar herramienta (nuevo o editado)
async function guardarHerramienta() {
  const nombre = document.getElementById("nombre-herramienta").value.trim();
  const cantidad = parseInt(document.getElementById("cantidad-herramienta").value);

  if (!nombre || isNaN(cantidad) || cantidad < 0) {
    return Swal.fire({
      icon: 'warning',
      title: 'Datos inválidos',
      text: 'Ingrese un nombre válido y una cantidad válida.'
    });
  }

  try {
    let response;
    if (editItemId) {
      // PUT actualizar
      response = await fetch(`${API_URL}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id_item: editItemId, nombre, cantidad })
      });
    } else {
      // POST agregar
      response = await fetch(`${API_URL}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id_item: 0, nombre, cantidad })
      });
    }

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Error en la operación");
    }

    cerrarModal();
    await cargarInventario();
    await Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: editItemId ? 'Herramienta actualizada correctamente' : 'Herramienta añadida correctamente'
    });
  } catch (error) {
    console.error("Error:", error);
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message
    });
  }
}

// Eliminar herramienta
async function eliminarHerramienta(id_item) {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: "Esta acción no se puede deshacer",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (!result.isConfirmed) return;

  try {
    const response = await fetch(`${API_URL}/${id_item}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Error al eliminar la herramienta");
    }

    await cargarInventario();
    await Swal.fire({
      icon: 'success',
      title: 'Eliminado',
      text: 'La herramienta ha sido eliminada correctamente.'
    });
  } catch (error) {
    console.error("Error:", error);
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message
    });
  }
}


// Cerrar modal
function cerrarModal() {
  document.getElementById("modal").style.display = "none";
  document.getElementById("modal-overlay").style.display = "none";
}
