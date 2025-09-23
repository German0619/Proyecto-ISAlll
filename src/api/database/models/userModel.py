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