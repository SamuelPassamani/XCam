// filters.js
// Responsável por capturar e aplicar filtros da interface para a grade de transmissões do XCam.
// Projetado para integração total com o fluxo otimizado da grade (broadcasts.js): renderização e atualização incremental, sem fetch individual por transmissão.
// Garante sempre o envio de valores válidos à API conforme a estratégia de performance e UX planejada.

// === Importações necessárias ===
import { applyBroadcastFilters } from "https://xcam.gay/broadcasts.js";

// Mapeamentos explícitos dos valores aceitos pela API
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

/**
 * Função utilitária para mapear o valor do select para o valor aceito pela API.
 * Ignora "todos", vazio, nulo ou valores inválidos.
 */
function mapSelectValue(value, map) {
  if (!value || value === "all" || value === "-- Todos --" || value === "Todos" || value === "") {
    return undefined;
  }
  return map[value] || undefined;
}

/**
 * Mapeia valor de país para padrão aceito pela API (código ISO 3166-1 alpha-2, minúsculo).
 */
function mapCountryValue(value) {
  if (!value || value === "all" || value === "-- Todos --" || value === "Todos" || value === "") {
    return undefined;
  }
  return value.toLowerCase();
}

/**
 * Configura o sistema de filtros da interface.
 * Assegura que apenas valores válidos e padronizados sejam enviados para a API,
 * promovendo integração fluida com a grade incremental do broadcasts.js.
 */
export function setupFilters() {
  const button = document.getElementById("apply-filters");
  const form = document.getElementById("filters-form");

  // Intercepta submit do formulário para aplicar filtros sem recarregar página
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    // Captura os valores dos selects
    const genderRaw = document.getElementById("gender-filter").value;
    const orientationRaw = document.getElementById("orientation-filter").value;
    const countryRaw = document.getElementById("country-filter").value;

    // Filtros podem ser expandidos para minViewers, tags, etc no futuro
    // Exemplo:
    // const minViewersInput = document.getElementById("min-viewers")?.value;
    // const tagsInput = document.getElementById("tags")?.value;

    const filters = {};

    // Gênero
    const genderValue = mapSelectValue(genderRaw, GENDER_API_VALUES);
    if (genderValue) filters.gender = genderValue;

    // Orientação
    const orientationValue = mapSelectValue(orientationRaw, ORIENTATION_API_VALUES);
    if (orientationValue) filters.orientation = orientationValue;

    // País (código ISO)
    const countryValue = mapCountryValue(countryRaw);
    if (countryValue) filters.country = countryValue;

    // Exemplos de expansão:
    // if (minViewersInput && !isNaN(parseInt(minViewersInput, 10))) {
    //   filters.minViewers = parseInt(minViewersInput, 10);
    // }
    // if (tagsInput && typeof tagsInput === 'string') {
    //   const tags = tagsInput.split(",").map(t => t.trim().toLowerCase()).filter(Boolean);
    //   if (tags.length > 0) filters.tags = tags;
    // }

    // Aplica filtros na grade, disparando o fluxo otimizado do broadcasts.js
    applyBroadcastFilters(filters);
  });

  // Garantia de acessibilidade: botão também envia o formulário
  button.addEventListener("click", (event) => {
    event.preventDefault();
    form.requestSubmit();
  });
}

/*
Resumo das melhorias/correções (2025):
- Integração total com a grade otimizada: filtros são aplicados via fetch único, sem chamadas individuais.
- Filtros nunca enviam "all", "Todos" ou valores vazios/nulos para a API.
- Estrutura modular, clara e pronta para expansão (minViewers, tags, etc).
- Comentários detalhados e foco em performance e UX.
*/
