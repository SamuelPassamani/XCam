// broadcasts.js
// Responsável por carregar, filtrar e renderizar a grade de transmissões ao vivo com pré-carregamento de imagens robusto.
// Implementa fallback progressivo para imagens e busca individual de dados detalhados por usuário, conforme estratégia XCam 2025.

// === Importações necessárias ===
import { t } from "./i18n.js"; // Função de tradução (labels/UX)
import { countryNames } from "./translations.js"; // Map. código país → nome completo

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

// === Variáveis de controle de paginação e filtros ===
let currentPage = 1;
const itemsPerPage = 30;
let allItems = [];
let grid;

// Filtros padrão: todos em branco para buscar "todos" por padrão
let filters = {
  gender: "",
  country: "",
  orientation: "",
  minViewers: null,
  tags: []
};

// Imagem padrão XCam (terceira opção de fallback)
const FALLBACK_IMAGE = "https://xcam.gay/src/loading.gif";
// Imagem default do CAM4 que NÃO deve ser usada
const BAD_DEFAULT_IMAGE = "https://cam4-static-test.xcdnpro.com/web/images/defaults/default_Male.png";

// === Elementos de carregamento e botão "Carregar mais" ===
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

// === Função: Monta a URL da API com base nos filtros aplicados ===
function buildApiUrl(filters, page = 1, limit = itemsPerPage) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    format: "json"
  });
  if (filters.gender && filters.gender !== "all") params.set("gender", filters.gender);
  if (filters.country && filters.country !== "all") params.set("country", filters.country);
  if (filters.orientation && filters.orientation !== "all") params.set("orientation", filters.orientation);
  if (filters.minViewers !== undefined && !isNaN(filters.minViewers)) params.set("minViewers", filters.minViewers);
  if (Array.isArray(filters.tags) && filters.tags.filter(Boolean).length > 0)
    params.set("tags", filters.tags.filter(Boolean).join(","));
  return `https://api.xcam.gay/?${params.toString()}`;
}

