# ─────────────────────────────────────────────────────────────────────────────
# Project root Makefile — app commands only
# Infrastructure commands live in infra/Makefile
# ─────────────────────────────────────────────────────────────────────────────

.PHONY: dev build start lint test test-watch test-cover \
        infra-install infra-synth infra-diff infra-deploy infra-destroy \
        ssh help

# ── Local development ─────────────────────────────────────────────────────────
dev:          ## Start the Next.js dev server at http://localhost:3000
	npm run dev

build:        ## Build the app for production
	npm run build

start:        ## Start the production server (requires a build first)
	npm run start

lint:         ## Run ESLint across the codebase
	npm run lint

# ── Testing ───────────────────────────────────────────────────────────────────
test:         ## Run all unit tests once
	npm test

test-watch:   ## Run tests in watch mode (re-runs on file save)
	npm test -- --watch

test-cover:   ## Run tests and open a coverage report
	npm test -- --coverage

# ── Infrastructure shortcuts ──────────────────────────────────────────────────
# Full targets live in infra/Makefile — these are convenience aliases.
infra-install:  ## Install CDK dependencies
	$(MAKE) -C infra install

infra-synth:    ## Preview the CloudFormation template (no AWS calls)
	$(MAKE) -C infra synth

infra-diff:     ## Show what will change vs the live stack
	$(MAKE) -C infra diff

infra-deploy:   ## Deploy infrastructure to AWS
	$(MAKE) -C infra deploy

infra-destroy:  ## Destroy all AWS resources — CAUTION: permanent
	$(MAKE) -C infra destroy

# ── SSH ───────────────────────────────────────────────────────────────────────
ssh:            ## SSH into EC2  (usage: make ssh EC2_HOST=<elastic-ip>)
	@test -n "$(EC2_HOST)" || (echo "ERROR: provide EC2_HOST=<elastic-ip>"; exit 1)
	ssh ubuntu@$(EC2_HOST)

# ── Help ──────────────────────────────────────────────────────────────────────
help:           ## Show all available commands
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'
	@echo ""

.DEFAULT_GOAL := help
