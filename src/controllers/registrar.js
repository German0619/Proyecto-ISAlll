document
  .getElementById("register-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!nombre || !apellido || !correo || !password) {
      alert("Por favor completa todos los campos.");
      return;
    }

    try {
      // Registrar usuario en la API
      const response = await fetch("http://localhost:8000/auth/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: nombre,
          apellido: apellido,
          correo: correo,
          contrasena: password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Ocurrió un error al registrar el usuario.");
        return;
      }

      alert("¡Usuario registrado con éxito! Ahora puedes iniciar sesión.");
      // Redirigir al login
      window.location.href = "login.html";

    } catch (error) {
      console.error("Error al registrar usuario:", error);
      alert("Ocurrió un error al registrar el usuario. Intenta nuevamente.");
    }
  });
