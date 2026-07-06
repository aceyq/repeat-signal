from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import aggregates, categories, cities, neighborhoods

app = FastAPI(
    title="Repeat Signal API",
    description=(
        "Read-only API serving pre-aggregated, cross-city public safety data "
        "(Chicago, NYC, San Francisco). See /docs for interactive documentation, "
        "and docs/ARCHITECTURE.md and docs/ETHICS.md in the repo for the design "
        "and responsible-use policy behind this data."
    ),
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(cities.router)
app.include_router(categories.router)
app.include_router(neighborhoods.router)
app.include_router(aggregates.router)


@app.get("/api/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}
