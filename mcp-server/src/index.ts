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
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { homedir } from 'node:os';
import { execFileSync } from 'node:child_process';

dotenv.config();

// ============================================================================
// INFOGENIUS v5.2 — KNOWLEDGE-FIRST VISUAL INTELLIGENCE + VEO 3.1 + GEMINI TTS
//
// Unified pipeline:
//   TOPIC → RESEARCH (Google Search grounding) → EXTRACT FACTS & VIDEO PROMPT
//   → COMPOSE KNOWLEDGE-RICH PROMPT → GENERATE 2K/4K INFOGRAPHIC
//   → OPTIONAL VEO 3.1 MOTION (.mp4) & GEMINI TTS NARRATION (.wav)
// ============================================================================

const ENV_KEY_NAMES = ['GEMINI_API_KEY', 'GOOGLE_GENERATIVE_AI_API_KEY', 'GOOGLE_API_KEY'];

const ENV_FILE_CANDIDATES = [
  resolve(process.cwd(), '.env.local'),
  resolve(process.cwd(), '.env'),
  resolve(homedir(), '.starlight', '.env'),
  resolve('C:/Users/frank/.starlight/.env'),
  resolve('C:/Users/frank/starlight/.env'),
  resolve('C:/Users/frank/starlight/repos/frankx.ai-vercel-website/.env.local'),
  resolve('C:/Users/frank/starlight/repos/FrankX/.env.local'),
  resolve('C:/Users/frank/starlight/repos/infogenius/.env.local'),
  resolve('C:/Users/frank/starlight/repos/arcanea-infogenius/.env'),
];

const INFISICAL_PROJECT_ID =
  process.env.STARLIGHT_INFISICAL_PROJECT_ID || '6e39a7d9-be07-4f58-babb-0cf650321feb';
const INFISICAL_ENV = process.env.STARLIGHT_INFISICAL_ENV || 'dev';

function isValidKeyCandidate(v: string | undefined | null): v is string {
  return Boolean(
    v &&
      !v.startsWith('<') &&
      !v.startsWith('your-') &&
      !v.startsWith('AQ.Ab8')
  );
}

function resolveApiKey(): string {
  for (const name of ENV_KEY_NAMES) {
    const v = process.env[name];
    if (isValidKeyCandidate(v)) return v;
  }
  for (const file of ENV_FILE_CANDIDATES) {
    if (!existsSync(file)) continue;
    try {
      const content = readFileSync(file, 'utf8');
      for (const name of ENV_KEY_NAMES) {
        const re = new RegExp(`^\\s*${name}\\s*=\\s*(.+)$`, 'm');
        const m = content.match(re);
        if (m) {
          const val = m[1].trim().replace(/^["']|["']$/g, '');
          if (isValidKeyCandidate(val)) return val;
        }
      }
    } catch {
      // ignore unreadable file
    }
  }
  for (const name of ENV_KEY_NAMES) {
    try {
      const out = execFileSync(
        'infisical',
        [
          'secrets',
          'get',
          name,
          '--plain',
          '--silent',
          `--projectId=${INFISICAL_PROJECT_ID}`,
          `--env=${INFISICAL_ENV}`,
        ],
        { encoding: 'utf8', timeout: 4500, stdio: ['ignore', 'pipe', 'ignore'] }
      ).trim();
      if (isValidKeyCandidate(out)) return out;
    } catch {
      // ignore infisical lookup error
    }
  }
  return '';
}

function getGenAI(): GoogleGenAI {
  const key = resolveApiKey();
  if (!key) {
    throw new Error(
      'GEMINI_API_KEY not found. Set GEMINI_API_KEY in C:/Users/frank/.starlight/.env or environment.'
    );
  }
  return new GoogleGenAI({ apiKey: key });
}

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
    instruction: 'Restrained Tech HUD. Glowing neon blue/cyan lines on dark background, holographic data visualization, 3D wireframes. Data panels and readouts integrated into design.'
  },
  'vintage': {
    name: 'Scientific Lithograph',
    instruction: '19th Century Scientific Lithograph. Engraving style, sepia tones, textured paper background, fine hatch lines. Detailed labels in period-appropriate typography.'
  },
  'cartoon': {
    name: 'Educational Comic',
    instruction: 'Educational Comic. Vibrant colors, thick outlines, expressive cel-shaded style, engaging and fun. Information made approachable through visual storytelling.'
  },
  'glassmorphic': {
    name: 'Premium 3D Glassmorphism',
    instruction: 'Premium 3D Glassmorphic Infographic. Dark void background (#0b0e14). All information displayed on frosted translucent glass panels floating at different depths. Key concepts rendered as 3D crystal/glass nodes connected by thin luminous teal (#7fffd4) threads. Dramatic directional spotlight from upper-left creating teal rim lighting on all glass surfaces. Gold (#ffd700) accents on highlights. Clean white sans-serif labels on every element. Maximum 3 accent colors. Professional data visualization meets luxury 3D rendering. NOT flat, NOT HUD overlay, NOT cyberpunk, NOT clay. Ultra-high detail, studio quality.'
  },
  'premium': {
    name: 'Luxury Brand Visual',
    instruction: 'Luxury tech-brand visual. Apple meets Dior meets DeepMind. Dark void background (#0b0e14). One striking crystal/glass focal element at center with dramatic volumetric lighting. Data and labels on frosted glass cards orbiting the focal point. Thin luminous teal (#7fffd4) connection threads forming constellation pattern. Gold (#ffd700) warm accent highlights. Ultra-clean typography in thin modern serif. 50%+ negative space. Materials: crystal, glass, titanium, light. NEVER clay, plastic, HUD, or clutter. 8K detail.'
  }
};

