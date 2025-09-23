const userType = localStorage.getItem('usuario');
    const menu = document.querySelector('.menu ul');

    if (menu) {
      menu.innerHTML = '<li><img src="/public/img/logo.png" alt="Logo" class="logo"></li>';

      if (userType === 'admin') {
        menu.innerHTML += `
      <li><a href="/src/solicitudes/solicitudes.html">Solicitudes</a></li>
      <li><a href="/src/agenda/agenda.html" class="active">Agenda</a></li>
      <li><a href="/src/inventario/inventario.html">Inventario</a></li>
      <li><a href="/src/colaboradores/colaboradores.html">Colaboradores</a></li>
      <li><a href="/src/login/login.html" id="logout">Cerrar sesión</a></li>
    `;
      } else {
        alert('Acceso no autorizado.');
        window.location.href = '/src/index.html';
      }
    }

    const logout = document.getElementById('logout');
    if (logout) {
      logout.addEventListener('click', function () {
        localStorage.removeItem('usuario');
        window.location.href = '/src/login/login.html';
      });
    }
    const tbody = document.getElementById('agenda-body');
 
     function cargarAgenda() {
       const agenda = JSON.parse(localStorage.getItem('agenda')) || [];
 
       tbody.innerHTML = '';
 
       if (agenda.length === 0) {
         const row = document.createElement('tr');
         row.innerHTML = '<td colspan="7" style="text-align: center;">No hay servicios agendados</td>';
         tbody.appendChild(row);
         return;
       }
 
       agenda.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
 
       agenda.forEach(item => {
         const row = document.createElement('tr');
         const fechaFormateada = item.fecha ? new Date(item.fecha).toLocaleDateString('es-ES') : 'Sin fecha';
 
         row.innerHTML = `
       <td>${fechaFormateada}</td>
       <td>${item.cliente || 'Sin nombre'}</td>
       <td>${item.contacto || 'Sin contacto'}</td>
       <td>${item.servicio || 'Sin servicio'}</td>
       <td>${item.descripcion || 'Sin descripción'}</td>
       <td>${item.origen || 'Sin origen'}</td>
       <td>${item.destino || 'Sin destino'}</td>
     `;
         tbody.appendChild(row);
       });
     }
     cargarAgenda();