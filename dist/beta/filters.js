import { reverseTranslate, getCountryCode } from "./translations-reverse.js";
import { applyBroadcastFilters } from "./broadcasts.js";

export function setupFilters() {
  const button = document.getElementById("apply-filters");

  button.addEventListener("click", () => {
    // Captura valores dos campos
    const genderLabel = document.getElementById("gender-filter").value;
    const orientationLabel = document.getElementById("orientation-filter").value;
    const countryLabel = document.getElementById("country-filter").value;
    const minViewersInput = document.getElementById("min-viewers").value;
    const tagsInput = document.getElementById("tags").value;

    const filters = {};

    // 1. gender: apenas valores esperados pela API
    const genderValue = reverseTranslate("gender", genderLabel);
    if (genderValue) filters.gender = genderValue;

    // 2. orientation: (não está na API v19, mas pode deixar preparado)
    const orientationValue = reverseTranslate("sexPreference", orientationLabel);
    if (orientationValue) filters.orientation = orientationValue;

    // 3. country: código ISO 3166-1 alpha-2
    const countryValue = getCountryCode(countryLabel);
    if (countryValue) filters.country = countryValue;

    // 4. minViewers: inteiro, opcional
    if (minViewersInput && !isNaN(parseInt(minViewersInput))) {
      filters.minViewers = parseInt(minViewersInput, 10);
    }

    // 5. tags: array de slugs, limpos e minúsculos
    if (tagsInput) {
      filters.tags = tagsInput
        .split(",")
        .map(tag => tag.trim().toLowerCase().replace(/\s+/g, "-"))
        .filter(Boolean);
    }

    applyBroadcastFilters(filters);
  });
}
