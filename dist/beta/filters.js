import { reverseTranslate, getCountryCode } from "./translations-reverse.js";
import { applyBroadcastFilters } from "./broadcasts.js";

export function setupFilters() {
  const button = document.getElementById("apply-filters");

  button.addEventListener("click", () => {
    // Coleta os valores dos filtros
    const genderLabel = document.getElementById("gender-filter").value;
    const orientationLabel = document.getElementById("orientation-filter").value;
    const countryLabel = document.getElementById("country-filter").value;
    const minViewersInput = document.getElementById("min-viewers").value;
    const tagsInput = document.getElementById("tags").value;

    // Tradução reversa/códigos corretos
    const filters = {};

    const genderValue = reverseTranslate("gender", genderLabel);
    if (genderValue) filters.gender = genderValue;

    const orientationValue = reverseTranslate("sexPreference", orientationLabel);
    if (orientationValue) filters.orientation = orientationValue;

    const countryValue = getCountryCode(countryLabel);
    if (countryValue) filters.country = countryValue;

    if (minViewersInput && !isNaN(parseInt(minViewersInput))) {
      filters.minViewers = parseInt(minViewersInput, 10);
    }

    // tags: converter para array de slug (sem espaços, somente texto minúsculo)
    if (tagsInput) {
      filters.tags = tagsInput
        .split(",")
        .map(tag => tag.trim().toLowerCase().replace(/\s+/g, "-"))
        .filter(Boolean);
    }

    applyBroadcastFilters(filters);
  });
}
