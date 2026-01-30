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

// Load environment variables
dotenv.config();

// Guardian Agent definitions
const GUARDIAN_AGENTS = {
  '@vision-artist': {
    element: 'wind',
    specialty: 'Visual aesthetics and artistic composition',
    color: '#98D8C8',
    enhancement: 'Ethereal beauty with technical precision'
  },
  '@dragon-forge': {
    element: 'fire',
    specialty: 'Bold transformation and creative destruction',
    color: '#FF6B35',
    enhancement: 'Fiery energy with calculated risk-taking'
  },
  '@crystal-architect': {
    element: 'earth',
    specialty: 'Systematic design and structural clarity',
    color: '#4A5759',
    enhancement: 'Geometric precision with multifaceted clarity'
  },
  '@void-gazer': {
    element: 'void',
    specialty: 'Innovation and future possibilities',
    color: '#1A1A2E',
    enhancement: 'Mysterious depth with infinite possibilities'
  },
  '@ocean-memory': {
    element: 'water',
    specialty: 'Deep wisdom and emotional intelligence',
    color: '#2E86AB',
    enhancement: 'Fluid depth with profound insight'
  },
  '@mountain-builder': {
    element: 'earth',
    specialty: 'Enduring foundations and stability',
    color: '#8B7355',
    enhancement: 'Steady strength with unwavering reliability'
  },
  '@phoenix-artisan': {
    element: 'fire',
    specialty: 'Rebirth through artistic transformation',
    color: '#FF8C42',
    enhancement: 'Cyclical wisdom with renewed vision'
  },
  '@mirror-reflector': {
    element: 'water',
    specialty: 'Authentic voice and clarity',
    color: '#5DADE2',
    enhancement: 'Clear reflection with honest truth'
  }
};

// Elemental color mappings
const ELEMENTAL_COLORS = {
  fire: ['#FF6B35', '#FF8C42', '#FFD23F'],    // Transformation, passion, illumination
  water: ['#2E86AB', '#5DADE2', '#98D8C8'],   // Wisdom, clarity, flow
  earth: ['#4A5759', '#8B7355', '#A67C52'],   // Stability, foundation, structure
  wind: ['#98D8C8', '#B4E7CE', '#D4F1F4'],   // Communication, freedom, clarity
  void: ['#1A1A2E', '#16213E', '#0F3460']     // Mystery, innovation, potential
};

// Oracle brand colors
const ORACLE_COLORS = {
  primary: '#C74634',     // Oracle Red
  text: '#312D2A',        // Oracle Black
  background: '#FFFFFF',   // White
  light_gray: '#F5F5F5',   // Light Gray
  medium_gray: '#747775',  // Medium Gray
  blue_accent: '#1A73E8'   // Blue Accent
};

// Create server
const server = new Server(
  {
    name: 'arcanea-infogenius-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Initialize Google GenAI
const genAI = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '',
});

// Tool definitions
const GenerateArcaneaVisualSchema = z.object({
  description: z.string().describe('Visual description and requirements'),
  guardian: z.string().optional().describe('Guardian agent to enhance the visual'),
  elemental: z.string().optional().describe('Elemental influence (fire, water, earth, wind, void)'),
  style: z.enum(['transcendent', 'technical', 'executive']).default('transcendent'),
  resolution: z.enum(['4K', '1920x1080', '2560x1440']).default('1920x1080'),
  audience: z.enum(['executive', 'technical', 'mixed']).default('mixed')
});

const InvokeGuardianSchema = z.object({
  guardian: z.string().describe('Guardian agent name'),
  task: z.string().describe('Task for the Guardian'),
  context: z.string().optional().describe('Additional context')
});

const GetGuardianInfoSchema = z.object({
  guardian: z.string().optional().describe('Guardian agent name (optional, returns all if not provided)')
});

