document
  .getElementById("register-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!nombre || !apellido || !correo || !password) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor completa todos los campos.",
      });
      return;
    }

    try {
      // Mostrar loading mientras se hace la petición
      Swal.fire({
        title: 'Registrando usuario...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await fetch("http://localhost:8000/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre,
          apellido: apellido,
          correo: correo,
          contrasena: password
        }),
      });

      Swal.close(); // Cerrar loading

      const data = await response.json();

      if (!response.ok) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.detail || "Ocurrió un error al registrar el usuario.",
        });
        return;
      }

      Swal.fire({
        icon: "success",
        title: "¡Usuario registrado!",
        text: "Ahora puedes iniciar sesión.",
        showConfirmButton: false,
        timer: 1500
      });

      // Redirigir al login
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);

    } catch (error) {
      Swal.close();
      console.error("Error al registrar usuario:", error);
      Swal.fire({
        icon: "error",
        title: "Ocurrió un error",
        text: "Intenta nuevamente.",
      });
    }
  });