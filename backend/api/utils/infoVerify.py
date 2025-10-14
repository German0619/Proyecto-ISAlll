from fastapi import HTTPException, status
from core.connectDB import db
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

async def searchColaboradores(id:str):
    try:
        query = """
            SELECT * FROM colaboradores WHERE id_colaborador =:id_colaborador
        """
        data = await db.fetch_one(query,{"id_colaborador":id})
        return  data
    except Exception:
        raise errorInterno()

async def searchHerramienta(id:int):
    query = """
        Select * from inventario Where id_item =:id_item
    """
    result = await db.fetch_one(query,{"id_item":id})
    
    return result

def validCedula(cedula: str) -> bool:
    """
    Valida una cédula panameña en formato estándar.
    
    Formatos válidos incluyen:
      - 1-1234-12345
      - PE-1234-12345
      - E-1234-123456
      - N-1234-1234
      - 1AV-1234-12345
      - 1PI-1234-12345
    """
    # Expresión regular para validar la cédula panameña
    patron = re.compile(r'^(?:\d|PE|E|N|1AV|1PI)-\d{4}-\d{4,6}$', re.IGNORECASE)
    return bool(patron.match(cedula.strip()))

def validTel(numero: str) -> bool:
    # Limpiar espacios y guiones
    limpio = re.sub(r"[\s-]", "", numero)
    
    # Regex para Panamá: fijos (7 dígitos, empiezan con 2) o móviles (8 dígitos, empiezan con 6,7,8)
    pattern = r"^(2\d{6}|[678]\d{7})$"
    
    return bool(re.match(pattern, limpio))