include validate.mk

MM_SHELL ?= bash -c
all: install_mm validat

# Update go-sdk dependencies in this project and all subprojects
# Usage: make update_gosdk_version VERSION=v1.13.0-rc.1
update_gosdk_version:
	@if [ -z "$(VERSION)" ]; then \
		echo "Error: VERSION parameter is required. Usage: make update_gosdk_version VERSION=v1.13.0-rc.1"; \
		exit 1; \
	fi
	@echo "Updating go-sdk to version $(VERSION) in all SDK variant quickstarts..."
	@building_blocks=$$(find . -maxdepth 1 -mindepth 1 -type d); \
	for building_block in $$building_blocks; do \
		if [ -d "$$building_block/go/sdk" ]; then \
			echo "Checking $$building_block/go/sdk for go.mod"; \
			if [ -f "$$building_block/go/sdk/go.mod" ]; then \
				echo "Updating $$building_block/go/sdk to go-sdk $(VERSION)"; \
				(cd "$$building_block/go/sdk" && \
				grep -q "github.com/dapr/go-sdk" go.mod && \
				go get github.com/dapr/go-sdk@$(VERSION) && \
				go mod tidy) || \
				echo "Failed to update go-sdk in $$building_block/go/sdk"; \
			else \
				echo "No go.mod file found in $$building_block/go/sdk"; \
				echo "Looking for nested Go projects..."; \
				NESTED_GO_MODS=$$(find "$$building_block/go/sdk" -name "go.mod" -type f); \
				if [ -n "$$NESTED_GO_MODS" ]; then \
					for GO_MOD in $$NESTED_GO_MODS; do \
						NESTED_DIR=$$(dirname "$$GO_MOD"); \
						echo "Found Go project at $$NESTED_DIR"; \
						echo "Updating to go-sdk $(VERSION)"; \
						(cd "$$NESTED_DIR" && \
						grep -q "github.com/dapr/go-sdk" go.mod && \
						go get github.com/dapr/go-sdk@$(VERSION) && \
						go mod tidy) || \
						echo "Failed to update go-sdk in $$NESTED_DIR"; \
					done; \
				else \
					echo "No Go projects found in $$building_block/go/sdk"; \
				fi; \
			fi; \
		fi; \
	done
	@echo "go-sdk update complete! Please verify changes and run tests before committing."

# Target to update Python dependencies in all quickstarts
# Usage: make update_python_sdk_version [DAPR_VERSION=1.16.0] [FASTAPI_VERSION=1.16.0] [WORKFLOW_VERSION=1.16.0]
update_python_sdk_version:
	@echo "Updating Python dependencies in all quickstarts..."
	@find . -path '*/python/*' -name "requirements.txt" | while read -r REQ_FILE; do \
		echo "Processing: $$REQ_FILE"; \
		PROJECT_DIR=$$(dirname "$$REQ_FILE"); \
		if [ -n "$(DAPR_VERSION)" ] && grep -q "dapr>=" "$$REQ_FILE"; then \
			echo "  Updating dapr package to $(DAPR_VERSION)"; \
			sed -i.bak "s/dapr>=.*$$/dapr>=$(DAPR_VERSION)/g" "$$REQ_FILE" && rm -f "$$REQ_FILE.bak" || \
			echo "  Failed to update dapr in $$REQ_FILE"; \
		fi; \
		if [ -n "$(FASTAPI_VERSION)" ] && grep -q "dapr-ext-fastapi>=" "$$REQ_FILE"; then \
			echo "  Updating dapr-ext-fastapi to $(FASTAPI_VERSION)"; \
			sed -i.bak "s/dapr-ext-fastapi>=.*$$/dapr-ext-fastapi>=$(FASTAPI_VERSION)/g" "$$REQ_FILE" && rm -f "$$REQ_FILE.bak" || \
			echo "  Failed to update dapr-ext-fastapi in $$REQ_FILE"; \
		fi; \
		if [ -n "$(WORKFLOW_VERSION)" ] && grep -q "dapr-ext-workflow>=" "$$REQ_FILE"; then \
			echo "  Updating dapr-ext-workflow to $(WORKFLOW_VERSION)"; \
			sed -i.bak "s/dapr-ext-workflow>=.*$$/dapr-ext-workflow>=$(WORKFLOW_VERSION)/g" "$$REQ_FILE" && rm -f "$$REQ_FILE.bak" || \
			echo "  Failed to update dapr-ext-workflow in $$REQ_FILE"; \
		fi; \
	done
	@echo "Python dependency update complete! Please verify changes and run tests before committing."



