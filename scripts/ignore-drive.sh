#!/bin/bash

# Ignora build se não houver mudanças relevantes para drive.xcam.gay (api/netlify/xcam-drive)
CHANGED_FILES=$(git diff --name-only $CACHED_COMMIT_REF $COMMIT_REF)

if [ -z "$CACHED_COMMIT_REF" ]; then
  echo "Nenhum commit anterior encontrado, buildando por padrão."
  exit 1
fi

if echo "$CHANGED_FILES" | grep -qE '^api/netlify/xcam-drive/|^package(-lock)?\.json|^pnpm-lock\.yaml|^yarn\.lock'; then
  echo "Mudanças relevantes detectadas para drive.xcam.gay. Build necessário."
  exit 1
fi

echo "Nenhuma mudança relevante para drive.xcam.gay detectada. Build ignorado."
exit 0