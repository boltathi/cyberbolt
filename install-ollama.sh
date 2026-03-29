#!/bin/bash
# ─── Ollama + Model Installer for Contabo VPS ────────────────
#
# Installs Ollama and pulls the qwen2.5:0.5b model (~398MB)
# for the CyberBolt OWASP Top 10 Checklist Generator.
#
# Usage:
#   chmod +x install-ollama.sh
#   sudo ./install-ollama.sh
#
# ──────────────────────────────────────────────────────────────

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

MODEL="qwen2.5:0.5b"

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🤖 CyberBolt — Ollama + LLM Model Installer${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ─── Check root ──────────────────────────────────────────────
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Please run as root: sudo ./install-ollama.sh${NC}"
    exit 1
fi

# ─── Check system resources ─────────────────────────────────
echo -e "${CYAN}[1/5] Checking system resources...${NC}"

TOTAL_RAM_MB=$(free -m | awk '/^Mem:/{print $2}')
AVAILABLE_RAM_MB=$(free -m | awk '/^Mem:/{print $7}')
DISK_AVAIL_GB=$(df -BG / | awk 'NR==2{print $4}' | tr -d 'G')

echo "   Total RAM:     ${TOTAL_RAM_MB} MB"
echo "   Available RAM: ${AVAILABLE_RAM_MB} MB"
echo "   Disk free:     ${DISK_AVAIL_GB} GB"

if [ "$AVAILABLE_RAM_MB" -lt 500 ]; then
    echo -e "${YELLOW}   ⚠ Low RAM available (${AVAILABLE_RAM_MB} MB). Model needs ~600 MB.${NC}"
    echo -e "${YELLOW}     Ollama will auto-unload the model when idle (5 min default).${NC}"
fi

if [ "$DISK_AVAIL_GB" -lt 2 ]; then
    echo -e "${RED}   ❌ Not enough disk space (${DISK_AVAIL_GB} GB free). Need at least 2 GB.${NC}"
    exit 1
fi

echo -e "${GREEN}   ✅ System resources OK${NC}"

# ─── Install Ollama ──────────────────────────────────────────
echo -e "${CYAN}[2/5] Installing Ollama...${NC}"

if command -v ollama &>/dev/null; then
    OLLAMA_VERSION=$(ollama --version 2>/dev/null | grep -oP '[\d.]+' | head -1 || echo "unknown")
    echo -e "${GREEN}   ✅ Ollama already installed (version: ${OLLAMA_VERSION})${NC}"
else
    echo "   Downloading and installing Ollama..."
    curl -fsSL https://ollama.ai/install.sh | sh
    echo -e "${GREEN}   ✅ Ollama installed${NC}"
fi

# ─── Enable & start Ollama service ──────────────────────────
echo -e "${CYAN}[3/5] Starting Ollama service...${NC}"

if systemctl is-active --quiet ollama 2>/dev/null; then
    echo -e "${GREEN}   ✅ Ollama service already running${NC}"
else
    systemctl enable ollama 2>/dev/null || true
    systemctl start ollama 2>/dev/null || true
    sleep 3

    if systemctl is-active --quiet ollama 2>/dev/null; then
        echo -e "${GREEN}   ✅ Ollama service started & enabled on boot${NC}"
    else
        echo -e "${YELLOW}   ⚠ systemd not available, starting Ollama manually...${NC}"
        nohup ollama serve >/var/log/ollama.log 2>&1 &
        sleep 3
        if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
            echo -e "${GREEN}   ✅ Ollama started manually${NC}"
        else
            echo -e "${RED}   ❌ Failed to start Ollama${NC}"
            exit 1
        fi
    fi
fi

# ─── Pull the model ─────────────────────────────────────────
echo -e "${CYAN}[4/5] Pulling model: ${MODEL}...${NC}"

# Check if model already exists
if ollama list 2>/dev/null | grep -q "qwen2.5:0.5b"; then
    echo -e "${GREEN}   ✅ Model ${MODEL} already downloaded${NC}"
else
    echo "   Downloading ${MODEL} (~398 MB)..."
    ollama pull "$MODEL"
    echo -e "${GREEN}   ✅ Model ${MODEL} downloaded${NC}"
fi

# ─── Verify everything works ────────────────────────────────
echo -e "${CYAN}[5/5] Verifying installation...${NC}"

# Test a quick generation
echo "   Running test generation..."
TEST_RESPONSE=$(curl -s http://localhost:11434/api/generate -d "{
  \"model\": \"${MODEL}\",
  \"prompt\": \"Say hello in one sentence.\",
  \"stream\": false,
  \"options\": {\"num_predict\": 20}
}" 2>/dev/null)

if echo "$TEST_RESPONSE" | python3 -c "import sys,json; r=json.load(sys.stdin); print('   Model response:', r.get('response','')[:80])" 2>/dev/null; then
    echo -e "${GREEN}   ✅ Model is working correctly${NC}"
else
    echo -e "${RED}   ❌ Model test failed. Response: ${TEST_RESPONSE}${NC}"
    exit 1
fi

# ─── Print model info ───────────────────────────────────────
echo ""
MODEL_SIZE=$(ollama list 2>/dev/null | grep "qwen2.5:0.5b" | awk '{print $3, $4}')
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Ollama + ${MODEL} installed successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "   Model:         ${MODEL}"
echo "   Model size:    ${MODEL_SIZE}"
echo "   Ollama API:    http://localhost:11434"
echo "   Service:       systemctl status ollama"
echo ""
echo -e "${CYAN}Add to your .env:${NC}"
echo "   OLLAMA_URL=http://localhost:11434"
echo "   OLLAMA_MODEL=${MODEL}"
echo ""
echo -e "${CYAN}Useful commands:${NC}"
echo "   ollama list                  # list downloaded models"
echo "   ollama run ${MODEL}     # interactive chat"
echo "   systemctl restart ollama     # restart service"
echo "   journalctl -u ollama -f      # view logs"
echo ""
echo -e "${CYAN}To switch to a larger model later:${NC}"
echo "   ollama pull qwen2.5:1.5b     # 1.5B params, ~1 GB, better quality"
echo "   # Then update OLLAMA_MODEL in .env"
echo ""
