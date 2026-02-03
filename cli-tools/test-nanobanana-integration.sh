#!/bin/bash
# Test Nano Banana MCP Integration
#
# USAGE:
#   export GEMINI_API_KEY="your-key"
#   ./test-nanobanana-integration.sh

if [ -z "$GEMINI_API_KEY" ]; then
    echo "ERROR: GEMINI_API_KEY not set"
    echo "Run: export GEMINI_API_KEY='your-key'"
    exit 1
fi

echo "Testing Nano Banana MCP connection..."
echo "API Key: ${GEMINI_API_KEY:0:10}...${GEMINI_API_KEY: -4}"

# Test API connectivity
curl -s "https://generativelanguage.googleapis.com/v1/models?key=$GEMINI_API_KEY" | head -5

echo ""
echo "If you see model list above, API key is valid."
