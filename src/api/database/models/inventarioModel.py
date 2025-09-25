from pydantic import BaseModel
from typing import Optional

class Inventario(BaseModel):
    id_item : Optional[int] = None
    nombre: str
    cantidad: int
    
def inventarioSchema(data)->dict:
    return {
        "id_item" : data.id_item,
        "nombre": data.nombre,
        "cantidad": data.cantidad
    }