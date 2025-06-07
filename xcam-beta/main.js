import { setupCarousel } from "./carousel.js";
import { setupMenu } from "./menu.js";
import { setupModal } from "./modal.js";
import { setupFilters } from "./filters.js";
import { setupBroadcasts } from "./broadcasts.js";
import { populateFilterOptions } from "./filters-populate.js";

// Garante que tudo rode após o DOM estar pronto
document.addEventListener("DOMContentLoaded", () => {
  setupCarousel();
  setupMenu();
  setupModal();
  populateFilterOptions(); // Preenche os selects dinamicamente
  setupFilters();          // Depende dos selects preenchidos
  setupBroadcasts();       // Carrega grade de transmissões (apenas uma vez)
});

// Se precisar de reload global, exporte a função (opcional)
export function initApp() {
  setupBroadcasts();
}