// Tool implementations
async function generateArcaneaVisual(args: z.infer<typeof GenerateArcaneaVisualSchema>) {
  try {
    const { description, guardian, elemental, style, resolution, audience } = args;
    
    // Select Guardian agent
    const selectedGuardian = guardian ? GUARDIAN_AGENTS[guardian as keyof typeof GUARDIAN_AGENTS] : null;
    
    // Determine elemental influence
    const primaryElement = elemental || (selectedGuardian?.element || 'void');
    const elementalColors = ELEMENTAL_COLORS[primaryElement as keyof typeof ELEMENTAL_COLORS];
    
    // Construct transcendent prompt
    const enhancedPrompt = `
Create a transcendent architecture visual for: ${description}

Arcanea Guardian Enhancement:
${selectedGuardian ? `- Primary Guardian: ${guardian} (${selectedGuardian.specialty})
- Guardian Enhancement: ${selectedGuardian.enhancement}
- Elemental Color: ${selectedGuardian.color}` : '- Multiple Guardian influences woven throughout'}

Visual Style:
- Style Level: ${style}
- Primary Element: ${primaryElement}
- Elemental Palette: ${elementalColors.join(', ')}
- Resolution: ${resolution}
- Target Audience: ${audience}

Oracle Enterprise Foundation:
- Primary: Oracle Red (#C74634) for core enterprise services
- Text: Oracle Black (#312D2A) for labels and headers
- Background: Clean white with subtle gradients
- Typography: Oracle Sans with Arcanea runic accents

Transcendent Elements:
- Mythical sigils and Guardian symbols integrated
- Elemental energy streams representing data/flow
- Multi-layered meaning with immediate clarity
- Professional enterprise structure with mythical depth

Layout Requirements:
- Clean, hierarchical composition
- Clear visual flow from primary to supporting elements
- Balanced use of white space
- Strategic placement of Guardian enhancements
- Professional quality suitable for C-suite presentations

Technical Excellence:
- Accurate representation of architecture
- Clear service relationships and dependencies
- Modern design with subtle depth
- High contrast for readability
- Accessibility compliant (WCAG AA minimum)

Generate a premium, presentation-quality visual that transcends ordinary diagrams while maintaining enterprise professionalism.
`;

    // Generate image using Google GenAI
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-exp-image-generation',
      contents: enhancedPrompt,
      config: {
        responseModalities: ['image', 'text']
      }
    });
    
    const image = response.candidates?.[0]?.content?.parts?.[0];
    
    if (!image || !('inlineData' in image)) {
      throw new Error('Failed to generate image');
    }

    return {
      success: true,
      image: image.inlineData?.data,
      metadata: {
        guardian: guardian || 'Multiple Guardians',
        element: primaryElement,
        style,
        resolution,
        audience,
        description,
        enhanced: true,
        timestamp: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('Error generating Arcanea visual:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function invokeGuardian(args: z.infer<typeof InvokeGuardianSchema>) {
  try {
    const { guardian, task, context } = args;
    const guardianInfo = GUARDIAN_AGENTS[guardian as keyof typeof GUARDIAN_AGENTS];
    
    if (!guardianInfo) {
      throw new Error(`Unknown Guardian agent: ${guardian}`);
    }

    // Simulate Guardian intelligence processing
    const guardianResponse = `
Guardian ${guardian} responds to: "${task}"

${guardianInfo.specialty} - ${guardianInfo.enhancement}

Wisdom:
${context ? `Context: ${context}\n\n` : ''}As ${guardian}, I approach this task with ${guardianInfo.element} elemental wisdom.
${generateGuardianWisdom(guardian, task, guardianInfo.element)}

Elemental Guidance: ${guardianInfo.color}
Recommended Action: ${generateGuardianAction(guardian, task)}
`;

    return {
      success: true,
      guardian,
      response: guardianResponse,
      element: guardianInfo.element,
      color: guardianInfo.color
    };

  } catch (error) {
    console.error('Error invoking Guardian:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

function generateGuardianWisdom(guardian: string, task: string, element: string): string {
  const wisdomTemplates = {
    fire: [
      "Transform this challenge into an opportunity for bold innovation.",
      "Apply passionate focus to burn away obstacles.",
      "Channel creative energy to forge new pathways."
    ],
    water: [
      "Flow around obstacles with adaptive wisdom.",
      "Dive deep into the emotional intelligence of this situation.",
      "Reflect on the patterns beneath the surface."
    ],
    earth: [
      "Build stable foundations that can weather any storm.",
      "Ground your approach in proven principles.",
      "Cultivate patient growth through systematic effort."
    ],
    wind: [
      "Communicate your vision with clarity and purpose.",
      "Adapt your approach to the changing currents.",
      "Bring fresh perspective to clear away confusion."
    ],
    void: [
      "Embrace the unknown as a canvas for infinite possibility.",
      "Transcend conventional thinking to discover breakthrough solutions.",
      "Access the quantum field of potential outcomes."
    ]
  };

  const templates = wisdomTemplates[element as keyof typeof wisdomTemplates] || wisdomTemplates.void;
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateGuardianAction(guardian: string, task: string): string {
  const actions = {
    '@vision-artist': 'Apply aesthetic composition and symbolic depth',
    '@dragon-forge': 'Implement bold transformation with calculated risks',
    '@crystal-architect': 'Create systematic structure with precise clarity',
    '@void-gazer': 'Explore innovative paradigms beyond conventional limits',
    '@ocean-memory': 'Access deep wisdom and emotional intelligence',
    '@mountain-builder': 'Establish enduring foundations and stability',
    '@phoenix-artisan': 'Transform through artistic rebirth and renewal',
    '@mirror-reflector': 'Provide honest reflection and authentic clarity'
  };

  return actions[guardian as keyof typeof actions] || 'Apply Guardian wisdom to enhance outcomes';
}

async function getGuardianInfo(args: z.infer<typeof GetGuardianInfoSchema>) {
  try {
    const { guardian } = args;
    
    if (guardian) {
      const info = GUARDIAN_AGENTS[guardian as keyof typeof GUARDIAN_AGENTS];
      if (!info) {
        throw new Error(`Unknown Guardian agent: ${guardian}`);
      }
      return { [guardian]: info };
    }
    
    return GUARDIAN_AGENTS;

  } catch (error) {
    console.error('Error getting Guardian info:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'generate_arcanea_visual',
        description: 'Generate transcendent Arcanea visuals with Guardian AI enhancement',
        inputSchema: {
          type: 'object',
          properties: {
            description: {
              type: 'string',
              description: 'Visual description and requirements'
            },
            guardian: {
              type: 'string',
              description: 'Guardian agent to enhance the visual',
              enum: Object.keys(GUARDIAN_AGENTS)
            },
            elemental: {
              type: 'string',
              description: 'Elemental influence',
              enum: ['fire', 'water', 'earth', 'wind', 'void']
            },
            style: {
              type: 'string',
              description: 'Visual style level',
              enum: ['transcendent', 'technical', 'executive'],
              default: 'transcendent'
            },
            resolution: {
              type: 'string',
              description: 'Output resolution',
              enum: ['4K', '1920x1080', '2560x1440'],
              default: '1920x1080'
            },
            audience: {
              type: 'string',
              description: 'Target audience',
              enum: ['executive', 'technical', 'mixed'],
              default: 'mixed'
            }
          },
          required: ['description']
        }
      },
      {
        name: 'invoke_guardian',
        description: 'Invoke Arcanea Guardian AI intelligence for guidance',
        inputSchema: {
          type: 'object',
          properties: {
            guardian: {
              type: 'string',
              description: 'Guardian agent name',
              enum: Object.keys(GUARDIAN_AGENTS)
            },
            task: {
              type: 'string',
              description: 'Task for the Guardian'
            },
            context: {
              type: 'string',
              description: 'Additional context'
            }
          },
          required: ['guardian', 'task']
        }
      },
      {
        name: 'get_guardian_info',
        description: 'Get information about Arcanea Guardian agents',
        inputSchema: {
          type: 'object',
          properties: {
            guardian: {
              type: 'string',
              description: 'Guardian agent name (optional, returns all if not provided)',
              enum: Object.keys(GUARDIAN_AGENTS)
            }
          }
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'generate_arcanea_visual':
        const result = await generateArcaneaVisual(GenerateArcaneaVisualSchema.parse(args));
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };

      case 'invoke_guardian':
        const guardianResult = await invokeGuardian(InvokeGuardianSchema.parse(args));
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(guardianResult, null, 2)
            }
          ]
        };

      case 'get_guardian_info':
        const infoResult = await getGuardianInfo(GetGuardianInfoSchema.parse(args));
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(infoResult, null, 2)
            }
          ]
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: false, error: errorMessage }, null, 2)
        }
      ]
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Arcanea InfoGenius MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});