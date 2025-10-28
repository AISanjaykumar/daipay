.PHONY: up down logs seed api web mongo build

up:
	docker compose up -d --build

down:
	docker compose down -v

logs:
	docker compose logs -f --tail=100

seed:
	docker compose exec api npm run seed || true

api:
	cd server && npm i && npm run dev

web:
	cd web && npm i && npm run dev

mongo:
	docker compose exec mongo mongosh

build:
	cd server && npm i && npm run start &
	cd web && npm i && npm run build
