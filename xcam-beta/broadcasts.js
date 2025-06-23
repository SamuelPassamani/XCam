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

// === CONFIGURAÇÕES GLOBAIS E VARIÁVEIS DE CONTROLE ==============================
const CONFIG = {
  // Quantos cards exibir por página/clique em "Carregar Mais"
  itemsPerPage: 30,
  // Quantos itens buscar por requisição à API
  apiFetchLimit: 60,
  // URL base da API
  apiBaseUrl: "https://api.xcam.gay/",
  // URL base para posters seguros
  posterBaseUrl: "https://api.xcam.gay/v1/media/poster/",
  // Placeholder para poster
  posterPlaceholder: "/assets/placeholder_poster.jpg"
};

let allItems = []; // Todas as transmissões buscadas da API
let renderedItemsCount = 0; // Contador para paginação local
let grid; // Referência ao elemento DOM principal da grade

// Estado atual dos filtros aplicados
let filters = {
  gender: "",
  country: "",
  orientation: "",
  minViewers: null,
  tags: []
};
// =================================================================================

// === Importações necessárias ===
import { t } from "./i18n.js"; // Módulo de tradução para internacionalização (i18n).
import { countryNames } from "./translations.js"; // Mapeia códigos de país para nomes completos (ex: "br" -> "Brasil").

// === Função utilitária: Criação de elementos DOM com atributos e filhos ===
/**
 * Cria elementos DOM de forma declarativa com atributos e filhos.
 * Compatível com navegadores modernos e antigos.
 * @param {string} type - Tipo do elemento (ex: "div", "img")
 * @param {object} props - Atributos do elemento
 * @param {Array} children - Elementos filhos
 * @returns {HTMLElement}
 */
function createEl(type, props = {}, children = []) {
  const el = document.createElement(type);

  Object.entries(props).forEach(([key, value]) => {
    if (key === "text") {
      el.textContent = value;
    } else if (key === "html") {
      el.innerHTML = value;
    } else if (key.startsWith("on") && typeof value === "function") {
      // Exemplo: onClick, onMouseOver
      // Converte para minúsculo e adiciona como ouvinte de evento
      const eventName = key.slice(2).toLowerCase();
      el.addEventListener(eventName, value, false);
    } else if (key === "class") {
      el.className = value;
    } else if (key === "style" && typeof value === "object") {
      // Permite passar um objeto de estilos
      Object.assign(el.style, value);
    } else if (key in el) {
      // Para propriedades DOM conhecidas (ex: id, value, tabindex)
      el[key] = value;
    } else {
      // Fallback para setAttribute (ex: data-*, aria-*)
      el.setAttribute(key, value);
    }
  });

  (children || []).forEach((child) => {
    if (child) el.appendChild(child);
  });

  return el;
}

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
  return `${CONFIG.posterBaseUrl}${username}`;
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
    return CONFIG.posterPlaceholder;
  }
}

// === Lógica Principal ==========================================================
/**
 * Monta a URL da API com base nos filtros ativos.
 * @param {object} filters - O objeto de filtros atual.
 * @param {number} limit - O número máximo de resultados a serem pedidos para a API.
 * @returns {string} A URL completa para a chamada da API.
 */
function buildApiUrl(filters, limit = CONFIG.apiFetchLimit) {
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
  return `${CONFIG.apiBaseUrl}?${params.toString()}`;
}

/**
 * Busca as transmissões da API principal usando o novo endpoint stream=0.
 * @param {number} limit - O limite de transmissões a serem buscadas.
 * @returns {Promise<Array>} Uma promessa que resolve para um array de transmissões.
 */
