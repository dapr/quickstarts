DOCKER_IMAGE_PREFIX ?=sample_bindings_
APPS                ?=nodeapp pythonapp

SAMPLE_REGISTRY     ?=docker.io/daprio
SAMPLE_VERSION      ?=latest

# Docker image build and push setting
DOCKER:=docker
DOCKERFILE:=Dockerfile

.PHONY: build

SAMPLE_APPS:=$(foreach ITEM,$(APPS),$(DOCKER_IMAGE_PREFIX)$(ITEM))
build: $(SAMPLE_APPS)

# Generate builds for dapr binaries for the target
# Params:
# $(1): app name
# $(2): tag name
define genDockerImageBuild
.PHONY: $(DOCKER_IMAGE_PREFIX)$(1)
$(DOCKER_IMAGE_PREFIX)$(1):
	$(DOCKER) build -f $(1)/$(DOCKERFILE) $(1)/. -t $(SAMPLE_REGISTRY)/$(DOCKER_IMAGE_PREFIX)$(1):$(2)
endef

# Generate docker image build targets
$(foreach ITEM,$(APPS),$(eval $(call genDockerImageBuild,$(ITEM),$(SAMPLE_VERSION))))

# push docker image to the registry
.PHONY: push
PUSH_SAMPLE_APPS:=$(foreach ITEM,$(APPS),push-$(DOCKER_IMAGE_PREFIX)$(ITEM))
push: $(PUSH_SAMPLE_APPS)

# Generate builds for dapr binaries for the target
# Params:
# $(1): app name
# $(2): tag name
define genDockerImagePush
.PHONY: push-$(DOCKER_IMAGE_PREFIX)$(1)
push-$(DOCKER_IMAGE_PREFIX)$(1):
	$(DOCKER) push $(SAMPLE_REGISTRY)/$(DOCKER_IMAGE_PREFIX)$(1):$(2)
endef

# Generate docker image build targets
$(foreach ITEM,$(APPS),$(eval $(call genDockerImagePush,$(ITEM),$(SAMPLE_VERSION))))