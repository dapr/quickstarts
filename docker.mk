#
# Copyright 2021 The Dapr Authors
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#     http://www.apache.org/licenses/LICENSE-2.0
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
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

ifeq ($(TARGET_ARCH),arm)
  DOCKER_IMAGE_PLATFORM:=$(TARGET_OS)/arm/v7
else ifeq ($(TARGET_ARCH),arm64)
  DOCKER_IMAGE_PLATFORM:=$(TARGET_OS)/arm64/v8
else
  DOCKER_IMAGE_PLATFORM:=$(TARGET_OS)/amd64
endif


.PHONY: build

BUILD_APPS:=$(foreach ITEM,$(APPS),build-$(ITEM))
build: $(BUILD_APPS)

# Generate docker image build targets
define genDockerImageBuild
.PHONY: build-$(1)
build-$(1):
ifeq ($(TARGET_ARCH),amd64)
	$(DOCKER) build --build-arg PKG_FILES=* --platform $(DOCKER_IMAGE_PLATFORM) -f $(1)/$(DOCKERFILE) $(1)/. -t $(SAMPLE_REGISTRY)/$(DOCKER_IMAGE_PREFIX)$(1):$(REL_VERSION)-$(TARGET_OS)-$(TARGET_ARCH)
else
	-$(DOCKER) buildx create --use --name daprsamplesbuild
	-$(DOCKER) run --rm --privileged multiarch/qemu-user-static --reset -p yes
	$(DOCKER) buildx build --build-arg PKG_FILES=* --platform $(DOCKER_IMAGE_PLATFORM) -f $(1)/$(DOCKERFILE) $(1)/. -t $(SAMPLE_REGISTRY)/$(DOCKER_IMAGE_PREFIX)$(1):$(REL_VERSION)-$(TARGET_OS)-$(TARGET_ARCH)
endif
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
ifeq ($(TARGET_ARCH),amd64)
	$(DOCKER) push $(SAMPLE_REGISTRY)/$(DOCKER_IMAGE_PREFIX)$(1):$(REL_VERSION)-$(TARGET_OS)-$(TARGET_ARCH)
else
	-$(DOCKER) buildx create --use --name daprsamplesbuild
	-$(DOCKER) run --rm --privileged multiarch/qemu-user-static --reset -p yes
	$(DOCKER) buildx build --build-arg PKG_FILES=* --platform $(DOCKER_IMAGE_PLATFORM) -f $(1)/$(DOCKERFILE) $(1)/. -t $(SAMPLE_REGISTRY)/$(DOCKER_IMAGE_PREFIX)$(1):$(REL_VERSION)-$(TARGET_OS)-$(TARGET_ARCH) --push
endif
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