/**
 * XCam - broadcasts.js
 * Renderização da grade de transmissões, integração com novo modal e UX aprimorada
 * --------------------------------------------------------------
 * - Modular, limpo e integrado ao novo padrão do modal.html/style.css
 * - Comentários detalhados para onboarding e manutenção
 * - Clean Architecture: funções separadas, componentes desacoplados
 */

import { t } from "./i18n.js";
import { countryNames } from "./translations.js"; // Mapa código → nome por extenso

/**
 * Utilitário para criar elementos DOM com propriedades e filhos.
 * Facilita a padronização e reuso nos cards, mensagens e controles.
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
  children.forEach((child) => {
    if (child) el.appendChild(child);
  });
  return el;
}

// Estado e variáveis globais do módulo
let currentPage = 1;
const itemsPerPage = 15;
let allItems = [];
let filters = {
  gender: "male",
  country: "",
  orientation: "",
  minViewers: null,
  tags: []
};

let grid;

// Loader visual reutilizável
const loader = createEl("div", { class: "loading-state" }, [
  createEl("div", { class: "loader" }),
  createEl("p", { text: t("loading") })
]);

// Botão "Carregar mais" (paginador incremental)
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

/**
 * Monta a URL da API para buscar transmissões com base nos filtros ativos.
 * Permite fácil extensão e debug.
 */
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

/**
 * Busca as transmissões na API de acordo com os filtros.
 * - Retorna um array de transmissões ou vazio se erro.
 */
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

/**
 * Renderiza um card de transmissão.
 * Integração com novo modal:
 * - Adiciona data-* necessários para integração JS do modal
 * - Botão play acessível, pronto para disparar exibição do modal
 */
function renderBroadcastCard(data) {
  const poster = data.preview?.poster;
  const username = data.username;
  const viewers = data.viewers;
  const country = data.country || "xx";
  const tags = Array.isArray(data.tags) ? data.tags : [];

  if (!poster || !username || viewers == null) return;

  const countryNameFull = countryNames[country.toLowerCase()] || "Desconhecido";
  const flagImg = createEl("img", {
    src: `https://flagcdn.com/24x18/${country}.png`,
    alt: `País: ${countryNameFull}`,
    title: countryNameFull
  });

  // Tags de transmissão
  const tagsDiv = createEl("div", { class: "card-tags" });
  tags.forEach((tag) => {
    const tagName = typeof tag === "string" ? tag : tag.name;
    const tagSpan = createEl("span", {
      class: "tag",
      text: `#${tagName}`
    });
    tagsDiv.appendChild(tagSpan);
  });

  // Card principal (acessível, pronto para integração com modal)
  const card = createEl(
    "div",
    {
      class: "broadcast-card",
      role: "region",
      "aria-label": `Transmissão de ${username}`,
      "data-broadcast-id": data.id,
      "data-username": username // Utilizado pelo modal.js
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
              tabindex: "0",
              // Clique no botão play também dispara o modal (delegação no modal.js)
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

  // Delegação: clique no card ou play button chama o modal
  card.addEventListener("click", (e) => {
    // Evita duplo disparo se o clique for no botão play
    if (e.target.closest(".play-button") || e.target === card) {
      // Dispara evento customizado para o modal abrir (ou chame diretamente setupModal.openModal(data.id) se modular)
      const openEvent = new CustomEvent("open-broadcast-modal", {
        detail: { id: data.id, username: data.username }
      });
      window.dispatchEvent(openEvent);
    }
  });

  // Acessibilidade: permite Enter/Espaço abrir o modal ao focar no card
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      const openEvent = new CustomEvent("open-broadcast-modal", {
        detail: { id: data.id, username: data.username }
      });
      window.dispatchEvent(openEvent);
    }
  });

  grid.appendChild(card);
}

/**
 * Renderiza o próximo lote de cards na grade.
 * Paginação incremental ("Carregar mais")
 */
function renderNextBatch() {
  const start = (currentPage - 1) * itemsPerPage;
  const end = currentPage * itemsPerPage;
  const batch = allItems.slice(start, end);
  batch.forEach(renderBroadcastCard);
  currentPage++;
  loadMoreBtn.style.display =
    currentPage * itemsPerPage >= allItems.length ? "none" : "block";
}

/**
 * Mensagem para estado vazio (nenhuma transmissão encontrada)
 */
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

/**
 * Mensagem para estado de erro na busca de transmissões
 */
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

/**
 * Carrega e exibe as transmissões filtradas.
 * Sempre limpa o grid e reseta paginação.
 */
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

/**
 * Setup principal da grade de transmissões.
 * - Adiciona listener ao botão "Carregar mais"
 * - Carrega transmissões iniciais
 */
export function setupBroadcasts() {
  loadMoreBtn.addEventListener("click", renderNextBatch);
  loadFilteredBroadcasts();
}

/**
 * Atualiza a grade de transmissões (ex: após filtros ou atualização manual)
 */
export function refreshBroadcasts() {
  loadFilteredBroadcasts();
}

/**
 * Aplica filtros à busca de transmissões e recarrega a grade.
 * Recebe objeto parcial de filtros.
 */
export function applyBroadcastFilters(newFilters) {
  filters = { ...filters, ...newFilters };
  loadFilteredBroadcasts();
}

// Inicialização do grid ao carregar a página (garante referência correta)
document.addEventListener("DOMContentLoaded", () => {
  grid = document.getElementById("broadcasts-grid");
});

/**
 * EXPLICAÇÕES DOS AJUSTES:
 * - Cards agora disparam evento customizado "open-broadcast-modal" para o novo modal, via window.dispatchEvent (clean, desacoplado)
 * - Estrutura, classes e atributos dos cards seguem o novo padrão para integração visual e de UX
 * - Acessibilidade: roles, aria-label, foco e controle via teclado
 * - Todos os controles do modal (abrir/fechar) ficam centralizados no modal.js, sem lógica duplicada aqui
 * - Funções e variáveis seguem Clean Architecture: fáceis de testar, mockar ou estender
 */