// broadcasts.js
// Responsável por carregar, filtrar e renderizar a grade de transmissões ao vivo do XCam
// Estratégia otimizada: apenas UMA chamada para API principal, renderização instantânea de placeholders, atualização incremental dos cards
// Não faz fetch individual por transmissão. Busca incremental/desempenho máximo.

// === Importações necessárias ===
import { t } from "./i18n.js"; // Função de tradução para labels/UX
import { countryNames } from "./translations.js"; // Mapeia código país → nome completo

// === Função utilitária: Criação de elementos DOM com atributos e filhos ===
function createEl(type, props = {}, children = []) {
  const el = document.createElement(type);
  Object.entries(props).forEach(([key, value]) => {
    if (key === "text") el.textContent = value;
    else if (key === "html") el.innerHTML = value;
    else if (key.startsWith("on") && typeof value === "function") el[key] = value;
    else el.setAttribute(key, value);
  });
  children.forEach((child) => child && el.appendChild(child));
  return el;
}

// === Variáveis de controle da grid, paginação e filtros ===
let currentPage = 1;
const itemsPerPage = 30;
let allItems = [];
let renderedItems = []; // Para controle incremental dos cards já exibidos
let grid;

// Configuração dos filtros (vazios = sem filtro)
let filters = {
  gender: "",
  country: "",
  orientation: "",
  minViewers: null,
  tags: []
};

// Imagem padrão de loading e default do CAM4 (que nunca deve ser usada)
const FALLBACK_IMAGE = "https://xcam.gay/src/loading.gif";
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

// === Função: Monta a URL da API principal baseada nos filtros ===
function buildApiUrl(filters, limit = itemsPerPage) {
  const params = new URLSearchParams({
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

// === Função: Busca as transmissões da API principal ===
async function fetchBroadcasts(limit = itemsPerPage) {
  try {
    const url = buildApiUrl(filters, limit);
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

// === Garantia defensiva de que o grid está inicializado ===
function ensureGridElement() {
  if (!grid) {
    grid = document.getElementById("broadcasts-grid");
  }
}

// === Função: Resolve a melhor imagem possível para o card ===
function resolvePreviewImage(data) {
  // 1. preview.poster (se não for BAD_DEFAULT_IMAGE)
  let poster = data.preview && data.preview.poster && data.preview.poster !== BAD_DEFAULT_IMAGE ? data.preview.poster : null;
  // 2. profileImageURL (se não for BAD_DEFAULT_IMAGE)
  let profileImg = data.profileImageURL && data.profileImageURL !== BAD_DEFAULT_IMAGE ? data.profileImageURL : null;
  // 3. fallback loading.gif
  return poster || profileImg || FALLBACK_IMAGE;
}

// === Função: Renderiza um único card de transmissão (placeholder ou completo) ===
function renderBroadcastCard(data, isPlaceholder = false) {
  ensureGridElement();

  const username = data.username;
  const viewers = data.viewers;
  const country = data.country || "xx";
  const tags = Array.isArray(data.tags) ? data.tags : [];
  const countryName = countryNames[country.toLowerCase()] || "Desconhecido";

  // Define imagem: se placeholder, sempre loading.gif, senão tenta preview
  const imgSrc = isPlaceholder ? FALLBACK_IMAGE : resolvePreviewImage(data);

  // Verifica se o card já existe (para atualização incremental)
  let card = grid.querySelector(`.broadcast-card[data-username="${username}"]`);
  if (!card) {
    // Cria o card do zero se ainda não existe
    card = createEl(
      "div",
      {
        class: "broadcast-card",
        role: "region",
        "aria-label": `Transmissão de ${username}`,
        "data-username": username
      },
      [
        createEl("div", { class: "card-thumbnail" }, [
          createEl("img", {
            src: imgSrc,
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
  } else {
    // Atualiza apenas a imagem se já existe
    const img = card.querySelector("img");
    if (img && img.src !== imgSrc) img.src = imgSrc;
    // (Opcional: atualizar viewers/tags em tempo real se necessário)
  }
}

// === Função: Renderiza lote de cards (placeholder ou completos) ===
function renderBatch(startIndex, count, asPlaceholder = false, itemsSource = allItems) {
  ensureGridElement();
  const batch = itemsSource.slice(startIndex, startIndex + count);
  batch.forEach(data => renderBroadcastCard(data, asPlaceholder));
}

// === Renderiza o próximo lote paginado (completa ou atualiza cards já exibidos) ===
async function renderNextBatch() {
  ensureGridElement();

  // Se for a primeira página, renderiza placeholders imediatamente
  if (currentPage === 1 && allItems.length > 0 && renderedItems.length === 0) {
    renderBatch(0, itemsPerPage, true, allItems);
  }

  // Busca todos os itens disponíveis (limit alto), para atualizar cards já exibidos e adicionar mais 15
  const totalNeeded = currentPage * itemsPerPage;
  let result = await fetchBroadcasts(3333);
  if (!result.length) {
    showEmptyMessage();
    return;
  }

  // Atualiza grade incrementalmente: atualiza já exibidos e adiciona novos
  allItems = result;
  // Atualiza todos já exibidos (cards de 0 até renderedItems.length)
  for (let i = 0; i < renderedItems.length; i++) {
    renderBroadcastCard(allItems[i], false);
  }
  // Adiciona os próximos 15 (ou até o limite)
  const nextBatch = allItems.slice(renderedItems.length, totalNeeded);
  nextBatch.forEach(data => renderBroadcastCard(data, false));
  renderedItems = allItems.slice(0, totalNeeded);

  currentPage++;
  loadMoreBtn.style.display =
    renderedItems.length >= allItems.length ? "none" : "block";
}

// === Exibe mensagem caso não haja transmissões ===
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

// === Exibe mensagem de erro de rede/API ===
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

// === Carrega as transmissões filtradas e inicializa a grid ===
async function loadFilteredBroadcasts() {
  currentPage = 1;
  allItems = [];
  renderedItems = [];
  ensureGridElement();
  grid.innerHTML = "";
  loader.remove();
  loadMoreBtn.remove();
  grid.appendChild(loader);

  try {
    // Busca os 30 primeiros para formar a grade rapidamente
    let result = await fetchBroadcasts(itemsPerPage);
    loader.remove();

    if (!result.length) {
      showEmptyMessage();
      return;
    }

    allItems = result;
    renderedItems = [];
    // Renderiza placeholders imediatamente
    renderBatch(0, itemsPerPage, true, allItems);

    // Em background já busca todos os cards para atualizar os placeholders e para a próxima paginação
    setTimeout(() => renderNextBatch(), 100);

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

// Recebe filtros e recarrega a grade
export function applyBroadcastFilters(newFilters) {
  filters = {
    ...filters,
    ...Object.fromEntries(Object.entries(newFilters).filter(([_, v]) =>
      v !== undefined && v !== null && v !== "" && v !== "all"
    ))
  };
  loadFilteredBroadcasts();
}

// Inicializa referência do grid assim que o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  grid = document.getElementById("broadcasts-grid");
});

/*
Resumo das melhorias/correções (2025):
- Não faz mais fetch individual por transmissão; utiliza apenas a API principal para máxima performance.
- Renderização instantânea de placeholders (loading.gif) para UX rápida.
- Atualização incremental dos cards após chegada dos dados reais.
- Atualiza cards já exibidos ao clicar em "Carregar mais", mantendo a grade sincronizada.
- Imagem segue prioridade: preview.poster > profileImageURL > loading.gif, nunca usa imagem default do CAM4.
- Código limpo, organizado, modular e altamente performático para demandas de streaming ao vivo.
*/