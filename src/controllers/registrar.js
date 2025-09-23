document
  .getElementById("register-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const password = document.getElementById("password").value.trim();

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    const existe = usuarios.some(
      (u) => u.correo === correo || correo === "juanito.golondrina@gmail.com"
    );
    if (existe) {
      alert("Ese correo ya está registrado.");
      return;
    }

    usuarios.push({ nombre, apellido, correo, password });
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    alert("¡Usuario registrado con éxito!");
    localStorage.setItem("usuario", "cliente");
    window.location.href = "/src/cotizar/cotizar.html";
  });
