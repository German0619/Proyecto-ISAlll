from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
from datetime import datetime, timezone, timedelta
from utils.infoVerify import searchUser
from utils.httpError import errorInterno
from typing import cast, Dict
import jwt
from jwt import PyJWTError, ExpiredSignatureError, InvalidTokenError
from database.connectDB import db
import os
import bcrypt

# OAuth2
oauth2 = OAuth2PasswordBearer(tokenUrl="auth/login")

# Cargar variables de entorno
load_dotenv()
try:
    SECRET_KEY = os.getenv("SECRET_KEY")
    ACCESS_TOKEN_EXPIRED_MINUTES = int(cast(str, os.getenv("ACCESS_TOKEN_EXPIRED_MINUTES")))
    ALGORITHM = cast(str, os.getenv("ALGORITHM"))
except ValueError:
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Error interno en el servidor"
    )

# -------------------------
# Funciones de autenticación
# -------------------------
async def authToken(token: str = Depends(oauth2)):
    try:
        tokenData = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        tokenData["sub"] = int(tokenData.get("sub", 0))
        
        if not tokenData["sub"]:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token sin 'sub' válido",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        if await searchUser(tokenData["sub"], 1) is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario del token no existe",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        return tokenData

    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expirado",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"}
        )

def generateJWT(id: int) -> str:
    playload = {
        "sub": str(id),
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRED_MINUTES)
    }
    return jwt.encode(playload, SECRET_KEY, algorithm=ALGORITHM)

# -------------------------
# Funciones de autorización
# -------------------------
async def getRol(id: int):
    try:
        query = "SELECT rol FROM usuarios WHERE id_usuario = :id"
        result = await db.fetch_one(query, {"id": id})
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise errorInterno(e)

async def isAdmin(token: Dict = Depends(authToken)) -> bool:
    try:
        user_id = token.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido: no contiene ID de usuario"
            )

        result = await getRol(user_id)
        if not result["rol"].lower() == "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para realizar esta acción"
            )
        return True
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

def getTokenId(token: Dict = Depends(authToken)):
    user_id = token.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido: no contiene ID de usuario"
        )
    return user_id