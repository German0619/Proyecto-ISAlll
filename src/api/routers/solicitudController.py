from fastapi import APIRouter,HTTPException,status,Depends
from database.connectDB import db
from database.models.solicitudModel import Solicitud
from utils.security import getTokenId,authToken
from utils.httpError import errorInterno
from collections import defaultdict

router  = APIRouter(prefix="/solicitud",tags=["Solicitudes"])

@router.post("/",status_code=status.HTTP_200_OK)
async def crearSolicitud(solicitud : Solicitud,user_id : int = Depends(getTokenId)):
    try:
        async with db.transaction():
            query = """
                INSERT INTO solicitudes(id_usuario, fecha, servicio, descripcion, origen, destino, total)
                VALUES(:id_usuario, :fecha, :servicio, :descripcion, :origen, :destino, :total)
                RETURNING id_solicitud
            """
            values = solicitud.model_dump()
            values["id_usuario"] = user_id
            del values["id_solicitud"]
            del values["servicios"]
            print("Valores solicitud:", values)

            idSolicitud = await db.fetch_val(query,values)
            
            if not idSolicitud:
                raise errorInterno(e="Error al crear la solicitud")

            query = """
                INSERT INTO solicitud_servicios(id_solicitud,nombre_servicio)
                VALUES(:id_solicitud,:nombre_servicio)
                RETURNING id
            """
            print("Servicios:", solicitud.servicios)
            for serv in solicitud.servicio:
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
