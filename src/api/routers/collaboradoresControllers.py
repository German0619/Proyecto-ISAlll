from fastapi import APIRouter,HTTPException,status,Depends
from database.connectDB import db
from database.models.colaboradoresModel import Colaborador
from utils.security import getTokenId,authToken
from utils.httpError import errorInterno

router = APIRouter(prefix="/colaboradores",tags=["Colaboradores"])

@router.post("/",status_code=status.HTTP_200_OK)
async def agregarColaborador(colaborador: Colaborador, _ = Depends(authToken)):
    try:
        async with db.transaction():
            query = """
                INSERT INTO colaboradores(id_colaborador,nombre,especialidad,pago_hora)
                VALUES(:id_colaborador,:nombre,:especialidad,:pago_hora)
                Returning id_colaborador
            """
            
            values = colaborador.model_dump()
            
            result = await db.fetch_val(query,values)
            
            if not result:
                raise errorInterno("Error al guardar colaborador,el colaborador no se registro")
            return {
                "detail":"Colaborador agregado exitosamente",
            }
    except HTTPException:
        raise
    except Exception as e:
        raise errorInterno(e)