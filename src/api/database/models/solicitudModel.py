from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Solicitud(BaseModel):
    id_solicitud : Optional[int] = None
    telefono: str
    nombre:str
    fecha: datetime
    servicio: str
    descripcion: Optional[str] = None
    origen: str
    destino: str
    total: float
    servicios: List[str]

def solicitudSchema(data) -> dict:
    return {
        "id_solicitud": data.id_solicitud,
        "telefono": data.telefono,
        "nombre": data.nombre,
        "fecha": str(data.fecha),
        "tipo_trabajo": data.tipo_trabajo,  
        "descripcion": data.descripcion,
        "origen": data.origen,
        "destino": data.destino,
        "total": data.total,
        "estado": data.estado,
        "servicios": data.servicios_adicionales 
    }
