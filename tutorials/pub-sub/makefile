DOCKER_IMAGE_PREFIX ?=pubsub-
APPS                ?=node-subscriber python-subscriber csharp-subscriber react-form

include ../docker.mk
include ../validate.mk

TARGET_DOTNET_PLATFORM = $(TARGET_ARCH)
ifeq ($(TARGET_DOTNET_PLATFORM),amd64)
  TARGET_DOTNET_PLATFORM = x64
endif

build-csharp-subscriber-local:
	cd csharp-subscriber && dotnet restore -r linux-$(TARGET_DOTNET_PLATFORM)
	cd csharp-subscriber && dotnet publish -c Release -o out

build-csharp-subscriber: build-csharp-subscriber-local
