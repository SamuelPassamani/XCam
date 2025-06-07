// main.js
// Arquivo principal de bootstrap do XCam Beta App V3.0.
// Responsável por iniciar os módulos visuais, funcionais e de dados da aplicação.

// =====================
// IMPORTAÇÕES DE MÓDULOS
// =====================

// Carrossel de destaques no topo da página
import { setupCarousel } from "./carousel.js";

// Menu de navegação responsivo (desktop + mobile)
import { setupMenu } from "./menu.js";

// Modal universal que exibe a transmissão e detalhes do usuário ao clicar em um card
import { setupModal } from "./modal.js";

// Lógica e eventos de filtro (gênero, país, orientação etc)
import { setupFilters } from "./filters.js";

// Inicialização da grade de transmissões (grid principal de cards)
import { setupBroadcasts } from "./broadcasts.js";

// Popula dinamicamente os selects dos filtros com dados da API (países, gêneros etc)
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
  // Etapa 1 — Componentes de estrutura base
  setupCarousel(); // Inicializa o carrossel superior de destaques
  setupMenu(); // Menu de navegação responsivo
  setupModal(); // Modal de exibição detalhada de transmissões

  // Etapa 2 — Preparação dos filtros
  // populateFilterOptions() deve rodar antes para garantir que os selects estejam populados
  populateFilterOptions();

  // Etapa 3 — Configuração de lógica dos filtros
  setupFilters();

  // Etapa 4 — Inicializa grade de transmissões
  // Esta função cuida do carregamento inicial da API, renderiza os cards e configura paginação
  setupBroadcasts();

  // Observação: NÃO é necessário chamar refreshBroadcasts aqui, pois setupBroadcasts já realiza o primeiro fetch.
});

/*
🔍 Descrição dos módulos integrados:

- carousel.js:
  Controla o carrossel de slides de destaque com rotação automática e controles manuais.

- menu.js:
  Gerencia o menu principal e a versão mobile (hambúrguer), incluindo toggle e responsividade.

- modal.js:
  Abre um modal detalhado ao clicar em um card, carregando dados do usuário e exibindo o XCam Player integrado.

- filters.js:
  Aplica filtros ao conjunto de transmissões com base nos selects (gênero, país, etc).

- filters-populate.js:
  Realiza fetch dinâmico dos valores dos filtros disponíveis via API e injeta nos selects.

- broadcasts.js:
  Responsável por carregar as transmissões da API, renderizar os cards, aplicar filtros e paginação.

✅ Benefícios desta arquitetura:
- Cada módulo tem responsabilidade única e bem definida.
- Inicialização em ordem lógica e funcional.
- Escalável: novos módulos podem ser adicionados sem reescrever a base.
- Clareza e facilidade de manutenção com comentários descritivos.

📦 Versão de referência: XCam Beta App V3.0
*/
