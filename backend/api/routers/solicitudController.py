from fastapi import APIRouter, HTTPException, status, Depends, Query
from core.connectDB import db
from core.security import getTokenId, isAdmin
from models.solicitudModel import Solicitud, solicitudSchema
from utils.httpError import errorInterno
from utils.dbHelper import paginar, totalPages
from utils.infoVerify import searchColaboradores, validTel, validDate

router = APIRouter(prefix="/solicitud", tags=["Solicitudes"])


# ===============================
# Obtener todas las solicitudes (admin)
# ===============================
@router.get("/", status_code=status.HTTP_200_OK)
async def obtenerSolicitudes(
    estado: str = Query("todas", description="Filtrar por estado: 'pendiente', 'rechazada', 'aceptada' o 'todas'"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    _: bool = Depends(isAdmin)
):
    try:
        estado = estado.lower()
        if estado not in ["pendiente", "rechazada", "aceptada", "todas"]:
            raise HTTPException(status_code=400, detail="Estado inválido")

        offset = paginar(page, size)

        #Construcción dinámica de query según estado
        query = """
            SELECT 
                s.id_solicitud, s.fecha, s.nombre, s.telefono,
                s.servicio AS tipo_trabajo, s.descripcion, 
                s.origen, s.destino, s.total, s.estado,
                array_agg(ss.nombre_servicio) AS servicios_adicionales
            FROM solicitudes s
            LEFT JOIN solicitud_servicios ss ON s.id_solicitud = ss.id_solicitud
        """
        condicion = {}
        if estado != "todas":
            query += " WHERE s.estado = :estado"
            condicion["estado"] = estado

        query += f"""
            GROUP BY s.id_solicitud
            ORDER BY s.fecha DESC
            OFFSET {offset}
            LIMIT {size};
        """

        data = await db.fetch_all(query, condicion)

        # 🔹 Contar total de registros
        count_query = "SELECT COUNT(*) FROM solicitudes"
        if estado != "todas":
            count_query += " WHERE estado = :estado"

        total = await db.fetch_val(count_query, condicion)
        total_pages = totalPages(total, size)

        return {
            "page": page,
            "size": size,
            "total": total,
            "total_pages": total_pages,
            "solicitudes": [solicitudSchema(row) for row in data]
        }

    except Exception as e:
        raise errorInterno(e)


# ===============================
# Obtener historial del usuario
# ===============================
@router.get("/me/", status_code=status.HTTP_200_OK)
async def obtenerHistorial(
    estado: str = Query("todas"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    userID: int = Depends(getTokenId)
):
    try:
        estado = estado.lower()
        if estado not in ["pendiente", "rechazada", "aceptada", "todas"]:
            raise HTTPException(status_code=400, detail="Estado inválido")

        offset = paginar(page, size)

        query = """
            SELECT 
                s.id_solicitud, s.fecha, s.nombre, s.telefono,
                s.servicio AS tipo_trabajo, s.descripcion,
                s.origen, s.destino, s.total, s.estado,
                array_agg(ss.nombre_servicio) AS servicios_adicionales
            FROM solicitudes s
            LEFT JOIN solicitud_servicios ss ON s.id_solicitud = ss.id_solicitud
            WHERE s.id_usuario = :id_usuario
        """
        condicion = {"id_usuario": userID}
        if estado != "todas":
            query += " AND s.estado = :estado"
            condicion["estado"] = estado

        query += f"""
            GROUP BY s.id_solicitud
            ORDER BY s.fecha DESC
            OFFSET {offset}
            LIMIT {size};
        """

        data = await db.fetch_all(query, condicion)
        total_query = "SELECT COUNT(*) FROM solicitudes WHERE id_usuario = :id_usuario"
        if estado != "todas":
            total_query += " AND estado = :estado"

        total = await db.fetch_val(total_query, condicion)
        total_pages = totalPages(total, size)

        return {
            "page": page,
            "size": size,
            "total": total,
            "total_pages": total_pages,
            "solicitudes": [solicitudSchema(row) for row in data]
        }

    except Exception as e:
        raise errorInterno(e)


# ===============================
# Crear solicitud
# ===============================
@router.post("/", status_code=status.HTTP_200_OK)
async def crearSolicitud(solicitud: Solicitud, user_id: int = Depends(getTokenId)):
    try:
        if not validTel(solicitud.telefono):
            raise HTTPException(status_code=406, detail="Teléfono inválido")

        if not validDate(solicitud.fecha):
            raise HTTPException(status_code=406, detail="Fecha inválida (debe ser futura)")

        async with db.transaction():
            query = """
                INSERT INTO solicitudes(id_usuario, fecha, nombre, telefono, servicio, descripcion, origen, destino, total)
                VALUES(:id_usuario, :fecha, :nombre, :telefono, :servicio, :descripcion, :origen, :destino, :total)
                RETURNING id_solicitud
            """
            values = solicitud.model_dump()
            values["id_usuario"] = user_id
            del values["id_solicitud"]
            del values["servicios"]

            idSolicitud = await db.fetch_val(query, values)
            if not idSolicitud:
                raise errorInterno("Error al crear solicitud")

            query_serv = """
                INSERT INTO solicitud_servicios(id_solicitud, nombre_servicio)
                VALUES(:id_solicitud, :nombre_servicio)
                RETURNING id
            """
            for serv in solicitud.servicios:
                result = await db.fetch_val(query_serv, {"id_solicitud": idSolicitud, "nombre_servicio": serv})
                if not result:
                    raise errorInterno("Error al guardar servicios")

            return {
                "detail": "Solicitud creada exitosamente, en espera de ser aceptada",
                "solicitud_id": idSolicitud
            }

    except Exception as e:
        raise errorInterno(e)


# ===============================
# Actualizar estado (admin)
# ===============================
@router.patch("/{id}", status_code=status.HTTP_200_OK)
async def actualizarEstado(id: int, estado: str, colaborador: str, _: bool = Depends(isAdmin)):
    try:
        # 1. Validar que el estado sea permitido
        if estado not in ["pendiente", "aceptada", "rechazada"]:
            raise HTTPException(status_code=406, detail="Estado inválido")

        # 2. Verificar si la solicitud existe
        existe = await db.fetch_val(
            "SELECT COUNT(*) FROM solicitudes WHERE id_solicitud = :id",
            {"id": id}
        )
        if not existe:
            raise HTTPException(status_code=404, detail="Solicitud no encontrada")

        # 3. Si se acepta, verificar si el colaborador existe
        if estado == "aceptada":
            if await searchColaboradores(colaborador) is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Colaborador inexistente"
                )

        # 4. Transacción segura
        async with db.transaction():
            # Actualizar el estado de la solicitud
            id_solicitud = await db.fetch_val(
                """
                UPDATE solicitudes
                SET estado = :estado
                WHERE id_solicitud = :id
                RETURNING id_solicitud
                """,
                {"estado": estado, "id": id}
            )

            if not id_solicitud:
                raise errorInterno("No se pudo actualizar el estado")

            # Si el estado es "aceptada", insertar en solicitud_colaboradores
            if estado == "aceptada":
                result = await db.fetch_val(
                    """
                    INSERT INTO solicitud_colaboradores(id_solicitud, id_colaborador)
                    VALUES (:id_solicitud, :id_colaborador)
                    RETURNING id
                    """,
                    {"id_solicitud": id_solicitud, "id_colaborador": colaborador}
                )

                if not result:
                    raise errorInterno("Error al asignar colaborador")

        return {"detail": "Solicitud actualizada exitosamente"}

    except HTTPException:
        raise  
    except Exception as e:
        raise errorInterno(e)

# ===============================
# 🔹 Obtener direcciones
# ===============================
@router.get("/direcciones/", status_code=status.HTTP_200_OK)
async def obtenerDirecciones():
    try:
        query = """
            SELECT p.nombre AS provincia, d.nombre AS distrito, c.nombre AS corregimiento
            FROM provincias p
            JOIN distritos d ON d.id_provincia = p.id_provincia
            JOIN corregimientos c ON c.id_distrito = d.id_distrito
            ORDER BY p.nombre, d.nombre, c.nombre;
        """
        direcciones = await db.fetch_all(query)
        if not direcciones:
            raise HTTPException(status_code=404, detail="No se encontraron direcciones")

        return {"direcciones": direccionesSchema(direcciones)}

    except Exception as e:
        raise errorInterno(e)


# ===============================
# 🔹 Función auxiliar para direcciones
# ===============================
def direccionesSchema(direcciones) -> dict:
    resultado = {}
    for fila in direcciones:
        prov, dist, corr = fila["provincia"], fila["distrito"], fila["corregimiento"]
        resultado.setdefault(prov, {}).setdefault(dist, []).append(corr)
    return resultado
