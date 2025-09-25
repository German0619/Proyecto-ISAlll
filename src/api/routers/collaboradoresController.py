from fastapi import APIRouter,HTTPException,status,Depends
from database.connectDB import db
from database.models.colaboradoresModel import Colaborador,colaboradorSchema
from utils.security import authToken,isAdmin
from utils.httpError import errorInterno
from utils.infoVerify import searchColaboradores
from utils.dbHelper import paginar,totalPages

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
    
from fastapi import Query

@router.get("/", status_code=status.HTTP_200_OK)
async def obtenerColaboradores(
    page: int = Query(1, ge=1, description="Número de página"),
    size: int = Query(10, ge=1, le=100),
    _: bool = Depends(isAdmin)
):
    offset = paginar(page,size)
    
    try:
        query = """
            SELECT id_colaborador, nombre, especialidad, pago_hora, id_tipo_trabajo
            FROM colaboradores
            ORDER BY id_colaborador
            OFFSET :skip LIMIT :limit
        """
        values = {"skip": offset, "limit": size}
        data = await db.fetch_all(query, values)

        if not data:
            return {
                "page":page,
                "size":size,
                "total": 0,
                "colaboradores": []
            }
        total = await db.fetch_val("SELECT COUNT(*) FROM colaboradores")
        
        return {
            "page":page,
            "size":size,
            "total_pages": totalPages(total,size),
            "colaboradores": [colaboradorSchema(row) for row in data]
        }

    except HTTPException:
        raise
    except Exception as e:
        raise errorInterno(e)

@router.delete("/{id}",status_code=status.HTTP_200_OK)
async def eliminarColaborador(id:int,_: bool = Depends(isAdmin)):
    try:
        async with db.transaction():
            if await searchColaboradores(id) is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                    detail="El colaborador que intenta eliminar no existe")
            query = """
                DELETE FROM colaboradores WHERE id_colaborador =:id_colaborador
            """
            await db.execute(query,{"id_colaborador":id})

            return {
                "detail":"Colaborador Eliminado con Exito"
            }
    except HTTPException:
        raise
    except Exception:
        raise errorInterno("Error al eliminar el colaborador,el colaborador no fue eliminado")