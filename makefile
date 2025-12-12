FRONTEND_DIR = ./apps/web
LIB_DIR = ./packages/react-image-annotate
BACKEND_DIR = .
VERSION_FILE = ./VERSION

.PHONY: all build-all build-lib build-frontend start-frontend start-backend stop-backend clean-frontend-cache docker-up docker-down docker-build docker-restart generate-client version-sync version-bump version-current dev-lib dev-all check-annotate

# Local development: build library and frontend, then start backend
all: build-all start-backend

# Build library first, then frontend
build-all: build-lib build-frontend

build-lib: ## Build react-image-annotate library
	@echo "Building react-image-annotate library..."
	@bun run build:lib

clean-frontend-cache: ## Clear frontend cache and dependencies (fixes Vite hangs)
	@echo "🧹 Clearing frontend cache and dependencies..."
	@cd $(FRONTEND_DIR) && rm -rf node_modules .vite
	@echo "✅ Frontend cache cleared. Run 'bun install' from root to reinstall."

build-frontend: ## Build React frontend
	@echo "Building frontend..."
	@bun run build:web

generate-client: ## Generate TypeScript API client from FastAPI OpenAPI spec
	@echo "Generating TypeScript API client..."
	@chmod +x ./bin/generate-client.sh
	@./bin/generate-client.sh

start-frontend: ## Start frontend dev server (Vite on port 5173)
	@echo "Starting frontend dev server..."
	@bun run dev

start-backend: ## Start backend dev server (blocking, use Ctrl+C to stop)
	@echo "Starting backend dev server..."
	@cd $(BACKEND_DIR) && [ -d .venv ] && . .venv/bin/activate && uvicorn svc.main:app --reload --host 0.0.0.0 --port 5002 || uvicorn svc.main:app --reload --host 0.0.0.0 --port 5002

stop-backend: ## Kill any running uvicorn processes
	@echo "Stopping backend server..."
	@pkill -f "uvicorn svc.main:app" || echo "No backend server running"

# Docker deployment: build frontend and start containers
docker-up: build-frontend ## Build frontend and start Docker containers
	@echo "Starting Docker containers..."
	@docker compose -f docker-compose.yml up -d

docker-down: ## Stop and remove Docker containers
	@echo "Stopping Docker containers..."
	@docker compose -f docker-compose.yml down

docker-build: build-frontend ## Build frontend and Docker images
	@echo "Building Docker images..."
	@docker compose -f docker-compose.yml build

docker-restart: build-frontend ## Build frontend and restart Docker containers
	@echo "Restarting Docker containers..."
	@docker compose -f docker-compose.yml restart

define Comment
	- Run `make help` to see all the available options.
	- Run `make lint` to run the linter.
	- Run `make lint-check` to check linter conformity.
	- Run `make generate-client` to regenerate TypeScript API client after backend changes.
	- Run `make version-current` to display the current version.
	- Run `make version-bump TYPE=patch|minor|major` to manually bump version.
	- Run `make version-sync VERSION=x.y.z` to sync version across all files (includes uv.lock).
	- Run `dep-lock` to lock the deps in 'requirements.txt' and 'requirements-dev.txt'.
	- Run `dep-sync` to sync current environment up to date with the locked deps.
endef


.PHONY: lint
lint: ruff mypy lint-react	## Apply all the linters.

.PHONY: lint-react
lint-react: lint-frontend lint-i18n	## Run all React/frontend linters.

.PHONY: lint-frontend
lint-frontend: ## Run ESLint on frontend code.
	@echo "Running ESLint on frontend..."
	@bun run lint

.PHONY: lint-i18n
lint-i18n: ## Run the i18n linter.
	@echo "Running i18n linter..."
	@bun run --filter '@data-labeling/web' lint:i18n

.PHONY: lint-check
lint-check:  ## Check whether the codebase satisfies the linter rules.
	@echo
	@echo "Checking linter rules..."
	@echo "========================"
	@echo
	@cd $(BACKEND_DIR) && [ -d .venv ] && . .venv/bin/activate && uv run ruff check $(BACKEND_DIR) || uv run ruff check $(BACKEND_DIR)
	@cd $(BACKEND_DIR) && [ -d .venv ] && . .venv/bin/activate && uv run mypy $(BACKEND_DIR) || uv run mypy $(BACKEND_DIR)

