// --------------------
// Verificar sesión y obtener usuario
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
// Inicializar la página
// --------------------
verificarSesion().then(user => {
  if (!user) return;

  const menu = document.getElementById('menu-lista');
  if (menu) {
    menu.innerHTML = '<li><img src="../../public/img/logo.png" alt="Logo" class="logo"></li>';

    if (user.rol === 'cliente') {
      menu.innerHTML += `
        <li><a href="../views/historial.html" class="active">Mi Historial</a></li>
        <li><a href="../views/cotizar.html">Nueva Cotización</a></li>
        <li><a href="../views/login.html" id="logout">Cerrar sesión</a></li>
      `;
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Acceso no autorizado',
        text: 'Solo los clientes pueden acceder a esta página.'
      }).then(() => window.location.href = '../index.html');
      return;
    }
  }

  const logout = document.getElementById('logout');
  if (logout) {
    logout.addEventListener('click', async function(e) {
      e.preventDefault();
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

  // Una vez validado el usuario, cargar historial
  cargarHistorial();
});

async function cargarHistorial(filtro = "todos") {
  const tbody = document.getElementById("historial-body");
  tbody.innerHTML = "";

  const token = sessionStorage.getItem("access_token") || ""; // o localStorage según tu implementación
  if (!token) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No autorizado</td></tr>';
    return;
  }

  try {
    const response = await fetch("http://localhost:8000/solicitud/me/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error("Error al obtener el historial");

    const data = await response.json();
    let historial = data.solicitudes || [];

    if (filtro !== "todos") {
      historial = historial.filter(item => item.estado === filtro);
    }

    if (historial.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No hay registros en tu historial</td></tr>';
      return;
    }

    historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    historial.forEach(item => {
      const row = document.createElement("tr");
      const fechaFormateada = item.fecha
        ? new Date(item.fecha).toLocaleDateString("es-ES")
        : "Sin fecha";

      row.innerHTML = `
        <td>${fechaFormateada}</td>
        <td>${item.tipo_trabajo || "Sin servicio"}</td>
        <td>${item.descripcion || "Sin descripción"}</td>
        <td class="estado-${item.estado}">${item.estado || "Pendiente"}</td>
        <td>$${item.total || "0"}</td>
      `;
      tbody.appendChild(row);
    });

  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">${error.message}</td></tr>`;
    console.error(error);
  }
}


function filtrarHistorial() {
  const filtro = document.getElementById("filtro-estado").value;
  cargarHistorial(filtro);
}

document.addEventListener("DOMContentLoaded", () => {
  cargarHistorial();
});
