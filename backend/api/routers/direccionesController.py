from fastapi import APIRouter, HTTPException, status
from core.connectMongoDB import db 

router = APIRouter(prefix="/direcciones", tags=["Direcciones"])

# ===============================
# GET: Obtener todas las direcciones
# ===============================
@router.get("/", status_code=status.HTTP_200_OK)
def obtenerDirecciones():
    try:
        provincias_cursor = db.provincias.find()  # obtenemos todos los documentos
        resultado = {}

        for prov in provincias_cursor:
            # construimos el dict jerárquico: provincia -> distrito -> corregimientos
            resultado[prov["provincia"]] = {
                distrito["nombre"]: distrito["corregimientos"]
                for distrito in prov.get("distritos", [])
            }

        if not resultado:
            raise HTTPException(status_code=404, detail="No se encontraron direcciones")

        return {"direcciones": resultado}

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
