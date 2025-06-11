// filters.js
// Responsável por capturar e aplicar filtros da interface para a grade de transmissões.
// Ajustado para integração total com o novo fluxo de carregamento e resolução de imagens da grade (broadcasts.js).
// Garante que apenas valores válidos sejam enviados à API e que a filtragem seja sempre compatível com o novo modelo de busca individual/preload.

// === Importações necessárias ===
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
  // Filtros "todos", vazio ou nulos nunca são enviados
  if (!value || value === "all" || value === "-- Todos --" || value === "Todos" || value === "") {
    return undefined;
  }
  return map[value] || undefined;
}

// Função utilitária para país
function mapCountryValue(value) {
  // Países "todos", vazio ou nulos nunca são enviados
  if (!value || value === "all" || value === "-- Todos --" || value === "Todos" || value === "") {
    return undefined;
  }
  // O value já vem no padrão ISO 3166-1 alpha-2 em minúsculo (garantido pelo populateFilterOptions)
  return value.toLowerCase();
}

/**
 * Função principal para configurar os filtros da interface.
 * Integra com o modelo de busca incremental da grade de transmissões, garantindo compatibilidade e UX responsiva.
 */
export function setupFilters() {
  const button = document.getElementById("apply-filters");
  const form = document.getElementById("filters-form");

  // Garante que não haverá reload do formulário por submit e aplica os filtros corretamente
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    // Captura valores dos selects (os selects devem estar sempre sincronizados com os valores aceitos pela API)
    const genderRaw = document.getElementById("gender-filter").value;
    const orientationRaw = document.getElementById("orientation-filter").value;
    const countryRaw = document.getElementById("country-filter").value;

    // Exemplos para campos opcionais (minViewers, tags) podem ser ativados no futuro:
    // const minViewersInput = document.getElementById("min-viewers")?.value;
    // const tagsInput = document.getElementById("tags")?.value;

    const filters = {};

    // 1. Gênero
    // Mapeia o valor selecionado para o valor aceito pela API, omite se for "todos"
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

    // Aplica os filtros à grade de transmissões (broadcasts.js cuidará de toda a lógica incremental/paginada)
    applyBroadcastFilters(filters);
  });

  // Garantia de acessibilidade: botão também submete o formulário
  button.addEventListener("click", (event) => {
    event.preventDefault();
    form.requestSubmit();
  });
}

/*
Resumo das melhorias/correções (2025):
- Continuidade total com a estratégia da grade de transmissões que agora faz fetch incremental e resolve imagens por usuário.
- Filtros nunca enviam "all", "Todos" ou valores vazios/nulos para a API, garantindo consistência e performance.
- Estrutura modular e pronta para expansão (minViewers, tags, etc).
- Comentários detalhados em todas as etapas.
*/