ifneq (,$(wildcard ./.env.terraform))
	include .env.terraform
	export
else
	ifneq ($(DEPLOY_ENV), ci)
  	$(error You haven't setup your .env file. Please refer to the readme)
	endif
endif

ECR_URI=$(TF_VAR_allowed_account_id).dkr.ecr.us-west-2.amazonaws.com
IMAGE_TAG_BASE=$(ECR_URI)/$(TF_VAR_app)-ecr:$(TF_WORKSPACE)

# This is a hack to eval the image tag only when it's a dependency, cause we don't want to set it until docker builds
get_image_tag = IMAGE_TAG = $$(IMAGE_TAG_BASE)-$$(shell docker inspect --format $$(format-filter) $$(IMAGE_TAG_BASE)-latest | sed -e 's/sha256://g')

.PHONY: eval_image_tag

eval_image_tag:
	$(eval $(get_image_tag))

# GET the absolute location for .env.production.local, again, only after it exists


get_env_file = ENV_FILE = $$(abspath .env.production.local)

.PHONE: eval_env_file
eval_env_file: .env.production.local
	$(eval $(get_env_file))

.PHONY: docker-login
docker-login:
	aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin $(ECR_URI)

.env.production.local: .env.terraform .env.production.local.tpl
	./scripts/esh -o .env.production.local .env.production.local.tpl 

docker-build: docker-login .env.production.local
	docker build -t $(IMAGE_TAG_BASE)-latest .

format-filter ="{{ .Id }}"

docker-tag: docker-build eval_image_tag
	docker tag $(IMAGE_TAG_BASE)-latest $(IMAGE_TAG)

docker-push: docker-tag eval_image_tag
	docker push $(IMAGE_TAG)

.PHONY: clean-terraform

clean-terraform: eval_image_tag
	tofu -chdir=deploy/app destroy -var="image_tag=$(IMAGE_TAG)" 

.PHONY: clean-shared

clean-shared:
	TF_WORKSPACE=default tofu -chdir=deploy/shared destroy

.PHONY: clean

clean: clean-terraform clean-shared

deploy/app/.terraform:
	tofu -chdir=deploy/app init -backend-config="key=storacha/$(TF_VAR_app)/terraform.tfstate"

deploy/shared/.terraform:
	TF_WORKSPACE=default tofu -chdir=deploy/shared init -backend-config="key=storacha/$(TF_VAR_app)/shared.tfstate"

.tfworkspace:
	tofu -chdir=deploy/app workspace new $(TF_WORKSPACE)
	touch .tfworkspace

.PHONY: init

init: deploy/app/.terraform deploy/shared/.terraform .tfworkspace

.PHONY: upgrade-shared

upgrade-shared:
	TF_WORKSPACE=default tofu -chdir=deploy/shared init --upgrade -backend-config="key=storacha/$(TF_VAR_app)/shared.tfstate"

.PHONY: upgrade-app

upgrade-app: upgrade-shared
	tofu -chdir=deploy/app init -upgrade -backend-config="key=storacha/$(TF_VAR_app)/terraform.tfstate"

.PHONY: upgrade
upgrade: upgrade-shared upgrade-app

.PHONY: validate-shared

validate-shared: deploy/shared/.terraform
	TF_WORKSPACE=default tofu -chdir=deploy/shared validate

.PHONY: validate-app

validate-app: deploy/app/.terraform .tfworkspace
	tofu -chdir=deploy/app validate

.PHONY: validate

validate: validate-shared validate-app

.PHONY: plan-shared

plan-shared: deploy/shared/.terraform
	TF_WORKSPACE=default tofu -chdir=deploy/shared plan

.PHONY: plan-app

plan-app: deploy/app/.terraform .tfworkspace eval_image_tag
	tofu -chdir=deploy/app plan -var="image_tag=$(IMAGE_TAG)"

.PHONY: plan

plan: plan-shared plan-app

ifeq ($(DEPLOY_ENV), ci)
APPLY_ARGS=-input=false --auto-approve
else
APPLY_ARGS=""
endif

.PHONY: apply-shared

apply-shared: deploy/shared/.terraform
	TF_WORKSPACE=default tofu -chdir=deploy/shared apply

.PHONY: apply-app

apply-app: deploy/app/.terraform .tfworkspace docker-push eval_image_tag eval_env_file
	tofu -chdir=deploy/app apply -var="image_tag=$(IMAGE_TAG)" -var='env_files=["$(ENV_FILE)"]' $(APPLY_ARGS)

.PHONY: apply

apply: apply-shared apply-app

.PHONY: console-shared

console-shared: deploy/shared/.terraform
	TF_WORKSPACE=default tofu -chdir=deploy/shared console

.PHONY: console-app
console: deploy/app/.terraform .tfworkspace eval_image_tag eval_env_file
	tofu -chdir=deploy/app console -var="image_tag=$(IMAGE_TAG)" -var='env_files=["$(ENV_FILE)"]' $(APPLY_ARGS)

.PHONY: wait-deploy
wait-deploy:
	aws deploy wait deployment-successful --deployment-id $(shell aws deploy list-deployments --deployment-group-name $(TF_WORKSPACE)-$(TF_VAR_app)-code-deploy-deployment-group --application-name $(TF_WORKSPACE)-$(TF_VAR_app)-code-deploy-app --query "deployments[0]" --output text)

.PHONY: db-migrate
db-migrate:
	aws ecs run-task \
	--cluster $(TF_WORKSPACE)-$(TF_VAR_app)-cluster \
	--task-definition $(TF_WORKSPACE)-$(TF_VAR_app) \
	--count 1 \
  --launch-type FARGATE \
	--overrides '{ \
  	"containerOverrides": [ \
    	{ \
			  "name": "first", \
    		"command": ["node", "scripts/migrate/index.mjs"] \
			} \
		] \
	}' \
   --network-configuration '$(shell aws ecs describe-services --cluster $(TF_WORKSPACE)-$(TF_VAR_app)-cluster --service $(TF_WORKSPACE)-$(TF_VAR_app)-service --query "services[0].networkConfiguration")'
