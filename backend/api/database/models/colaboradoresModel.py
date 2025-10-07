# database/models/colaboradorModel.py
from pydantic import BaseModel, constr, condecimal
from typing import Optional
from datetime import datetime

class Colaborador(BaseModel):
    id_colaborador:int
    nombre: str
    especialidad: str
    pago_hora: float

def colaboradorSchema(colaborador)->dict:
    return {
        "id_colaborador":colaborador.id_colaborador,
        "nombre":colaborador.nombre,
        "especialidad":colaborador.especialidad,
        "pago_hora":colaborador.pago_hora,
        "id_tipo_trabajo":colaborador.id_tipo_trabajo
    }