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
    id_tipo_trabajo INT REFERENCES tipos_trabajo(id_tipo),
    estado VARCHAR(20) DEFAULT 'activo', -- activo/inactivo
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO colaboradores (id_colaborador, nombre, especialidad, pago_hora, id_tipo_trabajo) VALUES
(12345, 'Juan Pérez', 'Conductor', 10, 1),
(12346, 'Sebastian Rodríguez', 'Ayudante', 8, 1),
(12347, 'Paul Jaén', 'Ayudante', 8, 1),
(12348, 'Manuel Arauz', 'Manejador', 12, 2),
(12349, 'Sebastian Rodríguez', 'Ayudante', 8, 2),
(12350, 'Camilo Ortega', 'Conductor', 10, 2),
(12351, 'Federico Jaén', 'Manejador', 12, 2),
(12352, 'Sebastian Rodríguez', 'Ayudante', 8, 3),
(12353, 'Juan Pérez', 'Conductor', 10, 3),
(12354, 'Andrés Lomon', 'Cargador', 9, 3);


-- Tabla solicitudes
CREATE TABLE solicitudes (
    id_solicitud SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL REFERENCES usuarios(id_usuario),
    fecha TIMESTAMP NOT NULL, -- fecha del servicio ingresada por el usuario
    descripcion TEXT,
    origen VARCHAR(255),
    telefono VARCHAR(20) NOT NULL,
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

-- Provincias
CREATE TABLE provincias (
    id_provincia SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL
);

-- Distritos
CREATE TABLE distritos (
    id_distrito SERIAL PRIMARY KEY,
    id_provincia INT NOT NULL REFERENCES provincias(id_provincia) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL
);

-- Corregimientos
CREATE TABLE corregimientos (
    id_corregimiento SERIAL PRIMARY KEY,
    id_distrito INT NOT NULL REFERENCES distritos(id_distrito) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL
);


-- Distritos
INSERT INTO distritos (id_provincia, nombre) VALUES
-- Panamá
((SELECT id_provincia FROM provincias WHERE nombre='Panamá'), 'Ciudad de Panamá'),
((SELECT id_provincia FROM provincias WHERE nombre='Panamá'), 'San Miguelito'),
-- Panamá Oeste
((SELECT id_provincia FROM provincias WHERE nombre='Panamá Oeste'), 'Arraiján'),
((SELECT id_provincia FROM provincias WHERE nombre='Panamá Oeste'), 'La Chorrera'),
-- Colón
((SELECT id_provincia FROM provincias WHERE nombre='Colón'), 'Colón'),
((SELECT id_provincia FROM provincias WHERE nombre='Colón'), 'Portobelo'),
-- Chiriquí
((SELECT id_provincia FROM provincias WHERE nombre='Chiriquí'), 'David'),
((SELECT id_provincia FROM provincias WHERE nombre='Chiriquí'), 'Boquete'),
-- Veraguas
((SELECT id_provincia FROM provincias WHERE nombre='Veraguas'), 'Santiago'),
((SELECT id_provincia FROM provincias WHERE nombre='Veraguas'), 'Soná'),
-- Coclé
((SELECT id_provincia FROM provincias WHERE nombre='Coclé'), 'Penonomé'),
((SELECT id_provincia FROM provincias WHERE nombre='Coclé'), 'Aguadulce'),
-- Los Santos
((SELECT id_provincia FROM provincias WHERE nombre='Los Santos'), 'Las Tablas'),
((SELECT id_provincia FROM provincias WHERE nombre='Los Santos'), 'Guararé'),
-- Herrera
((SELECT id_provincia FROM provincias WHERE nombre='Herrera'), 'Chitré'),
((SELECT id_provincia FROM provincias WHERE nombre='Herrera'), 'Parita'),
-- Bocas del Toro
((SELECT id_provincia FROM provincias WHERE nombre='Bocas del Toro'), 'Bocas del Toro'),
((SELECT id_provincia FROM provincias WHERE nombre='Bocas del Toro'), 'Changuinola'),
-- Darién
((SELECT id_provincia FROM provincias WHERE nombre='Darién'), 'La Palma'),
((SELECT id_provincia FROM provincias WHERE nombre='Darién'), 'Chepigana');

-- Corregimientos
-- Panamá -> Ciudad de Panamá
INSERT INTO corregimientos (id_distrito, nombre) VALUES
((SELECT id_distrito FROM distritos WHERE nombre='Ciudad de Panamá'), 'Bethania'),
((SELECT id_distrito FROM distritos WHERE nombre='Ciudad de Panamá'), 'San Francisco'),
((SELECT id_distrito FROM distritos WHERE nombre='Ciudad de Panamá'), 'Juan Díaz'),
-- Panamá -> San Miguelito
((SELECT id_distrito FROM distritos WHERE nombre='San Miguelito'), 'Belisario Porras'),
((SELECT id_distrito FROM distritos WHERE nombre='San Miguelito'), 'Arnulfo Arias'),
((SELECT id_distrito FROM distritos WHERE nombre='San Miguelito'), 'Victoriano Lorenzo'),
-- Panamá Oeste -> Arraiján
((SELECT id_distrito FROM distritos WHERE nombre='Arraiján'), 'Vista Alegre'),
((SELECT id_distrito FROM distritos WHERE nombre='Arraiján'), 'Burunga'),
((SELECT id_distrito FROM distritos WHERE nombre='Arraiján'), 'Juan Demóstenes Arosemena'),
-- Panamá Oeste -> La Chorrera
((SELECT id_distrito FROM distritos WHERE nombre='La Chorrera'), 'Barrio Colón'),
((SELECT id_distrito FROM distritos WHERE nombre='La Chorrera'), 'Barrio Balboa'),
((SELECT id_distrito FROM distritos WHERE nombre='La Chorrera'), 'Playa Leona'),
-- Colón -> Colón
((SELECT id_distrito FROM distritos WHERE nombre='Colón'), 'Cristóbal Este'),
((SELECT id_distrito FROM distritos WHERE nombre='Colón'), 'Cativá'),
((SELECT id_distrito FROM distritos WHERE nombre='Colón'), 'Sabanitas'),
-- Colón -> Portobelo
((SELECT id_distrito FROM distritos WHERE nombre='Portobelo'), 'Portobelo'),
((SELECT id_distrito FROM distritos WHERE nombre='Portobelo'), 'Cacique'),
((SELECT id_distrito FROM distritos WHERE nombre='Portobelo'), 'Isla Grande'),
-- Chiriquí -> David
((SELECT id_distrito FROM distritos WHERE nombre='David'), 'Barrio Bolívar'),
((SELECT id_distrito FROM distritos WHERE nombre='David'), 'Barrio Sur'),
((SELECT id_distrito FROM distritos WHERE nombre='David'), 'Barrio Norte'),
-- Chiriquí -> Boquete
((SELECT id_distrito FROM distritos WHERE nombre='Boquete'), 'Alto Boquete'),
((SELECT id_distrito FROM distritos WHERE nombre='Boquete'), 'Los Naranjos'),
((SELECT id_distrito FROM distritos WHERE nombre='Boquete'), 'Palmira'),
-- Veraguas -> Santiago
((SELECT id_distrito FROM distritos WHERE nombre='Santiago'), 'Canto del Llano'),
((SELECT id_distrito FROM distritos WHERE nombre='Santiago'), 'San Martín de Porres'),
((SELECT id_distrito FROM distritos WHERE nombre='Santiago'), 'Carlos Santana Ávila'),
-- Veraguas -> Soná
((SELECT id_distrito FROM distritos WHERE nombre='Soná'), 'Soná Cabecera'),
((SELECT id_distrito FROM distritos WHERE nombre='Soná'), 'Bahía Honda'),
((SELECT id_distrito FROM distritos WHERE nombre='Soná'), 'Calidonia'),
-- Coclé -> Penonomé
((SELECT id_distrito FROM distritos WHERE nombre='Penonomé'), 'Penonomé Cabecera'),
((SELECT id_distrito FROM distritos WHERE nombre='Penonomé'), 'Chiguirí Arriba'),
((SELECT id_distrito FROM distritos WHERE nombre='Penonomé'), 'Río Grande'),
-- Coclé -> Aguadulce
((SELECT id_distrito FROM distritos WHERE nombre='Aguadulce'), 'Aguadulce Cabecera'),
((SELECT id_distrito FROM distritos WHERE nombre='Aguadulce'), 'El Cristo'),
((SELECT id_distrito FROM distritos WHERE nombre='Aguadulce'), 'Pocrí'),
-- Los Santos -> Las Tablas
((SELECT id_distrito FROM distritos WHERE nombre='Las Tablas'), 'Las Tablas Cabecera'),
((SELECT id_distrito FROM distritos WHERE nombre='Las Tablas'), 'La Palma'),
((SELECT id_distrito FROM distritos WHERE nombre='Las Tablas'), 'Santo Domingo'),
-- Los Santos -> Guararé
((SELECT id_distrito FROM distritos WHERE nombre='Guararé'), 'Guararé Cabecera'),
((SELECT id_distrito FROM distritos WHERE nombre='Guararé'), 'El Espinal'),
((SELECT id_distrito FROM distritos WHERE nombre='Guararé'), 'Perales'),
-- Herrera -> Chitré
((SELECT id_distrito FROM distritos WHERE nombre='Chitré'), 'Chitré Cabecera'),
((SELECT id_distrito FROM distritos WHERE nombre='Chitré'), 'La Arena'),
((SELECT id_distrito FROM distritos WHERE nombre='Chitré'), 'Monagrillo'),
-- Herrera -> Parita
((SELECT id_distrito FROM distritos WHERE nombre='Parita'), 'Parita Cabecera'),
((SELECT id_distrito FROM distritos WHERE nombre='Parita'), 'Llano Grande'),
((SELECT id_distrito FROM distritos WHERE nombre='Parita'), 'Potuga'),
-- Bocas del Toro -> Bocas del Toro
((SELECT id_distrito FROM distritos WHERE nombre='Bocas del Toro'), 'Bastimentos'),
((SELECT id_distrito FROM distritos WHERE nombre='Bocas del Toro'), 'Isla Colón'),
((SELECT id_distrito FROM distritos WHERE nombre='Bocas del Toro'), 'Cauchero'),
-- Bocas del Toro -> Changuinola
((SELECT id_distrito FROM distritos WHERE nombre='Changuinola'), 'Changuinola Cabecera'),
((SELECT id_distrito FROM distritos WHERE nombre='Changuinola'), 'El Empalme'),
((SELECT id_distrito FROM distritos WHERE nombre='Changuinola'), 'Guabito'),
-- Darién -> La Palma
((SELECT id_distrito FROM distritos WHERE nombre='La Palma'), 'La Palma Cabecera'),
((SELECT id_distrito FROM distritos WHERE nombre='La Palma'), 'Garachiné'),
((SELECT id_distrito FROM distritos WHERE nombre='La Palma'), 'Chepigana'),
-- Darién -> Chepigana
((SELECT id_distrito FROM distritos WHERE nombre='Chepigana'), 'Sambú'),
((SELECT id_distrito FROM distritos WHERE nombre='Chepigana'), 'Setegantí'),
((SELECT id_distrito FROM distritos WHERE nombre='Chepigana'), 'Taimatí');

-- Tipos de trabajo
CREATE TABLE tipos_trabajo (
    id_tipo SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    costo_mano_obra DECIMAL(10,2) DEFAULT 0,
    costo_adicional DECIMAL(10,2) DEFAULT 0
);
INSERT INTO tipos_trabajo (nombre, costo_mano_obra, costo_adicional) VALUES
('Acarreo', 100, 200),
('Wincheo', 160, 1000),
('Mudanza Internas', 130, 500);

-- Servicios
CREATE TABLE servicios (
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
