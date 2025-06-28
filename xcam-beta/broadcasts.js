/**
 * =====================================================================================
 * XCam - Grade de Transmissões (broadcasts.js)
 * =====================================================================================
 *
 * @author      Samuel Passamani / Um Projeto do Estudio A.Sério [AllS Company] 
 * @info        https://aserio.work/
 * @version     2.1.0
 * @lastupdate  28/06/2025
 *
 * @description
 * Este script é responsável por construir e gerenciar a grade principal de transmissões ao vivo do XCam.
 * Ele realiza a busca eficiente de transmissões, renderiza os cards de forma reativa e utiliza como poster seguro
 * (imagem de preview) um frame dinâmico extraído do endpoint seguro:
 *   https://api.xcam.gay/v1/media/poster/{username}
 * Isso garante compatibilidade máxima com CORS e Same-Origin Policy para uso direto em <img> ou <canvas>,
 * otimizando performance e experiência do usuário.
 * 
 * Principais estratégias implementadas:
 * - Busca robusta de transmissões (100+ de uma vez) com paginação local no frontend.
 * - Renderização dinâmica e segura dos posters de cada transmissão.
 * - Filtros e paginação totalmente controlados no frontend, sem recarregar a página.
 * - UI responsiva para estados de carregamento, erro e lista vazia.
 * - Cache persistente e inteligente de posters, acelerando o carregamento e reduzindo requisições.
 * 
 * =====================================================================================
 */

/* ============================================================================
 * 2. CONFIGURAÇÕES & VARIÁVEIS GLOBAIS
 * ========================================================================== */

// Importações necessárias
import { t } from "https://xcam.gay/i18n.js";
import { countryNames } from "https://xcam.gay/translations.js";

// Configurações editáveis e regras de comportamento
const CONFIG = {
  apiBaseUrl: "https://api.xcam.gay/",
  apiPosterUrl: "https://api.xcam.gay/v1/media/poster/",
  itemsPerPage: 20, // Quantidade de cards exibidos por lote na UI
  defaultPoster: "https://poster.xcam.gay/${username}",
  loadingGif: "https://xcam.gay/src/loading.gif",
};

// Novo parâmetro global para controlar o limite de transmissões requisitadas na API
const API_LIMIT = 25; // Quantidade máxima de transmissões buscadas por requisição

// Variáveis de controle global
let allItems = []; // Todas as transmissões buscadas da API
let renderedItemsCount = 0; // Quantos cards já foram renderizados
let grid; // Elemento DOM da grade principal

let filters = {
  gender: "",
  country: "",
  orientation: "",
  minViewers: null,
  tags: []
};

// Cache robusto para posters (memória + IndexedDB + fallback localStorage)
const posterCacheMemory = {};
const DB_NAME = "xcamPosterCache";
const STORE_NAME = "posters";
let dbPromise = null;

/* ============================================================================
 * 3. CORPO: FUNÇÕES E EXECUÇÃO PRINCIPAL
 * ========================================================================== */

// ---------- CACHE DE POSTERS ----------

// Abre/cria o banco IndexedDB para cache de posters
function openPosterDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
  });
  return dbPromise;
}

// Salva poster no cache (memória + IndexedDB + fallback localStorage)
async function setPosterInCache(username, url) {
  posterCacheMemory[username] = url;
  try {
    const db = await openPosterDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(url, username);
    tx.oncomplete = () => db.close && db.close();
  } catch (e) {
    try {
      localStorage.setItem(`poster_${username}`, url);
    } catch {}
  }
}

// Busca poster do cache (ordem: memória > IndexedDB > localStorage)
async function getPosterFromCache(username) {
  if (posterCacheMemory[username]) return posterCacheMemory[username];
  try {
    const db = await openPosterDB();
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(username);
      req.onsuccess = () => {
        if (req.result) posterCacheMemory[username] = req.result;
        resolve(req.result || null);
        db.close && db.close();
      };
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    try {
      const url = localStorage.getItem(`poster_${username}`);
      if (url) posterCacheMemory[username] = url;
      return url || null;
    } catch {
      return null;
    }
  }
}

