import { reverseTranslate, getCountryCode } from "./translations-reverse.js";
import { applyBroadcastFilters } from "./broadcasts.js";

export function setupFilters() {
  const button = document.getElementById("apply-filters");

  button.addEventListener("click", () => {
    const genderLabel = document.getElementById("gender-filter").value;
    const orientationLabel = document.getElementById("orientation-filter").value;
    const countryLabel = document.getElementById("country-filter").value;
    const minViewersInput = document.getElementById("min-viewers");
    const tagsInput = document.getElementById("tags");

    const filters = {
      gender: reverseTranslate("gender", genderLabel),
      orientation: reverseTranslate("sexPreference", orientationLabel),
      country: getCountryCode(countryLabel),
      minViewers: minViewersInput?.value || null,
      tags: tagsInput?.value?.split(",").map(tag => tag.trim()).filter(Boolean) || []
    };

    applyBroadcastFilters(filters);
  });
}