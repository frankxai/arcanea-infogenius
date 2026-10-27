# InfoGenius MCP server: agent instructions

This repository is the MCP server component of InfoGenius (`product_infogenius` in the agentic-ops registry). The product home is `frankxai/infogenius`; changes to styles, brand packs or the app belong there.

## Rules
- Not on npm (checked 2026-10-26: `npm view arcanea-infogenius` is 404). Document the from-source install; do not claim `npx` until a release is published, which is Frank's call.
- `GEMINI_API_KEY` comes from the caller's environment only. Never commit a key, a key-bearing config, or a test script with a key in it. A Google API key leaked into this public repo's history in commit `ec29c3a28` (secret-scanning alert #1).
- Branch `agent/<harness>/<scope>`, draft PR, review by a different harness before merge.

## Verification
- Run the MCP server's build and typecheck before opening a PR.