# Target to update Dapr package versions in all C# quickstarts (SDK variant only)
# Usage: make update_dotnet_sdk_version VERSION=1.15.0
update_dotnet_sdk_version:
	@if [ -z "$(VERSION)" ]; then \
		echo "Error: VERSION parameter is required. Usage: make update_csharp_dapr VERSION=1.16.0-rc01"; \
		exit 1; \
	fi
	@echo "Updating Dapr packages to version $(VERSION) in all C# projects..."
	
	@# Process standard SDK quickstarts
	@echo "Processing SDK quickstarts..."
	@building_blocks=$$(find . -maxdepth 1 -mindepth 1 -type d); \
	for building_block in $$building_blocks; do \
		if [ -d "$$building_block/csharp/sdk" ]; then \
			echo "Checking $$building_block/csharp/sdk for .csproj files"; \
			CSPROJ_FILES=$$(find "$$building_block/csharp/sdk" -name "*.csproj"); \
			if [ -n "$$CSPROJ_FILES" ]; then \
				for CSPROJ in $$CSPROJ_FILES; do \
					echo "Processing: $$CSPROJ"; \
					PROJ_DIR=$$(dirname "$$CSPROJ"); \
					DAPR_LINES=$$(grep -A1 "PackageReference Include=\"Dapr." "$$CSPROJ" || echo ""); \
					if [ -n "$$DAPR_LINES" ]; then \
						echo "$$DAPR_LINES" | grep "Include=\"Dapr." | while read -r LINE; do \
							PACKAGE=$$(echo $$LINE | sed 's/.*Include="\([^"]*\)".*/\1/'); \
							echo "  Updating $$PACKAGE to version $(VERSION)"; \
							(cd "$$PROJ_DIR" && dotnet add "$$(basename $$CSPROJ)" package "$$PACKAGE" --version $(VERSION)) || \
							echo "  Failed to update $$PACKAGE in $$CSPROJ"; \
						done; \
					else \
						echo "  No Dapr package references found in $$CSPROJ"; \
					fi; \
				done; \
			else \
				echo "No .csproj files found in $$building_block/csharp/sdk"; \
			fi; \
		fi; \
	done
	
	@# Process tutorials directory separately
	@echo "Processing tutorials directory..."
	@if [ -d "./tutorials" ]; then \
		echo "Searching tutorials for .csproj files with Dapr references..."; \
		TUTORIAL_CSPROJ_FILES=$$(find "./tutorials" -name "*.csproj"); \
		if [ -n "$$TUTORIAL_CSPROJ_FILES" ]; then \
			for CSPROJ in $$TUTORIAL_CSPROJ_FILES; do \
				echo "Processing tutorial: $$CSPROJ"; \
				PROJ_DIR=$$(dirname "$$CSPROJ"); \
				DAPR_LINES=$$(grep -A1 "PackageReference Include=\"Dapr." "$$CSPROJ" || echo ""); \
				if [ -n "$$DAPR_LINES" ]; then \
					echo "$$DAPR_LINES" | grep "Include=\"Dapr." | while read -r LINE; do \
						PACKAGE=$$(echo $$LINE | sed 's/.*Include="\([^"]*\)".*/\1/'); \
						echo "  Updating $$PACKAGE to version $(VERSION)"; \
						(cd "$$PROJ_DIR" && dotnet add "$$(basename $$CSPROJ)" package "$$PACKAGE" --version $(VERSION)) || \
						echo "  Failed to update $$PACKAGE in $$CSPROJ"; \
					done; \
				else \
					echo "  No Dapr package references found in $$CSPROJ"; \
				fi; \
			done; \
		else \
			echo "No .csproj files found in tutorials directory"; \
		fi; \
	else \
		echo "No tutorials directory found"; \
	fi
	
	@echo "C# Dapr package update complete! Please verify changes and run tests before committing."

