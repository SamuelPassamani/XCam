// filters.js
// Responsável por capturar e aplicar filtros da interface para a grade de transmissões.
// Corrigido para enviar à API somente valores válidos (em inglês) e omitindo filtros "todos".

import { applyBroadcastFilters } from "./broadcasts.js";

// Mapeamento explícito dos valores dos selects para os valores aceitos pela API
const GENDER_API_VALUES = {
  "male": "male",
  "female": "female",
  "trans": "trans"
};

const ORIENTATION_API_VALUES = {
  "straight": "straight",
  "gay": "gay",
  "lesbian": "lesbian",
  "bisexual": "bisexual",
  "bicurious": "bicurious",
  "unknown": "unknown"
};

// Função utilitária para mapear o valor do select para o valor aceito pela API
function mapSelectValue(value, map) {
  if (!value || value === "all" || value === "-- Todos --" || value === "Todos" || value === "") {
    // Não aplicar filtro se for "todos"
    return undefined;
  }
  // Se o valor já estiver no mapa, retorna o mapeado; senão, retorna undefined (filtro não aplicado)
  return map[value] || undefined;
}

// Função utilitária para país
function mapCountryValue(value) {
  if (!value || value === "all" || value === "-- Todos --" || value === "Todos" || value === "") {
    // Não aplicar filtro se for "todos"
    return undefined;
  }
  // Para países, o value já deve ser o código ISO 3166-1 alpha-2 em minúsculo
  return value.toLowerCase();
}

// Setup dos filtros
export function setupFilters() {
  const button = document.getElementById("apply-filters");
  const form = document.getElementById("filters-form");

  // Garante que não haverá reload do formulário por submit
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    // Captura valores dos selects
    const genderRaw = document.getElementById("gender-filter").value;
    const orientationRaw = document.getElementById("orientation-filter").value;
    const countryRaw = document.getElementById("country-filter").value;
    // Se tiver campo para espectadores mínimos e tags, adapte aqui:
    // const minViewersInput = document.getElementById("min-viewers")?.value;
    // const tagsInput = document.getElementById("tags")?.value;

    const filters = {};

    // 1. Gênero
    // Mapeia o valor selecionado para o valor aceito pela API, ou omite se for "todos"
    const genderValue = mapSelectValue(genderRaw, GENDER_API_VALUES);
    if (genderValue) filters.gender = genderValue;

    // 2. Orientação
    const orientationValue = mapSelectValue(orientationRaw, ORIENTATION_API_VALUES);
    if (orientationValue) filters.orientation = orientationValue;

    // 3. País (código ISO)
    const countryValue = mapCountryValue(countryRaw);
    if (countryValue) filters.country = countryValue;

    // 4. Exemplo para espectadores mínimos (descomente se usar)
    // if (minViewersInput && !isNaN(parseInt(minViewersInput, 10))) {
    //   filters.minViewers = parseInt(minViewersInput, 10);
    // }

    // 5. Exemplo para tags (descomente se usar)
    // if (tagsInput && typeof tagsInput === 'string') {
    //   const tags = tagsInput.split(",").map(t => t.trim().toLowerCase()).filter(Boolean);
    //   if (tags.length > 0) filters.tags = tags;
    // }

    // Aplica os filtros à grade de transmissões
    applyBroadcastFilters(filters);
  });

  // (Opcional) Garantia de click no botão também submete o formulário (acessibilidade)
  button.addEventListener("click", (event) => {
    event.preventDefault();
    form.requestSubmit();
  });
}

/*
Resumo das modificações/correções:
- Não usa mais tradução reversa ou arquivos de tradução para montar os filtros.
- Usa mapeamento explícito dos valores dos selects para os valores aceitos pela API.
- Não envia filtros com valor "all", "Todos", vazio, etc (filtro omitido = mostrar todos).
- Corrige o evento do formulário para evitar reload da página.
- Código modularizado, organizado, com comentários detalhados.
*/