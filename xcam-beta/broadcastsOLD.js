/**
 * =====================================================================================
 * XCam - Grade de Transmissões (broadcasts.js)
 * =====================================================================================
 *
 * @author      [Seu Nome/Empresa]
 * @version     2.0.0
 * @lastupdate  17/06/2025
 *
 * @description Este script é o coração da página principal do XCam. Ele é responsável
 * por buscar a lista de todas as transmissões ao vivo disponíveis através
 * de uma única chamada à API, renderizar os cards na tela e gerenciar os
 * filtros de usuário e a paginação (botão "Carregar Mais").
 *
 * @strategy    A estratégia foi otimizada para performance máxima e experiência do usuário:
 * 1. **Chamada Única**: Em vez de múltiplas requisições, fazemos uma chamada
 * robusta para a API para buscar um grande lote de transmissões.
 * 2. **Paginação Local**: A paginação é gerenciada no lado do cliente
 * (frontend), tornando a ação de "Carregar Mais" instantânea.
 * 3. **Renderização Direta com Iframe**: Cada card de transmissão agora
 * utiliza um `iframe` que aponta para um player de preview dedicado,
 * substituindo a imagem estática por um preview de vídeo real e dinâmico.
 *
 * =====================================================================================
 */

// === Importações necessárias ===
import { t } from "./i18n.js"; // Módulo de tradução para internacionalização (i18n).
import { countryNames } from "./translations.js"; // Mapeia códigos de país para nomes completos (ex: "br" -> "Brasil").

// === Função utilitária: Criação de elementos DOM com atributos e filhos ===
function createEl(type, props = {}, children = []) {
  const el = document.createElement(type);
  Object.entries(props).forEach(([key, value]) => {
    if (key === "text") el.textContent = value;
    else if (key === "html") el.innerHTML = value;
    else if (key.startsWith("on") && typeof value === "function")
      el[key] = value;
    else el.setAttribute(key, value);
  });
  children.forEach((child) => child && el.appendChild(child));
  return el;
}

// === Variáveis de Controle e Configurações Globais ===============================

// [CONFIGURÁVEL] Define quantos cards são exibidos por página/clique no "Carregar Mais".
const itemsPerPage = 30;

let allItems = []; // Array que armazena TODAS as transmissões buscadas da API.
let renderedItemsCount = 0; // Contador para controlar a paginação local.
let grid; // Referência ao elemento DOM da grade, inicializado no 'DOMContentLoaded'.

// [CONFIGURÁVEL] Objeto que armazena o estado atual dos filtros aplicados.
let filters = {
  gender: "",
  country: "",
  orientation: "",
  minViewers: null,
  tags: []
};
// =================================================================================

// === Elementos de UI reutilizáveis ===
const loader = createEl("div", { class: "loading-state" }, [
  createEl("div", { class: "loader" }),
  createEl("p", { text: t("loading") })
]);

const loadMoreBtn = createEl(
  "button",
  {
    id: "load-more",
    class: "load-more-button",
    "aria-label": t("loadMore")
  },
  [createEl("span", { text: t("loadMore") })]
);
loadMoreBtn.style.display = "none";

// === Lógica Principal ==========================================================

/**
 * Monta a URL da API com base nos filtros ativos.
 * @param {object} filters - O objeto de filtros atual.
 * @param {number} limit - [CONFIGURÁVEL] O número máximo de resultados a serem pedidos para a API.
 * @returns {string} A URL completa para a chamada da API.
 */
function buildApiUrl(filters, limit = 100) {
  // Busca um lote maior para paginação local.
  const params = new URLSearchParams({
    limit: String(limit),
    format: "json"
  });
  if (filters.gender && filters.gender !== "all")
    params.set("gender", filters.gender);
  if (filters.country && filters.country !== "all")
    params.set("country", filters.country);
  if (filters.orientation && filters.orientation !== "all")
    params.set("orientation", filters.orientation);
  if (filters.minViewers !== undefined && !isNaN(filters.minViewers))
    params.set("minViewers", filters.minViewers);
  if (Array.isArray(filters.tags) && filters.tags.filter(Boolean).length > 0)
    params.set("tags", filters.tags.filter(Boolean).join(","));
  return `https://api.xcam.gay/?${params.toString()}`;
}

