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
// INFOGENIUS v5 — KNOWLEDGE-FIRST VISUAL INTELLIGENCE
//
// The fundamental shift: Research FIRST, then visualize knowledge.
//
// Pipeline: TOPIC → RESEARCH (web grounding) → EXTRACT FACTS → COMPOSE
//           KNOWLEDGE-RICH PROMPT → GENERATE INFOGRAPHIC
//
// Every image must TEACH something. Style is the presentation layer,
// not the substance.
// ============================================================================

// ============================================================================
// AUDIENCE LEVELS — Controls information density and complexity
// ============================================================================

const AUDIENCES: Record<string, {
  label: string;
  instruction: string;
  density: string;
}> = {
  'elementary': {
    label: 'Ages 6-10',
    instruction: 'Target: Ages 6-10. Bright, simple, fun. Large clear icons and minimal text labels. Use simple words. Maximum 3-4 visual elements.',
    density: 'minimal'
  },
  'highschool': {
    label: 'High School',
    instruction: 'Target: High School. Standard textbook style. Clean lines, clear labels, accurate diagrams. 5-8 visual elements with explanatory labels.',
    density: 'moderate'
  },
  'college': {
    label: 'University',
    instruction: 'Target: University. Academic journal style. High detail, data-rich, precise schematics. Include statistics, proper terminology, interconnected systems.',
    density: 'high'
  },
  'expert': {
    label: 'Industry Expert',
    instruction: 'Target: Industry Expert. Technical blueprint. Extremely dense detail, precise annotations, industry-standard notation, maximum information per pixel.',
    density: 'maximum'
  }
};

// ============================================================================
// VISUAL STYLES — The presentation layer (how knowledge is rendered)
// ============================================================================

const STYLES: Record<string, {
  name: string;
  instruction: string;
}> = {
  'standard': {
    name: 'Scientific Illustration',
    instruction: 'High-quality digital scientific illustration. Clean, modern, highly detailed. Professional color palette. Clear visual hierarchy with labeled components.'
  },
  'minimalist': {
    name: 'Bauhaus Minimalist',
    instruction: 'Bauhaus Minimalist. Flat vector art, limited color palette (2-3 colors), reliance on negative space and simple geometric shapes. Information conveyed through spatial relationships.'
  },
  'photorealistic': {
    name: 'Photorealistic',
    instruction: 'Photorealistic Composite. Cinematic lighting, 8K resolution, highly detailed textures. Looks like a photograph with annotated overlays.'
  },
  '3d': {
    name: '3D Isometric',
    instruction: '3D Isometric Render. Claymorphism or high-gloss plastic texture, studio lighting, soft shadows, looks like a physical model. Components clearly separated and labeled.'
  },
  'technical': {
    name: 'Technical Blueprint',
    instruction: 'Da Vinci Notebook style. Ink on parchment sketch, handwritten annotation style, rough but accurate lines, technical precision. Dense with labels and cross-references.'
  },
  'futuristic': {
    name: 'Cyberpunk HUD',
    instruction: 'Cyberpunk HUD. Glowing neon blue/cyan lines on dark background, holographic data visualization, 3D wireframes. Data panels and readouts integrated into design.'
  },
  'vintage': {
    name: 'Scientific Lithograph',
    instruction: '19th Century Scientific Lithograph. Engraving style, sepia tones, textured paper background, fine hatch lines. Detailed labels in period-appropriate typography.'
  },
  'cartoon': {
    name: 'Educational Comic',
    instruction: 'Educational Comic. Vibrant colors, thick outlines, expressive cel-shaded style, engaging and fun. Information made approachable through visual storytelling.'
  }
};

// ============================================================================
// RESEARCH ENGINE — Uses Gemini with Google Search grounding
// ============================================================================

