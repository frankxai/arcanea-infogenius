#!/usr/bin/env node
/**
 * InfoGenius v5 Knowledge-First Showcase
 *
 * Demonstrates the fundamental difference:
 * v4 = "make pretty picture" (decoration engine)
 * v5 = "research topic → extract facts → visualize knowledge" (knowledge engine)
 *
 * Each image is GROUNDED in real research via Google Search.
 */

const { GoogleGenAI } = require('../mcp-server/node_modules/@google/genai');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) { console.error('Set GEMINI_API_KEY'); process.exit(1); }

const genAI = new GoogleGenAI({ apiKey: API_KEY });

// ── Style definitions (presentation layer) ──────────────────────────
const STYLES = {
  'standard': 'High-quality digital scientific illustration. Clean, modern, highly detailed. Professional color palette. Clear visual hierarchy with labeled components.',
  'minimalist': 'Bauhaus Minimalist. Flat vector art, limited color palette (2-3 colors), negative space, simple geometric shapes. Information through spatial relationships.',
  '3d': '3D Isometric Render. Claymorphism or high-gloss plastic texture, studio lighting, soft shadows. Components clearly separated and labeled.',
  'technical': 'Da Vinci Notebook style. Ink on parchment sketch, handwritten annotations, technical precision. Dense labels and cross-references.',
  'futuristic': 'Cyberpunk HUD. Glowing neon blue/cyan lines on dark background, holographic data visualization, 3D wireframes with data panels.',
};

const AUDIENCES = {
  'elementary': 'Target: Ages 6-10. Bright, simple, fun. Large clear icons and minimal text. Maximum 3-4 visual elements.',
  'highschool': 'Target: High School. Standard textbook style. Clean lines, clear labels, accurate diagrams. 5-8 elements.',
  'college': 'Target: University. Academic journal style. High detail, data-rich, precise schematics with statistics.',
  'expert': 'Target: Industry Expert. Technical blueprint. Extremely dense, precise annotations, maximum information per pixel.',
};

// ── STEP 1: Research with Google Search Grounding ───────────────────
async function researchTopic(topic, audience) {
  console.log(`  [RESEARCH] Querying Gemini 2.5 Flash with Google Search grounding...`);

  const prompt = `You are a visual knowledge architect. Research this topic thoroughly and extract the essential knowledge needed to create an educational infographic.

TOPIC: "${topic}"
AUDIENCE: ${audience}

Respond in EXACTLY this structured format:

FACTS:
1. [Most important fact with specific numbers/data]
2. [Second key fact]
3. [Third key fact]
4. [Fourth key fact]
5. [Fifth key fact]

VISUAL_ELEMENTS:
1. [Primary diagram/visualization to include]
2. [Secondary visual element]
3. [Supporting visual element]

LABELS:
1. [Key term that MUST appear]
2. [Second critical label]
3. [Third label]
4. [Fourth label]

CONTEXT:
[One paragraph on why this matters and what viewer should learn]

Be precise. Use current 2026 data. Every fact should be visualizable.`;

  const response = await genAI.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] }
  });

  const text = response.text || '';

  // Parse sections
  const facts = extractSection(text, 'FACTS');
  const visuals = extractSection(text, 'VISUAL_ELEMENTS');
  const labels = extractSection(text, 'LABELS');
  const ctxMatch = text.match(/CONTEXT:\s*\n([\s\S]*?)(?:\n\n|$)/);
  const context = ctxMatch ? ctxMatch[1].trim() : topic;

  // Get grounding sources
  const sources = [];
  if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
    for (const chunk of response.candidates[0].groundingMetadata.groundingChunks) {
      if (chunk.web?.uri) sources.push(chunk.web.uri);
    }
  }

  console.log(`  [RESEARCH] Found ${facts.length} facts, ${visuals.length} visual elements, ${labels.length} labels, ${sources.length} sources`);
  return { facts, visuals, labels, context, sources };
}

function extractSection(text, name) {
  const regex = new RegExp(`${name}:\\s*\\n([\\s\\S]*?)(?=\\n[A-Z_]+:|$)`);
  const match = text.match(regex);
  if (!match) return [];
  return match[1]
    .split('\n')
    .map(l => l.replace(/^\d+\.\s*/, '').replace(/^\[|\]$/g, '').trim())
    .filter(l => l.length > 0 && !l.startsWith('['));
}

