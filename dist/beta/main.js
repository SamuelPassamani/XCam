import { setupCarousel } from "./carousel.js";
import { setupMenu } from "./menu.js";
import { setupModal } from "./modal.js";
import { setupFilters } from "./filters.js";
import { setupBroadcasts, refreshBroadcasts } from "./broadcasts.js";
import { populateFilterOptions } from "./filters-populate.js";

export function initApp() {
  refreshBroadcasts();
}

document.addEventListener("DOMContentLoaded", () => {
  setupCarousel();
  setupMenu();
  setupModal();
  populateFilterOptions(); // Preenche os selects dinamicamente
  setupFilters();
  setupBroadcasts();
  refreshBroadcasts(); // Garante carregamento inicial automático
});