# ------------------------------------------------------------
# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
# ------------------------------------------------------------
#
# Common make targets for samples' Docker images.

SAMPLE_REGISTRY        ?= docker.io/dapriosamples
TARGET_OS              ?= linux
TARGET_ARCH            ?= amd64
REL_VERSION            ?= latest
ifeq ($(REL_VERSION),edge)
	REL_VERSION := latest
endif

# Docker image build and push setting
DOCKER:=docker
DOCKERFILE:=Dockerfile
DOCKERMUTI_ARCH=linux-amd64 linux-arm linux-arm64

.PHONY: build

BUILD_APPS:=$(foreach ITEM,$(APPS),build-$(ITEM))
build: $(BUILD_APPS)

# Generate docker image build targets
define genDockerImageBuild
.PHONY: build-$(1)
build-$(1):
	$(DOCKER) build -f $(1)/$(DOCKERFILE) $(1)/. -t $(SAMPLE_REGISTRY)/$(DOCKER_IMAGE_PREFIX)$(1):$(REL_VERSION)-$(TARGET_OS)-$(TARGET_ARCH) --platform $(TARGET_OS)/$(TARGET_ARCH)
endef

# Generate docker image build targets
$(foreach ITEM,$(APPS),$(eval $(call genDockerImageBuild,$(ITEM))))

# push docker image to the registry
.PHONY: push
PUSH_APPS:=$(foreach ITEM,$(APPS),push-$(ITEM))
push: $(PUSH_APPS)

# Generate docker image push targets
define genDockerImagePush
.PHONY: push-$(1)
push-$(1):
	$(DOCKER) push $(SAMPLE_REGISTRY)/$(DOCKER_IMAGE_PREFIX)$(1):$(REL_VERSION)-$(TARGET_OS)-$(TARGET_ARCH)
endef

# Generate docker image push targets
$(foreach ITEM,$(APPS),$(eval $(call genDockerImagePush,$(ITEM))))

# Create docker manifest
.PHONY: manifest-create
CREATE_MANIFEST_APPS:=$(foreach ITEM,$(APPS),manifest-create-$(ITEM))
manifest-create: $(CREATE_MANIFEST_APPS)

# Generate docker manifest create
define genDockerManifestCreate
.PHONY: manifest-create-$(1)
manifest-create-$(1):
	$(DOCKER) manifest create $(SAMPLE_REGISTRY)/$(DOCKER_IMAGE_PREFIX)$(1):$(REL_VERSION) $(DOCKERMUTI_ARCH:%=$(SAMPLE_REGISTRY)/$(DOCKER_IMAGE_PREFIX)$(1):$(REL_VERSION)-%)
endef

# Generate docker manifest create
$(foreach ITEM,$(APPS),$(eval $(call genDockerManifestCreate,$(ITEM))))

# Push docker manifest
.PHONY: manifest-push
PUSH_MANIFEST_APPS:=$(foreach ITEM,$(APPS),manifest-push-$(ITEM))
manifest-push: $(PUSH_MANIFEST_APPS)

# Generate docker manifest create
define genDockerManifestPush
.PHONY: manifest-push-$(1)
manifest-push-$(1):
	$(DOCKER) manifest push $(SAMPLE_REGISTRY)/$(DOCKER_IMAGE_PREFIX)$(1):$(REL_VERSION)
endef

# Generate docker manifest create
$(foreach ITEM,$(APPS),$(eval $(call genDockerManifestPush,$(ITEM))))
