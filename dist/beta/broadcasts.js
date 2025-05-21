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

const grid = document.getElementById("broadcasts-grid");
const loader = document.createElement("div");
loader.className = "loading-state";
loader.innerHTML = '<div class="loader"></div><p>Carregando transmissões...</p>';

const loadMoreBtn = document.createElement("button");
loadMoreBtn.id = "load-more";
loadMoreBtn.textContent = "Carregar mais transmissões";
loadMoreBtn.className = "load-more-button";
loadMoreBtn.style.display = "none"; // escondido inicialmente

// Monta a URL da API com base nos filtros definidos
function buildApiUrl(filters) {
  const params = new URLSearchParams({ page: "1", limit: "1000", format: "json" });

  if (filters.gender) params.set("gender", filters.gender);
  if (filters.country) params.set("country", filters.country);
  if (filters.orientation) params.set("orientation", filters.orientation);
  if (filters.minViewers) params.set("minViewers", filters.minViewers);
  if (filters.tags?.length) params.set("tags", filters.tags.join(","));

  return `https://xcam.moviele.workers.dev/?${params.toString()}`;
}

// Busca os dados da API com base na URL montada
async function fetchBroadcasts() {
  const url = buildApiUrl(filters);
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Falha na requisição");
    const data = await response.json();
    return Array.isArray(data.broadcasts?.items) ? data.broadcasts.items : [];
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    return [];
  }
}

// Renderiza um card de transmissão individual
function renderBroadcastCard(data) {
  const poster = data.preview?.poster;
  const username = data.username;
  const viewers = data.viewers;
  const country = data.country || "xx";
  const tags = Array.isArray(data.tags) ? data.tags : [];

  if (!poster || !username || viewers == null) return;

  const card = document.createElement("div");
  card.className = "broadcast-card";
  card.innerHTML = `
    <div class="card-thumbnail">
      <img src="${poster}" alt="${username}" loading="lazy">
      <div class="card-overlay">
        <div class="play-button"><i class="fas fa-play"></i></div>
      </div>
      <div class="live-badge">AO VIVO</div>
    </div>
    <div class="card-info">
      <div class="card-header">
        <h4 class="card-username">${username}</h4>
        <div class="card-country">
          <img src="https://flagcdn.com/24x18/${country}.png" alt="${country}">
        </div>
      </div>
      <div class="card-viewers">
        <i class="fas fa-eye"></i> ${viewers}
      </div>
      <div class="card-tags">
        ${tags.map(tag => `<span class="tag">${tag.name}</span>`).join('')}
      </div>
    </div>
  `;
  grid.appendChild(card);
}

// Renderiza o próximo lote de transmissões
function renderNextBatch() {
  const start = (currentPage - 1) * itemsPerPage;
  const end = currentPage * itemsPerPage;
  const batch = allItems.slice(start, end);
  batch.forEach(renderBroadcastCard);
  currentPage++;

  // Oculta o botão se não há mais transmissões a carregar
  if (currentPage * itemsPerPage >= allItems.length) {
    loadMoreBtn.style.display = "none";
  }
}

// Exibe uma mensagem amigável se nenhum resultado for retornado
function showEmptyMessage() {
  const empty = document.createElement("div");
  empty.className = "empty-state";
  empty.innerHTML = '<i class="fas fa-info-circle empty-icon"></i><h3>Nenhuma transmissão encontrada</h3><p>Tente ajustar os filtros ou recarregar a página.</p>';
  grid.appendChild(empty);
}

// Inicializa o carregamento e renderização da primeira página de resultados
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
    showEmptyMessage();
  }
}

// Configura os eventos iniciais
export function setupBroadcasts() {
  loadMoreBtn.addEventListener("click", () => {
    renderNextBatch();
  });
  loadFilteredBroadcasts();
}

// Recarrega a grade de transmissões
export function refreshBroadcasts() {
  loadFilteredBroadcasts();
}

// Aplica novos filtros e reinicia a grade
export function applyBroadcastFilters(newFilters) {
  filters = { ...filters, ...newFilters };
  loadFilteredBroadcasts();
}
