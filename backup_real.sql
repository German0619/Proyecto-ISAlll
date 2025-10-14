--en Proceso de remodelacion D:
-- =========================
-- Base de datos: transporte_hector_murillo
-- Todas las fechas como TIMESTAMPTZ
-- Datos de ejemplo solo para inventario y colaboradores
-- =========================

-- Tabla usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    apellido VARCHAR(150),
    correo VARCHAR(150) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL, -- 'admin' o 'cliente'
    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabla provincias
CREATE TABLE IF NOT EXISTS provincias (
    id_provincia SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL
);

-- Tabla distritos
CREATE TABLE IF NOT EXISTS distritos (
    id_distrito SERIAL PRIMARY KEY,
    id_provincia INT NOT NULL REFERENCES provincias(id_provincia) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL
);

-- Tabla corregimientos
CREATE TABLE IF NOT EXISTS corregimientos (
    id_corregimiento SERIAL PRIMARY KEY,
    id_distrito INT NOT NULL REFERENCES distritos(id_distrito) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL
);

-- Tabla tipos_trabajo
CREATE TABLE IF NOT EXISTS tipos_trabajo (
    id_tipo SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    costo_mano_obra DECIMAL(10,2) DEFAULT 0,
    costo_adicional DECIMAL(10,2) DEFAULT 0
);

-- Tabla inventario
CREATE TABLE IF NOT EXISTS inventario (
    id_item SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    cantidad INT DEFAULT 0,
    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Datos de ejemplo inventario
INSERT INTO inventario (nombre, cantidad) VALUES
('Camión grúa', 2),
('Cuerda de seguridad', 10),
('Carretilla', 5),
('Gato hidráulico', 3),
('Conos de señalización', 15);

-- Tabla colaboradores
CREATE TABLE colaboradores (
    id_colaborador VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    especialidad VARCHAR(150),
    pago_hora DECIMAL(10,2),
    id_tipo_trabajo INT REFERENCES tipos_trabajo(id_tipo),
    estado VARCHAR(20) DEFAULT 'activo',
    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


-- Datos de ejemplo colaboradores
INSERT INTO colaboradores (nombre, especialidad, pago_hora, id_tipo_trabajo) VALUES
('Juan Pérez', 'Conductor', 10, 1),
('Sebastian Rodríguez', 'Ayudante', 8, 1),
('Paul Jaén', 'Ayudante', 8, 1),
('Manuel Arauz', 'Manejador', 12, 2),
('Sebastian Rodríguez', 'Ayudante', 8, 2),
('Camilo Ortega', 'Conductor', 10, 2),
('Federico Jaén', 'Manejador', 12, 2),
('Sebastian Rodríguez', 'Ayudante', 8, 3),
('Juan Pérez', 'Conductor', 10, 3),
('Andrés Lomon', 'Cargador', 9, 3);

-- Tabla solicitudes
CREATE TABLE IF NOT EXISTS solicitudes (
    id_solicitud SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL REFERENCES usuarios(id_usuario),
    fecha TIMESTAMPTZ NOT NULL,
    nombre VARCHAR(150),
    telefono VARCHAR(20) NOT NULL,
    servicio VARCHAR(150) NOT NULL,
    descripcion TEXT,
    origen VARCHAR(255),
    destino VARCHAR(255),
    total DECIMAL(10,2) DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'pendiente',
    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS solicitud_colaboradores (
    id SERIAL PRIMARY KEY,
    id_solicitud INT NOT NULL REFERENCES solicitudes(id_solicitud) ON DELETE CASCADE,
    id_colaborador VARCHAR(20) NOT NULL REFERENCES colaboradores(id_colaborador) ON DELETE CASCADE,
    asignado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabla solicitud_servicios
CREATE TABLE IF NOT EXISTS solicitud_servicios (
    id SERIAL PRIMARY KEY,
    id_solicitud INT NOT NULL REFERENCES solicitudes(id_solicitud) ON DELETE CASCADE,
    nombre_servicio VARCHAR(255) NOT NULL
);

-- Tabla agenda
CREATE TABLE IF NOT EXISTS agenda (
    id_agenda SERIAL PRIMARY KEY,
    id_solicitud INT NOT NULL REFERENCES solicitudes(id_solicitud) ON DELETE CASCADE,
    fecha_servicio TIMESTAMPTZ NOT NULL,
    observaciones TEXT,
    actualizado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabla servicios
CREATE TABLE IF NOT EXISTS servicios (
    id_servicio SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    valor DECIMAL(10,2) NOT NULL
);

INSERT INTO servicios (nombre, valor) VALUES
('montaCarga', 100),
('material', 30),
('materialEmbalaje', 25),
('camionPequeño', 90),
('camionGrande', 150),
('camionPlancha', 200);

INSERT INTO tipos_trabajo (nombre, costo_mano_obra, costo_adicional) VALUES
('Acarreo', 100, 200),
('Wincheo', 160, 1000),
('Mudanza Internas', 130, 500);