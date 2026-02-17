# Arcanea InfoGenius — Visual Intelligence MCP Server

**Research-grounded infographics and visualizations, delivered as MCP tools.**

Arcanea InfoGenius is a Model Context Protocol (MCP) server that generates rich infographics and visual content using Google Gemini 3 Pro. It combines real-time research grounding with image generation to produce accurate, publication-ready visuals directly from your AI coding environment.

## Features

- **Research-backed visuals** — Gemini grounding pulls live data before generating images
- **Multiple output styles** — Infographics, diagrams, charts, concept art, and more
- **MCP-native** — Works with any MCP-compatible client out of the box
- **Zero config** — Single `npx` command, no build step required

## Tools

| Tool | Description |
|------|-------------|
| `research_topic` | Research a topic using Gemini grounding and return structured findings |
| `generate_infographic` | Generate a research-grounded infographic on any topic |
| `generate_visual` | Generate a styled visual or diagram from a text prompt |
| `get_styles` | List all available visual styles and their descriptions |

## Quick Start

### 1. Set your API key

```bash
export GEMINI_API_KEY="your-google-ai-api-key"
```

### 2. Add to your MCP client

**Claude Code** (`~/.claude/settings.json` or project `.mcp.json`):

```json
{
  "mcpServers": {
    "arcanea-infogenius": {
      "command": "npx",
      "args": ["arcanea-infogenius"]
    }
  }
}
```

**Cursor / Windsurf** — add the same config to your MCP settings file.

### 3. Use it

Ask your AI assistant to:

> "Research quantum computing breakthroughs in 2026 and generate an infographic"

> "Generate a visual diagram of a microservices architecture"

> "Show me available infographic styles"

## Usage Examples

### Research a topic

```
Tool: research_topic
Input: { "topic": "renewable energy adoption rates by country" }
```

Returns structured research findings with sources, ready to feed into visualization.

### Generate an infographic

```
Tool: generate_infographic
Input: {
  "topic": "AI model scaling laws",
  "style": "modern-dark"
}
```

Generates a complete infographic image grounded in current research.

### Generate a visual

```
Tool: generate_visual
Input: {
  "prompt": "System architecture diagram for a real-time multiplayer game",
  "style": "technical-blueprint"
}
```

Generates a styled visual from a descriptive prompt.

## Requirements

- Node.js 18+
- Google AI API key with Gemini 3 Pro access (`GEMINI_API_KEY`)

## How It Works

1. **Research** — Gemini grounding searches the web for current, relevant data
2. **Synthesize** — Findings are structured into a visual layout plan
3. **Generate** — Gemini 3 Pro image generation creates the final visual
4. **Deliver** — The image is returned as a base64-encoded result via MCP

## Part of the Arcanea Ecosystem

Arcanea InfoGenius is one module in the [Arcanea](https://github.com/frankxai/Arcanea) platform — a creative intelligence ecosystem for AI-human co-creation.

| Package | Description |
|---------|-------------|
| `@arcanea/core` | Intelligence engine — Guardian routing, voice, design tokens |
| `@arcanea/cli` | Install Arcanea OS into any AI coding tool |
| `@arcanea/mcp` | Core MCP server for the Arcanea platform |
| `arcanea-infogenius` | Visual intelligence MCP server (this package) |

## License

MIT
