from fastapi import APIRouter, HTTPException, status, Depends, Query
from database.connectDB import db
from database.models.solicitudModel import Solicitud, solicitudSchema
from utils.security import getTokenId
from utils.httpError import errorInterno
from utils.dbHelper import paginar,totalPages

router  = APIRouter(prefix="/solicitud", tags=["Solicitudes"])

@router.get("/", status_code=status.HTTP_200_OK)
async def obtenerSolicitudes(
    page: int = Query(1, ge=1, description="Número de página"),
    size: int = Query(10, ge=1, le=100)
):
    try:
        result = await searchSolicitud(page=page, size=size)

        if not result["data"]:
            return {
                "page": page,
                "size": size,
                "total": 0,
                "total_pages": 1,
                "solicitudes": []
            }

        return {
            "page": page,
            "size": size,
            "total": result["total"],
            "total_pages": result["total_pages"],
            "solicitudes": [solicitudSchema(row) for row in result["data"]]
        }

    except HTTPException:
        raise
    except Exception as e:
        raise errorInterno(e)


@router.get("/pendientes/", status_code=status.HTTP_200_OK)
async def obtenerPendientes(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100)
):
    try:
        result = await searchSolicitud(option=1, page=page, size=size)

        return {
            "page": page,
            "size": size,
            "total": result["total"],
            "total_pages": result["total_pages"],
            "solicitudes": [solicitudSchema(row) for row in result["data"]]
        }

    except HTTPException:
        raise
    except Exception as e:
        raise errorInterno(e)

@router.get("/rechazadas/", status_code=status.HTTP_200_OK)
async def obtenerRechazadas(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100)
):
    try:
        result = await searchSolicitud(option=2, page=page, size=size)

        return {
            "page": page,
            "size": size,
            "total": result["total"],
            "total_pages": result["total_pages"],
            "solicitudes": [solicitudSchema(row) for row in result["data"]]
        }

    except HTTPException:
        raise
    except Exception as e:
        raise errorInterno(e)
    

@router.get("/me/", status_code=status.HTTP_200_OK)
async def obtenerHistorial(
    userID: int = Depends(getTokenId),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100)
):
    try:
        result = await searchSolicitud(page=page, size=size, userID=userID)
        return {
            "page": page,
            "size": size,
            "total": result["total"],
            "total_pages": result["total_pages"],
            "solicitudes": [solicitudSchema(row) for row in result["data"]]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise errorInterno(e)

@router.post("/",status_code=status.HTTP_200_OK)
async def crearSolicitud(solicitud : Solicitud,user_id : int = Depends(getTokenId)):
    try:
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

            idSolicitud = await db.fetch_val(query,values)
            
            if not idSolicitud:
                raise errorInterno(e="Error al crear la solicitud")

            query = """
                INSERT INTO solicitud_servicios(id_solicitud,nombre_servicio)
                VALUES(:id_solicitud,:nombre_servicio)
                RETURNING id
            """

            for serv in solicitud.servicios:
                result = await db.fetch_val(query,{"id_solicitud":idSolicitud,"nombre_servicio":serv})
                if not result:
                    raise errorInterno(e="Error al guardar los servicios,su solicitud fue cancelada,intentelo mas tarde")

            return{
                "detail":"Solicitud creada exitosamente,actualmente esta en espera de ser aceptada",
                "solicitud_id":idSolicitud
            }
    except HTTPException:
        raise
    except Exception as e:
        raise errorInterno(e)

@router.get("/direcciones/", status_code=status.HTTP_200_OK)
async def obtenerDirecciones():
    try:
        query = """
            SELECT 
                p.nombre AS provincia,
                d.nombre AS distrito,
                c.nombre AS corregimiento
            FROM provincias p
            JOIN distritos d ON d.id_provincia = p.id_provincia
            JOIN corregimientos c ON c.id_distrito = d.id_distrito
            ORDER BY p.nombre, d.nombre, c.nombre;
        """
        direcciones = await db.fetch_all(query)

        if not direcciones:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Las direcciones no cargaron correctamente"
            )
        return {"direcciones": direccionesSchema(direcciones)}

    except HTTPException:
        raise
    except Exception as e:
        raise errorInterno(e)


def direccionesSchema(direcciones)->dict:
    resultado = {}
    for fila in direcciones:
        prov = fila["provincia"]
        dist = fila["distrito"]
        corr = fila["corregimiento"]

        if prov not in resultado:
            resultado[prov] = {}
        if dist not in resultado[prov]:
            resultado[prov][dist] = []
        resultado[prov][dist].append(corr)
    return resultado

async def searchSolicitud(option: int | None = None, page: int = 1, size: int = 10, userID: int | None = None):
    offset = (page - 1) * size  # paginar(page, size)
    query = f"""
        SELECT 
            s.id_solicitud,
            s.fecha,
            s.nombre,
            s.telefono,
            s.servicio AS tipo_trabajo,
            s.descripcion,
            s.origen,
            s.destino,
            s.total,
            s.estado,
            array_agg(ss.nombre_servicio) AS servicios_adicionales
        FROM solicitudes s
        LEFT JOIN solicitud_servicios ss ON s.id_solicitud = ss.id_solicitud
    """
    condicion = {}

    filtros = []
    if option == 1:
        filtros.append("estado = :estado")
        condicion["estado"] = "pendiente"
    elif option == 2:
        filtros.append("estado = :estado")
        condicion["estado"] = "rechazado"
    if userID is not None:
        filtros.append("id_usuario = :id_usuario")
        condicion["id_usuario"] = userID

    if filtros:
        query += " WHERE " + " AND ".join(filtros)

    # Aquí hacemos interpolación segura para OFFSET y LIMIT
    query += f"""
        GROUP BY s.id_solicitud
        ORDER BY s.fecha DESC
        OFFSET {offset}
        LIMIT {size};
    """
    data = await db.fetch_all(query, condicion)

    # Contar total
    count_query = "SELECT COUNT(*) FROM solicitudes"
    if filtros:
        count_query += " WHERE " + " AND ".join(filtros)
    total = await db.fetch_val(count_query, condicion)
    total_pages = totalPages(total, size)

    return {"data": data, "total": total, "total_pages": total_pages}
