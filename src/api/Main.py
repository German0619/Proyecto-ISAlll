from fastapi import FastAPI
from routers import authController
from fastapi.middleware.cors import CORSMiddleware
from database.connectDB import connect,disconnect
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect()
    try:
        yield
    finally:
        await disconnect()

app = FastAPI(lifespan=lifespan)

# Registrar rutas
app.include_router(authController.router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Es la ruta raíz"}