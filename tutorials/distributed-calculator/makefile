DOCKER_IMAGE_PREFIX ?= distributed-calculator-
APPS                ?= node python go csharp react-calculator
	
include ../docker.mk
include ../validate.mk

TARGET_DOTNET_PLATFORM = $(TARGET_ARCH)
ifeq ($(TARGET_DOTNET_PLATFORM),amd64)
  TARGET_DOTNET_PLATFORM = x64
endif

build-csharp-local:
	cd csharp && dotnet restore -r linux-$(TARGET_DOTNET_PLATFORM)
	cd csharp && dotnet publish -c Release -o out

build-csharp: build-csharp-local
