from typing import Optional
from pydantic import BaseModel

class Usuarios(BaseModel):
    id_usuario: Optional[int] = None
    nombre: str
    apellido: str
    correo: str
    contrasena: str


class UsuariosAdmin(Usuarios):
    rol : str


def userSchema(userData):
    return {
        "id_usuario": userData.id_usuario,
        "nombre": userData.nombre,
        "apellido": userData.apellido,
        "correo": userData.correo,
        "rol": userData.rol
    }