// filters-populate.js
// Responsável por popular dinamicamente os selects de filtro (gênero, orientação, país)
// Totalmente alinhado ao novo fluxo de busca incremental e filtragem robusta da grade de transmissões (broadcasts.js e filters.js).
// Garante que os valores dos <option> estejam SEMPRE no padrão aceito pela API (em inglês/código), nunca em português ou formato diverso.
// Nunca há dessintonia entre o value do select e o valor utilizado nos filtros.

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

import { countryNames } from "./translations.js";

/**
 * Popula todos os selects de filtro da interface.
 * Garante sincronização entre o valor exibido e o valor enviado para a API,
 * prevenindo problemas de filtragem e UX.
 */
export function populateFilterOptions() {
  populateSelect("gender-filter", GENDER_OPTIONS, false);
  populateSelect("orientation-filter", ORIENTATION_OPTIONS, false);
  populateSelect("country-filter", countryNames, true);
}

/**
 * Popula um <select> com opções consistentes com o backend da API.
 * - selectId: id do select
 * - values: objeto {value: label}
 * - isCountry: se true, não traduz valor nem label, apenas usa o par código/nome
 * 
 * Sempre adiciona a opção padrão "-- Todos --" (value="all"), que não envia filtro quando selecionada.
 * Garante que o value do option seja aceito pela API.
 */
function populateSelect(selectId, values, isCountry = false) {
  const select = document.getElementById(selectId);
  if (!select) return;

  // Limpa opções anteriores para evitar acúmulo
  select.innerHTML = "";

  // Adiciona a opção padrão "-- Todos --" (usada para representar filtro "todos")
  const defaultOption = document.createElement("option");
  defaultOption.value = "all";
  defaultOption.textContent = "-- Todos --";
  select.appendChild(defaultOption);

  // Adiciona opções do objeto passado, garantindo sempre o value correto
  for (const [value, label] of Object.entries(values)) {
    // Ignora valores nulos ou vazios
    if (!value) continue;
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    select.appendChild(option);
  }
}

/*
Resumo das melhorias/correções (2025):
- Garante consistência total entre os valores dos selects e os valores enviados para filtragem/pesquisa incremental.
- Não permite valores inválidos ou diferentes do padrão aceito pela API (evita bugs de filtragem, UX e resultados inesperados).
- O usuário sempre vê o label traduzido, mas o backend recebe o value correto (em inglês/código).
- O select de país usa o código (ex: "br") como value e o nome do país como label.
- A opção "-- Todos --" usa value "all" e nunca é enviada como filtro para a API.
- Código modular, limpo, escalável e com comentários detalhados.
- Compatível com futuras adições de filtros (ex: tags, minViewers).
*/