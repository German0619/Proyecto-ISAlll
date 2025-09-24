from fastapi import APIRouter,HTTPException,status,Depends
from database.connectDB import db
from database.models.solicitudModel import Solicitud
from utils.security import getTokenId
from utils.httpError import errorInterno

router  = APIRouter(prefix="/solicitud",tags=["Solicitudes"])

@router.post("/",status_code=status.HTTP_200_OK)
async def crearSolicitud(solicitud : Solicitud,user_id : int = Depends(getTokenId)):
    try:
        async with db.transaction():
            query = """
                INSERT INTO solicitudes(id_usuario,fecha,descripcion,origen,destino,total)
                VALUES(:id_usuario,:fecha,:descripcion,:origen,:destino,:total)
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
                VALUES(:id_solicitud,nombre_servicio)
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