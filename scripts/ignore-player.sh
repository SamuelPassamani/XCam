#!/bin/bash

# Ignora build se não houver mudanças relevantes para player.xcam.gay (player/)
CHANGED_FILES=$(git diff --name-only $CACHED_COMMIT_REF $COMMIT_REF)

if [ -z "$CACHED_COMMIT_REF" ]; then
  echo "Nenhum commit anterior encontrado, buildando por padrão."
  exit 1
fi

if echo "$CHANGED_FILES" | grep -qE '^player/|^package(-lock)?\.json|^pnpm-lock\.yaml|^yarn\.lock'; then
  echo "Mudanças relevantes detectadas para player.xcam.gay. Build necessário."
  exit 1
fi

echo "Nenhuma mudança relevante para player.xcam.gay detectada. Build ignorado."
exit 0