// ============================================================================
// RESEARCH ENGINE — Uses Gemini with Google Search grounding
// ============================================================================

async function researchTopic(
  genAI: GoogleGenAI,
  topic: string,
  audience: string,
  styleName = 'glassmorphic'
): Promise<{
  facts: string[];
  visualElements: string[];
  labels: string[];
  context: string;
  videoPrompt: string;
  sources: string[];
}> {
  const audienceLevel = AUDIENCES[audience] || AUDIENCES['college'];
  const styleObj = STYLES[styleName] || STYLES['glassmorphic'];

  const researchPrompt = `You are a Master Visual Knowledge Architect. Research this topic thoroughly using Google Search and extract the essential knowledge needed to create an educational infographic and a 7-second companion motion clip.

TOPIC: "${topic}"
AUDIENCE: ${audienceLevel.label} (${audienceLevel.density} information density)
AESTHETIC: ${styleObj.name} (${styleObj.instruction})

Respond in EXACTLY this structured format:

FACTS:
1. [Most important verified fact - include specific numbers/2026 data when available]
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

VIDEO_PROMPT:
[Cinematic prompt for a 7-second motion sequence animating the core mechanism of this infographic in ${styleObj.name} style]`;

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

    const facts = extractSection(text, 'FACTS');
    const visualElements = extractSection(text, 'VISUAL_ELEMENTS');
    const labels = extractSection(text, 'LABELS');
    const contextMatch = text.match(/CONTEXT:\s*\n([\s\S]*?)(?=\n[A-Z_]+:|$)/i);
    const context = contextMatch ? contextMatch[1].trim() : topic;
    const videoMatch = text.match(/VIDEO_PROMPT:\s*\n?([\s\S]*?)$/i);
    const videoPrompt = videoMatch
      ? videoMatch[1].trim()
      : `Cinematic 7-second data visualization animation of ${topic}. ${styleObj.instruction}`;

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
      videoPrompt,
      sources: Array.from(new Set(sources))
    };
  } catch (error) {
    console.error('Research grounding failed, using fallback:', error);
    return {
      facts: [`Key aspects of ${topic}`, `How ${topic} works`, `Why ${topic} matters`],
      visualElements: [`Diagram showing ${topic}`, `Components of ${topic}`],
      labels: [topic],
      context: `An educational overview of ${topic}`,
      videoPrompt: `Cinematic 7-second data visualization animation of ${topic}. ${styleObj.instruction}`,
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
    .map(line => line.replace(/^(?:\d+\.|-|\*)\s*/, '').replace(/^\[|\]$/g, '').trim())
    .filter(line => line.length > 0 && !line.startsWith('['));
}

// ============================================================================
// PROMPT COMPOSER v5 — Knowledge-First (Facts → Visual Directives)
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
  const style = STYLES[styleName] || STYLES['glassmorphic'];
  const audienceConfig = AUDIENCES[audience] || AUDIENCES['college'];

  const factsBlock = research.facts.map((f) => `- ${f}`).join('\n');
  const visualBlock = research.visualElements.map((v) => `- ${v}`).join('\n');
  const labelsBlock = research.labels.map(l => `"${l}"`).join(', ');

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
// AUDIO WAV WRAPPER FOR GEMINI TTS
// ============================================================================

function wrapPcmInWavHeader(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  if (pcmBuffer.length >= 4 && pcmBuffer.toString('ascii', 0, 4) === 'RIFF') {
    return pcmBuffer;
  }
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

// ============================================================================
// MCP SERVER SETUP
// ============================================================================

const server = new Server(
  { name: 'arcanea-infogenius', version: '5.2.0' },
  { capabilities: { tools: {} } }
);

// ============================================================================
// TOOL SCHEMAS & HANDLERS
// ============================================================================

const GenerateInfographicSchema = z.object({
  topic: z.string()
    .min(3, 'Topic must be at least 3 characters')
    .max(500, 'Topic must not exceed 500 characters')
    .describe('What to research and visualize — a topic, concept, or question'),
  style: z.enum(['standard', 'minimalist', 'photorealistic', '3d', 'technical', 'futuristic', 'vintage', 'cartoon', 'glassmorphic', 'premium'])
    .default('glassmorphic')
    .describe('Visual presentation style'),
  audience: z.enum(['elementary', 'highschool', 'college', 'expert'])
    .default('college')
    .describe('Target audience — controls information density and complexity'),
  aspect_ratio: z.enum(['16:9', '1:1', '9:16'])
    .default('16:9')
    .describe('Output aspect ratio'),
  image_size: z.enum(['1K', '2K', '4K'])
    .default('2K')
    .describe('Resolution tier (1K, 2K, or 4K)'),
  label: z.string().optional()
    .describe('Optional title text to render prominently on the infographic'),
  output_path: z.string().optional()
    .describe('Optional file path to save the generated PNG and .vis.provenance.json sidecar')
});

async function generateInfographic(args: z.infer<typeof GenerateInfographicSchema>) {
  const genAI = getGenAI();
  const { topic, style, audience, aspect_ratio, image_size, label, output_path } = args;
  const sanitized = topic.replace(/[<>]/g, '').trim();

  // STEP 1: Research the topic with web grounding
  const research = await researchTopic(genAI, sanitized, audience, style);

  // STEP 2: Compose knowledge-rich prompt
  let prompt = composeInfographicPrompt(
    sanitized,
    research,
    style,
    audience,
    aspect_ratio
  );

  if (label) {
    prompt += `\n\nTITLE: Render "${label}" as a prominent title at the top of the infographic in a clean, modern font.`;
  }

  // STEP 3: Generate the image
  const imageModel = process.env.INFOGENIUS_MODEL || 'gemini-3-pro-image-preview';

  const response = await genAI.models.generateContent({
    model: imageModel,
    contents: prompt,
    config: {
      responseModalities: ['IMAGE', 'TEXT'],
      imageConfig: {
        aspectRatio: aspect_ratio,
        imageSize: image_size
      }
    }
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error('No response from model');

  for (const part of parts) {
    if ('inlineData' in part && part.inlineData?.data) {
      let savedPath: string | undefined;
      if (output_path) {
        savedPath = resolve(output_path);
        const dir = dirname(savedPath);
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
        writeFileSync(savedPath, Buffer.from(part.inlineData.data, 'base64'));
        writeFileSync(
          `${savedPath}.vis.provenance.json`,
          JSON.stringify(
            {
              schemaVersion: '5.2.0',
              generator: 'arcanea-infogenius-mcp',
              createdAt: new Date().toISOString(),
              topic: sanitized,
              style,
              audience,
              aspectRatio: aspect_ratio,
              imageSize: image_size,
              research,
              prompt,
            },
            null,
            2
          )
        );
      }

      return {
        success: true,
        savedPath,
        image: output_path ? undefined : part.inlineData.data,
        mimeType: part.inlineData.mimeType || 'image/png',
        research: {
          facts: research.facts,
          visualElements: research.visualElements,
          labels: research.labels,
          context: research.context,
          videoPrompt: research.videoPrompt,
          sources: research.sources
        },
        metadata: {
          model: imageModel,
          researchModel: process.env.INFOGENIUS_RESEARCH_MODEL || 'gemini-2.5-flash',
          style,
          audience,
          aspectRatio: aspect_ratio,
          imageSize: image_size,
          promptLength: prompt.length,
          timestamp: new Date().toISOString()
        },
        prompt
      };
    }
  }

  throw new Error('No image data in response');
}

const AnimateInfographicSchema = z.object({
  prompt: z.string()
    .min(10)
    .max(2000)
    .describe('Motion prompt (use videoPrompt from research_topic or generate_infographic)'),
  aspect_ratio: z.enum(['16:9', '9:16'])
    .default('16:9')
    .describe('Video aspect ratio (16:9 or 9:16)'),
  output_path: z.string()
    .describe('Absolute file path where the .mp4 video should be saved')
});

async function animateInfographic(args: z.infer<typeof AnimateInfographicSchema>) {
  const apiKey = resolveApiKey();
  if (!apiKey) throw new Error('GEMINI_API_KEY not found');
  const genAI = new GoogleGenAI({ apiKey });
  const veoModel = process.env.INFOGENIUS_VEO_MODEL || 'veo-3.1-fast-generate-preview';

  let operation = await genAI.models.generateVideos({
    model: veoModel,
    prompt: args.prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: args.aspect_ratio
    }
  });

  let polls = 0;
  while (!operation.done && polls < 45) {
    polls += 1;
    await new Promise(r => setTimeout(r, 8000));
    operation = await genAI.operations.getVideosOperation({ operation });
  }

  const downloadUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadUri) {
    throw new Error('Veo video generation completed without a download URI');
  }

  const sep = downloadUri.includes('?') ? '&' : '?';
  const res = await fetch(`${downloadUri}${sep}key=${apiKey}`);
  if (!res.ok) {
    throw new Error(`Failed to download Veo video: ${res.status}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const outPath = resolve(args.output_path);
  const dir = dirname(outPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(outPath, buf);

  return {
    success: true,
    path: outPath,
    model: veoModel,
    bytes: buf.length,
    mimeType: 'video/mp4'
  };
}

const NarrateInfographicSchema = z.object({
  facts: z.array(z.string()).min(1).describe('Array of researched facts to narrate'),
  voice_name: z.string().default('Kore').describe('Gemini TTS voice name (default: Kore)'),
  output_path: z.string().describe('Absolute file path where the .wav narration should be saved')
});

async function narrateInfographic(args: z.infer<typeof NarrateInfographicSchema>) {
  const genAI = getGenAI();
  const ttsModel = process.env.INFOGENIUS_TTS_MODEL || 'gemini-2.5-flash-preview-tts';
  const textToNarrate = `Read the following facts clearly and professionally: ${args.facts.join('. ')}`;

  const response = await genAI.models.generateContent({
    model: ttsModel,
    contents: [{ parts: [{ text: textToNarrate }] }],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: args.voice_name }
        }
      }
    }
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error('No audio data returned from Gemini TTS');
  }

  const rawBuf = Buffer.from(base64Audio, 'base64');
  const wavBuf = wrapPcmInWavHeader(rawBuf, 24000, 1, 16);
  const outPath = resolve(args.output_path);
  const dir = dirname(outPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(outPath, wavBuf);

  return {
    success: true,
    path: outPath,
    model: ttsModel,
    voiceName: args.voice_name,
    bytes: wavBuf.length,
    mimeType: 'audio/wav'
  };
}

const GenerateVisualSchema = z.object({
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must not exceed 2000 characters')
    .describe('Direct visual description — use generate_infographic for knowledge-based visuals'),
  style: z.enum(['standard', 'minimalist', 'photorealistic', '3d', 'technical', 'futuristic', 'vintage', 'cartoon', 'glassmorphic', 'premium'])
    .default('glassmorphic')
    .describe('Visual style preset'),
  label: z.string().optional()
    .describe('Optional text to render on the image')
});

async function generateVisual(args: z.infer<typeof GenerateVisualSchema>) {
  const genAI = getGenAI();
  const { description, style: styleName, label } = args;
  const sanitized = description.replace(/[<>]/g, '').trim();
  const style = STYLES[styleName] || STYLES['glassmorphic'];

  let prompt = `Create a high-quality visual: ${sanitized}\n\nVISUAL STYLE: ${style.instruction}\n\nRender at maximum quality. Sharp detail, no artifacts. All text must be perfectly legible.`;

  if (label) {
    prompt += `\n\nRender the text "${label}" prominently in a clean, modern font.`;
  }

  const model = process.env.INFOGENIUS_MODEL || 'gemini-3-pro-image-preview';

  const response = await genAI.models.generateContent({
    model,
    contents: prompt,
    config: { responseModalities: ['IMAGE', 'TEXT'] }
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

const ResearchTopicSchema = z.object({
  topic: z.string()
    .min(3)
    .max(500)
    .describe('Topic to research with web grounding'),
  audience: z.enum(['elementary', 'highschool', 'college', 'expert'])
    .default('college')
    .describe('Target audience for information density'),
  style: z.enum(['standard', 'minimalist', 'photorealistic', '3d', 'technical', 'futuristic', 'vintage', 'cartoon', 'glassmorphic', 'premium'])
    .default('glassmorphic')
    .describe('Visual style for video prompt synthesis')
});

// ============================================================================
// REGISTER TOOLS
// ============================================================================

server.setRequestHandler(ListToolsRequestSchema, () => ({
  tools: [
    {
      name: 'generate_infographic',
      description: 'RECOMMENDED: Research-first infographic generation. Researches the topic using Google Search grounding, extracts key facts + video prompt, then generates a 2K/4K educational infographic.',
      inputSchema: {
        type: 'object',
        properties: {
          topic: {
            type: 'string',
            description: 'What to research and visualize (e.g., "how blockchain works", "quantum entanglement", "Sovereign AI Swarm Architecture")'
          },
          style: {
            type: 'string',
            description: 'Visual style preset',
            enum: Object.keys(STYLES),
            default: 'glassmorphic'
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
          image_size: {
            type: 'string',
            description: 'Image resolution tier',
            enum: ['1K', '2K', '4K'],
            default: '2K'
          },
          label: {
            type: 'string',
            description: 'Optional title text for the infographic'
          },
          output_path: {
            type: 'string',
            description: 'Optional absolute path to write PNG + .vis.provenance.json sidecar'
          }
        },
        required: ['topic']
      }
    },
    {
      name: 'animate_infographic',
      description: 'Generate a 7-second 720p motion video (.mp4) from an infographic motion prompt using Veo 3.1 (veo-3.1-fast-generate-preview).',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            description: 'Motion prompt (use videoPrompt from research_topic or generate_infographic)'
          },
          aspect_ratio: {
            type: 'string',
            enum: ['16:9', '9:16'],
            default: '16:9'
          },
          output_path: {
            type: 'string',
            description: 'Absolute path where the .mp4 file will be written'
          }
        },
        required: ['prompt', 'output_path']
      }
    },
    {
      name: 'narrate_infographic',
      description: 'Generate spoken audio narration (.wav) of extracted infographic facts using Gemini 2.5 Flash TTS (Kore voice).',
      inputSchema: {
        type: 'object',
        properties: {
          facts: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of facts to narrate'
          },
          voice_name: {
            type: 'string',
            default: 'Kore',
            description: 'Prebuilt voice name (default: Kore)'
          },
          output_path: {
            type: 'string',
            description: 'Absolute path where the .wav file will be written'
          }
        },
        required: ['facts', 'output_path']
      }
    },
    {
      name: 'generate_visual',
      description: 'Direct visual generation without research. Use for artistic/decorative images where factual accuracy is not the goal.',
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
            default: 'glassmorphic'
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
      description: 'Research a topic using Google Search grounding without generating an image. Returns structured facts, visual element suggestions, video prompt, and source citations.',
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
          },
          style: {
            type: 'string',
            description: 'Visual style for video prompt synthesis',
            enum: Object.keys(STYLES),
            default: 'glassmorphic'
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
      case 'animate_infographic': {
        const result = await animateInfographic(AnimateInfographicSchema.parse(args));
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'narrate_infographic': {
        const result = await narrateInfographic(NarrateInfographicSchema.parse(args));
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'generate_visual': {
        const result = await generateVisual(GenerateVisualSchema.parse(args));
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'research_topic': {
        const parsed = ResearchTopicSchema.parse(args);
        const genAI = getGenAI();
        const result = await researchTopic(genAI, parsed.topic, parsed.audience, parsed.style);
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
  console.error('InfoGenius v5.2 — Knowledge-First Visual Intelligence + Veo 3.1 + Gemini TTS');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
