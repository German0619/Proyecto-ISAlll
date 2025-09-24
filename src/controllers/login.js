document
  .getElementById("login-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    if (email === "juanito.golondrina@gmail.com" && password === "12345") {
      localStorage.setItem("usuario", "cliente");
      localStorage.setItem("usuarioActual", email);
      alert("¡Bienvenid@ de vuelta!");
      window.location.href = "/src/cotizar/cotizar.html";
      return;
    }
    if (email === "admin.jefe@gmail.com" && password === "6789") {
      localStorage.setItem("usuario", "admin");
      alert("¡Bienvenid@ de vuelta!");
      window.location.href = "../views/solicitudes.html";
      return;
    }
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    const usuarioEncontrado = usuarios.find(
      (usuario) => usuario.correo === email && usuario.password === password
    );

    if (usuarioEncontrado) {
      localStorage.setItem("usuario", "cliente");
      localStorage.setItem("usuarioActual", email);
      alert("¡Bienvenid@ " + usuarioEncontrado.nombre + "!");
      window.location.href = "/src/cotizar/cotizar.html";
    } else {
      alert("Credenciales incorrectas.");
    }
  });
