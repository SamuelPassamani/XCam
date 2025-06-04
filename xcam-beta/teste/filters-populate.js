import { translations, countryNames } from "./translations.js";

export function populateFilterOptions() {
  populateSelect("gender-filter", translations.gender);
  populateSelect("orientation-filter", translations.sexPreference);
  populateSelect("country-filter", countryNames, true);
}

function populateSelect(selectId, values, isCountry = false) {
  const select = document.getElementById(selectId);
  if (!select) return;

  // Clear previous options
  select.innerHTML = "";

  // Add default option
  const defaultOption = document.createElement("option");
  defaultOption.value = "all";
  defaultOption.textContent = "-- Todos --";
  select.appendChild(defaultOption);

  for (const [key, label] of Object.entries(values)) {
    const option = document.createElement("option");
    option.value = isCountry ? key : label;
    option.textContent = label;
    select.appendChild(option);
  }
}