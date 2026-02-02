#!/bin/bash

# 🚀 ARCANEA INFOGENIUS PRO - GITHUB DEPLOYMENT SCRIPT
# This script creates the GitHub repository and pushes all code

set -e  # Exit on error

echo "🌟 Arcanea InfoGenius Pro - GitHub Deployment"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    echo -e "${RED}Error: README.md not found. Are you in the arcanea-infogenius directory?${NC}"
    exit 1
fi

# Get GitHub username
read -p "Enter your GitHub username: " GITHUB_USERNAME

# Check if gh CLI is available and authenticated
echo ""
echo -e "${BLUE}Checking GitHub CLI...${NC}"
if command -v gh &> /dev/null; then
    if gh auth status &> /dev/null; then
        echo -e "${GREEN}✓ GitHub CLI authenticated${NC}"
        USE_GH=true
    else
        echo -e "${YELLOW}⚠ GitHub CLI found but not authenticated${NC}"
        echo -e "${YELLOW}  Run: gh auth login${NC}"
        USE_GH=false
    fi
else
    echo -e "${YELLOW}⚠ GitHub CLI not installed${NC}"
    USE_GH=false
fi

echo ""
echo -e "${BLUE}Current repository status:${NC}"
git log --oneline | head -3
echo ""

if [ "$USE_GH" = true ]; then
    echo -e "${BLUE}Creating repository using GitHub CLI...${NC}"
    
    # Create repository
    gh repo create arcanea-infogenius \
        --public \
        --description "🌟 Arcanea InfoGenius Pro - Sophisticated visual generation system with Guardian AI agents, Enterprise compliance, and transcendent quality. Creates magical, professional visuals through AI." \
        --homepage "https://github.com/$GITHUB_USERNAME/arcanea-infogenius" \
        --source=. \
        --remote=origin \
        --push
    
    echo -e "${GREEN}✓ Repository created and code pushed!${NC}"
else
    echo -e "${YELLOW}Manual repository creation required${NC}"
    echo ""
    echo "Please follow these steps:"
    echo ""
    echo "1. Go to: https://github.com/new"
    echo "2. Repository name: arcanea-infogenius"
    echo "3. Description: 🌟 Arcanea InfoGenius Pro - Sophisticated visual generation system"
    echo "4. Make it Public"
    echo "5. DO NOT initialize with README (we already have one)"
    echo "6. Click 'Create repository'"
    echo ""
    read -p "Press Enter once you've created the repository..."
    
    # Add remote and push
    echo -e "${BLUE}Adding remote and pushing code...${NC}"
    git remote add origin https://github.com/$GITHUB_USERNAME/arcanea-infogenius.git
    git push -u origin main
    
    echo -e "${GREEN}✓ Code pushed successfully!${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo "Repository URL: https://github.com/$GITHUB_USERNAME/arcanea-infogenius"
echo ""
echo "Next steps:"
echo "1. Visit the repository on GitHub"
echo "2. Enable Issues and Discussions in Settings"
echo "3. Add topics: mcp-server, ai-visual-generation, guardian-ai, enterprise-compliance"
echo "4. Star your own repository! ⭐"
echo "5. Share the link: https://github.com/$GITHUB_USERNAME/arcanea-infogenius"
echo ""
echo "Optional: Add Nano Banana MCP as submodule"
echo "  git submodule add https://github.com/ConechoAI/Nano-Banana-MCP.git mcp-server/nano-banana-mcp"
echo "  git commit -m \"📦 Add Nano Banana MCP submodule\""
echo "  git push"
echo ""
echo -e "${BLUE}Arcanea InfoGenius Pro is now live on GitHub! 🚀${NC}"