/**
 * Busca as transmissões da API principal.
 * @param {number} limit - O limite de transmissões a serem buscadas.
 * @returns {Promise<Array>} Uma promessa que resolve para um array de transmissões.
 */
async function fetchBroadcasts(limit) {
  try {
    const url = buildApiUrl(filters, limit);
    const response = await fetch(url);
    if (!response.ok) throw new Error("Falha na requisição");
    const data = await response.json();
    if (data?.broadcasts?.items) {
      return data.broadcasts.items;
    }
    console.warn("Formato inesperado da resposta:", data);
    return [];
  } catch (error) {
    console.error("Erro ao carregar transmissões:", error);
    showErrorMessage();
    return [];
  }
}

// Garante que a variável `grid` tenha uma referência ao elemento DOM.
function ensureGridElement() {
  if (!grid) {
    grid = document.getElementById("broadcasts-grid");
  }
}

/**
 * Cria e renderiza um único card de transmissão na grade.
 * @param {object} data - O objeto de dados para uma única transmissão.
 */
function renderBroadcastCard(data) {
  ensureGridElement();

  const username = data.username;
  const viewers = data.viewers;
  const country = data.country || "xx";
  const tags = Array.isArray(data.tags) ? data.tags : [];
  const countryName = countryNames[country.toLowerCase()] || "Desconhecido";

  // [PONTO CHAVE] URL do iframe para o player de preview.
  const previewUrl = `https://live.xcam.gay/?user=${username}&mode=preview`;

  const card = createEl(
    "div",
    {
      class: "broadcast-card",
      role: "region",
      "aria-label": `Transmissão de ${username}`,
      "data-username": username
    },
    [
      createEl("div", { class: "card-thumbnail" }, [
        // MODIFICAÇÃO PRINCIPAL: Usa um iframe para o preview de vídeo dinâmico.
        createEl("iframe", {
          src: previewUrl,
          title: `Prévia da transmissão de ${username}`,
          loading: "lazy", // Otimização de performance: carrega o iframe apenas quando visível.
          frameborder: "0",
          scrolling: "no",
          allow: "autoplay; muted" // Permissões necessárias para o preview funcionar.
        }),
        createEl("div", { class: "card-overlay" }, [
          createEl(
            "button",
            {
              class: "play-button",
              "aria-label": `${t("play")} @${username}`,
              tabindex: "0"
            },
            [createEl("i", { class: "fas fa-play", "aria-hidden": "true" })]
          )
        ]),
        createEl("div", { class: "live-badge", "aria-label": t("live") }, [
          createEl("span", { text: t("live") })
        ])
      ]),
      createEl("div", { class: "card-info" }, [
        createEl("div", { class: "card-header" }, [
          createEl("h4", {
            class: "card-username",
            tabindex: "0",
            text: `@${username}`
          }),
          createEl("div", { class: "card-country" }, [
            createEl("img", {
              src: `https://flagcdn.com/24x18/${country}.png`,
              alt: `País: ${countryName}`,
              title: countryName
            })
          ])
        ]),
        createEl("div", { class: "card-viewers" }, [
          createEl("i", { class: "fas fa-eye", "aria-hidden": "true" }),
          createEl("span", { text: ` ${viewers} ${t("viewers")}` })
        ]),
        createEl(
          "div",
          { class: "card-tags" },
          tags.map((tag) =>
            createEl("span", {
              class: "tag",
              text: `#${typeof tag === "string" ? tag : tag.name}`
            })
          )
        )
      ])
    ]
  );
  grid.appendChild(card);
}

/**
 * Renderiza o próximo lote de cards com base na paginação local.
 */
function renderNextBatch() {
  ensureGridElement();

  const nextItems = allItems.slice(
    renderedItemsCount,
    renderedItemsCount + itemsPerPage
  );
  nextItems.forEach((item) => renderBroadcastCard(item));
  renderedItemsCount += nextItems.length;

  // Mostra ou esconde o botão "Carregar mais" se chegamos ao fim da lista.
  loadMoreBtn.style.display =
    renderedItemsCount >= allItems.length ? "none" : "block";
}

