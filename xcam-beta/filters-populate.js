// filters-populate.js
// Responsável por popular dinamicamente os selects de filtro (gênero, orientação, país) na interface do XCam.
// Alinhado ao fluxo otimizado da grade (broadcasts.js) e filtros (filters.js): performance, consistência e usabilidade.
// Garante que os valores dos <option> estejam SEMPRE no padrão aceito pela API (em inglês/código), nunca em português ou formato diverso.

// === Mapeamento explícito dos valores aceitos pela API para exibição amigável no select ===
const GENDER_OPTIONS = {
  "male": "Masculino",
  "female": "Feminino",
  "trans": "Trans"
};
const ORIENTATION_OPTIONS = {
  "straight": "Hetero",
  "gay": "Gay",
  "lesbian": "Lésbica",
  "bisexual": "Bissexual",
  "bicurious": "Bicurioso",
  "unknown": "Não Definido"
};
// countryNames já está no formato {codigo: "Nome do País"}

import { countryNames } from "https://xcam.gay/translations.js";

/**
 * Popula todos os selects de filtro da interface.
 * Garante sincronização entre o valor exibido e o valor enviado para a API.
 * Deve ser chamada sempre antes de qualquer interação com os filtros.
 */
export function populateFilterOptions() {
  populateSelect("gender-filter", GENDER_OPTIONS);
  populateSelect("orientation-filter", ORIENTATION_OPTIONS);
  populateSelect("country-filter", countryNames, true);
}

/**
 * Popula um <select> HTML com opções consistentes com o backend da API.
 * @param {string} selectId - id do <select> a ser populado
 * @param {object} values - objeto {value: label} onde value é SEMPRE o aceito pela API
 * @param {boolean} [isCountry=false] - se true, usa countryNames; apenas para clareza futura
 * 
 * Sempre adiciona a opção padrão "-- Todos --" (value="all"), que não envia filtro quando selecionada.
 * Garante que o value do option seja aceito pela API.
 */
function populateSelect(selectId, values, isCountry = false) {
  const select = document.getElementById(selectId);
  if (!select) return;

  // Limpa opções anteriores
  select.innerHTML = "";

  // Adiciona a opção padrão "-- Todos --"
  const defaultOption = document.createElement("option");
  defaultOption.value = "all";
  defaultOption.textContent = "-- Todos --";
  select.appendChild(defaultOption);

  // Adiciona opções do objeto passado, garantindo sempre o value correto
  for (const [value, label] of Object.entries(values)) {
    if (!value) continue; // ignora chaves vazias
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    select.appendChild(option);
  }
}

/*
Resumo das melhorias/correções (2025):
- Garantia total de compatibilidade com o fluxo otimizado da grade: todos os filtros só enviam valores válidos (em inglês/código).
- Nunca há dessintonia entre back e front, evitando bugs de filtragem e problemas de UX.
- Estrutura modular, clara, pronta para expansão (adicionar novos filtros como tags ou minViewers).
- Comentários detalhados em cada etapa para facilitar manutenção e onboarding.
*/
