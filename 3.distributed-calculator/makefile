DOCKER_IMAGE_PREFIX ?=distributed-calculator-
APPS                ?=node python go csharp react-calculator

SAMPLE_REGISTRY     ?=docker.io/dapriosamples
REL_VERSION         ?=edge

# Add latest tag if LATEST_RELEASE is true
LATEST_RELEASE ?=


# Docker image build and push setting
DOCKER:=docker
DOCKERFILE:=Dockerfile

.PHONY: build

SAMPLE_APPS:=$(foreach ITEM,$(APPS),$(DOCKER_IMAGE_PREFIX)$(ITEM))
build: $(SAMPLE_APPS)

# Generate docker image build targets
# Params:
# $(1): app name
# $(2): tag name
define genDockerImageBuild
.PHONY: $(DOCKER_IMAGE_PREFIX)$(1)
$(DOCKER_IMAGE_PREFIX)$(1):
	$(DOCKER) build -f $(1)/$(DOCKERFILE) $(1)/. -t $(SAMPLE_REGISTRY)/$(DOCKER_IMAGE_PREFIX)$(1):$(2)
endef

# Generate docker image build targets
$(foreach ITEM,$(APPS),$(eval $(call genDockerImageBuild,$(ITEM),$(REL_VERSION))))

# push docker image to the registry
.PHONY: push
PUSH_SAMPLE_APPS:=$(foreach ITEM,$(APPS),push-$(DOCKER_IMAGE_PREFIX)$(ITEM))
push: $(PUSH_SAMPLE_APPS)

# Generate docker image push targets
# Params:
# $(1): app name
# $(2): tag name
define genDockerImagePush
.PHONY: push-$(DOCKER_IMAGE_PREFIX)$(1)
push-$(DOCKER_IMAGE_PREFIX)$(1):
	$(DOCKER) push $(SAMPLE_REGISTRY)/$(DOCKER_IMAGE_PREFIX)$(1):$(2)
ifeq ($(LATEST_RELEASE),true)
	$(DOCKER) tag $(SAMPLE_REGISTRY)/$(DOCKER_IMAGE_PREFIX)$(1):$(2) $(SAMPLE_REGISTRY)/$(DOCKER_IMAGE_PREFIX)$(1):latest
	$(DOCKER) push $(SAMPLE_REGISTRY)/$(DOCKER_IMAGE_PREFIX)$(1):latest
endif
endef

# Generate docker image push targets
$(foreach ITEM,$(APPS),$(eval $(call genDockerImagePush,$(ITEM),$(REL_VERSION))))