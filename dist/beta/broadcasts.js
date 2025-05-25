import { t } from "./i18n.js";
import { countryNames } from "./translations.js"; // Mapa de códigos para nomes por extenso

function createEl(type, props = {}, children = []) {
  const el = document.createElement(type);
  Object.entries(props).forEach(([key, value]) => {
    if (key === "text") el.textContent = value;
    else if (key === "html") el.innerHTML = value;
    else if (key.startsWith("on") && typeof value === "function")
      el[key] = value;
    else el.setAttribute(key, value);
  });
  children.forEach((child) => {
    if (child) el.appendChild(child);
  });
  return el;
}

let currentPage = 1;
const itemsPerPage = 30;
let allItems = [];
let filters = {
  gender: "male",
  country: "",
  orientation: "",
  minViewers: null,
  tags: []
};

let grid;
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

function buildApiUrl(filters) {
  const params = new URLSearchParams({
    page: "1",
    limit: itemsPerPage.toString(),
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

async function fetchBroadcasts() {
  const url = buildApiUrl(filters);
  try {
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

    console.warn("Formato inesperado da resposta da API:", data);
    return [];
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    showErrorMessage();
    return [];
  }
}

function renderBroadcastCard(data) {
  const poster = data.preview?.poster;
  const username = data.username;
  const viewers = data.viewers;
  const country = data.country || "xx";
  const tags = Array.isArray(data.tags) ? data.tags : [];

  if (!poster || !username || viewers == null) return;

  const countryNameFull = countryNames[country.toUpperCase()] || "Desconhecido";

  const flagImg = createEl("img", {
    src: `https://flagcdn.com/24x18/${country}.png`,
    alt: `País: ${countryNameFull}`,
    title: countryNameFull
  });

  const tagsDiv = createEl("div", { class: "card-tags" });
  tags.forEach((tag) => {
    const tagName = typeof tag === "string" ? tag : tag.name;
    const tagSpan = createEl("span", {
      class: "tag",
      text: `#${tagName}`
    });
    tagsDiv.appendChild(tagSpan);
  });

  const card = createEl(
    "div",
    {
      class: "broadcast-card",
      role: "region",
      "aria-label": `Transmissão de ${username}`
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
              "aria-label": t("play") + " @" + username,
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
          createEl("div", { class: "card-country" }, [flagImg])
        ]),
        createEl("div", { class: "card-viewers" }, [
          createEl("i", { class: "fas fa-eye", "aria-hidden": "true" }),
          createEl("span", { text: ` ${viewers} ${t("viewers")}` })
        ]),
        tagsDiv
      ])
    ]
  );

  grid.appendChild(card);
}

function renderNextBatch() {
  const start = (currentPage - 1) * itemsPerPage;
  const end = currentPage * itemsPerPage;
  const batch = allItems.slice(start, end);
  batch.forEach(renderBroadcastCard);
  currentPage++;

  loadMoreBtn.style.display =
    currentPage * itemsPerPage >= allItems.length ? "none" : "block";
}

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

export function setupBroadcasts() {
  loadMoreBtn.addEventListener("click", () => {
    renderNextBatch();
  });
  loadFilteredBroadcasts();
}

export function refreshBroadcasts() {
  loadFilteredBroadcasts();
}

export function applyBroadcastFilters(newFilters) {
  filters = { ...filters, ...newFilters };
  loadFilteredBroadcasts();
}

document.addEventListener("DOMContentLoaded", () => {
  grid = document.getElementById("broadcasts-grid");
});