async function researchTopic(
  genAI: GoogleGenAI,
  topic: string,
  audience: string
): Promise<{
  facts: string[];
  visualElements: string[];
  labels: string[];
  context: string;
  sources: string[];
}> {
  const audienceLevel = AUDIENCES[audience] || AUDIENCES['college'];

  const researchPrompt = `You are a visual knowledge architect. Research this topic thoroughly and extract the essential knowledge needed to create an educational infographic.

TOPIC: "${topic}"
AUDIENCE: ${audienceLevel.label} (${audienceLevel.density} information density)

Respond in EXACTLY this structured format:

FACTS:
1. [Most important fact - include specific numbers/data when available]
2. [Second key fact]
3. [Third key fact]
4. [Fourth key fact if density is high/maximum]
5. [Fifth key fact if density is maximum]

VISUAL_ELEMENTS:
1. [Primary diagram/visualization element to include, e.g., "Flow diagram showing X connecting to Y"]
2. [Secondary visual element, e.g., "Comparison chart of A vs B"]
3. [Supporting visual, e.g., "Cross-section showing internal structure"]
4. [Additional element if density warrants]

LABELS:
1. [Key term or label that MUST appear on the infographic]
2. [Second critical label]
3. [Third label]
4. [Fourth label if needed]

CONTEXT:
[One paragraph explaining WHY this topic matters and what the viewer should understand after seeing this infographic]

Be precise. Use current 2026 data. Every fact should be visualizable.`;

  const researchModel = process.env.INFOGENIUS_RESEARCH_MODEL || 'gemini-2.5-flash';

  try {
    const response = await genAI.models.generateContent({
      model: researchModel,
      contents: researchPrompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || '';

    // Parse structured response
    const facts = extractSection(text, 'FACTS');
    const visualElements = extractSection(text, 'VISUAL_ELEMENTS');
    const labels = extractSection(text, 'LABELS');
    const contextMatch = text.match(/CONTEXT:\s*\n([\s\S]*?)(?:\n\n|$)/);
    const context = contextMatch ? contextMatch[1].trim() : topic;

    // Extract sources from grounding metadata if available
    const sources: string[] = [];
    const candidates = response.candidates;
    if (candidates?.[0]?.groundingMetadata?.groundingChunks) {
      for (const chunk of candidates[0].groundingMetadata.groundingChunks) {
        if (chunk.web?.uri) {
          sources.push(chunk.web.uri);
        }
      }
    }

    return {
      facts: facts.length > 0 ? facts : [`Key information about ${topic}`],
      visualElements: visualElements.length > 0 ? visualElements : [`Diagram of ${topic}`],
      labels: labels.length > 0 ? labels : [topic],
      context,
      sources
    };
  } catch (error) {
    // Fallback: generate without grounding if search fails
    console.error('Research grounding failed, using fallback:', error);
    return {
      facts: [`Key aspects of ${topic}`, `How ${topic} works`, `Why ${topic} matters`],
      visualElements: [`Diagram showing ${topic}`, `Components of ${topic}`],
      labels: [topic],
      context: `An educational overview of ${topic}`,
      sources: []
    };
  }
}

function extractSection(text: string, sectionName: string): string[] {
  const regex = new RegExp(`${sectionName}:\\s*\\n([\\s\\S]*?)(?=\\n[A-Z_]+:|$)`);
  const match = text.match(regex);
  if (!match) return [];

  return match[1]
    .split('\n')
    .map(line => line.replace(/^\d+\.\s*/, '').replace(/^\[|\]$/g, '').trim())
    .filter(line => line.length > 0 && !line.startsWith('['));
}

// ============================================================================
// PROMPT COMPOSER v5 — Knowledge-First (Facts → Visual Directives)
//
// The prompt structure:
// 1. What kind of infographic (style + audience)
// 2. The RESEARCHED FACTS to visualize (the substance)
// 3. Visual elements derived from knowledge (not decoration)
// 4. Labels and annotations (precision)
// 5. Composition and quality
// ============================================================================

function composeInfographicPrompt(
  topic: string,
  research: {
    facts: string[];
    visualElements: string[];
    labels: string[];
    context: string;
  },
  styleName: string,
  audience: string,
  aspectRatio: string
): string {
  const style = STYLES[styleName] || STYLES['standard'];
  const audienceConfig = AUDIENCES[audience] || AUDIENCES['college'];

  const factsBlock = research.facts
    .map((f, i) => `- ${f}`)
    .join('\n');

  const visualBlock = research.visualElements
    .map((v, i) => `- ${v}`)
    .join('\n');

  const labelsBlock = research.labels
    .map(l => `"${l}"`)
    .join(', ');

  return `Create a ${aspectRatio} educational infographic about: ${topic}

VISUAL STYLE: ${style.instruction}

AUDIENCE: ${audienceConfig.instruction}

KNOWLEDGE TO VISUALIZE (these are researched facts — each must be represented visually):
${factsBlock}

VISUAL ELEMENTS TO INCLUDE:
${visualBlock}

REQUIRED LABELS AND TEXT (render clearly and legibly):
${labelsBlock}

COMPOSITION:
- Clear visual hierarchy — most important information largest and most prominent
- Logical flow — viewer's eye should follow the information in order
- All text must be perfectly spelled, large enough to read, with high contrast
- Include directional arrows or flow indicators where relationships exist
- White space between sections for clarity
- Professional color coding to distinguish different categories of information

QUALITY: Render at maximum quality. Sharp detail, no artifacts. Every label must be perfectly legible. This is an educational tool, not decoration — clarity and accuracy matter above all.`;
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
  { name: 'arcanea-infogenius', version: '5.0.0' },
  { capabilities: { tools: {} } }
);

// ============================================================================
// TOOL: generate_infographic — Knowledge-first visual generation
// ============================================================================

const GenerateInfographicSchema = z.object({
  topic: z.string()
    .min(3, 'Topic must be at least 3 characters')
    .max(500, 'Topic must not exceed 500 characters')
    .describe('What to research and visualize — a topic, concept, or question'),
  style: z.enum(['standard', 'minimalist', 'photorealistic', '3d', 'technical', 'futuristic', 'vintage', 'cartoon'])
    .default('standard')
    .describe('Visual presentation style'),
  audience: z.enum(['elementary', 'highschool', 'college', 'expert'])
    .default('college')
    .describe('Target audience — controls information density and complexity'),
  aspect_ratio: z.enum(['16:9', '1:1', '9:16'])
    .default('16:9')
    .describe('Output aspect ratio'),
  label: z.string().optional()
    .describe('Optional title text to render prominently on the infographic')
});

async function generateInfographic(args: z.infer<typeof GenerateInfographicSchema>) {
  const { topic, style, audience, aspect_ratio, label } = args;
  const sanitized = topic.replace(/[<>]/g, '').trim();

  // STEP 1: Research the topic with web grounding
  const research = await researchTopic(genAI, sanitized, audience);

  // STEP 2: Compose knowledge-rich prompt
  let prompt = composeInfographicPrompt(
    sanitized,
    research,
    style,
    audience,
    aspect_ratio
  );

  // Add title if requested
  if (label) {
    prompt += `\n\nTITLE: Render "${label}" as a prominent title at the top of the infographic in a clean, modern font.`;
  }

  // STEP 3: Generate the image
  const imageModel = process.env.INFOGENIUS_MODEL || 'gemini-3-pro-image-preview';

  const response = await genAI.models.generateContent({
    model: imageModel,
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
        research: {
          facts: research.facts,
          visualElements: research.visualElements,
          labels: research.labels,
          context: research.context,
          sources: research.sources
        },
        metadata: {
          model: imageModel,
          researchModel: process.env.INFOGENIUS_RESEARCH_MODEL || 'gemini-2.5-flash',
          style,
          audience,
          aspectRatio: aspect_ratio,
          promptLength: prompt.length,
          timestamp: new Date().toISOString()
        },
        prompt
      };
    }
  }

  throw new Error('No image data in response');
}

// ============================================================================
// TOOL: generate_visual — Direct visual generation (no research, art-only)
// Kept for backward compatibility and pure art generation use cases
// ============================================================================

const GenerateVisualSchema = z.object({
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must not exceed 2000 characters')
    .describe('Direct visual description — use generate_infographic for knowledge-based visuals'),
  style: z.enum(['standard', 'minimalist', 'photorealistic', '3d', 'technical', 'futuristic', 'vintage', 'cartoon'])
    .default('standard')
    .describe('Visual style preset'),
  label: z.string().optional()
    .describe('Optional text to render on the image')
});

async function generateVisual(args: z.infer<typeof GenerateVisualSchema>) {
  const { description, style: styleName, label } = args;
  const sanitized = description.replace(/[<>]/g, '').trim();
  const style = STYLES[styleName] || STYLES['standard'];

  let prompt = `Create a high-quality visual: ${sanitized}\n\nVISUAL STYLE: ${style.instruction}\n\nRender at maximum quality. Sharp detail, no artifacts. All text must be perfectly legible.`;

  if (label) {
    prompt += `\n\nRender the text "${label}" prominently in a clean, modern font.`;
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
        metadata: { model, style: styleName, promptLength: prompt.length, timestamp: new Date().toISOString() },
        prompt
      };
    }
  }

  throw new Error('No image data in response');
}

