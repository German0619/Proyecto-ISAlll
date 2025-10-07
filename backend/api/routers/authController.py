from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from passlib.context import CryptContext
from core.connectDB import db
from core.security import generateJWT,getTokenId
from models.userModel import Usuarios,userSchema
from utils.infoVerify import searchUser,validContrasena
from utils.httpError import errorInterno
router = APIRouter(prefix ="/auth",tags=["Autenticacion"])

crypt = CryptContext(schemes=["bcrypt"])

#loguear usuario
@router.post("/login/",status_code=status.HTTP_200_OK)
async def login(form : OAuth2PasswordRequestForm = Depends()):
    try:  
        result = await searchUser(form.username,2)
    
        if not result or not crypt.verify(form.password,result["contrasena"]):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail="Usuario o contraseña incorrectos")
    
        return {
            "access_token": generateJWT(result["id_usuario"]),
            "token_type": "bearer"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise errorInterno(e) 

# Registrar nuevo usuario
@router.post("/register/",status_code=status.HTTP_201_CREATED)
async def register(user: Usuarios): 
    try:
        if await searchUser(user.correo,2) :
            raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                                detail="Correo ya en uso,ingrese uno diferente")
        
        if not validContrasena(user.contrasena) :
            raise HTTPException(status_code=status.HTTP_406_NOT_ACCEPTABLE,
                                detail="Contraseña invalida,introduzca una contraseña que contenga 8 caracteres minimo y que incluya una letra mayuscula,una minuscula,un numero y un caracter especial(@$!%*?&),ejemplo: Hola123!")
        
        query ="""INSERT INTO usuarios(nombre,apellido,correo,contrasena,rol) 
                VALUES(:nombre,:apellido,:correo,:contrasena,:rol)
                RETURNING id_usuario"""
        values = {
            "nombre":user.nombre,
            "apellido":user.apellido,
            "correo": user.correo,
            "contrasena":crypt.hash(user.contrasena),
            "rol": "cliente"
        }
        
        result = await db.fetch_one(query,values)
        
        if result is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                               detail="Error al registrar usuario") 
            
        return {"detail":"Usuario registrado exitosamente"}    
    except HTTPException:
        raise
    except Exception as e:
        raise errorInterno(e)

# Obtener datos del usuario logueado
@router.get("/me", status_code=status.HTTP_200_OK)
async def get_me(userId: int = Depends(getTokenId)):
    try:
        userData = await searchUser(userId,1)

        return userSchema(userData)
    except HTTPException:
        raise
    except Exception:
        raise errorInterno()
