from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from routers import authController,solicitudController,inventarioController,collaboradoresController
from fastapi.middleware.cors import CORSMiddleware
from core.connectDB import connect,disconnect
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
app.include_router(solicitudController.router)
app.include_router(collaboradoresController.router)
app.include_router(inventarioController.router)
#cargar el frontend en el servidor de uvicorn
app.mount("/app", StaticFiles(directory="../../frontend"),name="frontend")
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

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse("../../frontend/public/static/favicon.ico")