// ── STEP 2: Compose knowledge-rich prompt ───────────────────────────
function composePrompt(topic, research, style, audience) {
  const factsBlock = research.facts.map(f => `- ${f}`).join('\n');
  const visualBlock = research.visuals.map(v => `- ${v}`).join('\n');
  const labelsBlock = research.labels.map(l => `"${l}"`).join(', ');

  return `Create a 16:9 educational infographic about: ${topic}

VISUAL STYLE: ${style}

AUDIENCE: ${audience}

KNOWLEDGE TO VISUALIZE (researched facts — each must be represented visually):
${factsBlock}

VISUAL ELEMENTS TO INCLUDE:
${visualBlock}

REQUIRED LABELS AND TEXT (render clearly and legibly):
${labelsBlock}

COMPOSITION:
- Clear visual hierarchy — most important information largest
- Logical flow — viewer's eye follows information in order
- All text perfectly spelled, large enough to read, high contrast
- Directional arrows or flow indicators where relationships exist
- Professional color coding for different information categories

QUALITY: Maximum quality. Sharp detail, no artifacts. Every label perfectly legible. This is an educational tool — clarity and accuracy above all.`;
}

// ── STEP 3: Generate image ──────────────────────────────────────────
async function generateImage(prompt) {
  console.log(`  [GENERATE] Calling Gemini 3 Pro image generation...`);
  const response = await genAI.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: prompt,
    config: { responseModalities: ['IMAGE', 'TEXT'] }
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error('No response');
  for (const part of parts) {
    if (part.inlineData) {
      return Buffer.from(part.inlineData.data, 'base64');
    }
  }
  throw new Error('No image in response');
}

// ── Main ────────────────────────────────────────────────────────────
async function main() {
  const outputDir = '/home/frankx/repos/arcanea-infogenius/examples';

  const showcases = [
    {
      name: 'v5-knowledge-quantum-computing',
      topic: 'How quantum computing works and why it matters in 2026',
      style: 'futuristic',
      audience: 'college'
    },
    {
      name: 'v5-knowledge-human-heart',
      topic: 'The human cardiovascular system and how the heart pumps blood',
      style: 'standard',
      audience: 'highschool'
    },
    {
      name: 'v5-knowledge-ai-transformer',
      topic: 'How transformer architecture powers modern AI large language models',
      style: '3d',
      audience: 'expert'
    },
    {
      name: 'v5-knowledge-photosynthesis',
      topic: 'How photosynthesis converts sunlight into energy in plants',
      style: 'technical',
      audience: 'college'
    },
    {
      name: 'v5-knowledge-blockchain',
      topic: 'How blockchain technology and distributed ledgers work',
      style: 'minimalist',
      audience: 'college'
    }
  ];

  console.log(`\nInfoGenius v5 — Knowledge-First Showcase`);
  console.log(`Pipeline: RESEARCH (Gemini 2.5 Flash + Google Search) → COMPOSE → GENERATE (Gemini 3 Pro)`);
  console.log(`Generating ${showcases.length} knowledge infographics...\n`);

  const results = [];

  for (const s of showcases) {
    console.log(`\n━━━ ${s.name} ━━━`);
    console.log(`  Topic: ${s.topic}`);
    console.log(`  Style: ${s.style} | Audience: ${s.audience}`);

    try {
      // Step 1: Research
      const research = await researchTopic(s.topic, AUDIENCES[s.audience]);
      console.log(`  [FACTS] ${research.facts.slice(0, 2).join(' | ')}...`);

      // Step 2: Compose
      const prompt = composePrompt(s.topic, research, STYLES[s.style], AUDIENCES[s.audience]);
      console.log(`  [PROMPT] ${prompt.length} chars, knowledge-rich`);

      // Step 3: Generate
      const buffer = await generateImage(prompt);
      const outPath = path.join(outputDir, `${s.name}.png`);
      fs.writeFileSync(outPath, buffer);
      console.log(`  [SAVED] ${outPath} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);

      // Save metadata
      const meta = {
        topic: s.topic, style: s.style, audience: s.audience,
        research: { facts: research.facts, visuals: research.visuals, labels: research.labels, sources: research.sources },
        promptLength: prompt.length, imageSize: buffer.length,
        timestamp: new Date().toISOString()
      };
      fs.writeFileSync(path.join(outputDir, `${s.name}.meta.json`), JSON.stringify(meta, null, 2));

      results.push({ ...s, success: true, size: buffer.length, factsCount: research.facts.length });
    } catch (err) {
      console.error(`  [FAIL] ${err.message}`);
      results.push({ ...s, success: false, error: err.message });
    }
  }

  console.log(`\n\n━━━ RESULTS ━━━`);
  for (const r of results) {
    const status = r.success ? `OK (${(r.size / 1024 / 1024).toFixed(2)} MB, ${r.factsCount} facts)` : `FAIL: ${r.error}`;
    console.log(`  ${r.name}: ${status}`);
  }
  console.log('\nDone.\n');
}

main();
