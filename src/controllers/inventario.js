// Menú dinámico
const userType = localStorage.getItem('usuario');
const menu = document.querySelector('.menu ul');

if (menu) {
  menu.innerHTML = '<li><img src="/public/img/logo.png" alt="Logo" class="logo"></li>';

  if (userType === 'admin') {
    menu.innerHTML += `
      <li><a href="/src/solicitudes/solicitudes.html">Solicitudes</a></li>
      <li><a href="/src/agenda/agenda.html">Agenda</a></li>
      <li><a href="/src/inventario/inventario.html" class="active">Inventario</a></li>
      <li><a href="/src/colaboradores/colaboradores.html">Colaboradores</a></li>
      <li><a href="/src/login/login.html" id="logout">Cerrar sesión</a></li>
    `;
  } else {
    alert('Acceso no autorizado.');
    window.location.href = 'index.html';
  }
}

const logout = document.getElementById('logout');
if (logout) {
  logout.addEventListener('click', function() {
    localStorage.removeItem('usuario');
    window.location.href = '/src/login/login.html';
  });
}

// Inventario de ejemplo
let inventario = [
  { herramienta: "Camión de carga", cantidad: 3 },
  { herramienta: "Grúa hidráulica", cantidad: 2 },
  { herramienta: "Carretillas", cantidad: 10 },
  { herramienta: "Transpaletas", cantidad: 5 }
];

const tbody = document.getElementById('inventario-body');
let editIndex = null;

// Cargar tabla
function cargarInventario() {
  tbody.innerHTML = '';
  inventario.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.herramienta}</td>
      <td>${item.cantidad}</td>
      <td>
        <button class="edit-button" onclick="editarHerramienta(${index})">Editar</button>
        <button class="delete-button" onclick="eliminarHerramienta(${index})">Eliminar</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Abrir modal para agregar
function abrirModalAgregar() {
  editIndex = null;
  document.getElementById('modal-titulo').textContent = 'Añadir Nueva Herramienta';
  document.getElementById('nombre-herramienta').value = '';
  document.getElementById('cantidad-herramienta').value = '';
  document.getElementById('modal').style.display = 'block';
  document.getElementById('modal-overlay').style.display = 'block';
}

// Abrir modal para editar
function editarHerramienta(index) {
  editIndex = index;
  document.getElementById('modal-titulo').textContent = 'Editar Herramienta';
  document.getElementById('nombre-herramienta').value = inventario[index].herramienta;
  document.getElementById('cantidad-herramienta').value = inventario[index].cantidad;
  document.getElementById('modal').style.display = 'block';
  document.getElementById('modal-overlay').style.display = 'block';
}

// Guardar herramienta (nuevo o editado)
function guardarHerramienta() {
  const nombre = document.getElementById('nombre-herramienta').value.trim();
  const cantidad = parseInt(document.getElementById('cantidad-herramienta').value);

  if (!nombre || isNaN(cantidad) || cantidad < 0) {
    alert('Ingrese un nombre válido y una cantidad válida.');
    return;
  }

  if (editIndex !== null) {
    // Editar existente
    inventario[editIndex] = { herramienta: nombre, cantidad: cantidad };
  } else {
    // Agregar nueva
    inventario.push({ herramienta: nombre, cantidad: cantidad });
  }

  cerrarModal();
  cargarInventario();
}

// Eliminar herramienta
function eliminarHerramienta(index) {
  if (confirm('¿Seguro que deseas eliminar esta herramienta?')) {
    inventario.splice(index, 1);
    cargarInventario();
  }
}

// Cerrar modal
function cerrarModal() {
  document.getElementById('modal').style.display = 'none';
  document.getElementById('modal-overlay').style.display = 'none';
}

cargarInventario();