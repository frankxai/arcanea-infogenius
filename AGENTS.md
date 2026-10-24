# Arcanea InfoGenius v5.2 — Agent Instructions

Canonical Model Context Protocol (MCP) Server & Web Interface for InfoGenius v5.2 (`frankxai/arcanea-infogenius`).

## Scope & Architecture
- **MCP Server**: `mcp-server/src/index.ts` (compiled to `mcp-server/dist/index.js`).
- **Tools Exposed**: `generate_infographic`, `animate_infographic` (Veo 3.1), `narrate_infographic` (Gemini 2.5 Flash TTS `Kore`), `generate_visual`, `research_topic`, `get_styles`.
- **Credential Resolution**: Resolves `GEMINI_API_KEY` from environment, `C:/Users/frank/.starlight/.env`, or Infisical CLI (`6e39a7d9-be07-4f58-babb-0cf650321feb`). Never hardcode keys in source.

## Verification
- Run `npm run build` and `npm run typecheck` inside `mcp-server/` before pushing or opening a draft PR.
