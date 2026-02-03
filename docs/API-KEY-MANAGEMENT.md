# Gemini API Key Management

## Quick Setup

```bash
# Set your API key (add to ~/.bashrc or ~/.zshrc for persistence)
export GEMINI_API_KEY="your-key-here"

# Test it works
curl -s "https://generativelanguage.googleapis.com/v1/models?key=$GEMINI_API_KEY" | head -5
```

## Get Your API Key

1. Go to https://aistudio.google.com/apikey
2. Sign in with Google account
3. Create new API key
4. Copy and store securely

## Key Longevity

| Factor | Impact |
|--------|--------|
| **Free tier** | 15 RPM, 1M tokens/min, 1500 req/day |
| **Expiration** | Keys don't auto-expire |
| **Revocation** | Manual only (or quota exceeded) |
| **Quota reset** | Daily at midnight PT |

**Keys typically last indefinitely** unless:
- You manually revoke them
- Google detects abuse
- Account issues

## Security Best Practices

### DO:
- Store in environment variables
- Use `${GEMINI_API_KEY}` in configs
- Add `.env` to `.gitignore`
- Rotate keys periodically

### DON'T:
- Hardcode in source files
- Commit to git repos
- Share in plain text
- Log full key values

## Where Keys Are Configured

| Location | Purpose |
|----------|---------|
| `~/.bashrc` | Shell env var |
| `~/.claude/mcp.json` | Claude Code MCP servers |
| `/mnt/c/Users/frank/.claude/mcp.json` | Windows Claude Code |

## Troubleshooting

**"API key expired"**
- Keys don't expire. Check for typos or revocation.

**"Quota exceeded"**
- Wait for daily reset or upgrade plan.

**"Invalid API key"**
- Regenerate at aistudio.google.com/apikey

## Monitor Usage

```bash
# Check available models (confirms key works)
curl -s "https://generativelanguage.googleapis.com/v1/models?key=$GEMINI_API_KEY" | jq '.models[].name'
```

## Key Rotation Checklist

When rotating keys:
1. Generate new key at aistudio.google.com
2. Update `~/.bashrc`: `export GEMINI_API_KEY="new-key"`
3. Update `~/.claude/mcp.json`
4. Update `/mnt/c/Users/frank/.claude/mcp.json` (Windows)
5. Run `source ~/.bashrc`
6. Test: `node generate-acos-visuals.js`
7. Revoke old key

---
*Last updated: 2026-02-03*
