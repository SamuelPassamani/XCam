// main.js
// Arquivo principal de bootstrap do XCam Beta App V3.2.
// Responsável por iniciar os módulos visuais, funcionais e de dados da aplicação.
// Totalmente alinhado ao novo fluxo de busca incremental, filtragem e resolução de imagens robusta da grade de transmissões.

// =====================
// IMPORTAÇÕES DE MÓDULOS
// =====================

// Carrossel de destaques no topo da página
import { setupCarousel } from "./carousel.js";

// Menu de navegação responsivo (desktop + mobile)
import { setupMenu } from "./menu.js";

// Modal universal que exibe a transmissão e detalhes do usuário ao clicar em um card
import { setupModal } from "./modal.js";

// Lógica e eventos de filtro (gênero, país, orientação etc) - só envia valores aceitos pela API
import { setupFilters } from "./filters.js";

// Inicialização da grade de transmissões (grid principal de cards)
// Agora realiza preload incremental e resolução inteligente de imagens
import { setupBroadcasts } from "./broadcasts.js";

// Popula dinamicamente os selects dos filtros com dados da API (países, gêneros etc) - só value em inglês/código
import { populateFilterOptions } from "./filters-populate.js";

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
    Ordem crítica para funcionamento correto dos filtros e grid:
    1. Popula selects dos filtros com valores em inglês/código (API-ready)
    2. Configura listeners dos filtros (setupFilters)
    3. Inicializa grid de transmissões (setupBroadcasts)
    O carrossel, menu e modal podem ser inicializados antes, pois não afetam filtros nem grade.
  */

  // Inicializa componentes visuais independentes do grid/filtros
  setupCarousel(); // Carrossel superior de destaques
  setupMenu();     // Menu de navegação responsivo
  setupModal();    // Modal universal

  // Preenche os filtros ANTES de configurar listeners para garantir selects corretos
  populateFilterOptions();

  // Configura listeners/lógica dos filtros (sempre no padrão aceito pela API)
  setupFilters();

  // Inicializa a grade de transmissões com busca incremental, fallback de imagens e integração total de filtros
  setupBroadcasts();

  // Observação: NÃO é necessário chamar refreshBroadcasts aqui, pois setupBroadcasts já realiza o primeiro fetch.
});

/*
🔍 Descrição dos módulos integrados (revisado, 2025):

- carousel.js:
  Controla o carrossel de slides de destaque com rotação automática e controles manuais.

- menu.js:
  Gerencia o menu principal e a versão mobile (hambúrguer), incluindo toggle e responsividade.

- modal.js:
  Abre um modal detalhado ao clicar em um card, carregando dados do usuário e exibindo o XCam Player integrado.

- filters.js:
  Aplica filtros ao conjunto de transmissões com base nos selects (gênero, país, etc).
  Os valores enviados à API são sempre em inglês/código e nunca "all" ou em português.

- filters-populate.js:
  Popula os selects dos filtros com valores em inglês/código (API-ready) e labels amigáveis em português.

- broadcasts.js:
  Responsável por carregar as transmissões da API, renderizar os cards, aplicar filtros, paginação e busca incremental.
  Implementa fallback inteligente de imagens (preview, avatar, profile, loading.gif).

✅ Benefícios desta arquitetura:
- Cada módulo tem responsabilidade única e bem definida.
- Inicialização em ordem lógica e funcional, evitando bugs de filtro e valores inválidos.
- Escalável: novos módulos podem ser adicionados sem reescrever a base.
- Clareza e facilidade de manutenção, com comentários descritivos e integração transparente entre fluxos de filtro, grid e UX.

📦 Versão de referência: XCam Beta App V3.2 (busca incremental, filtros robustos e imagens sempre válidas)
*/