// Limpa todo o cache de posters
async function clearPosterCache() {
  for (const k in posterCacheMemory) delete posterCacheMemory[k];
  try {
    const db = await openPosterDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => db.close && db.close();
  } catch {
    Object.keys(localStorage)
      .filter((k) => k.startsWith("poster_"))
      .forEach((k) => localStorage.removeItem(k));
  }
}

// Pré-carrega todos os posters do endpoint ?poster=0 e alimenta o cache
async function preloadAllPostersToCache() {
  try {
    const resp = await fetch("https://api.xcam.gay/?poster=0", {
      headers: { accept: "application/json" }
    });
    if (resp.ok) {
      const posters = await resp.json();
      window._xcamAllPosters = posters;
      for (const [username, obj] of Object.entries(posters)) {
        if (obj && typeof obj.fileUrl === "string" && obj.fileUrl.trim() !== "") {
          await setPosterInCache(username, obj.fileUrl);
        }
      }
    } else {
      window._xcamAllPosters = {};
    }
  } catch (err) {
    window._xcamAllPosters = {};
  }
}

// ---------- UTILITÁRIOS DOM ----------

// Cria elementos DOM de forma declarativa
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

// Garante referência ao elemento da grade
function ensureGridElement() {
  if (!grid) {
    grid = document.getElementById("broadcasts-grid");
  }
}

// ---------- ELEMENTOS DE UI REUTILIZÁVEIS ----------

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

// ---------- POSTER ----------

// Retorna a URL segura do poster do usuário
function getPosterUrl(username) {
  return `${CONFIG.apiPosterUrl}${username}`;
}

// Busca poster como blob para uso em <img src>
async function fetchPosterImageUrl(username) {
  try {
    const resp = await fetch(getPosterUrl(username), { mode: "cors" });
    if (!resp.ok) throw new Error("Poster não disponível");
    const blob = await resp.blob();
    return URL.createObjectURL(blob);
  } catch (err) {
    return CONFIG.defaultPoster;
  }
}

// ---------- ESTADOS DE UI (VAZIO/ERRO) ----------

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

// ---------- LÓGICA PRINCIPAL ----------

