from fastapi import APIRouter,HTTPException,status,Depends,Query
from core.connectDB import db
from core.security import isAdmin
from models.inventarioModel import Inventario,inventarioSchema
from utils.httpError import errorInterno
from utils.infoVerify import searchHerramienta
from utils.dbHelper import paginar,totalPages

router = APIRouter(prefix="/Inventario",tags=["Inventario"])

@router.get("/",status_code=status.HTTP_200_OK)
async def obtenerInventario(
    page: int = Query(1, ge=1, description="Número de página"),
    size: int = Query(10, ge=1, le=100),
    _: bool = Depends(isAdmin)
):
    offset = paginar(page,size)
    try:
        query = """
            SELECT id_item,nombre,cantidad FROM inventario
            OFFSET :offset LIMIT :size
        """
        inventario = await db.fetch_all(query,{"offset":offset,"size":size})
        
        if not inventario:
            return {
                "page": page,
                "size": size,
                "total_pages": 0,
                "inventario": []
            }
        total = await db.fetch_val("SELECT COUNT(*) FROM inventario")
        return {
            "page": page,
            "size": size,
            "total_pages": totalPages(total,size),
            "inventario": [inventarioSchema(row) for row in inventario]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise errorInterno(e)

@router.post("/",status_code=status.HTTP_201_CREATED)
async def agregarHerramienta(herramienta: Inventario,_:bool = Depends(isAdmin)):
    try:
        if herramienta.cantidad < 0:
            raise HTTPException(status_code=status.HTTP_406_NOT_ACCEPTABLE,
                                detail="Cantidad invalida,ingrese una cantidad mayor o igual a 0")
        
        async with db.transaction():
            query = """
                INSERT INTO inventario(nombre, cantidad)
                VALUES(:nombre, :cantidad)
                RETURNING id_item
            """
            
            values = herramienta.model_dump()
            del values["id_item"]
            result = await db.fetch_val(query,values)
            
            if not result:
                raise errorInterno("Error al agregar herramienta, la herramiento no se agrego al inventario")
           
            return {
                "detail":"Herramienta agregada exitosamente",
                "id_item": result
            }
    except HTTPException:
        raise
    except Exception as e:
        raise errorInterno(e)

@router.put("/",status_code=status.HTTP_200_OK)
async def actualizarInventario(herramienta: Inventario,_:bool = Depends(isAdmin)):
    try:
        if herramienta.cantidad < 0:
            raise HTTPException(status_code=status.HTTP_406_NOT_ACCEPTABLE,
                                detail="Cantidad invalida,ingrese una cantidad mayor o igual a 0")
        async with db.transaction():
            query = """
                UPDATE inventario
                SET nombre =:nombre, cantidad =:cantidad, actualizado_en = now()
                WHERE id_item =:id_item
                RETURNING id_item
            """
            
            values = herramienta.model_dump()
            
            result = await db.fetch_val(query,values)
            
            if not result:
                raise errorInterno("Error al actualizar herramienta, no se modificó el inventario")                
            return {
                "detail": "Herramienta actualizada exitosamente",
                "id_item": result
            }
    except HTTPException:
        raise
    except Exception as e:
        raise errorInterno(e)

@router.delete("/{id}",status_code=status.HTTP_200_OK)
async def eliminarHerramienta(id:int,_:bool = Depends(isAdmin)):
    try:
        if await searchHerramienta(id) is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail="Herramienta no encontrada")
        async with db.transaction():
            query = """
                DELETE FROM inventario
                Where id_item =:id_item
            """
            
            await db.execute(query,{"id_item":id})   

            return {
                "detail": "Herramienta eliminada con exito"
            }
    except HTTPException:
        raise
    except Exception as e:
        raise errorInterno("Error al eliminar del inventario,la herramienta no fue eliminada")

