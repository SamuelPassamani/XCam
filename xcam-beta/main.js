// main.js
// Arquivo principal de bootstrap do XCam Beta App V3.0.
// Responsável por iniciar os módulos visuais, funcionais e de dados da aplicação
// Correções: garante que filtros e valores dos selects estejam SEMPRE no padrão aceito pela API.

// =====================
// IMPORTAÇÕES DE MÓDULOS
// =====================

// Carrossel de destaques no topo da página
import { setupCarousel } from "./carousel.js";

// Menu de navegação responsivo (desktop + mobile)
import { setupMenu } from "./menu.js";

// Modal universal que exibe a transmissão e detalhes do usuário ao clicar em um card
import { setupModal } from "./modal.js";

// Lógica e eventos de filtro (gênero, país, orientação etc) - agora só envia valores aceitos pela API
import { setupFilters } from "./filters.js";

// Inicialização da grade de transmissões (grid principal de cards)
import { setupBroadcasts } from "./broadcasts.js";

// Popula dinamicamente os selects dos filtros com dados da API (países, gêneros etc) - só value em inglês/código
import { populateFilterOptions } from "./filters-populate.js";

// =====================
// FUNÇÃO PÚBLICA PARA REINICIALIZAR O APP
// =====================
export function initApp() {
  // Esta função pode ser reutilizada para reinicializar o estado da aplicação
  // Exemplo de uso: após login, logout ou atualização de permissões
  setupBroadcasts();
}

// =====================
// INICIALIZAÇÃO DO APP AO CARREGAR O DOM
// =====================
document.addEventListener("DOMContentLoaded", () => {
  /*
    Ordem crítica para funcionamento correto dos filtros:
    1. Popula selects dos filtros com valores em inglês/código (API-ready)
    2. Configura listeners dos filtros (setupFilters)
    3. Inicializa grid de transmissões (setupBroadcasts)
    O carrossel, menu e modal podem ser inicializados antes, pois não afetam os filtros.
  */
  setupCarousel(); // Inicializa o carrossel superior de destaques
  setupMenu();     // Menu de navegação responsivo
  setupModal();    // Modal de exibição detalhada de transmissões

  // Popula os filtros ANTES de setupFilters para garantir que os selects tenham opções corretas
  populateFilterOptions();

  // Configura os listeners/lógica dos filtros (agora só aceita valores da API)
  setupFilters();

  // Inicializa grade de transmissões (carrega cards e configura paginação)
  setupBroadcasts();

  // Observação: NÃO é necessário chamar refreshBroadcasts aqui, pois setupBroadcasts já realiza o primeiro fetch.
});

/*
🔍 Descrição dos módulos integrados (revisado):

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
  Responsável por carregar as transmissões da API, renderizar os cards, aplicar filtros e paginação.
  Sempre usa valores aceitos pela API.

✅ Benefícios desta arquitetura:
- Cada módulo tem responsabilidade única e bem definida.
- Inicialização em ordem lógica e funcional.
- Evita bugs de filtro e valores inválidos enviados à API.
- Escalável: novos módulos podem ser adicionados sem reescrever a base.
- Clareza e facilidade de manutenção com comentários descritivos.

📦 Versão de referência: XCam Beta App V3.1 (corrigida para valores de filtro em inglês/código)
*/