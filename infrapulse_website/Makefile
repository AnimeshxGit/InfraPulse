.PHONY: up down logs ps restart seed clean test zip help

help:
	@echo "InfraPulse Production Management Commands:"
	@echo "  make up       - Build and launch all services in background"
	@echo "  make down     - Stop and remove all containers"
	@echo "  make logs     - View live logs from all services"
	@echo "  make ps       - List running containers and health status"
	@echo "  make restart  - Restart all services"
	@echo "  make seed     - Seed initial staff department accounts"
	@echo "  make zip      - Create clean upload zip archive excluding caches/env"
	@echo "  make clean    - Remove all volumes and containers (WARNING: destroys data)"


up:
	@if [ ! -f .env ]; then cp .env.example .env && echo "Created .env from .env.example"; fi
	docker compose up -d --build

down:
	docker compose down

logs:
	docker compose logs -f

ps:
	docker compose ps

restart:
	docker compose restart

seed:
	docker compose exec backend python scripts/seed_staff.py

clean:
	docker compose down -v

zip:
	@echo "Creating clean infrapulse.zip (excluding caches, venv, node_modules, and secrets)..."
	zip -r ../infrapulse.zip . \
		-x "*/.git/*" ".git/*" \
		-x "*/node_modules/*" "node_modules/*" \
		-x "*/.venv/*" ".venv/*" \
		-x "*/__pycache__/*" "__pycache__/*" \
		-x "*/.pytest_cache/*" ".pytest_cache/*" \
		-x "*/dist/*" "dist/*" \
		-x "*.env" "*.env.local" \
		-x "*backend/uploads/*" "*uploads/*" \
		-x "*.DS_Store" "*.log"
	@echo "\nSuccess! Clean archive created at: ../infrapulse.zip"
	@ls -lh ../infrapulse.zip

