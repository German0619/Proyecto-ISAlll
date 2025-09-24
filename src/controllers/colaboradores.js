const userType = localStorage.getItem('usuario');
  const menu = document.querySelector('.menu ul');

  if (menu) {
    menu.innerHTML = '<li><img src="/public/img/logo.png" alt="Logo" class="logo"></li>';

    if (userType === 'admin') {
      menu.innerHTML += `
        <li><a href="/src/solicitudes/solicitudes.html">Solicitudes</a></li>
        <li><a href="/src/agenda/agenda.html">Agenda</a></li>
        <li><a href="/src/inventario/inventario.html">Inventario</a></li>
        <li><a href="/src/colaboradores/colaboradores.html" class="active">Colaboradores</a></li>
        <li><a href="/src/login/login.html" id="logout">Cerrar sesión</a></li>
      `;
    } else {
      alert('Acceso no autorizado.');
      window.location.href = '/src/index.html';
    }
  }

  const logout = document.getElementById('logout');
  if (logout) {
    logout.addEventListener('click', function() {
      localStorage.removeItem('usuario');
      window.location.href = '../views/login.html';
    });
  }

  // Simulación de colaboradores
  const colaboradores = [
    { nombre: "Juan Pérez", id: "123456789", especialidad: "Conductor de camión", pago: "$10/h" },
    { nombre: "Ana Gómez", id: "987654321", especialidad: "Operador de grúa", pago: "$12/h" },
    { nombre: "Carlos Rodríguez", id: "456789123", especialidad: "Gestión de carga", pago: "$11/h" }
  ];

  const tbody = document.getElementById('colaboradores-body');

  function cargarColaboradores() {
    tbody.innerHTML = '';
    colaboradores.forEach(colab => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${colab.nombre}</td>
        <td>${colab.id}</td>
        <td>${colab.especialidad}</td>
        <td>${colab.pago}</td>
      `;
      tbody.appendChild(row);
    });
  }

  cargarColaboradores();
    // Abrir y cerrar modales
    function abrirModal(tipo) {
    document.getElementById(`modal-${tipo}`).style.display = 'block';
    document.getElementById(`overlay-${tipo}`).style.display = 'block';
  }

  function cerrarModal(tipo) {
    document.getElementById(`modal-${tipo}`).style.display = 'none';
    document.getElementById(`overlay-${tipo}`).style.display = 'none';
  }

  document.getElementById('btn-agregar').addEventListener('click', () => abrirModal('agregar'));
  document.getElementById('btn-eliminar').addEventListener('click', () => abrirModal('eliminar'));

  // Guardar nuevo colaborador
  document.getElementById('guardar-colaborador').addEventListener('click', () => {
    const nuevo = {
      nombre: document.getElementById('nombre').value,
      id: document.getElementById('id').value,
      especialidad: document.getElementById('especialidad').value,
      pago: document.getElementById('pago').value
    };

    if (nuevo.nombre && nuevo.id && nuevo.especialidad && nuevo.pago) {
      colaboradores.push(nuevo);
      cargarColaboradores();
      cerrarModal('agregar');
    } else {
      alert("Por favor, completa todos los campos.");
    }
  });

  // Eliminar colaborador por ID
  document.getElementById('confirmar-eliminar').addEventListener('click', () => {
    const idEliminar = document.getElementById('id-eliminar').value;
    const index = colaboradores.findIndex(c => c.id === idEliminar);
    if (index !== -1) {
      colaboradores.splice(index, 1);
      cargarColaboradores();
      cerrarModal('eliminar');
    } else {
      alert("No se encontró un colaborador con esa identificación.");
    }
  });