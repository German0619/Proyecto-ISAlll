from fastapi import HTTPException

def errorInterno(e = None):
    """
    Lanza un HTTPException con código 500 y detalle del error.
    Si no se pasa ningún error, usa un mensaje genérico.
    """
    detalle = str(e) if e else "Error interno del servidor"
    raise HTTPException(status_code=500, detail=detalle)
