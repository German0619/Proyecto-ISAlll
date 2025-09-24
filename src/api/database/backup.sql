-- Tabla usuarios
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    apellido VARCHAR(150),
    correo VARCHAR(150) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL, -- 'admin' o 'cliente'
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla inventario
CREATE TABLE inventario (
    id_item SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    cantidad INT DEFAULT 0,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla colaboradores
CREATE TABLE colaboradores (
    id_colaborador SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    especialidad VARCHAR(150),
    pago_hora DECIMAL(10,2),
    estado VARCHAR(20) DEFAULT 'activo', -- activo/inactivo
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla solicitudes
CREATE TABLE solicitudes (
    id_solicitud SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL REFERENCES usuarios(id_usuario),
    fecha TIMESTAMP NOT NULL, -- fecha del servicio ingresada por el usuario
    servicio VARCHAR(150) NOT NULL,
    descripcion TEXT,
    origen VARCHAR(255),
    destino VARCHAR(255),
    total DECIMAL(10,2) DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente | aceptada | rechazada
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla agenda
CREATE TABLE agenda (
    id_agenda SERIAL PRIMARY KEY,
    id_solicitud INT NOT NULL REFERENCES solicitudes(id_solicitud) ON DELETE CASCADE,
    fecha_servicio TIMESTAMP NOT NULL,
    observaciones TEXT,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
