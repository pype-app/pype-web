#!/bin/bash
# Setup script para pype-web
# Executa durante clone/setup inicial
# 
# Para rodar manualmente:
#   bash setup-hooks.sh

set -e

echo ""
echo "=========================================="
echo "  pype-web: Configurando Hooks"
echo "=========================================="
echo ""

# Chamar o script de instalação global
bash ../pype-bmad/.github/install-hooks.sh

echo ""
echo "✅ Setup completo para pype-web!"
echo ""
echo "Próximos passos:"
echo "  1. Verifique o status: git config core.hooksPath"
echo "  2. Tente um commit: git commit --allow-empty -m 'test: verify hooks'"
echo "  3. Leia a documentação: ../pype-bmad/.github/COMO_USAR_HOOKS.md"
echo ""
