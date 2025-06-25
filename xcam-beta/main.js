// main.js
// Bootstrap principal do XCam Beta App V3.3
// Responsável por inicializar todos os módulos visuais, funcionais e de dados da aplicação.
// Estrategicamente alinhado ao novo fluxo otimizado de carregamento, filtragem e renderização da grade de transmissões.
// Cada módulo é inicializado em ordem lógica e funcional, garantindo performance, UX e manutenção facilitada.

// =====================
// IMPORTAÇÕES DE MÓDULOS
// =====================

// Carrossel de destaques (topo)
import { setupCarousel } from "https://xcam.gay/carousel.js";

// Menu responsivo (desktop/mobile)
import { setupMenu } from "https://xcam.gay/menu.js";

// Modal universal para transmissões ao clicar em um card
import { setupModal } from "https://xcam.gay/modal.js";

// Lógica e eventos de filtro (gênero, país, orientação, etc)
import { setupFilters } from "https://xcam.gay/filters.js";

// Inicialização da grade de transmissões (grid principal)
// Agora utiliza fluxo de placeholders, atualização incremental e fetch único da API principal
import { setupBroadcasts } from "https://xcam.gay/broadcasts.js";

// População dinâmica dos selects dos filtros (valores em inglês/código)
import { populateFilterOptions } from "https://xcam.gay/filters-populate.js";

// =====================
// FUNÇÃO PÚBLICA PARA REINICIALIZAR O APP
// =====================
/**
 * Reinicializa o estado da aplicação.
 * Útil após login, logout ou atualização de permissões.
 * Sempre respeita a ordem ideal: popula filtros, configura listeners e recarrega grid.
 */
export function initApp() {
  populateFilterOptions();
  setupFilters();
  setupBroadcasts();
}

// =====================
// INICIALIZAÇÃO DO APP AO CARREGAR O DOM
// =====================
document.addEventListener("DOMContentLoaded", () => {
  /*
    Ordem estratégica para funcionamento otimizado dos filtros e grade:
    1. Inicializa componentes visuais independentes da grade/filtros.
    2. Preenche selects dos filtros com valores corretos (API-ready).
    3. Configura listeners dos filtros.
    4. Inicializa a grid de transmissões, que já renderiza placeholders imediatamente.
    Observação: Não é necessário chamar refreshBroadcasts, pois setupBroadcasts já realiza o fetch inicial.
  */

  // Módulos visuais independentes
  setupCarousel();
  setupMenu();
  setupModal();

  // Filtros: popula opções e configura listeners ANTES da grid para garantir valores corretos
  populateFilterOptions();
  setupFilters();

  // Inicializa a grade de transmissões com placeholders e atualização incremental
  setupBroadcasts();
});

/*
🔍 Módulos integrados (revisado, 2025):

- carousel.js:
  Carrossel de destaques, rotação automática e controles manuais.

- menu.js:
  Menu principal e mobile, com toggle e responsividade.

- modal.js:
  Modal detalhado ao clicar em um card, carregando player XCam.

- filters.js:
  Aplica filtros robustos, enviando apenas valores válidos à API (nunca "all" ou em português).

- filters-populate.js:
  Preenche selects dos filtros com valores API-ready, labels amigáveis.

- broadcasts.js:
  Carrega transmissões da API única, renderiza placeholders (loading.gif), atualiza cards incrementalmente, nunca faz fetch individual, garante performance máxima e UX suave.

✅ Benefícios:
- Responsabilidade única por módulo.
- Inicialização em ordem lógica, evitando bugs de filtro e valores inválidos.
- Escalável para novos módulos e features.
- Estrutura robusta para manutenção, performance e clareza.

📦 Versão de referência: XCam Beta App V3.3 (grade otimizada, fetch único, placeholders, filtros robustos)
*/
