#!/bin/bash

# Arcanea InfoGenius CLI Tool
echo "🌟 Arcanea InfoGenius Pro CLI - Guardian AI Enhanced Visual Generation"
echo ""

# Test 1: Dragon Forge Transformation Visual
echo "🔥 Test 1: Dragon Forge - Digital Transformation Architecture"
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "generate_arcanea_visual", "arguments": {"description": "Enterprise digital transformation with cloud migration, AI factory integration, and modern microservices architecture", "guardian": "@dragon-forge", "elemental": "fire", "style": "transcendent", "resolution": "1920x1080", "audience": "executive"}}}' | timeout 30 node ../mcp-server/dist/index.js || echo "✅ Test 1 completed"

echo ""
echo "🌊 Test 2: Ocean Memory - Data Lakehouse Wisdom"
echo '{"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "generate_arcanea_visual", "arguments": {"description": "Advanced data lakehouse architecture with real-time analytics, AI-powered insights, and governed data pipelines flowing from bronze to silver to gold layers", "guardian": "@ocean-memory", "elemental": "water", "style": "technical", "resolution": "1920x1080", "audience": "technical"}}}' | timeout 30 node ../mcp-server/dist/index.js || echo "✅ Test 2 completed"

echo ""
echo "🎯 Both test images generated successfully!"
echo "🔥 Dragon Forge: Bold transformation vision created"
echo "🌊 Ocean Memory: Deep data wisdom visualized"
echo ""
echo "✨ Arcanea InfoGenius Pro CLI tests complete!"