TAG ?= 0.1.3
CONFIG ?= default.json
SERVER_CONFIG ?= server-values.yaml
RELEASE ?= mineflayer-k8s

help: ## Display this help
	@echo 'usage: make [target] ...'
	@echo
	@echo -e '\033[35mVariables:\033[0m'
	@echo 'TAG: Docker tag, default "$(shell grep 'TAG' Makefile | head -1)"'
	@echo 'CONFIG: path to application config file, default "$(shell grep 'CONFIG' Makefile | head -1)"'
	@echo 'SERVER_CONFIG: path to minecraft server config file, default "$(shell grep 'SERVER_CONFIG' Makefile | head -1)"'
	@echo
	@echo -e '\033[35mTargets:\033[0m'
	@egrep '^(.+)\:\ ##\ (.+)' ${MAKEFILE_LIST} | column -t -c 2 -s ':#'

build_push: ## Build and push on DockerHub multiarch Docker image (need Docker buildx)
	docker buildx build --platform linux/arm,linux/arm64,linux/amd64 -t louis030195/mineflayer-k8s:${TAG} . --push

deploy: ## Deploy as a baremetal process
	node start.js -c ${CONFIG}

deploy_docker: ## Deploy as a Docker container
	docker run -p 3000:3000 --name mineflayer-k8s --rm -it -v $(shell pwd)/${CONFIG}:/app/${CONFIG} louis030195/mineflayer-k8s:${TAG} -c ${CONFIG}

deploy_k8s: ## Deploy as a Kubernetes Deployment
	helm install ${RELEASE} helm \
	--set config.host=$(shell jq -r '.host' ${CONFIG}),\
	config.port=$(shell jq -r '.port' ${CONFIG}),\
	config.username=$(shell jq -r '.username' ${CONFIG}),\
	config.password=$(shell jq -r '.password' ${CONFIG}),\
	config.version=$(shell jq -r '.version' ${CONFIG}),\
	config.disabledPlugins=$(shell jq -r '.disabledPlugins' ${CONFIG})

deploy_k8s_server: ## Deploy a github.comitzg/minecraft-server-charts on Kubernetes
	# https://github.com/itzg/minecraft-server-charts/blob/master/charts/minecraft/values.yaml#L40
	helm install minecraft-server itzg/minecraft -f ${SERVER_CONFIG}
