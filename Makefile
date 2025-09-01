.PHONY: install test build clean dist package help

# Default target
all: install build

# Install dependencies
install:
	npm install

# Test the project (no tests currently defined in package.json)
test:
	@echo "No tests currently defined in package.json"

# Build the project (outputs to dist folder)
build:
	npm run build
	npm run dist
	@echo "Build completed - files available in dist/ folder"

# Clean build artifacts
clean:
	npm run clean
	rm -f background.js index.js chronomark-extension.zip

# Create distribution folder with only necessary extension files
dist:
	npm run dist

# Package the extension for distribution
package: build
	npm run package
	@echo "Extension packaged as chronomark-extension.zip"

# Show help
help:
	@echo "Available targets:"
	@echo "  install  - Install npm dependencies"
	@echo "  test     - Run tests (currently none defined)"
	@echo "  build    - Build the project and create dist folder"
	@echo "  clean    - Clean build artifacts"
	@echo "  dist     - Copy necessary files to dist folder"
	@echo "  package  - Build and package extension as zip"
	@echo "  help     - Show this help message"