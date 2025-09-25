document
  .getElementById("login-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor ingresa tu correo y contraseña.",
      });
      return;
    }

    try {
      // Mostrar loading mientras se hace la petición
      Swal.fire({
        title: 'Iniciando sesión...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);

      const response = await fetch("http://localhost:8000/auth/login/", {
        method: "POST",
        body: formData,
      });

      Swal.close(); // Cerrar loading al recibir respuesta

      if (!response.ok) {
        const errorData = await response.json();
        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorData.detail || "Credenciales incorrectas.",
        });
        return;
      }

      const data = await response.json();

      // Guardar token JWT en sessionStorage
      sessionStorage.setItem("access_token", data.access_token);
      sessionStorage.setItem("usuarioActual", email);

      Swal.fire({
        icon: "success",
        title: "¡Bienvenid@ de vuelta!",
        showConfirmButton: false,
        timer: 1500
      });

      // Redirigir según rol o por defecto a cotizar.html
      setTimeout(() => {
        window.location.href = "../views/cotizar.html";
      }, 1500);

    } catch (error) {
      Swal.close();
      console.error("Error al iniciar sesión:", error);
      Swal.fire({
        icon: "error",
        title: "Ocurrió un error",
        text: "Intenta nuevamente.",
      });
    }
  });