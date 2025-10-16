.PHONY: help install dev build start lint clean docker-build docker-run docker-stop docker-logs docker-shell setup

# Default target
help:
	@echo "Available commands:"
	@echo "  install      - Install npm dependencies"
	@echo "  dev          - Start npm development server"
	@echo "  build        - Npm build for production"
	@echo "  start        - Start npm production server"
	@echo "  lint         - Run ESLint"
	@echo "  clean        - Clean build artifacts"
	@echo "  docker-build - Build Docker image"
	@echo "  docker-run   - Run with Docker Compose"
	@echo "  docker-stop  - Stop Docker containers"
	@echo "  docker-logs  - View Docker logs"
	@echo "  docker-shell - Access Docker container shell"
	@echo "  setup        - Run automated setup script"

# Local development
install:
	npm install

dev:
	npm run dev

build:
	npm run build

start:
	npm start

lint:
	npm run lint

clean:
	rm -rf .next
	rm -rf node_modules
	rm -rf out

# Docker commands
docker-build:
	docker compose build --no-cache

docker-run:
	docker compose up -d

docker-stop:
	docker compose down

docker-logs:
	docker compose logs -f

docker-shell:
	docker compose exec ui-internal-ts sh

# Production Docker
docker-build-prod:
	docker compose -f docker-compose.prod.yml build --no-cache

docker-run-prod:
	docker compose -f docker-compose.prod.yml up -d

docker-stop-prod:
	docker compose -f docker-compose.prod.yml down

# Development Docker
docker-build-dev:
	docker compose -f docker-compose.dev.yml build --no-cache

docker-run-dev:
	docker compose -f docker-compose.dev.yml up -d

docker-stop-dev:
	docker compose -f docker-compose.dev.yml down

# Setup
setup:
	chmod +x setup.sh
	./setup.sh

# Environment
env-setup:
	cp .example .env.local
	@echo "Please edit .env.local with your configuration"

# Utility commands
logs:
	docker logs ui-internal-ts -f

status:
	docker compose ps

restart:
	docker compose restart

rebuild:
	docker compose down
	docker compose build --no-cache
	docker compose up -d
