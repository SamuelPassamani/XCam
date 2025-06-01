/**
 * XCam - main.js
 * Arquitetura modular, integração do novo modal e UX aprimorada
 * --------------------------------------------------------------
 * - Inicializa todos os módulos da interface, incluindo o novo modal
 * - Garante clean architecture, modularidade e fácil manutenção
 * - Comentários detalhados para clareza e onboarding de novos devs
 */

import { setupCarousel } from "./carousel.js";
import { setupMenu } from "./menu.js";
import { setupModal } from "./modal.js"; // Novo modal já no padrão moderno
import { setupFilters } from "./filters.js";
import { setupBroadcasts, refreshBroadcasts } from "./broadcasts.js";
import { populateFilterOptions } from "./filters-populate.js";

// Função principal de boot da aplicação (pode ser usada em testes/e2e)
export function initApp() {
  // Carrega transmissões iniciais
  refreshBroadcasts();
}

// Inicialização automática ao carregar a DOM
document.addEventListener("DOMContentLoaded", () => {
  // Carrossel principal do topo da home
  setupCarousel();

  // Menu fixo superior e menu mobile (incluindo responsividade)
  setupMenu();

  // Modal de transmissão, agora com padrão visual do novo modal.html
  setupModal();

  // Preenchimento dinâmico dos filtros (combos de país/gênero/orientação)
  populateFilterOptions();

  // Listeners de filtros (ações de filtrar, resetar, etc)
  setupFilters();

  // Inicialização da grade de transmissões: listeners, eventos, UX
  setupBroadcasts();

  // Carregamento inicial automático da grade de transmissões
  refreshBroadcasts();

  // Observação: caso haja integração com analytics, hotjar, etc., adicionar aqui.
});

/**
 * EXPLICAÇÕES DOS AJUSTES:
 * - setupModal agora é responsável por inserir e controlar o novo modal (estrutura, eventos, UX e acessibilidade)
 * - Nenhum código legado do modal antigo permanece neste arquivo
 * - Funções são organizadas por ordem de impacto visual na interface
 * - O código é preparado para testes e extensão futura (ex: integração de chat, login dinâmico, etc)
 */