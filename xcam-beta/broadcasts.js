// === Importações necessárias ===
import { t } from "./i18n.js"; // Função de tradução
import { countryNames } from "./translations.js"; // Mapeamento de códigos de países → nomes por extenso

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
const itemsPerPage = 15;
let allItems = [];
let grid;

let filters = {
  gender: "",
  country: "",
  orientation: "",
  minViewers: "",
  tags: []
};

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
function buildApiUrl(filters) {
  const params = new URLSearchParams({
    page: "1",
    limit: "1500",
    format: "json"
  });

  if (filters.gender) params.set("gender", filters.gender);
  if (filters.country) params.set("country", filters.country);
  if (filters.orientation) params.set("orientation", filters.orientation);
  if (filters.minViewers) params.set("minViewers", filters.minViewers);
  if (Array.isArray(filters.tags) && filters.tags.length > 0) {
    params.set("tags", filters.tags.join(","));
  }

  return `https://api.xcam.gay/?${params.toString()}`;
}

// === Função: Consulta a API e retorna os dados de transmissões ===
async function fetchBroadcasts() {
  try {
    const url = buildApiUrl(filters);
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

// === Função: Renderiza um único card de transmissão ===
function renderBroadcastCard(data) {
  const poster = data.preview?.poster;
  const username = data.username;
  const viewers = data.viewers;
  const country = data.country || "xx";
  const tags = Array.isArray(data.tags) ? data.tags : [];

  if (!poster || !username || viewers == null) return;

  const countryName = countryNames[country.toLowerCase()] || "Desconhecido";

  const card = createEl(
    "div",
    {
      class: "broadcast-card",
      role: "region",
      "aria-label": `Transmissão de ${username}`,
      "data-broadcast-id": data.id,
      "data-username": username // Importante para funcionar com modal.js
    },
    [
      createEl("div", { class: "card-thumbnail" }, [
        createEl("img", {
          src: poster,
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

// === Função: Renderiza o próximo lote de transmissões (paginado) ===
function renderNextBatch() {
  const start = (currentPage - 1) * itemsPerPage;
  const end = currentPage * itemsPerPage;
  const batch = allItems.slice(start, end);
  batch.forEach(renderBroadcastCard);
  currentPage++;

  // Esconde o botão se todas já foram renderizadas
  loadMoreBtn.style.display =
    currentPage * itemsPerPage >= allItems.length ? "none" : "block";
}

// === Exibe mensagem caso não haja transmissões ===
function showEmptyMessage() {
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
  grid.innerHTML = "";
  loader.remove();
  loadMoreBtn.remove();
  grid.appendChild(loader);

  try {
    const result = await fetchBroadcasts();
    loader.remove();

    if (!result.length) {
      showEmptyMessage();
      return;
    }

    allItems = result;
    renderNextBatch();
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
  filters = { ...filters, ...newFilters };
  loadFilteredBroadcasts();
}

// === Inicializa a referência do grid assim que o DOM estiver pronto ===
document.addEventListener("DOMContentLoaded", () => {
  grid = document.getElementById("broadcasts-grid");
});