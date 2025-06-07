// main.js
// Arquivo principal de inicialização do frontend do XCam Beta.
// Responsável por orquestrar a configuração de todos os módulos de interface e dados.
// Cada função de setup inicializa um componente ou funcionalidade da página.

// Importação dos módulos responsáveis por partes da interface e lógica
import { setupCarousel } from "./carousel.js";              // Carrossel de destaques
import { setupMenu } from "./menu.js";                      // Menu responsivo e navegação
import { setupModal } from "./modal.js";                    // Modal universal para transmissões
import { setupFilters } from "./filters.js";                // Filtros de busca/seleção
import { setupBroadcasts } from "./broadcasts.js";          // Grade de transmissões ao vivo
import { populateFilterOptions } from "./filters-populate.js"; // Preenchimento dinâmico dos selects de filtro

/**
 * Função opcional para reinicializar o app.
 * Pode ser chamada de outros módulos se for necessário recarregar toda a interface (ex: após login/logout).
 */
export function initApp() {
  // Recarrega a grade de transmissões ao vivo
  setupBroadcasts();
}

// Aguarda o carregamento completo do DOM antes de inicializar os módulos.
// Isso garante que todos os elementos necessários já existam na página.
document.addEventListener("DOMContentLoaded", () => {
  // 1. Inicializa componentes visuais e estruturais
  setupCarousel();           // Carrossel de destaques, deve ser inicializado cedo para UX fluida
  setupMenu();               // Menu superior e menu mobile
  setupModal();              // Modal de exibição de transmissão individual

  // 2. Preenche dinamicamente os selects dos filtros (país, gênero, etc)
  // Importante rodar ANTES dos filtros, pois os filtros dependem dos selects populados
  populateFilterOptions();

  // 3. Inicializa a lógica dos filtros (event listeners, callbacks, etc)
  setupFilters();

  // 4. Inicializa a grade de transmissões ao vivo
  // Esta função configura a grade, listeners e faz o primeiro carregamento automático dos dados
  setupBroadcasts();

  // Observação:
  // Não é necessário chamar refreshBroadcasts() logo após setupBroadcasts(),
  // pois setupBroadcasts já faz o carregamento inicial.
});

/*
  Detalhamento dos módulos importados:

  - carousel.js: Gerencia o carrossel de banners/destaques, controles e rotação automática.
  - menu.js: Controla o menu de navegação superior e o menu mobile, incluindo toggle e responsividade.
  - modal.js: Modal universal para exibir detalhes das transmissões quando um card é clicado.
  - filters.js: Adiciona lógica de filtragem e aplica filtros selecionados na busca das transmissões.
  - filters-populate.js: Busca e popula dinamicamente os selects de filtro (ex: países disponíveis).
  - broadcasts.js: Gerencia toda a grade de transmissões ao vivo, filtragem, paginação e renderização dos cards.

  Boas práticas adotadas:
  - Ordem de inicialização respeita dependências entre módulos.
  - Apenas uma chamada de carregamento de transmissões para evitar fetch duplo.
  - Comentários explicativos para cada etapa do fluxo.
  - initApp exportada para uso futuro em outros pontos da aplicação, caso necessário.
*/