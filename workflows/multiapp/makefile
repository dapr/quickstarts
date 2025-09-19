# Multi-App E-commerce Workflow Demo
# This makefile helps you run the complete multi-app workflow scenario

.PHONY: help build run-all run-go run-payment run-inventory run-ai clean

# Default target
help:
	@echo "Multi-App E-commerce Workflow Demo"
	@echo "=================================="
	@echo ""
	@echo "Available targets:"
	@echo "  build         - Build all services"
	@echo "  run-all       - Run all services (requires 4 terminals)"
	@echo "  run-go        - Run Go Order Orchestrator"
	@echo "  run-payment   - Run Java Payment Service"
	@echo "  run-inventory - Run Java Inventory Service"
	@echo "  run-ai        - Run Java AI Recommendation Service"
	@echo "  clean         - Clean Java build artifacts"
	@echo ""

# Build all services
build:
	@echo "Building Go Order Orchestrator..."
	@bash -c 'source ~/.sdkman/bin/sdkman-init.sh && cd go && cd order-orchestrator && go mod tidy && go build -o order-orchestrator .'
	@echo "Setting up Java environment..."
	@bash -c 'source ~/.sdkman/bin/sdkman-init.sh && cd java && sdk env'
	@echo "Building Java Payment Service..."
	@bash -c 'source ~/.sdkman/bin/sdkman-init.sh && cd java && sdk env && cd payment-service && mvn clean package -q'
	@echo "Building Java Inventory Service..."
	@bash -c 'source ~/.sdkman/bin/sdkman-init.sh && cd java && sdk env && cd inventory-service && mvn clean package -q'
	@echo "Building Java AI Recommendation Service..."
	@bash -c 'source ~/.sdkman/bin/sdkman-init.sh && cd java && sdk env && cd ai-recommendation-service && mvn clean package -q'
	@echo "All services built successfully!"

# Run all services (requires 4 terminals)
run-all:
	@echo "Starting all services..."
	@echo "Please open 4 terminals and run:"
	@echo "  Terminal 1: make run-go"
	@echo "  Terminal 2: make run-payment"
	@echo "  Terminal 3: make run-inventory"
	@echo "  Terminal 4: make run-ai"
	@echo ""
	@echo "Or run them individually:"
	@echo "  make run-go"
	@echo "  make run-payment"
	@echo "  make run-inventory"
	@echo "  make run-ai"

# Run Go Order Orchestrator
run-go:
	@echo "Starting Go Order Orchestrator..."
	cd go/order-orchestrator && dapr run --log-level debug --app-id order-orchestrator --app-port 50001 --dapr-http-port 3505 --dapr-grpc-port 50014 --resources-path ../../components -- go run .

# Run Java Payment Service
run-payment:
	@echo "Starting Java Payment Service..."
	@bash -c 'source ~/.sdkman/bin/sdkman-init.sh && cd java && sdk env && cd payment-service && dapr run --log-level debug --app-id payment-service --app-port 50002 --dapr-http-port 3506 --dapr-grpc-port 50015 --resources-path ../../components -- java -jar target/payment-service-1.0.0.jar'

# Run Java Inventory Service
run-inventory:
	@echo "Starting Java Inventory Service..."
	@bash -c 'source ~/.sdkman/bin/sdkman-init.sh && cd java && sdk env && cd inventory-service && dapr run --log-level debug --app-id inventory-service --app-port 50003 --dapr-http-port 3507 --dapr-grpc-port 50016 --resources-path ../../components -- java -jar target/inventory-service-1.0.0.jar'

# Run Java AI Recommendation Service
run-ai:
	@echo "Starting Java AI Recommendation Service..."
	@bash -c 'source ~/.sdkman/bin/sdkman-init.sh && cd java && sdk env && cd ai-recommendation-service && dapr run --log-level debug --app-id ai-recommendation-service --app-port 50004 --dapr-http-port 3508 --dapr-grpc-port 50017 --resources-path ../../components -- java -jar target/ai-recommendation-service-1.0.0.jar'

# Clean Java build artifacts
clean:
	@echo "Cleaning Java build artifacts..."
	cd java/payment-service && mvn clean -q
	cd java/inventory-service && mvn clean -q
	cd java/ai-recommendation-service && mvn clean -q
	@echo "Clean completed!"

# Test the workflow
test:
	@echo "Testing the multi-app workflow..."
	@echo "Sending POST request to: http://localhost:50001/start-workflow"
	@curl -X POST http://localhost:50001/start-workflow
	@echo ""
	@echo "Test completed!"
