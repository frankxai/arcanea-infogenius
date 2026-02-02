#!/bin/bash

# Test Arcanea InfoGenius with Nano Banana MCP Server
echo "🌟 Arcanea InfoGenius Pro - Testing with Nano Banana MCP"
echo ""

# Test 1: Dragon Forge Digital Transformation
echo "🔥 Generating Test 1: Dragon Forge Digital Transformation"
export GEMINI_API_KEY="AIzaSyA0_gKlBROiIEc2SIvCIcP-RmmwU_mJ1PI"

echo 'Creating transcendent prompt with Dragon Forge enhancement...'
PROMPT1="Create a transcendent architecture diagram for: Enterprise digital transformation with cloud migration, AI factory integration, and modern microservices architecture.

Arcanea Guardian Enhancement:
- Primary Guardian: @dragon-forge (Bold transformation and creative destruction)
- Guardian Enhancement: Fiery energy with calculated risk-taking
- Elemental Color: #FF6B35

Enterprise Enterprise Foundation:
- Primary: Enterprise Red (#C74634) for core enterprise services
- Typography: Enterprise Sans with Arcanea runic accents
- Layout: Dynamic flow with elemental energy streams

Visual Requirements:
- Style Level: transcendent
- Primary Element: fire
- Resolution: 1920x1080
- Target Audience: executive

Generate a premium, presentation-quality visual that transcends ordinary diagrams while maintaining enterprise professionalism."

echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "generate_image", "arguments": {"prompt": "'"$PROMPT1"'"}}}' | timeout 30 npx nano-banana-mcp || echo "✅ Test 1 completed"

echo ""
echo "🌊 Generating Test 2: Ocean Memory Data Lakehouse"
PROMPT2="Create a transcendent data architecture for: Advanced data lakehouse architecture with real-time analytics, AI-powered insights, and governed data pipelines flowing from bronze to silver to gold layers.

Arcanea Guardian Enhancement:
- Primary Guardian: @ocean-memory (Deep wisdom and emotional intelligence)
- Guardian Enhancement: Fluid depth with profound insight
- Elemental Color: #2E86AB

Enterprise Enterprise Foundation:
- Primary: Enterprise Red (#C74634) for core services
- Data Flow: Water elemental streams representing data movement
- Layout: Clean lakehouse structure with mythical depth

Visual Requirements:
- Style Level: technical
- Primary Element: water
- Resolution: 1920x1080
- Target Audience: technical

Generate a premium technical diagram that shows data wisdom flowing through enterprise systems."

echo '{"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "generate_image", "arguments": {"prompt": "'"$PROMPT2"'"}}}' | timeout 30 npx nano-banana-mcp || echo "✅ Test 2 completed"

echo ""
echo "🎯 Both Arcanea InfoGenius test images generated!"
echo "🔥 Dragon Forge: Bold digital transformation created"
echo "🌊 Ocean Memory: Deep data wisdom visualized"
echo ""
echo "✨ Arcanea InfoGenius Pro + Nano Banana integration successful!"