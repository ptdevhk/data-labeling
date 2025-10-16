# Define Python version as an argument
ARG PYTHON_VERSION=3.13
# Timezone configuration
ARG TZ=Asia/Hong_Kong
# Environment: production or develop
ARG ENVIRONMENT=production

# Install uv and dependencies
FROM python:${PYTHON_VERSION}-slim AS builder
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Re-declare ARG to make it available in this stage
ARG ENVIRONMENT=production

# Show the currently running commands
SHELL ["sh", "-exc"]

# Set working directory
WORKDIR /app

# Copy environment-specific .env file
# Priority: 1) Use existing .env if present, 2) Copy .env.dev (develop mode), 3) Copy .env.example (production mode)
COPY .env* .env.example .env.dev* ./
RUN if [ -f ".env" ]; then \
        echo "Using existing .env file from repository"; \
    elif [ "$ENVIRONMENT" = "develop" ]; then \
        echo "Using development environment (.env.dev)"; \
        cp .env.dev .env 2>/dev/null || cp .env.example .env; \
    else \
        echo "Using production environment (.env.example)"; \
        cp .env.example .env; \
    fi

# Install dependencies
COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --no-install-project --locked --no-dev

# Copy the project source code into the builder stage
COPY . /app

# Final stage with minimal footprint
FROM python:${PYTHON_VERSION}-slim

# Re-declare ARG to make it available in this stage
ARG TZ=Asia/Hong_Kong
ENV TZ="$TZ"

# Set the working directory in the final image
WORKDIR /app

# See <https://hynek.me/articles/docker-signals/>.
STOPSIGNAL SIGINT

# Copy the virtual environment and the source code from the builder stage
COPY --from=builder /app/.venv /app/.venv
COPY --from=builder /app /app

# Set environment variables and add venv to PATH
ENV PATH="/app/.venv/bin:$PATH"

# Expose the application port
EXPOSE 5001

# Entry point for running the application
ENTRYPOINT ["gunicorn", "svc.main:app", "--workers", "2", "--worker-class", \
        "uvicorn.workers.UvicornWorker",  "-b", "0.0.0.0:5001" ]
