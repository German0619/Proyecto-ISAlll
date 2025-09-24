from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Solicitud(BaseModel):
    id_solicitud : Optional[int] = None
    telefono: str 
    fecha: datetime
    servicio: str
    descripcion: Optional[str] = None
    origen: str
    destino: str
    total: float
    servicios: List[str]