async function fetchBroadcasts(limit = CONFIG.apiFetchLimit) {
  try {
    const url = buildApiUrl(filters, limit);
    const response = await fetch(url);
    if (!response.ok) throw new Error("Falha na requisição");
    const data = await response.json();
    // Garante que sempre retorna um array, mesmo se não houver items
    if (data?.broadcasts && Array.isArray(data.broadcasts.items)) {
      return data.broadcasts.items;
    }
    // Se não houver items, retorna array vazio e loga o caminho real
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
 * Obtém a melhor URL de poster para o usuário seguindo o fluxo de prioridades:
 * 1. preview.poster da API principal
 * 2. fileUrl da API ?poster={username}
 * 3. getPosterUrl(username) como fallback
 * @param {object} data - Objeto de transmissão (item)
 * @returns {Promise<string>} - URL do poster
 */
async function resolvePosterSrc(data) {
  const username = data.username;

  // 1. Tenta usar preview.poster da API principal
  if (
    typeof data.preview === "object" &&
    data.preview !== null &&
    typeof data.preview.poster === "string" &&
    data.preview.poster.trim() !== ""
  ) {
    return data.preview.poster;
  }

  // 2. Tenta buscar fileUrl via API ?poster={username}
  try {
    const resp = await fetch(`https://api.xcam.gay/?poster=${encodeURIComponent(username)}`, {
      headers: { accept: "application/json" }
    });
    if (resp.ok) {
      const json = await resp.json();
      // O formato esperado é { "USERNAME": { fileUrl: "..." } }
      if (
        json &&
        typeof json === "object" &&
        json[username] &&
        typeof json[username].fileUrl === "string" &&
        json[username].fileUrl.trim() !== ""
      ) {
        return json[username].fileUrl;
      }
    }
  } catch (err) {
    // Silencia erro, segue para fallback
  }

  // 3. Fallback: getPosterUrl
  return getPosterUrl(username);
}

/**
 * Cria e renderiza um único card de transmissão.
 * Usa o fluxo de prioridades para obter o poster.
 * @param {object} data - O objeto de dados para uma única transmissão.
 */
async function renderBroadcastCard(data) {
  ensureGridElement();

  const username = data.username;
  const viewers = data.viewers ?? 0;
  const country = data.country || "xx";
  const tags = Array.isArray(data.tags) ? data.tags : [];
  const countryName = countryNames[country.toLowerCase()] || "Desconhecido";

  // Cria o elemento do poster com o loading.gif como src inicial
  const posterImg = createEl("img", {
    class: "poster-img",
    src: "https://xcam.gay/src/loading.gif",
    alt: `Poster da transmissão de ${username}`,
    loading: "lazy",
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      aspectRatio: "16/9",
      borderRadius: "8px",
      background: "#000"
    }
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

  // Após renderizar, busca o poster definitivo e atualiza o src
  // 1. Tenta obter do IndexedDB
  let posterSrc = await getPosterFromCache(username);

  // 2. preview.poster da API principal
  if (!posterSrc &&
    typeof data.preview === "object" &&
    data.preview !== null &&
    typeof data.preview.poster === "string" &&
    data.preview.poster.trim() !== ""
  ) {
    posterSrc = data.preview.poster;
    setPosterInCache(username, posterSrc);
  }

  // 3. fileUrl via API ?poster={username}
  if (!posterSrc) {
    try {
      const resp = await fetch(`https://api.xcam.gay/?poster=${encodeURIComponent(username)}`, {
        headers: { accept: "application/json" }
      });
      if (resp.ok) {
        const json = await resp.json();
        if (
          json &&
          typeof json === "object" &&
          json[username] &&
          typeof json[username].fileUrl === "string" &&
          json[username].fileUrl.trim() !== ""
        ) {
          posterSrc = json[username].fileUrl;
          setPosterInCache(username, posterSrc);
        }
      }
    } catch (err) {
      // Silencia erro, segue para fallback
    }
  }

  // 4. Se não conseguiu, usa <iframe> como fallback
  if (posterSrc) {
    posterImg.src = posterSrc;
  } else {
    const iframe = createEl("iframe", {
      class: "poster-iframe",
      src: `https://live.xcam.gay/?user=${username}&mode=preview`,
      title: `Prévia de @${username}`,
      loading: "lazy",
      allow: "autoplay; encrypted-media",
      frameborder: "0",
      tabindex: "-1",
      "aria-hidden": "true",
      style: {
        width: "100%",
        height: "100%",
        aspectRatio: "16/9",
        display: "block",
        background: "#000",
        borderRadius: "8px"
      }
    });
    posterImg.replaceWith(iframe);
  }
}

/**
 * Renderiza o próximo lote de cards com base na paginação local.
 * Agora suporta cards assíncronos.
 */
async function renderNextBatch() {
  ensureGridElement();

  const nextItems = allItems.slice(
    renderedItemsCount,
    renderedItemsCount + CONFIG.itemsPerPage
  );
  // Renderiza cards de forma assíncrona (aguarda cada poster)
  for (const item of nextItems) {
    await renderBroadcastCard(item);
  }
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
  if (loader.parentElement) loader.remove();
  if (loadMoreBtn.parentElement) loadMoreBtn.remove();
  grid.appendChild(loader);

  try {
    // 2. Busca um lote grande de transmissões para trabalhar localmente.
    const result = await fetchBroadcasts(CONFIG.apiFetchLimit);
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