// === Funções de Estado da UI (Vazio, Erro) ===

function showEmptyMessage() {
  ensureGridElement();
  grid.innerHTML = "";
  const empty = createEl(
    "div",
    { class: "empty-state", "aria-live": "polite" },
    [
      createEl("i", {
        class: "fas fa-info-circle empty-icon",
        "aria-hidden": "true"
      }),
      createEl("h3", { text: t("noBroadcasts.title") }),
      createEl("p", { text: t("noBroadcasts.description") })
    ]
  );
  grid.appendChild(empty);
}

function showErrorMessage() {
  ensureGridElement();
  grid.innerHTML = "";
  const errorDiv = createEl(
    "div",
    { class: "error-state", "aria-live": "assertive" },
    [
      createEl("i", {
        class: "fas fa-exclamation-triangle",
        "aria-hidden": "true"
      }),
      createEl("h3", { text: t("error.title") }),
      createEl("p", { text: t("error.description") })
    ]
  );
  grid.appendChild(errorDiv);
}

/**
 * Orquestra o carregamento inicial ou a recarga da grade com base nos filtros.
 */
async function loadFilteredBroadcasts() {
  // 1. Reseta o estado atual para uma nova busca.
  renderedItemsCount = 0;
  allItems = [];
  ensureGridElement();
  grid.innerHTML = "";
  loader.remove();
  loadMoreBtn.remove();
  grid.appendChild(loader);

  try {
    // 2. Busca um lote grande de transmissões para trabalhar localmente.
    const result = await fetchBroadcasts(100);
    loader.remove();

    if (!result.length) {
      showEmptyMessage();
      return;
    }

    // 3. Renderiza a primeira página e prepara as próximas.
    allItems = result;
    renderNextBatch(); // Renderiza a primeira página de 'itemsPerPage' cards.

    // 4. Adiciona o botão "Carregar Mais" se houver mais itens para mostrar.
    if (allItems.length > renderedItemsCount) {
      grid.parentElement.appendChild(loadMoreBtn);
      loadMoreBtn.style.display = "block";
    }
  } catch (err) {
    console.error("Erro ao processar transmissões:", err);
    loader.remove();
    showErrorMessage();
  }
}

// === Funções Públicas (API do Módulo) =========================================

/**
 * Inicializa a grade de transmissões e adiciona os event listeners.
 */
export function setupBroadcasts() {
  loadMoreBtn.addEventListener("click", renderNextBatch);
  loadFilteredBroadcasts();
}

/**
 * Força a recarga completa da grade, útil para um botão de "Atualizar".
 */
export function refreshBroadcasts() {
  loadFilteredBroadcasts();
}

/**
 * Aplica um novo conjunto de filtros e recarrega a grade.
 * @param {object} newFilters - O novo objeto de filtros a ser aplicado.
 */
export function applyBroadcastFilters(newFilters) {
  filters = {
    ...filters,
    ...Object.fromEntries(
      Object.entries(newFilters).filter(
        ([_, v]) => v !== undefined && v !== null && v !== "" && v !== "all"
      )
    )
  };
  loadFilteredBroadcasts();
}
// =================================================================================

// === Inicialização do Script ===
document.addEventListener("DOMContentLoaded", () => {
  grid = document.getElementById("broadcasts-grid");
});

/**
 * =====================================================================================
 * FIM DO SCRIPT
 * =====================================================================================
 *
 * @log de mudanças:
 * - v2.0.0 (17/06/2025): Substituída a renderização de imagem estática (`<img>`) por
 * `<iframe>` para exibir um player de preview dinâmico. Lógica de placeholders
 * removida em favor da renderização direta. Paginação agora é 100% local após
 * uma busca inicial mais robusta.
 * - v1.0.0: Versão inicial com placeholders e atualização incremental.
 *
 * @roadmap futuro:
 * - Implementar "Infinite Scrolling" em vez do botão "Carregar Mais".
 * - Adicionar funcionalidade de "Favoritos" com persistência em localStorage.
 * - Animações de entrada para os cards recém-carregados para uma UX mais fluida.
 *
 * =====================================================================================
 */
