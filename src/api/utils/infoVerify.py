from fastapi import HTTPException, status
from database.connectDB import db
import os
import re
from dotenv import load_dotenv
from utils.httpError import errorInterno

load_dotenv()

VALID_ROL = os.getenv("VALID_ROL", "").strip().split(",")


def validRol(rol: str):
    if rol not in VALID_ROL:
        raise HTTPException(
            status_code=status.HTTP_406_NOT_ACCEPTABLE,
            detail="Rol invalido"
        )


async def searchUser(data: str | int, option: int):
    try:
        match option:
            case 1:
                try:
                    value = int(data)
                except ValueError:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="ID inválido"
                    )
                condicion = "id_usuario"
            case 2:
                value = data
                condicion = "correo"
            case _:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Opción de búsqueda inválida"
                )

        query = f"""
            SELECT *
            FROM usuarios 
            WHERE {condicion} = :{condicion}
        """
        result = await db.fetch_one(query, {condicion: value})
        return result

    except HTTPException:
        raise
    except Exception as e:
        raise errorInterno(e)


def validContrasena(password: str) -> bool:
    pattern = re.compile(
        r'^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$'
    )
    return bool(pattern.match(password))


def validImagenes(imagenes):
    if not imagenes or len(imagenes) == 0:
        raise HTTPException(
            status_code=status.HTTP_406_NOT_ACCEPTABLE,
            detail="Debes subir al menos una imagen"
        )

    tipos_permitidos = ["image/jpeg", "image/png", "image/webp"]
    for img in imagenes:
        if img.content_type not in tipos_permitidos:
            raise HTTPException(
                status_code=status.HTTP_406_NOT_ACCEPTABLE,
                detail=f"Tipo de imagen no permitido: {img.content_type}"
            )


def validCategoria(categoria: int):
    if not categoria or not (1 <= categoria <= 4):
        raise HTTPException(
            status_code=status.HTTP_406_NOT_ACCEPTABLE,
            detail="Categoría inválida"
        )

async def searchColaboradores(id:int):
    try:
        query = """
            SELECT * FROM colaboradores WHERE id_colaborador =:id_colaborador
        """
        data = await db.fetch_one(query,{"id_colaborador":id})
        return  data
    except Exception:
        raise errorInterno()