// === Função: Busca as transmissões básicas da API (página x) ===
async function fetchBroadcastsPage(page = 1, limit = itemsPerPage) {
  try {
    const url = buildApiUrl(filters, page, limit);
    const response = await fetch(url);
    if (!response.ok) throw new Error("Falha na requisição");
    const data = await response.json();
    if (
      data &&
      typeof data === "object" &&
      data.broadcasts &&
      Array.isArray(data.broadcasts.items)
    ) {
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

// === Função: Busca dados detalhados para cada transmissão individual ===
async function fetchUserDetails(username) {
  try {
    const url = `https://api.xcam.gay/?user=${encodeURIComponent(username)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Erro ao buscar dados detalhados");
    const data = await response.json();
    return data;
  } catch (e) {
    console.warn(`Falha ao obter detalhes de ${username}:`, e);
    return null;
  }
}

// === Função: Resolve a melhor imagem possível para o card ===
function resolvePreviewImage(userData) {
  // graphData vem da resposta detalhada
  const graph = userData && userData.graphData ? userData.graphData : {};
  const profile = userData && userData.profileInfo ? userData.profileInfo : {};

  // 1. preview.poster (preferencial)
  let poster = graph.preview && graph.preview.poster ? graph.preview.poster : null;
  // 2. avatarUrl
  let avatar = profile.avatarUrl || null;
  // 3. profileImageURL
  let profileImg = graph.profileImageURL || profile.profileImageUrl || null;

  // Não usar BAD_DEFAULT_IMAGE
  [poster, avatar, profileImg] = [poster, avatar, profileImg].map(img =>
    img === BAD_DEFAULT_IMAGE ? null : img
  );

  // Retorna o primeiro válido, senão fallback
  return poster || avatar || profileImg || FALLBACK_IMAGE;
}

// Garantia defensiva de que o grid está inicializado
function ensureGridElement() {
  if (!grid) {
    grid = document.getElementById("broadcasts-grid");
  }
}

// === Função: Renderiza um único card de transmissão ===
function renderBroadcastCard(data, resolvedImage) {
  ensureGridElement();
  const username = data.username;
  const viewers = data.viewers;
  const country = data.country || "xx";
  const tags = Array.isArray(data.tags) ? data.tags : [];
  if (!resolvedImage || !username || viewers == null) return;
  const countryName = countryNames[country.toLowerCase()] || "Desconhecido";
  const card = createEl(
    "div",
    {
      class: "broadcast-card",
      role: "region",
      "aria-label": `Transmissão de ${username}`,
      "data-broadcast-id": data.id,
      "data-username": username
    },
    [
      createEl("div", { class: "card-thumbnail" }, [
        createEl("img", {
          src: resolvedImage,
          alt: `Prévia da transmissão de ${username}`,
          loading: "lazy"
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

// === Função: Renderiza um lote de transmissões (com preload dos detalhes e imagens) ===
async function renderBatch(startIndex, count) {
  ensureGridElement();
  const batch = allItems.slice(startIndex, startIndex + count);
  if (!batch.length) return;
  // Pré-carrega detalhes em paralelo controlado (Promise.all, mas pode ser throttling)
  // Limite simultâneo: 10 (ajustável)
  const CONCURRENT_LIMIT = 10;
  let i = 0;
  async function processNext() {
    if (i >= batch.length) return;
    const idx = i++;
    const item = batch[idx];
    // Busca detalhes
    const userDetails = await fetchUserDetails(item.username);
    // Resolve imagem (passando userDetails, se não veio, tenta com o básico)
    let resolvedImg = resolvePreviewImage(userDetails) || FALLBACK_IMAGE;
    // Se userDetails falhar, tenta pelo próprio item (básico)
    if (resolvedImg === FALLBACK_IMAGE) {
      // fallback: usa previewPoster direto da listagem, se válido e não BAD_DEFAULT
      let tryPoster = (item.preview && item.preview.poster !== BAD_DEFAULT_IMAGE) ? item.preview.poster : null;
      resolvedImg = tryPoster || FALLBACK_IMAGE;
    }
    renderBroadcastCard(item, resolvedImg);
    await processNext();
  }
  // Inicia CONCURRENT_LIMIT tarefas simultâneas
  const tasks = [];
  for (let c = 0; c < CONCURRENT_LIMIT; c++) tasks.push(processNext());
  await Promise.all(tasks);
}

// === Renderiza o próximo lote paginado ===
async function renderNextBatch() {
  ensureGridElement();
  const start = (currentPage - 1) * itemsPerPage;
  await renderBatch(start, itemsPerPage);
  currentPage++;
  loadMoreBtn.style.display =
    currentPage * itemsPerPage >= allItems.length ? "none" : "block";
}

// === Exibe mensagem caso não haja transmissões ===
function showEmptyMessage() {
  ensureGridElement();
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

// === Exibe mensagem de erro de rede/API ===
function showErrorMessage() {
  ensureGridElement();
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
  grid.innerHTML = "";
  grid.appendChild(errorDiv);
}

// === Carrega as transmissões filtradas e inicializa a grid ===
async function loadFilteredBroadcasts() {
  currentPage = 1;
  allItems = [];
  ensureGridElement();
  grid.innerHTML = "";
  loader.remove();
  loadMoreBtn.remove();
  grid.appendChild(loader);

  try {
    // 1. Busca os 30 primeiros (default)
    let result = await fetchBroadcastsPage(1, itemsPerPage);
    // 2. Busca mais 15 da página 2 (se for necessário para paginação)
    if (result.length >= itemsPerPage) {
      // Busca até 150 itens para navegação "carregar mais"
      for (let page = 2; result.length < 150; page++) {
        const nextPage = await fetchBroadcastsPage(page, 15);
        if (!nextPage.length) break;
        result = result.concat(nextPage);
      }
    }
    loader.remove();

    if (!result.length) {
      showEmptyMessage();
      return;
    }

    allItems = result;
    await renderNextBatch();
    grid.parentElement.appendChild(loadMoreBtn);
    loadMoreBtn.style.display = "block";
  } catch (err) {
    console.error("Erro ao processar transmissões:", err);
    loader.remove();
    showErrorMessage();
  }
}

// === Funções públicas expostas para uso externo ===
export function setupBroadcasts() {
  loadMoreBtn.addEventListener("click", renderNextBatch);
  loadFilteredBroadcasts();
}
export function refreshBroadcasts() {
  loadFilteredBroadcasts();
}
export function applyBroadcastFilters(newFilters) {
  filters = {
    ...filters,
    ...Object.fromEntries(Object.entries(newFilters).filter(([_, v]) =>
      v !== undefined && v !== null && v !== "" && v !== "all"
    ))
  };
  loadFilteredBroadcasts();
}
document.addEventListener("DOMContentLoaded", () => {
  grid = document.getElementById("broadcasts-grid");
});

/*
Resumo das melhorias/correções (2025):
- Busca dados detalhados de cada transmissão via https://api.xcam.gay/?user={username}.
- Resolve imagem em ordem: preview.poster > avatarUrl > profileImageURL > fallback XCam.
- Nunca usa a imagem default do CAM4 ("default_Male.png").
- Pré-carrega os 30 primeiros, depois +15 por vez, conforme paginação/carregar mais.
- Modular, performático e robusto para mudanças futuras de API.
*/