#!/bin/bash

# Simple Test using Nano Banana MCP directly
echo "🍌 Testing Nano Banana MCP with Arcanea Prompts"
echo ""

# Set API Key
export GEMINI_API_KEY="AIzaSyA0_gKlBROiIEc2SIvCIcP-RmmwU_mJ1PI"

echo "🔥 Test 1: Arcanea Dragon Forge Digital Transformation"
echo ""

PROMPT1="Create a professional enterprise architecture diagram showing digital transformation journey.

Oracle Branding:
- Primary color: Oracle Red (#C74634) for core services
- Secondary: Dark gray (#312D2A) for text
- Background: Clean white with subtle gradients
- Style: Modern, flat design with subtle shadows

Arcanea Enhancement:
- Dragon Forge Guardian: Bold transformation energy
- Fire elemental influence: #FF6B35 accents
- Dynamic flow showing evolution and transformation
- Mythical sigils marking transformation points

Content:
- Legacy systems on left transforming to modern architecture on right
- Cloud migration arrows showing data flow
- AI factory integration in center
- Microservices architecture at the top
- Clear labels and professional presentation quality

Resolution: 1920x1080 for presentations"

echo "Generating image with Dragon Forge enhancement..."
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "generate_image", "arguments": {"prompt": "'"$PROMPT1"'"}}}' | timeout 30 npx nano-banana-mcp

echo ""
echo "🌊 Test 2: Arcanea Ocean Memory Data Lakehouse"
echo ""

PROMPT2="Create a technical data lakehouse architecture diagram.

Oracle Branding:
- Primary color: Oracle Red (#C74634) for core services
- Secondary: Medium gray (#747775) for secondary elements
- Background: Light gray (#F5F5F5) for clarity
- Style: Clean technical diagram with clear hierarchy

Arcanea Enhancement:
- Ocean Memory Guardian: Deep data wisdom
- Water elemental influence: #2E86AB flow streams
- Fluid data movement patterns
- Mystical depth showing data evolution

Content:
- Bronze layer: Raw data sources at bottom
- Silver layer: Processing in middle with transformations
- Gold layer: Refined analytics at top
- Real-time data streams flowing vertically
- AI/ML insights highlighted
- Clear technical labels and annotations

Resolution: 1920x1080 for technical documentation"

echo "Generating image with Ocean Memory enhancement..."
echo '{"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "generate_image", "arguments": {"prompt": "'"$PROMPT2"'"}}}' | timeout 30 npx nano-banana-mcp

echo ""
echo "✨ Both Arcanea-enhanced images generated!"
echo "🔥 Dragon Forge: Digital transformation with bold energy"
echo "🌊 Ocean Memory: Data wisdom with fluid depth"