

    // Acordeón
    const acc = document.getElementsByClassName("accordion");
    for (let i = 0; i < acc.length; i++) {
      acc[i].addEventListener("click", function () {
        this.classList.toggle("active");
        const panel = this.nextElementSibling;
        if (panel.style.display === "block") {
          panel.style.display = "none";
        } else {
          panel.style.display = "block";
        }
      });
    }

    // Colaboradores
    const colaboradoresPorTrabajo = {
      "Acarreo": [
        { nombre: "Juan Pérez - Conductor", pago: 10 },
        { nombre: "Sebastian Rodríguez - Ayudante", pago: 8 },
        { nombre: "Paul Jaén - Ayudante", pago: 8 }
      ],
      "Wincheo": [
        { nombre: "Manuel Arauz - Manejador", pago: 12 },
        { nombre: "Sebastian Rodríguez - Ayudante", pago: 8 },
        { nombre: "Camilo Ortega - Conductor", pago: 10 },
        { nombre: "Federico Jaén - Manejador", pago: 12 }
      ],
      "Mudanza Internas": [
        { nombre: "Sebastian Rodríguez - Ayudante", pago: 8 },
        { nombre: "Juan Pérez - Conductor", pago: 10 },
        { nombre: "Andrés Lomon - Cargador", pago: 9 }
      ]
    };


    function mostrarColaboradores() {
      const tipoTrabajo = document.getElementById("tiposTrabajos").value;
      const colaboradoresLista = document.getElementById("colaboradores-lista");
      const colaboradores = colaboradoresPorTrabajo[tipoTrabajo] || [];
      colaboradoresLista.innerHTML = `
    <ul>
      ${colaboradores.map(c => `<li>${c.nombre} - <strong>$${c.pago}/h</strong></li>`).join("")}
    </ul>
  `;
    }

    document.getElementById("tiposTrabajos").addEventListener("change", mostrarColaboradores);
    mostrarColaboradores();

    // Precios de servicios
    const servicioValores = {
      "montaCarga": 100,
      "material": 30,
      "materialEmbalaje": 25,
      "camionPequeño": 90,
      "camionGrande": 150,
      "camionPlancha": 200
    };

    const costoManoObra = {
      "Acarreo": 100,
      "Wincheo": 160,
      "Mudanza Internas": 130
    };

    const costoAdicionalTrabajo = {
      "Acarreo": 200,
      "Wincheo": 1000,
      "Mudanza Internas": 500
    };


    // Datos de Provincias, Ciudades y Barrios
    const ubicaciones = {
      "Panamá": {
        "Ciudad de Panamá": ["Bethania", "San Francisco", "Juan Díaz"],
        "San Miguelito": ["Belisario Porras", "Arnulfo Arias", "Victoriano Lorenzo"]
      },
      "Panamá Oeste": {
        "Arraiján": ["Vista Alegre", "Burunga", "Juan Demóstenes Arosemena"],
        "La Chorrera": ["Barrio Colón", "Barrio Balboa", "Playa Leona"]
      },
      "Colón": {
        "Colón": ["Cristóbal Este", "Cativá", "Sabanitas"],
        "Portobelo": ["Portobelo", "Cacique", "Isla Grande"]
      },
      "Chiriquí": {
        "David": ["Barrio Bolívar", "Barrio Sur", "Barrio Norte"],
        "Boquete": ["Alto Boquete", "Los Naranjos", "Palmira"]
      },
      "Veraguas": {
        "Santiago": ["Canto del Llano", "San Martín de Porres", "Carlos Santana Ávila"],
        "Soná": ["Soná Cabecera", "Bahía Honda", "Calidonia"]
      },
      "Coclé": {
        "Penonomé": ["Penonomé Cabecera", "Chiguirí Arriba", "Río Grande"],
        "Aguadulce": ["Aguadulce Cabecera", "El Cristo", "Pocrí"]
      },
      "Los Santos": {
        "Las Tablas": ["Las Tablas Cabecera", "La Palma", "Santo Domingo"],
        "Guararé": ["Guararé Cabecera", "El Espinal", "Perales"]
      },
      "Herrera": {
        "Chitré": ["Chitré Cabecera", "La Arena", "Monagrillo"],
        "Parita": ["Parita Cabecera", "Llano Grande", "Potuga"]
      },
      "Bocas del Toro": {
        "Bocas del Toro": ["Bastimentos", "Isla Colón", "Cauchero"],
        "Changuinola": ["Changuinola Cabecera", "El Empalme", "Guabito"]
      },
      "Darién": {
        "La Palma": ["La Palma Cabecera", "Garachiné", "Chepigana"],
        "Chepigana": ["Sambú", "Setegantí", "Taimatí"]
      }
    };

    // ---------------------------
    // Para Dirección de Partida
    // ---------------------------
    const provinciaPartida = document.getElementById("provincia-partida");
    const distritoPartida = document.getElementById("distrito-partida");
    const corregimientoPartida = document.getElementById("corregimiento-partida");

    function cargarProvinciasPartida() {
      provinciaPartida.innerHTML = '<option value="">Seleccione provincia</option>';
      for (let prov in ubicaciones) {
        provinciaPartida.innerHTML += `<option value="${prov}">${prov}</option>`;
      }
    }

    function cargarDistritosPartida() {
      const prov = provinciaPartida.value;
      distritoPartida.innerHTML = '<option value="">Seleccione distrito</option>';
      corregimientoPartida.innerHTML = '<option value="">Seleccione corregimiento</option>';
      if (ubicaciones[prov]) {
        for (let dist in ubicaciones[prov]) {
          distritoPartida.innerHTML += `<option value="${dist}">${dist}</option>`;
        }
      }
    }

    function cargarCorregimientosPartida() {
      const prov = provinciaPartida.value;
      const dist = distritoPartida.value;
      corregimientoPartida.innerHTML = '<option value="">Seleccione corregimiento</option>';
      if (ubicaciones[prov] && ubicaciones[prov][dist]) {
        ubicaciones[prov][dist].forEach(corr => {
          corregimientoPartida.innerHTML += `<option value="${corr}">${corr}</option>`;
        });
      }
    }

    provinciaPartida.addEventListener("change", cargarDistritosPartida);
    distritoPartida.addEventListener("change", cargarCorregimientosPartida);

    cargarProvinciasPartida();

    // ---------------------------
    // Para Dirección de Llegada
    // ---------------------------
    const provinciaLlegada = document.getElementById("provincia-llegada");
    const distritoLlegada = document.getElementById("distrito-llegada");
    const corregimientoLlegada = document.getElementById("corregimiento-llegada");

    function cargarProvinciasLlegada() {
      provinciaLlegada.innerHTML = '<option value="">Seleccione provincia</option>';
      for (let prov in ubicaciones) {
        provinciaLlegada.innerHTML += `<option value="${prov}">${prov}</option>`;
      }
    }

    function cargarDistritosLlegada() {
      const prov = provinciaLlegada.value;
      distritoLlegada.innerHTML = '<option value="">Seleccione distrito</option>';
      corregimientoLlegada.innerHTML = '<option value="">Seleccione corregimiento</option>';
      if (ubicaciones[prov]) {
        for (let dist in ubicaciones[prov]) {
          distritoLlegada.innerHTML += `<option value="${dist}">${dist}</option>`;
        }
      }
    }

    function cargarCorregimientosLlegada() {
      const prov = provinciaLlegada.value;
      const dist = distritoLlegada.value;
      corregimientoLlegada.innerHTML = '<option value="">Seleccione corregimiento</option>';
      if (ubicaciones[prov] && ubicaciones[prov][dist]) {
        ubicaciones[prov][dist].forEach(corr => {
          corregimientoLlegada.innerHTML += `<option value="${corr}">${corr}</option>`;
        });
      }
    }

    provinciaLlegada.addEventListener("change", cargarDistritosLlegada);
    distritoLlegada.addEventListener("change", cargarCorregimientosLlegada);

    cargarProvinciasLlegada();

