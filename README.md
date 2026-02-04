# InfoGenius

<div align="center">

**AI visual generation that doesn't suck.**

Generate technical diagrams, architecture visuals, and content graphics with **Gemini 3 Pro** - Google's most capable image model.

```
prompt → intelligence layer → gemini 3 pro → visual
```

[![MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)]()
[![Gemini 3 Pro](https://img.shields.io/badge/Gemini_3-Pro-4285F4.svg?style=flat-square)]()
[![MCP](https://img.shields.io/badge/MCP-ready-green.svg?style=flat-square)]()

</div>

---

## The Problem

AI image generators produce garbage for technical content:
- Generic "AI art" aesthetic
- Unreadable text
- Inconsistent quality
- No understanding of technical concepts

## The Solution

InfoGenius adds an intelligence layer between you and Gemini:

```
Your request
    ↓
Guardian routing (picks the right style)
    ↓
Prompt enhancement (adds technical precision)
    ↓
Gemini API
    ↓
Actually useful visual
```

---

## Quick Start

```bash
# 1. Get a Gemini API key (free tier includes Gemini 3 Pro)
# https://aistudio.google.com/apikey

# 2. Add to Claude Code (~/.claude/mcp.json)
{
  "mcpServers": {
    "nano-banana": {
      "command": "npx",
      "args": ["@bigcookie/mcp-nano-banana-image"],
      "env": {
        "GEMINI_API_KEY": "your-key",
        "MODEL": "gemini-3-pro-image"
      }
    }
  }
}

# 3. Use it
/infogenius "microservices architecture diagram"
```

### Why Gemini 3 Pro?

- **Best text rendering** of any image model
- **4K native resolution**
- **Understands technical concepts** (finally)
- **$0.04/image** (or free tier)

---

## The 5 Guardians

Different visual styles for different needs:

| Guardian | Use Case | Style |
|----------|----------|-------|
| `@dragon-forge` | Transformation, change, bold moves | Fire, dramatic |
| `@crystal-architect` | Technical diagrams, system design | Precise, clean |
| `@ocean-memory` | Data viz, analytics, insights | Flowing, intuitive |
| `@void-gazer` | Innovation, R&D, future concepts | Cosmic, mysterious |
| `@vision-artist` | Presentations, polished content | Refined, premium |

```bash
# Auto-select (recommended)
/infogenius "data pipeline architecture"

# Force a specific style
/infogenius "digital transformation roadmap" --guardian @dragon-forge
```

---

## What It's Good At

✓ Architecture diagrams
✓ System design visuals
✓ Technical documentation graphics
✓ Presentation slides
✓ Infographics
✓ Concept visualizations

## What It's Not For

✗ Photorealistic images
✗ Character art
✗ Complex scenes with people
✗ Marketing photography

---

## Example Gallery

### V3: Imagen 4 Ultra (Best Quality)

<div align="center">

| FrankX Superintelligent System | Arcanea Intelligence OS |
|:---:|:---:|
| ![FrankX System v3](examples/v3-frankx-system.png) | ![Arcanea Ecosystem v3](examples/v3-arcanea-ecosystem.png) |
| *Imagen 4 Ultra • 8K Hyper-Detailed* | *Imagen 4 Ultra • Isometric* |

| Golden Age of Co-Creation | |
|:---:|:---:|
| ![Golden Age v3](examples/v3-golden-age.png) | |
| *Imagen 4 Ultra • Cinematic* | |

</div>

### Version Comparison

| Version | Model | Prompt Style | Quality | Cost |
|---------|-------|--------------|---------|------|
| V1 | gemini-2.5-flash-image | Raw basic | Low | $0.02 |
| V2 | gemini-2.5-flash-image | 6-layer verbose | Medium | $0.02 |
| **V3** | **imagen-4.0-ultra** | **Simple, specific** | **HIGH** | $0.06 |

### What Makes V3 Better

| Aspect | V1/V2 | V3 |
|--------|-------|-----|
| **Model** | Gemini Flash (fast/cheap) | Imagen 4 Ultra (best quality) |
| **Prompts** | Abstract ("transcendent", "consciousness") | Concrete ("3D render", "isometric", "8K") |
| **Style** | Verbose 6-layer | Short, specific art direction |
| **Output** | Generic AI art | Professional concept art |

### Earlier Versions (for reference)

<details>
<summary>V2: Guardian-Enhanced</summary>

| FrankX System | Arcanea Ecosystem |
|:---:|:---:|
| ![v2](examples/v2-frankx-system.png) | ![v2](examples/v2-arcanea-ecosystem.png) |

</details>

<details>
<summary>V1: Basic Generation</summary>

| Starlight Orchestrator | Guardian Council |
|:---:|:---:|
| ![v1](examples/starlight-orchestrator.png) | ![v1](examples/guardian-council.png) |

</details>

---

## Usage Examples

### Technical Architecture
```bash
/infogenius "Kubernetes cluster with ingress controller, service mesh, and distributed tracing"
```

### Data Flow
```bash
/infogenius "ETL pipeline from raw data sources through transformation to data warehouse" --guardian @ocean-memory
```

### Strategic Visual
```bash
/infogenius "AI adoption maturity model with 5 stages" --guardian @vision-artist
```

---

## Advanced Usage

### Styles

```bash
--style transcendent   # Premium, polished
--style technical      # Clean, diagrammatic
--style minimalist     # Simple, focused
--style futuristic     # Sci-fi tech aesthetic
```

### Aspect Ratios

```bash
--aspect 16:9    # Presentations, headers
--aspect 1:1     # Social, icons
--aspect 9:16    # Mobile, stories
```

### Quality Levels

```bash
--quality high      # 4K output
--quality standard  # 1080p (default)
```

---

## How It Works

1. **Parse intent** - Understands what you're trying to visualize
2. **Route to Guardian** - Picks the right visual style
3. **Enhance prompt** - Adds technical precision, color theory, composition
4. **Generate** - Calls Gemini with optimized prompt
5. **Validate** - Checks output quality

The intelligence layer is the difference between "make me a diagram" and a prompt that actually produces something usable.

---

## Project Structure

```
infogenius/
├── mcp-server/      # MCP server for Claude Code
├── skills/          # Skill definitions
├── prompts/         # Ready-to-use prompt templates
├── cli-tools/       # Testing utilities
└── docs/            # Documentation
```

---

## Configuration

### Model Options

| Model | Cost | Best For |
|-------|------|----------|
| `gemini-3-pro-image` | $0.04 | Best quality, text rendering |
| `gemini-2.5-flash-image` | $0.02 | Fast iterations |
| `imagen-4-ultra` | $0.06 | Maximum photorealism |

### MCP Config

```json
{
  "mcpServers": {
    "nano-banana": {
      "command": "npx",
      "args": ["@bigcookie/mcp-nano-banana-image"],
      "env": {
        "GEMINI_API_KEY": "your-key",
        "MODEL": "gemini-3-pro-image",
        "DEFAULT_RESOLUTION": "high"
      }
    }
  }
}
```

### Environment Variables

```bash
GEMINI_API_KEY=xxx              # Required
INFOGENIUS_MODEL=gemini-3-pro   # Optional, default: gemini-3-pro
INFOGENIUS_QUALITY=high         # Optional: high, standard
```

---

## Contributing

Found something that works well? Share it.

1. Test your prompt 3+ times for consistency
2. Document what it's good for
3. PR to `/prompts/community/`

We value practical over clever.

---

## Limitations

- Requires Gemini API key (free tier available)
- Text rendering still imperfect (AI limitation)
- Some complex diagrams need iteration
- Quality depends on prompt clarity

---

## Related Projects

- [Agentic Creator OS](https://github.com/frankxai/agentic-creator-os) - Full creative operating system
- [Arcanea Intelligence OS](https://github.com/frankxai/arcanea-intelligence-os) - Agent orchestration with mythology

---

## License

MIT - Do whatever you want with it.

---

<div align="center">

**InfoGenius**

*Visual generation that actually works.*

---

<sub>
This is a personal/community project by <a href="https://github.com/frankxai">@frankxai</a>.<br>
Views and opinions are my own. Not affiliated with any employer.<br>
Built with Gemini API via <a href="https://github.com/bigcookie/mcp-nano-banana-image">Nano Banana MCP</a>.
</sub>

</div>
