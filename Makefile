STORE ?= demo
PORT ?= 3081
ENV_FILE := envs/$(STORE).env
IMAGE ?= hydrogen-demo

.DEFAULT_GOAL := help
.PHONY: help dev tunnel preview start docker

help: ## List the targets
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "} {printf "  %-8s %s\n", $$1, $$2}'
	@echo "  STORE picks envs/<STORE>.env (default: demo), PORT the local port (default: 3081)."

dev: ## Dev server with hot reload
	STORE=$(STORE) PORT=$(PORT) npm run dev

tunnel: ## ngrok tunnel for customer login with the Headless channel
	PORT=$(PORT) npm run tunnel

preview: ## Production build in MiniOxygen, the local Oxygen runtime
	npx shopify hydrogen preview --build --port $(PORT) --env-file $(ENV_FILE)

start: ## Production build on node-server.mjs, as in the Docker image
	npm run build
	PORT=$(PORT) node --env-file=$(ENV_FILE) node-server.mjs

docker: ## Docker image with the profile mounted as runtime.env
	docker build -t $(IMAGE) .
	docker run --rm -p $(PORT):8080 -v "$(CURDIR)/$(ENV_FILE):/app/runtime.env:ro" $(IMAGE)
