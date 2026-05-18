.PHONY: setup install db-up db-down migrate-create migrate-up migrate-down migrate-status sqlc dev-api dev-web lint test build validate-skills

setup:
	docker-compose up -d postgres
	@echo "Waiting for Postgres..."
	@sleep 3
	$(MAKE) migrate-up

install:
	cd common-api && go mod tidy
	cd web && pnpm install

db-up:
	docker-compose up -d postgres

db-down:
	docker-compose down

migrate-create:
	migrate create -ext sql -dir migrations -seq $(name)

migrate-up:
	migrate -path migrations -database "$(DATABASE_URL)" up

migrate-down:
	migrate -path migrations -database "$(DATABASE_URL)" down 1

migrate-status:
	migrate -path migrations -database "$(DATABASE_URL)" version

sqlc:
	cd common-api && sqlc generate

dev-api:
	cd common-api && go run cmd/api/main.go

dev-web:
	cd web && pnpm dev

lint:
	cd common-api && gofmt -w internal db pkg cmd
	cd web && pnpm lint --max-warnings=0

test:
	cd common-api && go test ./...
	cd web && pnpm type-check

build:
	cd common-api && go build -o bin/api cmd/api/main.go
	cd web && pnpm build

validate-skills:
	@echo "Skill validation not yet configured"
