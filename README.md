# Proyecto Transporte Héctor Murillo

## Requisitos previos

Antes de ejecutar el proyecto, asegúrate de tener instalado lo siguiente:

- **PostgreSQL**: Necesario para la base de datos.
- **Python 3.10+** (o versión compatible) para ejecutar la aplicación.
- **pip** para instalar dependencias (incluido con Python).
- **Virtualenv** (opcional, recomendado para entorno virtual).

---

## Configuración de la base de datos

1. **Crear la base de datos:**

   - Abre PostgreSQL (pgAdmin o línea de comandos) y crea una base de datos nueva llamada `transporte_hector_murillo`.
   
2. **Importar los datos:**

   - Copia y pega el contenido del archivo `backup.sql` en tu cliente de PostgreSQL para restaurar las tablas y datos necesarios.

---

## Configuración de variables de entorno

1. En la raíz del proyecto, crea un archivo llamado `.env`.
2. Copia y pega el siguiente contenido, ajustando `DB_PASSWORD` con tu contraseña de PostgreSQL:

`DB_USER=postgres`
`DB_PASSWORD=tu_contraseña`
`DB_HOST=localhost`
`DB_PORT=5432`
`DB_NAME=transporte_hector_murillo`
`SECRET_KEY=RW1pbGlhLVRhbiBHb2QsUmVtIFpaWg`
`ACCESS_TOKEN_EXPIRED_MINUTES=60`
`ALGORITHM=HS256`
`VALID_ROL=admin,cliente`

> **Nota:** Estas variables se utilizan para la conexión a la base de datos, autenticación y control de roles.

---

## Instalación de dependencias

Puedes instalar las librerías necesarias de dos formas:

### Opción 1: Usando un entorno virtual (recomendado)
(Si les da error usen cmd no powershell y si lo hacen con esta opcion verificar que activaron el entorno virtual antes de instalar las librerias o ejecutar el proyecto)

1. Crear un entorno virtual:
   python -m venv venv

2. Activar el entorno:
   - En Windows:
     ```
     venv\Scripts\activate
     ```
   - En macOS/Linux (dudo que usen pero por si las dudas):
     ```
     source venv/bin/activate
     ```
   Instalar las dependencias:
   - Escribir en la terminal `pip install -r requirements.txt`
### Opción 2: Instalación global (no recomendado)
Solo no seria pegar el comando en temrinal y ya pero tendran las librerias de todo el sistema
   Instalar las dependencias:
   - Escribir en la terminal `pip install -r requirements.txt`

## Inicializar el servidor de la Api (Uvicorn)
En la terminar debes ir a la ubicacion del archivo Main.py, para eso puedes usar el comando cd src/api y luego ejecutar el siguiente comando:
`uvicorn Main:app --reload`

> **Nota:** Es necesario tener el servidor encendido sino el proyecto web no funcionara.

para apagar el servidor solo debes presionar `Ctrl + C` en la terminal donde lo iniciaste.

## Documentación de la API
Una vez que el servidor esté en funcionamiento, puedes acceder a la documentación interactiva de la API en:

http://127.0.0.1:8000/docs

solo pegar el link con el servidor encendido en el navegador

## Cualquier pregunta o problema, no duden en preguntarme.