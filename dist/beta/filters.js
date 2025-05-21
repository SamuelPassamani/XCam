import { reverseTranslate, getCountryCode } from "./translations-reverse.js";
import { applyBroadcastFilters } from "./broadcasts.js";

/**
 * Aplica os filtros seguindo rigorosamente o formato exigido pela API XCam V.19:
 * - gender: string ('male', 'female', 'trans', 'couple')
 * - country: código ISO 3166-1 alpha-2 (ex: 'br')
 * - minViewers: inteiro
 * - tags: array de slugs, enviado como string separada por vírgula
 */
export function setupFilters() {
  const button = document.getElementById("apply-filters");

  button.addEventListener("click", () => {
    // Coleta os valores dos campos de filtro do DOM
    const genderLabel = document.getElementById("gender-filter").value;
    const orientationLabel = document.getElementById("orientation-filter").value;
    const countryLabel = document.getElementById("country-filter").value;
    const minViewersInput = document.getElementById("min-viewers").value;
    const tagsInput = document.getElementById("tags").value;

    const filters = {};

    // Gênero (apenas valor válido, não label)
    const genderValue = reverseTranslate("gender", genderLabel);
    if (genderValue) filters.gender = genderValue;

    // Orientação sexual (se for relevante para a API futura)
    const orientationValue = reverseTranslate("sexPreference", orientationLabel);
    if (orientationValue) filters.orientation = orientationValue;

    // País (código ISO)
    const countryValue = getCountryCode(countryLabel);
    if (countryValue) filters.country = countryValue;

    // minViewers (inteiro)
    if (minViewersInput && !isNaN(parseInt(minViewersInput))) {
      filters.minViewers = parseInt(minViewersInput, 10);
    }

    // Tags: converter para array de slugs, separados por vírgula
    if (tagsInput) {
      filters.tags = tagsInput
        .split(",")
        .map(tag => tag.trim().toLowerCase().replace(/\s+/g, "-"))
        .filter(Boolean);
    }

    applyBroadcastFilters(filters);
  });
}