.PHONY: ruff
ruff: ## Apply ruff.
	@echo "Applying ruff..."
	@echo "================"
	@echo
	@cd $(BACKEND_DIR) && [ -d .venv ] && . .venv/bin/activate && uv run ruff check --fix $(BACKEND_DIR) || uv run ruff check --fix $(BACKEND_DIR)
	@cd $(BACKEND_DIR) && [ -d .venv ] && . .venv/bin/activate && uv run ruff format $(BACKEND_DIR) || uv run ruff format $(BACKEND_DIR)

.PHONY: mypy
mypy: ## Apply mypy.
	@echo
	@echo "Applying mypy..."
	@echo "================="
	@echo
	@cd $(BACKEND_DIR) && [ -d .venv ] && . .venv/bin/activate && uv run mypy $(BACKEND_DIR) || uv run mypy $(BACKEND_DIR)

.PHONY: help
help: ## Show this help message.
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.PHONY: test
test: ## Run the tests against the current version of Python.
	@cd svc && [ -d ../.venv ] && . ../.venv/bin/activate && uv run pytest -vv && cd .. || uv run pytest -vv && cd ..

.PHONY: dep-lock
dep-lock: ## Freeze deps in 'requirements*.txt' files.
	@uv lock

.PHONY: dep-sync
dep-sync: ## Sync venv installation with 'requirements.txt' file.
	@uv sync

.PHONY: dep-update
dep-update: ## Update all the deps.
	@chmod +x ./bin/update_deps.sh
	@./bin/update_deps.sh

#################################################
# Library Development Workflow
#################################################

.PHONY: dev-lib
dev-lib: ## Start library in watch mode for development
	@echo "Starting library in watch mode..."
	@bun run dev:lib

.PHONY: dev-all
dev-all: ## Parallel development (lib watch + frontend dev) with HMR
	@echo "Starting parallel development..."
	@bun run dev:all

.PHONY: check-annotate
check-annotate: ## Check workspace vs npm version of @karlorz/react-image-annotate
	@echo "📋 Workspace version:"
	@cat $(LIB_DIR)/package.json | grep '"version"' | head -1
	@echo ""
	@echo "📋 Latest on npm:"
	@npm view @karlorz/react-image-annotate version 2>/dev/null || echo "  (unable to fetch)"

.PHONY: run-container
run-container: docker-up ## Run the app in a docker container (alias for docker-up).

.PHONY: kill-container
kill-container: docker-down ## Stop the running docker container (alias for docker-down).

#################################################
# Version Management
#################################################

.PHONY: version-current
version-current: ## Display current version from VERSION file
	@if [ -f $(VERSION_FILE) ]; then \
		cat $(VERSION_FILE); \
	else \
		echo "VERSION file not found"; \
		exit 1; \
	fi

.PHONY: version-sync
version-sync: ## Sync version across all project files (VERSION, pyproject.toml, package.json, uv.lock)
	@if [ -z "$(VERSION)" ]; then \
		echo "Error: VERSION variable is required. Usage: make version-sync VERSION=1.2.3"; \
		exit 1; \
	fi
	@echo "Syncing version $(VERSION) across project files..."
	@echo "$(VERSION)" > $(VERSION_FILE)
	@sed -i.bak 's/^version = ".*"/version = "$(VERSION)"/' pyproject.toml && rm -f pyproject.toml.bak
	@cd $(FRONTEND_DIR) && \
		sed -i.bak 's/"version": ".*"/"version": "$(VERSION)"/' package.json && \
		rm -f package.json.bak
	@echo "Updating uv.lock..."
	@uv lock
	@echo "Version synchronized to $(VERSION)"

.PHONY: version-bump
version-bump: ## Manually bump version (TYPE=major|minor|patch)
	@if [ -z "$(TYPE)" ]; then \
		echo "Error: TYPE variable is required. Usage: make version-bump TYPE=patch"; \
		echo "Valid types: major, minor, patch"; \
		exit 1; \
	fi
	@chmod +x ./bin/version-bump.sh
	@./bin/version-bump.sh $(TYPE)