#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

// ============================================================================
// GUARDIAN SYSTEM v4 — Concrete Visual Direction (Not Abstract Concepts)
//
// Each Guardian maps to specific PHOTOGRAPHIC and ART DIRECTION parameters.
// This is the key insight: Gemini 3 Pro responds to photographer-style
// direction, not abstract "elemental wisdom" keywords.
// ============================================================================

const GUARDIANS: Record<string, {
  name: string;
  camera: string;       // Camera/lens direction
  lighting: string;     // Lighting setup
  palette: string[];    // Actual hex colors to use
  composition: string;  // Composition technique
  texture: string;      // Material/surface quality
  mood: string;         // Atmospheric direction
}> = {
  '@vision-artist': {
    name: 'Vision Artist',
    camera: 'Wide-angle establishing shot, shallow depth of field f/2.8, slight dutch angle for dynamism',
    lighting: 'Golden hour rim lighting with soft ambient fill, volumetric light rays through atmosphere',
    palette: ['#98D8C8', '#FFD700', '#E8E0D4', '#2D1B69'],
    composition: 'Golden ratio spiral, subject at power point, leading lines converging to focal point',
    texture: 'Polished glass and brushed metal surfaces, holographic iridescence on edges',
    mood: 'Cinematic premium feel, like a high-end product launch keynote'
  },
  '@dragon-forge': {
    name: 'Dragon Forge',
    camera: 'Low-angle hero shot looking up, 24mm wide lens, dramatic perspective distortion',
    lighting: 'Strong backlight with ember particles, warm key light from below, deep shadows',
    palette: ['#FF6B35', '#FF8C42', '#FFD23F', '#1A0A00'],
    composition: 'Triangular power composition, subject dominating upper frame, energy radiating outward',
    texture: 'Molten metal, volcanic glass, glowing cracks revealing inner fire',
    mood: 'Epic and powerful, like a forge creating something legendary'
  },
  '@crystal-architect': {
    name: 'Crystal Architect',
    camera: 'Isometric 30-degree angle, orthographic perspective, clean geometric framing',
    lighting: 'Soft diffused studio lighting, no harsh shadows, even illumination across all surfaces',
    palette: ['#4A5759', '#DAA520', '#E8E0D4', '#1C2833'],
    composition: 'Grid-based layout, clear hierarchy, modular blocks with precise spacing',
    texture: 'Crystalline facets, architectural concrete, precision-cut glass, frosted surfaces',
    mood: 'Technical precision meets architectural beauty, like a Zaha Hadid render'
  },
  '@void-gazer': {
    name: 'Void Gazer',
    camera: 'Extreme wide shot pulling back to reveal scale, 14mm ultra-wide, deep depth of field',
    lighting: 'Bioluminescent glow from within, cool blue-purple ambient, point lights like distant stars',
    palette: ['#1A1A2E', '#0F3460', '#7B2FBE', '#00D4FF'],
    composition: 'Radial symmetry emanating from center void, fibonacci spiral, infinite depth layers',
    texture: 'Dark matter nebula, quantum particle fields, glass-smooth surfaces with internal glow',
    mood: 'Awe-inspiring cosmic scale, like looking into the birth of a universe'
  },
  '@ocean-memory': {
    name: 'Ocean Memory',
    camera: 'Eye-level medium shot, 50mm natural perspective, gentle tilt shift for miniature effect',
    lighting: 'Soft caustic light patterns as if underwater, cool ambient with warm accent highlights',
    palette: ['#2E86AB', '#5DADE2', '#98D8C8', '#0A1628'],
    composition: 'Flowing S-curve through frame, layered depth planes, organic asymmetry',
    texture: 'Fluid mercury surfaces, crystallized water, translucent layered glass',
    mood: 'Deep and contemplative, like an aquarium of living data'
  }
};

// ============================================================================
// STYLE PRESETS — Concrete Art Direction (Not Vague Adjectives)
// ============================================================================

