// filters-populate.js
// Responsável por popular dinamicamente os selects de filtro (gênero, orientação, país)
// Corrigido para garantir que os valores dos options estejam SEMPRE no padrão aceito pela API (em inglês/código), nunca em português.
// Não usa mais traduções reversas para value, apenas para exibição (label).

// Mapeamento explícito dos valores aceitos pela API para exibição amigável no select
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

import { countryNames } from "./translations.js";

// Popula todos os filtros
export function populateFilterOptions() {
  populateSelect("gender-filter", GENDER_OPTIONS, false);
  populateSelect("orientation-filter", ORIENTATION_OPTIONS, false);
  populateSelect("country-filter", countryNames, true);
}

// Função para popular um <select>
// - selectId: id do select
// - values: objeto {value: label}
// - isCountry: se true, não traduz valor nem label, apenas usa o par código/nome
function populateSelect(selectId, values, isCountry = false) {
  const select = document.getElementById(selectId);
  if (!select) return;

  // Limpa opções anteriores
  select.innerHTML = "";

  // Adiciona a opção padrão "-- Todos --" (usada para não aplicar filtro)
  const defaultOption = document.createElement("option");
  defaultOption.value = "all";
  defaultOption.textContent = "-- Todos --";
  select.appendChild(defaultOption);

  // Adiciona opções do objeto passado
  for (const [value, label] of Object.entries(values)) {
    const option = document.createElement("option");
    // O value do option SEMPRE deve ser o valor aceito pela API (em inglês/código)
    option.value = value;
    // O label exibido pode ser traduzido para o usuário
    option.textContent = label;
    select.appendChild(option);
  }
}

/*
Resumo das melhorias/correções:
- Os valores dos <option> agora são SEMPRE os aceitos pela API (em inglês/código), nunca em português.
- O usuário vê o label traduzido, mas o backend recebe o valor correto.
- A opção "-- Todos --" usa value "all", que no JS de filtro é omitida da query (não envia filtro).
- O select de país usa o código (ex: "br") como value e o nome do país como label.
- Não usa mais translations.gender nem translations.sexPreference, apenas o mapeamento explícito correto.
- Código modular, limpo e com comentários detalhados.
*/