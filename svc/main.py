from pathlib import Path

from fastapi import FastAPI, Response
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware

from svc.core import auth
from svc.routes import views

# Path to frontend build directory
FRONTEND_DIST = Path(__file__).parent.parent / "apps" / "web" / "dist"


def create_app() -> FastAPI:
    """Create a FastAPI application."""

    app = FastAPI(
        title="Data Labeling API",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
    )

    # Set all CORS enabled origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include API routers first (higher priority)
    app.include_router(auth.router)
    app.include_router(views.router)

    # Serve static files from web/dist (if directory exists)
    if FRONTEND_DIST.exists() and FRONTEND_DIST.is_dir():
        # Mount static assets (CSS, JS, images, etc.)
        app.mount(
            "/assets",
            StaticFiles(directory=str(FRONTEND_DIST / "assets")),
            name="assets",
        )

        # Catch-all route for SPA - must be defined last
        @app.get("/{full_path:path}")
        async def serve_spa(full_path: str) -> Response:
            """Serve index.html for all unmatched routes (SPA routing)."""
            # Serve static files if they exist
            file_path = FRONTEND_DIST / full_path
            if file_path.is_file():
                return FileResponse(file_path)
            # Otherwise serve index.html for client-side routing
            return FileResponse(FRONTEND_DIST / "index.html")

    return app


app = create_app()