const STYLES: Record<string, {
  artDirection: string;
  reference: string;
  constraints: string;
}> = {
  'concept-art': {
    artDirection: 'High-end concept art for a AAA game studio. Painterly digital illustration with photorealistic lighting.',
    reference: 'Style reference: Beeple daily renders meets Apple product photography',
    constraints: 'Clean composition, no text, no UI elements, pure visual storytelling'
  },
  'technical': {
    artDirection: 'Clean technical illustration. Flat design with selective 3D elements. Infographic quality.',
    reference: 'Style reference: Stripe documentation illustrations meets Bloomberg terminal aesthetics',
    constraints: 'Minimal palette, clear hierarchy, readable at any size, professional'
  },
  'isometric': {
    artDirection: 'Detailed isometric 3D render. Miniature world diorama style with tilt-shift depth of field.',
    reference: 'Style reference: Monument Valley game art meets architectural model photography',
    constraints: 'Strict 30-degree isometric, consistent scale, warm directional lighting'
  },
  'cinematic': {
    artDirection: 'Cinematic widescreen composition. Film grain, anamorphic lens flares, dramatic color grading.',
    reference: 'Style reference: Blade Runner 2049 cinematography meets NASA deep space imagery',
    constraints: '21:9 cinematic feel even in square, dramatic contrast, atmospheric depth'
  },
  'premium': {
    artDirection: 'Ultra-premium product visualization. Studio-lit floating elements on dark gradient.',
    reference: 'Style reference: Apple keynote hero shots meets luxury brand advertising',
    constraints: 'Dark background, selective highlights, glass/metal materials, editorial quality'
  },
  // ---- Proven presets from frankxai/infogenius (Google AI Studio) ----
  'minimalist': {
    artDirection: 'Bauhaus Minimalist. Flat vector art, limited color palette (2-3 colors), reliance on negative space and simple geometric shapes.',
    reference: 'Style reference: Dieter Rams design principles meets Swiss International Style',
    constraints: 'Maximum 3 colors, no gradients, pure geometric forms, generous whitespace'
  },
  'realistic': {
    artDirection: 'Photorealistic Composite. Cinematic lighting, 8k resolution, highly detailed textures. Looks like a photograph.',
    reference: 'Style reference: National Geographic photography meets high-end CGI compositing',
    constraints: 'Photorealistic materials, natural lighting, shallow depth of field, no stylization'
  },
  '3d-render': {
    artDirection: '3D Isometric Render. Claymorphism or high-gloss plastic texture, studio lighting, soft shadows, looks like a physical model.',
    reference: 'Style reference: Nintendo game art meets Pixar rendering quality',
    constraints: 'Consistent isometric angle, soft ambient occlusion, toy-like tactile quality'
  },
  'futuristic': {
    artDirection: 'Cyberpunk HUD. Glowing neon blue/cyan lines on dark background, holographic data visualization, 3D wireframes.',
    reference: 'Style reference: Minority Report UI meets Tron Legacy aesthetics',
    constraints: 'Dark background mandatory, neon accents only, tech/wireframe feel, no organic elements'
  },
  'vintage': {
    artDirection: '19th Century Scientific Lithograph. Engraving style, sepia tones, textured paper background, fine hatch lines.',
    reference: 'Style reference: Ernst Haeckel illustrations meets vintage patent drawings',
    constraints: 'Sepia/brown tones only, cross-hatching texture, aged paper effect, no modern elements'
  },
  'sketch': {
    artDirection: 'Da Vinci Notebook. Ink on parchment sketch, handwritten annotations style, rough but accurate lines.',
    reference: 'Style reference: Leonardo da Vinci codex pages meets architectural blueprints',
    constraints: 'Parchment background, ink-only rendering, mirror-text annotations welcome, technical accuracy'
  }
};

// ============================================================================
// PROMPT COMPOSER v4 — Narrative Description (Not Keyword Lists)
//
// Based on 2026 Gemini 3 Pro best practices:
// 1. Describe the scene narratively
// 2. Think like a photographer (lens, aperture, lighting)
// 3. Max 2-3 style elements
// 4. Include subject, composition, action, location, style
// 5. Target micro-contrast for perceived quality
// ============================================================================

function composePrompt(
  description: string,
  guardianKey: string | undefined,
  styleName: string
): string {
  const guardian = guardianKey ? GUARDIANS[guardianKey] : GUARDIANS['@vision-artist'];
  const style = STYLES[styleName] || STYLES['concept-art'];
  const colors = guardian.palette;

  // Build a narrative prompt — tell a story, don't list keywords
  return [
    // 1. SCENE NARRATIVE (What are we looking at?)
    `A stunning ${style.artDirection}`,
    ``,
    `The scene depicts: ${description}`,
    ``,
    // 2. CAMERA & COMPOSITION (Think like a photographer)
    `Camera: ${guardian.camera}.`,
    `Composition: ${guardian.composition}.`,
    ``,
    // 3. LIGHTING & ATMOSPHERE (Max 2-3 elements)
    `Lighting: ${guardian.lighting}.`,
    `Atmosphere: ${guardian.mood}.`,
    ``,
    // 4. MATERIALS & TEXTURE (Micro-contrast for quality)
    `Surfaces and materials: ${guardian.texture}.`,
    `Color palette dominated by ${colors.slice(0, 3).join(', ')} against ${colors[colors.length - 1]} background.`,
    ``,
    // 5. STYLE REFERENCE (Concrete, not abstract)
    `${style.reference}.`,
    `${style.constraints}.`,
    ``,
    // 6. QUALITY DIRECTIVE (Short and specific)
    `Render in 4K resolution with sharp detail, no artifacts, no text unless specifically requested. Photorealistic materials with cinematic color grading.`
  ].join('\n');
}

