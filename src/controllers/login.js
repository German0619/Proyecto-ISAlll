document
  .getElementById("login-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("Por favor ingresa tu correo y contraseña.");
      return;
    }

    try {
      // Crear FormData para enviar al endpoint
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);

      const response = await fetch("http://localhost:8000/auth/login/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.detail || "Credenciales incorrectas.");
        return;
      }

      const data = await response.json();

      // Guardar token JWT en sessionStorage
      sessionStorage.setItem("access_token", data.access_token);
      sessionStorage.setItem("usuarioActual", email);

      alert("¡Bienvenid@ de vuelta!");
      // Redirigir según rol si quieres, aquí asumimos cliente
      window.location.href = "../views/cotizar.html";
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Ocurrió un error al iniciar sesión. Intenta nuevamente.");
    }
  });
