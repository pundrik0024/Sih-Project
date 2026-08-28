from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.dashboard import router as dashboard_router
from app.api.network import router as network_router
from app.api.alerts import router as alerts_router
from app.api.incidents import router as incidents_router
from app.api.employees import router as employees_router
from app.api.departments import router as departments_router
from app.api.response import router as response_router
from app.api.audit import router as audit_router
from app.api.ml import router as ml_router
from app.api.demo import router as demo_router
from app.api.settings_api import router as settings_router
from app.api.architecture_api import router as architecture_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth_router)
api_router.include_router(dashboard_router)
api_router.include_router(network_router)
api_router.include_router(alerts_router)
api_router.include_router(incidents_router)
api_router.include_router(employees_router)
api_router.include_router(departments_router)
api_router.include_router(response_router)
api_router.include_router(audit_router)
api_router.include_router(ml_router)
api_router.include_router(demo_router)
api_router.include_router(settings_router)
api_router.include_router(architecture_router)