// ============================================================================
// MCP SERVER SETUP
// ============================================================================

if (!process.env.GEMINI_API_KEY) {
  console.error('ERROR: GEMINI_API_KEY environment variable is required');
  process.exit(1);
}

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const server = new Server(
  { name: 'arcanea-infogenius', version: '4.0.0' },
  { capabilities: { tools: {} } }
);

// ============================================================================
// TOOL: generate_visual — The core generation tool
// ============================================================================

const GenerateVisualSchema = z.object({
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must not exceed 2000 characters')
    .describe('What to visualize — describe the scene narratively'),
  guardian: z.string().optional()
    .describe('Visual direction preset: @vision-artist, @dragon-forge, @crystal-architect, @void-gazer, @ocean-memory'),
  style: z.enum(['concept-art', 'technical', 'isometric', 'cinematic', 'premium', 'minimalist', 'realistic', '3d-render', 'futuristic', 'vintage', 'sketch'])
    .default('concept-art')
    .describe('Art direction style preset'),
  label: z.string().optional()
    .describe('Optional text label to render on the image')
});

async function generateVisual(args: z.infer<typeof GenerateVisualSchema>) {
  const { description, guardian, style, label } = args;

  const sanitized = description.replace(/[<>]/g, '').trim();

  let prompt = composePrompt(sanitized, guardian, style);

  // Add label if requested
  if (label) {
    prompt += `\n\nIMPORTANT: Render the text "${label}" in a clean, modern sans-serif font (white with subtle drop shadow) in the bottom-right corner of the image.`;
  }

  const model = process.env.INFOGENIUS_MODEL || 'gemini-3-pro-image-preview';

  const response = await genAI.models.generateContent({
    model,
    contents: prompt,
    config: { responseModalities: ['image', 'text'] }
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error('No response from model');

  for (const part of parts) {
    if ('inlineData' in part && part.inlineData) {
      return {
        success: true,
        image: part.inlineData.data,
        mimeType: part.inlineData.mimeType || 'image/png',
        metadata: {
          model,
          guardian: guardian || '@vision-artist',
          style,
          promptLength: prompt.length,
          timestamp: new Date().toISOString()
        },
        prompt // Return prompt for debugging/learning
      };
    }
  }

  throw new Error('No image data in response');
}

// ============================================================================
// TOOL: get_guardians — List available visual direction presets
// ============================================================================

function getGuardians(guardianKey?: string) {
  if (guardianKey && GUARDIANS[guardianKey]) {
    return { [guardianKey]: GUARDIANS[guardianKey] };
  }
  return GUARDIANS;
}

// ============================================================================
// TOOL: get_styles — List available style presets
// ============================================================================

function getStyles(styleName?: string) {
  if (styleName && STYLES[styleName]) {
    return { [styleName]: STYLES[styleName] };
  }
  return STYLES;
}

// ============================================================================
// REGISTER TOOLS
// ============================================================================

server.setRequestHandler(ListToolsRequestSchema, () => ({
  tools: [
    {
      name: 'generate_visual',
      description: 'Generate a high-quality visual using Gemini 3 Pro with photographer-style art direction. Describe your scene narratively for best results.',
      inputSchema: {
        type: 'object',
        properties: {
          description: {
            type: 'string',
            description: 'Narrative description of the scene to visualize'
          },
          guardian: {
            type: 'string',
            description: 'Visual direction preset',
            enum: Object.keys(GUARDIANS)
          },
          style: {
            type: 'string',
            description: 'Art direction style',
            enum: Object.keys(STYLES),
            default: 'concept-art'
          },
          label: {
            type: 'string',
            description: 'Optional text to render on the image'
          }
        },
        required: ['description']
      }
    },
    {
      name: 'get_guardians',
      description: 'List available Guardian visual direction presets with camera, lighting, and composition details',
      inputSchema: {
        type: 'object',
        properties: {
          guardian: {
            type: 'string',
            description: 'Specific guardian to query',
            enum: Object.keys(GUARDIANS)
          }
        }
      }
    },
    {
      name: 'get_styles',
      description: 'List available art direction style presets',
      inputSchema: {
        type: 'object',
        properties: {
          style: {
            type: 'string',
            description: 'Specific style to query',
            enum: Object.keys(STYLES)
          }
        }
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'generate_visual': {
        const result = await generateVisual(GenerateVisualSchema.parse(args));
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'get_guardians': {
        const guardians = getGuardians(args?.guardian as string | undefined);
        return { content: [{ type: 'text', text: JSON.stringify(guardians, null, 2) }] };
      }
      case 'get_styles': {
        const styles = getStyles(args?.style as string | undefined);
        return { content: [{ type: 'text', text: JSON.stringify(styles, null, 2) }] };
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: message }) }] };
  }
});

// ============================================================================
// START
// ============================================================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('InfoGenius v4.0 MCP server running');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
