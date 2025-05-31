#!/bin/bash

# Script de ignore para Netlify: player.xcam.gay
# Objetivo: Só buildar se houver mudanças relevantes na pasta "player/" ou arquivos compartilhados

# Checa arquivos modificados no commit/pull request
CHANGED_FILES=$(git diff --name-only $CACHED_COMMIT_REF $COMMIT_REF)

# Caso esteja rodando em push para branch principal ou sem referência anterior
if [ -z "$CACHED_COMMIT_REF" ]; then
  echo "Nenhum commit anterior encontrado, buildando por padrão."
  exit 1
fi

# Se houver mudanças na pasta player/ ou em arquivos globais relevantes, faz o build
if echo "$CHANGED_FILES" | grep -qE '^player/|^package(-lock)?\.json|^pnpm-lock\.yaml|^yarn\.lock'; then
  echo "Mudanças relevantes detectadas para player. Build necessário."
  exit 1
fi

# Caso contrário, ignora o build
echo "Nenhuma mudança relevante para player/ detectada. Build ignorado."
exit 0