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

      const loginResponse = await fetch("http://localhost:8000/auth/login/", {
        method: "POST",
        body: formData,
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json();
        Swal.close();
        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorData.detail || "Credenciales incorrectas.",
        });
        return;
      }

      const loginData = await loginResponse.json();

      // Guardar token JWT en sessionStorage
      sessionStorage.setItem("access_token", loginData.access_token);
      sessionStorage.setItem("usuarioActual", email);

      // Ahora hacemos la solicitud a /auth/me para obtener el rol
      const meResponse = await fetch("http://localhost:8000/auth/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${loginData.access_token}`,
        },
      });

      Swal.close();

      if (!meResponse.ok) {
        Swal.fire({
          icon: "error",
          title: "Error al obtener datos del usuario",
          text: "No se pudo verificar el rol del usuario.",
        });
        return;
      }

      const meData = await meResponse.json();
      console.log(meData)
      Swal.fire({
        icon: "success",
        title: "¡Bienvenid@ de vuelta!",
        showConfirmButton: false,
        timer: 1500,
      });

      // Redirigir según el rol recibido desde /auth/me
      setTimeout(() => {
        if (meData.rol === "admin") {
          window.location.href = "../views/solicitudes.html";
        } else {
          window.location.href = "../views/cotizar.html";
        }
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
