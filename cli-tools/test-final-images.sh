#!/bin/bash
# Test Image Generation
#
# USAGE:
#   export GEMINI_API_KEY="your-key"
#   ./test-final-images.sh

if [ -z "$GEMINI_API_KEY" ]; then
    echo "ERROR: GEMINI_API_KEY not set"
    echo "Run: export GEMINI_API_KEY='your-key'"
    exit 1
fi

echo "Testing image generation with Gemini 3 Pro..."
echo "API Key: ${GEMINI_API_KEY:0:10}...${GEMINI_API_KEY: -4}"

# Add your test commands here
echo "Ready to generate images via MCP."