// Monta a URL da API conforme filtros ativos
function buildApiUrl(filters, limit = API_LIMIT) {
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

// Busca transmissões da API
async function fetchBroadcasts(limit = API_LIMIT) {
  try {
    const url = `${CONFIG.apiBaseUrl}?&limit=${limit}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Falha na requisição");
    const data = await response.json();
    if (data?.items) {
      return data.items;
    }
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

// Cria e renderiza um card de transmissão
async function renderBroadcastCard(data) {
  ensureGridElement();

  const username = data.username;
  const viewers = data.viewers ?? 0;
  const country = data.country || "xx";
  const tags = Array.isArray(data.tags) ? data.tags : [];
  const countryName = countryNames[country.toLowerCase()] || "Desconhecido";

  // Poster inicial (loading)
  let posterElement = createEl("img", {
    class: "poster-img",
    src: CONFIG.loadingGif,
    alt: `Poster da transmissão de ${username}`,
    loading: "lazy",
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      aspectRatio: "16/9",
      borderRadius: "8px",
      background: "#000",
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 1,
      transition: "opacity 0.2s"
    }
  });

  // Iframe de preview (hover)
  const previewIframe = createEl("iframe", {
    class: "poster-iframe",
    src: `https://live.xcam.gay/?user=${username}&mode=carousel`,
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
      borderRadius: "8px",
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 2,
      opacity: 0,
      pointerEvents: "none",
      transition: "opacity 0.2s"
    }
  });

  // Container thumbnail
  const thumbnailContainer = createEl("div", { class: "card-thumbnail", style: { position: "relative", width: "100%", height: "0", paddingBottom: "56.25%" } }, [
    posterElement,
    previewIframe,
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
  ]);

  // Card principal
  const card = createEl(
    "div",
    {
      class: "broadcast-card",
      role: "region",
      "aria-label": `Transmissão de ${username}`,
      "data-username": username
    },
    [
      thumbnailContainer,
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

  // Hover: mostra/oculta preview ao vivo
  card.addEventListener("mouseenter", () => {
    previewIframe.style.opacity = "1";
    previewIframe.style.pointerEvents = "auto";
    posterElement.style.opacity = "0";
  });
  card.addEventListener("mouseleave", () => {
    previewIframe.style.opacity = "0";
    previewIframe.style.pointerEvents = "none";
    posterElement.style.opacity = "1";
  });

  // Atualiza o poster assim que possível (ordem de prioridade)
  let posterSrc = null;
  if (
    typeof data.preview === "object" &&
    data.preview !== null &&
    typeof data.preview.poster === "string" &&
    data.preview.poster.trim() !== ""
  ) {
    posterSrc = data.preview.poster;
    setPosterInCache(username, posterSrc);
  }
  if (!posterSrc) {
    if (!window._xcamAllPosters) {
      try {
        const resp = await fetch("https://api.xcam.gay/?poster=0", {
          headers: { accept: "application/json" }
        });
        if (resp.ok) {
          window._xcamAllPosters = await resp.json();
        } else {
          window._xcamAllPosters = {};
        }
      } catch (err) {
        window._xcamAllPosters = {};
      }
    }
    if (
      window._xcamAllPosters &&
      window._xcamAllPosters[username] &&
      typeof window._xcamAllPosters[username].fileUrl === "string" &&
      window._xcamAllPosters[username].fileUrl.trim() !== ""
    ) {
      posterSrc = window._xcamAllPosters[username].fileUrl;
      setPosterInCache(username, posterSrc);
    }
  }
  if (!posterSrc) {
    posterSrc = await getPosterFromCache(username);
  }
  if (posterSrc) {
    posterElement.src = posterSrc;
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
    posterElement.replaceWith(iframe);
  }
}

// Renderiza o próximo lote de cards (paginado localmente)
function renderNextBatch() {
  ensureGridElement();
  const nextItems = allItems.slice(
    renderedItemsCount,
    renderedItemsCount + CONFIG.itemsPerPage
  );
  nextItems.forEach((item) => renderBroadcastCard(item));
  renderedItemsCount += nextItems.length;
  loadMoreBtn.style.display =
    renderedItemsCount >= allItems.length ? "none" : "block";
}

// Carrega e renderiza a grade com base nos filtros
async function loadFilteredBroadcasts() {
  renderedItemsCount = 0;
  allItems = [];
  ensureGridElement();
  grid.innerHTML = "";
  loader.remove();
  loadMoreBtn.remove();
  grid.appendChild(loader);

  try {
    // Busca até API_LIMIT transmissões da API
    const result = await fetchBroadcasts(API_LIMIT);
    loader.remove();

    if (!result.length) {
      showEmptyMessage();
      return;
    }

    allItems = result;
    renderNextBatch();

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
// ---------- EXPORTS (API DO MÓDULO) ----------

// Inicializa a grade e listeners
export function setupBroadcasts() {
  loadMoreBtn.addEventListener("click", renderNextBatch);
  loadFilteredBroadcasts();
}

// Força recarga da grade
export function refreshBroadcasts() {
  loadFilteredBroadcasts();
}

// Aplica filtros e recarrega a grade
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

// ---------- INICIALIZAÇÃO ----------

document.addEventListener("DOMContentLoaded", () => {
  grid = document.getElementById("broadcasts-grid");
  preloadAllPostersToCache();
});

/**
 * =====================================================================================
 * FIM DO SCRIPT
 * =====================================================================================
 *
 * @log de mudanças:
 * - v2.1.0 (20/06/2025): Substituído preview dinâmico via <iframe> por <img> seguro
 *   consumindo o endpoint de poster seguro. Agora todos os posters são carregados
 *   dinamicamente do backend seguro, prevenindo problemas de CORS e melhorando a UX.
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