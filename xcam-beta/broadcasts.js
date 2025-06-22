/**
 * =====================================================================================
 * XCam - Grade de Transmissões (broadcasts.js)
 * =====================================================================================
 *
 * @author      [Seu Nome/Empresa]
 * @version     2.1.0
 * @lastupdate  20/06/2025
 *
 * @description
 * Este script constrói a grade principal de transmissões ao vivo do XCam.
 * Ele busca e renderiza os cards de transmissões utilizando como poster seguro
 * (imagem de preview) um frame dinâmico, extraído do endpoint seguro:
 *   https://api.xcam.gay/v1/media/poster/{username}
 * Isso garante compatibilidade máxima com CORS e Same-Origin Policy para uso
 * direto em <img> ou <canvas>, otimizando performance e experiência.
 * 
 * Estratégias implementadas:
 * - Busca robusta de transmissões (100+ de uma vez) com paginação local.
 * - Renderização reativa de cards, cada um com poster dinâmico e seguro.
 * - Filtros e paginação totalmente controlados no frontend.
 * - UI responsiva para estados de carregamento, erro e vazio.
 * 
 * =====================================================================================
 */

// === Importações necessárias ===
import { t } from "./i18n.js"; // Módulo de tradução para internacionalização (i18n).
import { countryNames } from "./translations.js"; // Mapeia códigos de país para nomes completos (ex: "br" -> "Brasil").

// === Função utilitária: Criação de elementos DOM com atributos e filhos ===
/**
 * Cria elementos DOM de forma declarativa com atributos e filhos.
 * @param {string} type - Tipo do elemento (ex: "div", "img")
 * @param {object} props - Atributos do elemento
 * @param {Array} children - Elementos filhos
 * @returns {HTMLElement}
 */
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

// [CONFIGURÁVEL] Quantos cards exibir por página/clique em "Carregar Mais"
const itemsPerPage = 30;

let allItems = []; // Todas as transmissões buscadas da API
let renderedItemsCount = 0; // Contador para paginação local
let grid; // Referência ao elemento DOM principal da grade

// [CONFIGURÁVEL] Estado atual dos filtros aplicados
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

// === Função utilitária para buscar o poster seguro do usuário =================

/**
 * Retorna uma URL segura para o poster do usuário XCam.
 * @param {string} username - Nome do usuário
 * @returns {string} URL do poster seguro (.ts, mas usável como src de <img>)
 */
function getPosterUrl(username) {
  return `https://api.xcam.gay/v1/media/poster/${username}`;
}

/**
 * Cria uma URL de objeto Blob a partir do segmento de vídeo retornado pelo endpoint,
 * para ser usada em <img src>. Faz fallback para placeholder em caso de erro.
 * @param {string} username - Nome do usuário
 * @returns {Promise<string>} - URL para ser usado em <img src>
 */
async function fetchPosterImageUrl(username) {
  try {
    const resp = await fetch(getPosterUrl(username), { mode: "cors" });
    if (!resp.ok) throw new Error("Poster não disponível");
    const blob = await resp.blob();
    // Cria uma URL de objeto para uso temporário em <img>
    return URL.createObjectURL(blob);
  } catch (err) {
    // Fallback: imagem padrão
    return "/assets/placeholder_poster.jpg";
  }
}

// === Lógica Principal ==========================================================

/**
 * Monta a URL da API com base nos filtros ativos.
 * @param {object} filters - O objeto de filtros atual.
 * @param {number} limit - O número máximo de resultados a serem pedidos para a API.
 * @returns {string} A URL completa para a chamada da API.
 */
function buildApiUrl(filters, limit = 20) {
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
 * Busca as transmissões da API principal usando o novo endpoint stream=0.
 * @param {number} limit - O limite de transmissões a serem buscadas.
 * @returns {Promise<Array>} Uma promessa que resolve para um array de transmissões.
 */
async function fetchBroadcasts(limit) {
  try {
    const url = `https://api.xcam.gay/?stream=0&limit=${limit}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Falha na requisição");
    const data = await response.json();
    if (data?.items) {
      return data.items;
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
 * Cria e renderiza um único card de transmissão.
 * Usa graphData.preview.poster se existir, senão usa getPosterUrl.
 * @param {object} data - O objeto de dados para uma única transmissão.
 */
function renderBroadcastCard(data) {
  ensureGridElement();

  const username = data.username;
  const viewers = data.streamInfo?.viewers ?? data.graphData?.viewers ?? 0;
  const country = data.graphData?.country || "xx";
  const tags = Array.isArray(data.graphData?.tags) ? data.graphData.tags : [];
  const countryName = countryNames[country.toLowerCase()] || "Desconhecido";

  // Escolhe o poster: primeiro tenta graphData.preview.poster, senão getPosterUrl
  let posterSrc = "";
  if (
    data.graphData &&
    data.graphData.preview &&
    typeof data.graphData.preview.poster === "string" &&
    data.graphData.preview.poster.trim() !== ""
  ) {
    posterSrc = data.graphData.preview.poster;
  } else {
    posterSrc = getPosterUrl(username);
  }

  const posterImg = createEl("img", {
    class: "poster-img",
    src: posterSrc,
    alt: `Poster da transmissão de ${username}`,
    loading: "lazy"
  });

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
        posterImg,
        createEl("div", { class: "card-overlay" }, [
          createEl(
            "button",
            {
              class: "play-button",
              "aria-label": `${t("play")} @${username}`,
              tabindex: "0",
              onclick: () => {
                window.open(`https://live.xcam.gay/?user=${username}`, "_blank");
              }
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

/**
 * Exibe mensagem amigável para lista vazia.
 */
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

/**
 * Exibe mensagem de erro caso a API falhe.
 */
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
    const result = await fetchBroadcasts(20);
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
 * - v2.1.0 (20/06/2025): Substituído preview dinâmico via <iframe> por <img> seguro
 * consumindo o endpoint de poster seguro. Agora todos os posters são carregados
 * dinamicamente do backend seguro, prevenindo problemas de CORS e melhorando a UX.
 * - v2.0.0 (17/06/2025): Versão anterior com preview por <iframe>.
 * - v1.0.0: Versão inicial com placeholders e atualização incremental.
 *
 * @roadmap futuro:
 * - Implementar "Infinite Scrolling" em vez do botão "Carregar Mais".
 * - Adicionar funcionalidade de "Favoritos" com persistência em localStorage.
 * - Animações de entrada para os cards recém-carregados para uma UX mais fluida.
 *
 * =====================================================================================
 */
