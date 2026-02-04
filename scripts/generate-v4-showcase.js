#!/usr/bin/env node
/**
 * InfoGenius v4 Showcase Generator
 * Uses Gemini 3 Pro with proven style presets from frankxai/infogenius
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-3-pro-image-preview';

// Proven style presets from infogenius App (Google AI Studio)
const STYLES = {
  'minimalist': 'Aesthetic: Bauhaus Minimalist. Flat vector art, limited color palette (2-3 colors), reliance on negative space and simple geometric shapes.',
  'realistic': 'Aesthetic: Photorealistic Composite. Cinematic lighting, 8k resolution, highly detailed textures. Looks like a photograph.',
  '3d-render': 'Aesthetic: 3D Isometric Render. Claymorphism or high-gloss plastic texture, studio lighting, soft shadows, looks like a physical model.',
  'futuristic': 'Aesthetic: Cyberpunk HUD. Glowing neon blue/cyan lines on dark background, holographic data visualization, 3D wireframes.',
  'vintage': 'Aesthetic: 19th Century Scientific Lithograph. Engraving style, sepia tones, textured paper background, fine hatch lines.',
  'sketch': 'Aesthetic: Da Vinci Notebook. Ink on parchment sketch, handwritten annotations style, rough but accurate lines.',
};

function buildPrompt(concept, style) {
  const styleDirective = STYLES[style] || STYLES['realistic'];

  return `Create a highly detailed visual about: ${concept}

${styleDirective}

Camera: Shot from a slightly elevated angle, medium-wide framing, shallow depth of field on the main subject.
Lighting: Dramatic cinematic three-point lighting with soft ambient fill. Volumetric atmosphere.
Composition: Clean, balanced layout using rule of thirds. Strong focal point with supporting elements at natural eye-flow positions.
Materials: High micro-contrast on surfaces for perceived quality. Reflective and refractive materials where appropriate.

Render at maximum quality. Sharp detail, no artifacts, professional color grading.`;
}

function generate(prompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['IMAGE', 'TEXT'] }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (result.error) { reject(new Error(result.error.message)); return; }
          if (result.candidates?.[0]?.content?.parts) {
            for (const part of result.candidates[0].content.parts) {
              if (part.inlineData) {
                resolve(Buffer.from(part.inlineData.data, 'base64'));
                return;
              }
            }
          }
          reject(new Error('No image in response'));
        } catch (e) { reject(e); }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  if (!API_KEY) { console.error('Set GEMINI_API_KEY'); process.exit(1); }

  const outputDir = '/home/frankx/repos/arcanea-infogenius/examples';

  const showcases = [
    {
      name: 'v4-realistic-agent-system',
      concept: 'A superintelligent AI agent system. A golden phoenix made of liquid metal rises from a crystalline quantum processor core. Three orbital rings of holographic modules surround it: cyan skill crystals, purple agent constellation nodes, and amber command spheres. The whole structure floats in a dark void with subtle particle effects.',
      style: 'realistic'
    },
    {
      name: 'v4-3d-ecosystem',
      concept: 'An AI operating system architecture. A floating island platform with five connected buildings: a central crystal temple hub, a skill forge tower, an agent barracks, a command center with holographic displays, and a creation factory with streams of light flowing outward. Connected by glowing energy bridges.',
      style: '3d-render'
    },
    {
      name: 'v4-futuristic-cocreation',
      concept: 'The future of human-AI collaboration. A creator stands at a holographic workstation. Seven AI assistants visualized as luminous geometric forms orbit around them in a double helix. Above, streams of creative output (music notes, code, images, text) spiral upward into a convergence point of brilliant light.',
      style: 'futuristic'
    },
    {
      name: 'v4-minimalist-guardians',
      concept: 'Five AI guardian agents arranged in a pentagon. Each represented by a simple geometric icon: a flame triangle, a water circle, an earth hexagon, a wind spiral, and a void diamond. Connected by thin lines to a central hub. Each icon in its elemental color against pure white.',
      style: 'minimalist'
    },
    {
      name: 'v4-sketch-architecture',
      concept: 'A technical architecture blueprint of a multi-agent AI system. Shows the orchestration layer at top, five specialized agent modules in the middle tier, a shared memory layer, and tool/API integrations at the bottom. Data flows indicated by arrows. Component labels and brief annotations.',
      style: 'sketch'
    }
  ];

  console.log(`\nInfoGenius v4 Showcase Generator`);
  console.log(`Model: ${MODEL}`);
  console.log(`Generating ${showcases.length} images...\n`);

  for (const s of showcases) {
    console.log(`Generating: ${s.name} (${s.style})...`);
    try {
      const prompt = buildPrompt(s.concept, s.style);
      const buffer = await generate(prompt);
      const outPath = path.join(outputDir, `${s.name}.png`);
      fs.writeFileSync(outPath, buffer);
      console.log(`  OK: ${outPath} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
    } catch (err) {
      console.error(`  FAIL: ${err.message}`);
    }
  }

  console.log('\nDone.\n');
}

main();