// ============================================================================
// TOOL: research_topic — Research only, no image generation
// ============================================================================

const ResearchTopicSchema = z.object({
  topic: z.string()
    .min(3)
    .max(500)
    .describe('Topic to research with web grounding'),
  audience: z.enum(['elementary', 'highschool', 'college', 'expert'])
    .default('college')
    .describe('Target audience for information density')
});

// ============================================================================
// REGISTER TOOLS
// ============================================================================

server.setRequestHandler(ListToolsRequestSchema, () => ({
  tools: [
    {
      name: 'generate_infographic',
      description: 'RECOMMENDED: Research-first infographic generation. Researches the topic using Google Search grounding, extracts key facts, then generates a knowledge-rich educational infographic. Use this for any topic where accuracy and educational value matter.',
      inputSchema: {
        type: 'object',
        properties: {
          topic: {
            type: 'string',
            description: 'What to research and visualize (e.g., "how blockchain works", "quantum entanglement", "human cardiovascular system")'
          },
          style: {
            type: 'string',
            description: 'Visual style',
            enum: Object.keys(STYLES),
            default: 'standard'
          },
          audience: {
            type: 'string',
            description: 'Target audience (controls complexity)',
            enum: Object.keys(AUDIENCES),
            default: 'college'
          },
          aspect_ratio: {
            type: 'string',
            description: 'Output aspect ratio',
            enum: ['16:9', '1:1', '9:16'],
            default: '16:9'
          },
          label: {
            type: 'string',
            description: 'Optional title text for the infographic'
          }
        },
        required: ['topic']
      }
    },
    {
      name: 'generate_visual',
      description: 'Direct visual generation without research. Use for artistic/decorative images where factual accuracy is not the goal. For educational content, use generate_infographic instead.',
      inputSchema: {
        type: 'object',
        properties: {
          description: {
            type: 'string',
            description: 'Direct visual description'
          },
          style: {
            type: 'string',
            description: 'Visual style',
            enum: Object.keys(STYLES),
            default: 'standard'
          },
          label: {
            type: 'string',
            description: 'Optional text to render on image'
          }
        },
        required: ['description']
      }
    },
    {
      name: 'research_topic',
      description: 'Research a topic using Google Search grounding without generating an image. Returns structured facts, visual element suggestions, and source citations. Use this to preview what knowledge will inform an infographic.',
      inputSchema: {
        type: 'object',
        properties: {
          topic: {
            type: 'string',
            description: 'Topic to research'
          },
          audience: {
            type: 'string',
            description: 'Target audience for density',
            enum: Object.keys(AUDIENCES),
            default: 'college'
          }
        },
        required: ['topic']
      }
    },
    {
      name: 'get_styles',
      description: 'List available visual style presets',
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
      case 'generate_infographic': {
        const result = await generateInfographic(GenerateInfographicSchema.parse(args));
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'generate_visual': {
        const result = await generateVisual(GenerateVisualSchema.parse(args));
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'research_topic': {
        const parsed = ResearchTopicSchema.parse(args);
        const result = await researchTopic(genAI, parsed.topic, parsed.audience);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'get_styles': {
        const styleName = args?.style as string | undefined;
        if (styleName && STYLES[styleName]) {
          return { content: [{ type: 'text', text: JSON.stringify({ [styleName]: STYLES[styleName] }, null, 2) }] };
        }
        return { content: [{ type: 'text', text: JSON.stringify(STYLES, null, 2) }] };
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
  console.error('InfoGenius v5.0 — Knowledge-First Visual Intelligence');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
