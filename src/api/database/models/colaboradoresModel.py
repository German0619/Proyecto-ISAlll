# database/models/colaboradorModel.py
from pydantic import BaseModel, constr, condecimal
from typing import Optional
from datetime import datetime

class Colaborador(BaseModel):
    id_colaborador:Optional[int] = None
    nombre: str
    especialidad: str
    pago_hora: float