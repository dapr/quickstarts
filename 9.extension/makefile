DOCKER_IMAGE_PREFIX ?=extension-
APPS                ?=client daprd

SAMPLE_REGISTRY     ?=docker.io/dapriosamples
REL_VERSION         ?=edge
PROTO_VERSION		?=3.10.0
CGO         		?= 0
OUT_DIR 			:= ./dist
LDFLAGS				:="-s -w"

export GO111MODULE 	?= on
export GOPROXY 		?= https://proxy.golang.org
export GOSUMDB 		?= sum.golang.org


# Get target Architecture
LOCAL_ARCH := $(shell uname -m)
ifeq ($(LOCAL_ARCH),x86_64)
	TARGET_ARCH_LOCAL=amd64
else ifeq ($(shell echo $(LOCAL_ARCH) | head -c 5),armv8)
	TARGET_ARCH_LOCAL=arm64
else ifeq ($(shell echo $(LOCAL_ARCH) | head -c 4),armv)
	TARGET_ARCH_LOCAL=arm
else
	TARGET_ARCH_LOCAL=amd64
endif
export GOARCH ?= $(TARGET_ARCH_LOCAL)

# Get target OS
LOCAL_OS := $(shell uname)
ifeq ($(LOCAL_OS),Linux)
   TARGET_OS_LOCAL = linux
else ifeq ($(LOCAL_OS),Darwin)
   TARGET_OS_LOCAL = darwin
else
   TARGET_OS_LOCAL ?= windows
endif
export GOOS ?= $(TARGET_OS_LOCAL)


# Add latest tag if LATEST_RELEASE is true
LATEST_RELEASE ?=


# Docker image build and push setting
DOCKER:=docker
DOCKERFILE:=Dockerfile

############################################
# Build Binary
############################################
.PHONY: build
SAMPLE_APPS:=$(foreach ITEM,$(APPS),$(ITEM))
build: $(SAMPLE_APPS)

# Generate local build
# Params:
# $(1): app name
define generateBinary
.PHONY: $(1)
$(1):
	CGO_ENABLED=$(CGO) GOOS=$(GOOS) GOARCH=$(GOARCH) go build -ldflags=$(LDFLAGS) -o ./dist/$(1) ./cmd/$(1)/main.go;
endef
$(foreach ITEM,$(APPS),$(eval $(call generateBinary,$(ITEM))))

############################################
# Build Docker Image
############################################
.PHONY: build-docker
SAMPLE_APPS:=$(foreach ITEM,$(APPS),$(DOCKER_IMAGE_PREFIX)$(ITEM))
build-docker: $(SAMPLE_APPS)

# Generate docker image build targets
# Params:
# $(1): app name
# $(2): tag name
define genDockerImageBuild
.PHONY: $(DOCKER_IMAGE_PREFIX)$(1)
$(DOCKER_IMAGE_PREFIX)$(1):

	 $(DOCKER) build --build-arg APPNAME=$(1) \
	--build-arg HTTP_PROXY --build-arg http_proxy --build-arg HTTPS_PROXY --build-arg https_proxy --build-arg no_proxy --build-arg no_proxy \
	-f $(DOCKERFILE) . -t $(SAMPLE_REGISTRY)/$(DOCKER_IMAGE_PREFIX)$(1):$(2)
	
endef

# Generate docker image build targets
$(foreach ITEM,$(APPS),$(eval $(call genDockerImageBuild,$(ITEM),$(REL_VERSION))))

############################################
# Push Docker Image
############################################

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

############################################
# Generate Proto stubs
############################################
proto-generate: 
	go get -u github.com/golang/protobuf/protoc-gen-go@v1.3.2
	protoc -I $(shell pwd)/pkg/crypto $(shell pwd)/pkg/crypto/crypto.proto --go_out=plugins=grpc:$(shell pwd)/pkg/crypto/	