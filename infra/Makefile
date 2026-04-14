# ─────────────────────────────────────────────────────────────────────────────
# infra/Makefile — AWS CDK infrastructure commands
# Run from this directory or use the aliases in the root Makefile (infra-*)
# ─────────────────────────────────────────────────────────────────────────────

# AWS named profile — must match a profile in ~/.aws/credentials
AWS_PROFILE  := wperez-us-west-2

# Resolve the account ID from that profile so Vpc.fromLookup has an explicit account
ACCOUNT      := $(shell aws sts get-caller-identity --query Account --profile $(AWS_PROFILE) --output text 2>/dev/null)

# Environment passed to every CDK command
CDK_ENV      := AWS_PROFILE=$(AWS_PROFILE) AWS_ACCOUNT_ID=$(ACCOUNT)

.PHONY: install bootstrap synth diff deploy destroy help

install:    ## Install CDK dependencies
	npm ci

bootstrap:  ## One-time setup: create CDK toolkit resources in your AWS account
	$(CDK_ENV) npx cdk bootstrap aws://$(ACCOUNT)/us-west-2

synth:      ## Preview the CloudFormation template without deploying
	$(CDK_ENV) npm run synth

diff:     ## Show what will change vs the currently deployed stack
	$(CDK_ENV) npm run diff

deploy:   ## Deploy the stack to AWS (us-west-2, ~3 min on first run)
	$(CDK_ENV) npm run deploy

destroy:  ## Permanently delete all AWS resources in this stack
	@echo "WARNING: This will delete the EC2 instance, Elastic IP, and all related resources."
	@read -p "Type 'yes' to confirm: " confirm && [ "$$confirm" = "yes" ] || exit 1
	$(CDK_ENV) npm run destroy

help:     ## Show all available commands
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'
	@echo ""

.DEFAULT_GOAL := help
