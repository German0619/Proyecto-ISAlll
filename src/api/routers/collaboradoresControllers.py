from fastapi import APIRouter,HTTPException,status,Depends
from database.connectDB import db
from database.models.colaboradoresModel import Colaborador,colaboradorSchema
from utils.security import getTokenId,authToken
from utils.httpError import errorInterno
from utils.infoVerify import searchColaboradores

router = APIRouter(prefix="/colaboradores",tags=["Colaboradores"])

@router.post("/",status_code=status.HTTP_200_OK)
async def agregarColaborador(colaborador: Colaborador, _ = Depends(authToken)):
    try:
        if not await searchColaboradores(colaborador.id_colaborador) is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail="El colaborador que intento registrar ya se encuentra registado")
        
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
    
@router.get("/",status_code=status.HTTP_200_OK)
async def obtenerColaboradores(_=Depends(authToken)):
    try:
        query = """
            SELECT id_colaborador,nombre,especialidad,pago_hora FROM colaboradores
        """
        data = await db.fetch_all(query)
        
        return {
            "colaboradores": [colaboradorSchema(row)] for row in data 
        }
    except HTTPException:
        raise
    except Exception as e :
        raise errorInterno(e)