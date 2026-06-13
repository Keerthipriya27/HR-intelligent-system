#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Supabase Setup Script — HR Cost Intelligence
# ─────────────────────────────────────────────────────────────
# This script helps you configure Supabase Authentication with
# TOTP MFA for the CostIQ platform.
#
# Usage:
#   chmod +x scripts/supabase-setup.sh
#   ./scripts/supabase-setup.sh
# ─────────────────────────────────────────────────────────────

set -e

# ─── Colors ───
BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo ""
echo -e "${BOLD}${BLUE}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${BLUE}║   Supabase Setup — CostIQ HR Intelligence       ║${NC}"
echo -e "${BOLD}${BLUE}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# ─── Step 1: Check prerequisites ───
echo -e "${BOLD}${YELLOW}[1/5] Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "  ${RED}✗ Node.js is not installed. Please install Node.js 18+.${NC}"
    exit 1
fi
echo -e "  ${GREEN}✓ Node.js $(node -v)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "  ${RED}✗ npm is not installed.${NC}"
    exit 1
fi
echo -e "  ${GREEN}✓ npm $(npm -v)${NC}"

# Check .env file
if [ ! -f .env ]; then
    echo -e "  ${YELLOW}⚠ No .env file found. Creating from .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "  ${GREEN}✓ .env created from .env.example${NC}"
        echo -e "  ${YELLOW}⚠ Please edit .env with your Supabase credentials.${NC}"
    else
        echo -e "  ${RED}✗ .env.example not found. Creating template...${NC}"
        cat > .env << 'EOF'
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
EOF
        echo -e "  ${GREEN}✓ .env template created${NC}"
    fi
else
    echo -e "  ${GREEN}✓ .env file exists${NC}"
fi

# Check VITE_SUPABASE_URL is set (not placeholder)
if grep -q "your-project-id" .env 2>/dev/null; then
    echo -e "  ${YELLOW}⚠ VITE_SUPABASE_URL still has placeholder value.${NC}"
    echo -e "  ${YELLOW}  Please update .env with your real Supabase credentials.${NC}"
fi

echo ""

# ─── Step 2: Install dependencies ───
echo -e "${BOLD}${YELLOW}[2/5] Installing dependencies...${NC}"

if [ ! -d "node_modules" ]; then
    npm install
    echo -e "  ${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "  ${GREEN}✓ Dependencies already installed${NC}"
fi

echo ""

# ─── Step 3: Display Supabase setup instructions ───
echo -e "${BOLD}${YELLOW}[3/5] Supabase Project Setup Instructions${NC}"
echo ""
echo -e "  ${CYAN}Follow these steps in your browser:${NC}"
echo ""
echo -e "  ${BOLD}1. Create a Supabase project${NC}"
echo -e "     Go to https://supabase.com and click 'New project'"
echo -e "     Name: hr-cost-intelligence"
echo ""
echo -e "  ${BOLD}2. Get your API credentials${NC}"
echo -e "     Go to Project Settings → API"
echo -e "     Copy the 'Project URL' and 'anon public' key"
echo ""
echo -e "  ${BOLD}3. Update your .env file${NC}"
echo -e "     Edit .env and paste your credentials:"
echo -e "     VITE_SUPABASE_URL=https://your-project.supabase.co"
echo -e "     VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs..."
echo ""

read -p "  Have you updated .env with your Supabase credentials? (y/N) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "  ${GREEN}✓ Great! Continuing setup...${NC}"
else
    echo -e "  ${YELLOW}⚠ Please update .env before running the app.${NC}"
fi

echo ""

# ─── Step 4: Verify configuration ───
echo -e "${BOLD}${YELLOW}[4/5] Verifying configuration...${NC}"

# Check .env values
SUPABASE_URL=$(grep VITE_SUPABASE_URL .env 2>/dev/null | cut -d '=' -f2)
SUPABASE_KEY=$(grep VITE_SUPABASE_ANON_KEY .env 2>/dev/null | cut -d '=' -f2)

if [ -n "$SUPABASE_URL" ] && [ "$SUPABASE_URL" != "https://your-project-id.supabase.co" ]; then
    echo -e "  ${GREEN}✓ VITE_SUPABASE_URL is set${NC}"
else
    echo -e "  ${YELLOW}⚠ VITE_SUPABASE_URL is not configured yet${NC}"
fi

if [ -n "$SUPABASE_KEY" ] && [ "$SUPABASE_KEY" != "your-anon-key-here" ]; then
    echo -e "  ${GREEN}✓ VITE_SUPABASE_ANON_KEY is set${NC}"
else
    echo -e "  ${YELLOW}⚠ VITE_SUPABASE_ANON_KEY is not configured yet${NC}"
fi

echo ""

# ─── Step 5: MFA configuration guide ───
echo -e "${BOLD}${YELLOW}[5/5] MFA Configuration Checklist${NC}"
echo ""
echo -e "  Complete these steps in your Supabase Dashboard:"
echo ""
echo -e "  ${BOLD}□${NC} ${BOLD}Enable MFA${NC}"
echo -e "     Authentication → Providers → MFA Settings"
echo -e "     Set MFA Enrollment to 'Optional'"
echo -e "     Ensure Verification is NOT set to 'Disabled'"
echo ""
echo -e "  ${BOLD}□${NC} ${BOLD}Configure Session Settings${NC}"
echo -e "     Authentication → Settings"
echo -e "     Session duration: 86400 (24 hours)"
echo -e "     Enable PKCE flow: Yes"
echo ""
echo -e "  ${BOLD}□${NC} ${BOLD}Set up RLS Policies (Production)${NC}"
echo -e "     Run the SQL policies from scripts/supabase-setup.md"
echo -e "     Section 5: 'Set Up Row-Level Security Policies'"
echo ""
echo -e "  ${BOLD}□${NC} ${BOLD}Configure CORS (if needed)${NC}"
echo -e "     Authentication → Settings"
echo -e "     Add http://localhost:5173 to redirect URLs"
echo ""
echo -e "  ${BOLD}□${NC} ${BOLD}Start the development server${NC}"
echo -e "     ${CYAN}npm run dev${NC}"
echo ""

echo -e "${BOLD}${GREEN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}║   Setup complete!                                ║${NC}"
echo -e "${BOLD}${GREEN}║   See scripts/supabase-setup.md for full guide    ║${NC}"
echo -e "${BOLD}${GREEN}╚══════════════════════════════════════════════════╝${NC}"
echo ""