.PHONY: update_dotnet_sdk_version


test_go_quickstarts:
	@echo "Testing all Go quickstarts..."
	@building_blocks=$$(find . -maxdepth 1 -mindepth 1 -type d); \
	for building_block in $$building_blocks; do \
		for variant in "http" "sdk"; do \
			if [ ! -d "$$building_block/go/$$variant" ]; then \
				echo "$$building_block/go/$$variant does not exist."; \
			else \
				echo "Validating $$building_block/go/$$variant quickstart"; \
				(cd $$building_block/go/$$variant && make validate) || echo "Validation failed for $$building_block/go/$$variant"; \
			fi; \
		done; \
	done
	@echo "Go quickstart testing complete!"


test_python_quickstarts:
	@echo "Testing all Python quickstarts..."
	@building_blocks=$$(find . -maxdepth 1 -mindepth 1 -type d); \
	for building_block in $$building_blocks; do \
		for variant in "http" "sdk"; do \
			if [ ! -d "$$building_block/python/$$variant" ]; then \
				echo "$$building_block/python/$$variant does not exist."; \
			else \
				echo "Validating $$building_block/python/$$variant quickstart"; \
				(cd $$building_block/python/$$variant && \
				python3 -m venv .venv && \
				. .venv/bin/activate && \
				make validate && \
				deactivate && \
				rm -rf .venv) || echo "Validation failed for $$building_block/python/$$variant"; \
			fi; \
		done; \
	done
	@echo "Python quickstart testing complete!"

test_csharp_quickstarts:
	@echo "Testing all C# quickstarts..."
	@building_blocks=$$(find . -maxdepth 1 -mindepth 1 -type d); \
	for building_block in $$building_blocks; do \
		for variant in "http" "sdk"; do \
			if [ ! -d "$$building_block/csharp/$$variant" ]; then \
				echo "$$building_block/csharp/$$variant does not exist."; \
			else \
				echo "Validating $$building_block/csharp/$$variant quickstart"; \
				(cd $$building_block/csharp/$$variant && make validate) || echo "Validation failed for $$building_block/csharp/$$variant"; \
			fi; \
		done; \
	done
	@echo "C# quickstart testing complete!"

# Target to test all Java quickstarts
test_java_quickstarts:
	@echo "Testing all Java quickstarts..."
	@building_blocks=$$(find . -maxdepth 1 -mindepth 1 -type d); \
	for building_block in $$building_blocks; do \
		for variant in "http" "sdk"; do \
			if [ ! -d "$$building_block/java/$$variant" ]; then \
				echo "$$building_block/java/$$variant does not exist."; \
			else \
				echo "Validating $$building_block/java/$$variant quickstart"; \
				(cd $$building_block/java/$$variant && make validate) || echo "Validation failed for $$building_block/java/$$variant"; \
			fi; \
		done; \
	done
	@echo "Java quickstart testing complete!"

# Target to test all JavaScript quickstarts
test_javascript_quickstarts:
	@echo "Testing all JavaScript quickstarts..."
	@building_blocks=$$(find . -maxdepth 1 -mindepth 1 -type d); \
	for building_block in $$building_blocks; do \
		for variant in "http" "sdk"; do \
			if [ ! -d "$$building_block/javascript/$$variant" ]; then \
				echo "$$building_block/javascript/$$variant does not exist."; \
			else \
				echo "Validating $$building_block/javascript/$$variant quickstart"; \
				(cd $$building_block/javascript/$$variant && make validate) || echo "Validation failed for $$building_block/javascript/$$variant"; \
			fi; \
		done; \
	done
	@echo "JavaScript quickstart testing complete!"

test_all_quickstarts: test_go_quickstarts test_python_quickstarts test_csharp_quickstarts test_java_quickstarts test_javascript_quickstarts
	@echo "All quickstart tests complete!"

.PHONY: all update_gosdk_version update_python_sdk_version test_go_quickstarts test_python_quickstarts test_csharp_quickstarts test_java_quickstarts test_javascript_quickstarts test_all_quickstarts