async function guardarSolicitud() {
  const cliente = document.getElementById("nombreCliente").value; // opcional para mostrar
  const numero = document.getElementById("numeroCliente").value;
  const fechaServicio = document.getElementById("fechaServicio").value;
  const tipoTrabajo = document.getElementById("tiposTrabajos").value;

  const direccionPartida = `${document.getElementById("provincia-partida").value}, ${document.getElementById("distrito-partida").value}, ${document.getElementById("corregimiento-partida").value}, ${document.getElementById("direccionPartida").value}`;
  const direccionLlegada = `${document.getElementById("provincia-llegada").value}, ${document.getElementById("distrito-llegada").value}, ${document.getElementById("corregimiento-llegada").value}, ${document.getElementById("direccionLlegada").value}`;

  const descripcion = document.getElementById("descripcion").value;

  const { total: totalServicios, serviciosDetalle } = calcularTotalServicios();
  const costoMano = costoManoObra[tipoTrabajo] || 0;
  const adicional = costoAdicionalTrabajo[tipoTrabajo] || 0;
  const sumaFinal = totalServicios + costoMano + adicional;

  const solicitud = {
    id_solicitud: 0,                // siempre enviar 0 al crear
    fecha: fechaServicio,
    servicio: tipoTrabajo,
    descripcion,
    origen: direccionPartida,
    destino: direccionLlegada,
    total: sumaFinal,
    servicios: serviciosDetalle.map(s => s.nombre)
  };

  try {
    const response = await fetch('http://localhost:8000/solicitud/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('access_token') || ''}`
      },
      body: JSON.stringify(solicitud)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Error al enviar la solicitud");
    }

    const data = await response.json();

    const contenido = `
      <p><strong>Nombre:</strong> ${cliente}</p>
      <p><strong>Contacto:</strong> ${numero}</p>
      <p><strong>Fecha del Servicio:</strong> ${fechaServicio}</p>
      <p><strong>Tipo de Trabajo:</strong> ${tipoTrabajo}</p>
      <h4>Servicios Adicionales:</h4>
      <ul>${serviciosDetalle.map(servicio => `<li>${servicio.nombre}: $${servicio.valor}</li>`).join("")}</ul>
      <p><strong>Total:</strong> $${sumaFinal}</p>
      <p style="color: green; font-weight: bold;">¡Solicitud enviada correctamente! ID: ${data.solicitud_id}</p>
    `;

    document.getElementById("modal-content").innerHTML = contenido;
    document.getElementById("modal").style.display = "flex";
    document.getElementById("cotizarForm").reset();

  } catch (error) {
    alert(error.message);
  }
}

    function calcularTotalServicios() {
      let total = 0;
      const serviciosDetalle = [];
      Object.keys(servicioValores).forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox && checkbox.checked) {
          const valor = servicioValores[id];
          total += valor;
          const label = document.querySelector(`label[for="${id}"]`) || { textContent: id };
          serviciosDetalle.push({
            nombre: label.textContent.trim(),
            valor: valor
          });
        }
      });
      return { total, serviciosDetalle };
    }

    function cerrarModal() {
      document.getElementById("modal").style.display = "none";
    }

    // Menu dinámico
    const menu = document.getElementById('menu-lista');
    if (menu) {
      menu.innerHTML = '<li><img src="/public/img/logo.png" alt="Logo" class="logo"></li>';
      if (userType === 'admin') {
        menu.innerHTML += `
      <li><a href="/src/solicutudes/solicitudes.html">Solicitudes</a></li>
      <li><a href="/src/agenda/agenda.html">Agenda</a></li>
      <li><a href="/src/inventario/inventario.html">Inventario</a></li>
      <li><a href="/src/colaboradores/colaboradores.html">Colaboradores</a></li>
      <li><a href="/src/login/login.html" id="logout">Cerrar sesión</a></li>
    `;
      } else if (userType === 'cliente') {
        menu.innerHTML += `
      <li><a href="/src/cotizar/cotizar.html" class="active">Cotizar</a></li>
      <li><a href="/src/historial/historial.html">Mi Historial</a></li>
      <li><a href="/src/login/login.html" id="logout">Cerrar sesión</a></li>
    `;
      } else {
        menu.innerHTML += `
      <li><a href="/src/index.html">Inicio</a></li>
      <li><a href="/src/login/login.html">Iniciar sesión</a></li>
    `;
      }
    }
    const logout = document.getElementById('logout');
    if (logout) {
      logout.addEventListener('click', function () {
        localStorage.removeItem('usuario');
        window.location.href = 'login.html';
      });
    }