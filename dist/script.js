// Variáveis globais
let allBroadcasts = [];
let filteredBroadcasts = [];
let currentPage = 1;
let currentFilters = {
  country: "all",
  gender: "all",
  orientation: "all",
  search: ""
};
// Dados de fallback para caso a API falhe
const fallbackData = {
  broadcasts: {
    total: 9,
    items: [
      {
        itemNumber: 1,
        id: "fallback1",
        username: "user_brasil",
        country: "br",
        sexualOrientation: "straight",
        profileImageURL:
          "https://via.placeholder.com/400x300/121212/FFFFFF?text=XCam",
        preview: {
          src: "",
          poster: "https://via.placeholder.com/400x300/121212/FFFFFF?text=XCam"
        },
        viewers: 296,
        broadcastType: "male",
        gender: "male",
        tags: [
          {
            name: "fitness"
          },
          {
            name: "music"
          }
        ]
      },
      {
        itemNumber: 2,
        id: "fallback2",
        username: "user_espanha",
        country: "es",
        sexualOrientation: "gay",
        profileImageURL:
          "https://via.placeholder.com/400x300/121212/FFFFFF?text=XCam",
        preview: {
          src: "",
          poster: "https://via.placeholder.com/400x300/121212/FFFFFF?text=XCam"
        },
        viewers: 245,
        broadcastType: "male",
        gender: "male",
        tags: [
          {
            name: "dance"
          }
        ]
      },
      {
        itemNumber: 3,
        id: "fallback3",
        username: "user_italia",
        country: "it",
        sexualOrientation: "bisexual",
        profileImageURL:
          "https://via.placeholder.com/400x300/121212/FFFFFF?text=XCam",
        preview: {
          src: "",
          poster: "https://via.placeholder.com/400x300/121212/FFFFFF?text=XCam"
        },
        viewers: 189,
        broadcastType: "male",
        gender: "male",
        tags: [
          {
            name: "gaming"
          },
          {
            name: "sports"
          }
        ]
      },
      {
        itemNumber: 4,
        id: "fallback4",
        username: "user_franca",
        country: "fr",
        sexualOrientation: "straight",
        profileImageURL:
          "https://via.placeholder.com/400x300/121212/FFFFFF?text=XCam",
        preview: {
          src: "",
          poster: "https://via.placeholder.com/400x300/121212/FFFFFF?text=XCam"
        },
        viewers: 178,
        broadcastType: "male",
        gender: "male",
        tags: [
          {
            name: "music"
          }
        ]
      },
      {
        itemNumber: 5,
        id: "fallback5",
        username: "user_alemanha",
        country: "de",
        sexualOrientation: "gay",
        profileImageURL:
          "https://via.placeholder.com/400x300/121212/FFFFFF?text=XCam",
        preview: {
          src: "",
          poster: "https://via.placeholder.com/400x300/121212/FFFFFF?text=XCam"
        },
        viewers: 156,
        broadcastType: "male",
        gender: "male",
        tags: [
          {
            name: "fitness"
          },
          {
            name: "travel"
          }
        ]
      },
      {
        itemNumber: 6,
        id: "fallback6",
        username: "user_eua",
        country: "us",
        sexualOrientation: "straight",
        profileImageURL:
          "https://via.placeholder.com/400x300/121212/FFFFFF?text=XCam",
        preview: {
          src: "",
          poster: "https://via.placeholder.com/400x300/121212/FFFFFF?text=XCam"
        },
        viewers: 142,
        broadcastType: "male",
        gender: "male",
        tags: [
          {
            name: "gaming"
          }
        ]
      },
      {
        itemNumber: 7,
        id: "fallback7",
        username: "user_canada",
        country: "ca",
        sexualOrientation: "bisexual",
        profileImageURL:
          "https://via.placeholder.com/400x300/121212/FFFFFF?text=XCam",
        preview: {
          src: "",
          poster: "https://via.placeholder.com/400x300/121212/FFFFFF?text=XCam"
        },
        viewers: 128,
        broadcastType: "male",
        gender: "male",
        tags: [
          {
            name: "art"
          },
          {
            name: "music"
          }
        ]
      },
      {
        itemNumber: 8,
        id: "fallback8",
        username: "user_mexico",
        country: "mx",
        sexualOrientation: "straight",
        profileImageURL:
          "https://via.placeholder.com/400x300/121212/FFFFFF?text=XCam",
        preview: {
          src: "",
          poster: "https://via.placeholder.com/400x300/121212/FFFFFF?text=XCam"
        },
        viewers: 115,
        broadcastType: "male",
        gender: "male",
        tags: [
          {
            name: "dance"
          },
          {
            name: "fitness"
          }
        ]
      },
      {
        itemNumber: 9,
        id: "fallback9",
        username: "user_portugal",
        country: "pt",
        sexualOrientation: "gay",
        profileImageURL:
          "https://via.placeholder.com/400x300/121212/FFFFFF?text=XCam",
        preview: {
          src: "",
          poster: "https://via.placeholder.com/400x300/121212/FFFFFF?text=XCam"
        },
        viewers: 103,
        broadcastType: "male",
        gender: "male",
        tags: [
          {
            name: "travel"
          },
          {
            name: "cooking"
          }
        ]
      }
    ]
  }
};
// Mapeamento de países em ordem alfabética
const countryNames = {
  af: "Afeganistão",
  al: "Albânia",
  dz: "Argélia",
  as: "Samoa Americana",
  ad: "Andorra",
  ao: "Angola",
  ag: "Antígua e Barbuda",
  ar: "Argentina",
  am: "Armênia",
  au: "Austrália",
  at: "Áustria",
  az: "Azerbaijão",
  bs: "Bahamas",
  bh: "Bahrein",
  bd: "Bangladesh",
  bb: "Barbados",
  by: "Belarus",
  be: "Bélgica",
  bz: "Belize",
  bj: "Benin",
  bm: "Bermudas",
  bt: "Butão",
  bo: "Bolívia",
  ba: "Bósnia e Herzegovina",
  bw: "Botsuana",
  br: "Brasil",
  bn: "Brunei",
  bg: "Bulgária",
  bf: "Burquina Faso",
  bi: "Burundi",
  cv: "Cabo Verde",
  kh: "Camboja",
  cm: "Camarões",
  ca: "Canadá",
  cf: "República Centro-Africana",
  td: "Chade",
  cl: "Chile",
  cn: "China",
  co: "Colômbia",
  km: "Comores",
  cg: "Congo",
  cd: "República Democrática do Congo",
  cr: "Costa Rica",
  ci: "Costa do Marfim",
  hr: "Croácia",
  cu: "Cuba",
  cy: "Chipre",
  cz: "República Tcheca",
  cw: "Curaçao",
  dk: "Dinamarca",
  dj: "Djibuti",
  dm: "Dominica",
  do: "República Dominicana",
  ec: "Equador",
  eg: "Egito",
  sv: "El Salvador",
  gq: "Guiné Equatorial",
  er: "Eritreia",
  ee: "Estônia",
  sz: "Essuatíni",
  et: "Etiópia",
  fj: "Fiji",
  fi: "Finlândia",
  fr: "França",
  ga: "Gabão",
  gm: "Gâmbia",
  ge: "Geórgia",
  de: "Alemanha",
  gh: "Gana",
  gb: "Reino Unido",
  en: "Inglaterra",
  sc: "Escócia",
  wa: "País de Gales",
  ni: "Irlanda do Norte",
  gr: "Grécia",
  gd: "Granada",
  gt: "Guatemala",
  gn: "Guiné",
  gw: "Guiné-Bissau",
  gy: "Guiana",
  ht: "Haiti",
  hk: "Hong Kong",
  hn: "Honduras",
  hu: "Hungria",
  is: "Islândia",
  in: "Índia",
  id: "Indonésia",
  ir: "Irã",
  iq: "Iraque",
  ie: "Irlanda",
  il: "Israel",
  it: "Itália",
  jm: "Jamaica",
  jp: "Japão",
  jo: "Jordânia",
  kz: "Cazaquistão",
  ke: "Quênia",
  ki: "Kiribati",
  kp: "Coreia do Norte",
  kr: "Coreia do Sul",
  kw: "Kuwait",
  kg: "Quirguistão",
  la: "Laos",
  lv: "Letônia",
  lb: "Líbano",
  ls: "Lesoto",
  lr: "Libéria",
  ly: "Líbia",
  li: "Liechtenstein",
  lt: "Lituânia",
  lu: "Luxemburgo",
  mg: "Madagascar",
  mw: "Malawi",
  my: "Malásia",
  mv: "Maldivas",
  ml: "Mali",
  mt: "Malta",
  mh: "Ilhas Marshall",
  mr: "Mauritânia",
  mu: "Maurício",
  mx: "México",
  fm: "Micronésia",
  md: "Moldávia",
  mc: "Mônaco",
  mn: "Mongólia",
  me: "Montenegro",
  ma: "Marrocos",
  mz: "Moçambique",
  mm: "Mianmar",
  mk: "Macedônia do Norte",
  mq: "Pan-Africanismo",
  na: "Namíbia",
  nr: "Nauru",
  np: "Nepal",
  nl: "Holanda",
  nz: "Nova Zelândia",
  ni: "Nicarágua",
  ne: "Níger",
  ng: "Nigéria",
  no: "Noruega",
  om: "Omã",
  pk: "Paquistão",
  pw: "Palau",
  pa: "Panamá",
  pg: "Papua-Nova Guiné",
  py: "Paraguai",
  pe: "Peru",
  ph: "Filipinas",
  pl: "Polônia",
  pt: "Portugal",
  pr: "Porto Rico",
  qa: "Catar",
  ro: "Romênia",
  ru: "Rússia",
  rw: "Ruanda",
  ws: "Samoa",
  sm: "San Marino",
  st: "São Tomé e Príncipe",
  sa: "Arábia Saudita",
  sn: "Senegal",
  rs: "Sérvia",
  sc: "Seicheles",
  sl: "Serra Leoa",
  sg: "Singapura",
  sk: "Eslováquia",
  si: "Eslovênia",
  sb: "Ilhas Salomão",
  so: "Somália",
  za: "África do Sul",
  es: "Espanha",
  lk: "Sri Lanka",
  sd: "Sudão",
  sr: "Suriname",
  se: "Suécia",
  ch: "Suíça",
  sy: "Síria",
  tw: "Taiwan",
  tj: "Tajiquistão",
  tz: "Tanzânia",
  th: "Tailândia",
  tg: "Togo",
  to: "Tonga",
  tt: "Trinidad e Tobago",
  tn: "Tunísia",
  tr: "Turquia",
  tm: "Turcomenistão",
  tv: "Tuvalu",
  ug: "Uganda",
  ua: "Ucrânia",
  ae: "Emirados Árabes Unidos",
  us: "Estados Unidos",
  uy: "Uruguai",
  uz: "Uzbequistão",
  vu: "Vanuatu",
  va: "Vaticano",
  ve: "Venezuela",
  vn: "Vietnã",
  ye: "Iêmen",
  zm: "Zâmbia",
  zw: "Zimbábue"
};
// Traduções de gênero e orientação
const genderTranslations = {
  male: "Masculino",
  female: "Feminino",
  trans: "Trans",
};
const orientationTranslations = {
  straight: "Hetero",
  gay: "Gay",
  lesbian: "Lésbica",
  bisexual: "Bissexual",
  bicurious: "Bicurioso",
  unknown: "Não Definido"
};
// Função para carregar dados da API
async function fetchBroadcasts() {
  try {
    const response = await fetch("https://site.my.eu.org/0:/male.json");
    if (!response.ok) throw new Error("Falha na requisição");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    showToast("Erro ao carregar transmissões. Usando dados locais.", "error");
    return fallbackData;
  }
}
// Função para filtrar transmissões
function filterBroadcasts(broadcasts, filters) {
  return broadcasts.filter((broadcast) => {
    // Filtro por país
    if (
      filters.country &&
      filters.country !== "all" &&
      broadcast.country !== filters.country
    ) {
      return false;
    }
    // Filtro por gênero
    if (
      filters.gender &&
      filters.gender !== "all" &&
      broadcast.gender !== filters.gender
    ) {
      return false;
    }
    // Filtro por orientação
    if (
      filters.orientation &&
      filters.orientation !== "all" &&
      broadcast.sexualOrientation !== filters.orientation
    ) {
      return false;
    }
    // Filtro por pesquisa de username
    if (
      filters.search &&
      !broadcast.username.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });
}
// Função para ordenar transmissões por número de espectadores
function sortBroadcastsByViewers(broadcasts) {
  return [...broadcasts].sort((a, b) => b.viewers - a.viewers);
}
// Função para paginar resultados
function paginateBroadcasts(broadcasts, page, itemsPerPage = 15) {
  const startIndex = (page - 1) * itemsPerPage;
  return broadcasts.slice(startIndex, startIndex + itemsPerPage);
}
// Função para renderizar o carrossel
function renderCarousel(topBroadcasts) {
  const carouselContainer = document.getElementById("main-carousel");
  carouselContainer.innerHTML = "";
  topBroadcasts.slice(0, 5).forEach((broadcast, index) => {
    const slide = document.createElement("div");
    slide.className = `carousel-slide ${index === 0 ? "active" : ""}`;
    slide.innerHTML = `
          <div class="carousel-image" style="background-image: url('${
            broadcast.preview.poster
          }')">
            <div class="carousel-overlay"></div>
            <div class="carousel-content">
              <div class="carousel-badge">AO VIVO</div>
              <h2 class="carousel-username">@${broadcast.username}</h2>
              <div class="carousel-info">
                <span class="carousel-country">
                  <img src="https://flagcdn.com/w20/${
                    broadcast.country
                  }.png" alt="${broadcast.country}">
                </span>
                <span class="carousel-viewers">
                  <i class="fas fa-eye"></i> ${formatViewers(broadcast.viewers)}
                </span>
              </div>
              <button class="carousel-button" onclick="openModal('${
                broadcast.id
              }')">Assistir</button>
            </div>
          </div>
        `;
    carouselContainer.appendChild(slide);
  });
  // Adicionar controles
  const controls = document.createElement("div");
  controls.className = "carousel-controls";
  controls.innerHTML = `
        <div class="carousel-control" onclick="prevSlide()">
          <i class="fas fa-chevron-left"></i>
        </div>
        <div class="carousel-control" onclick="nextSlide()">
          <i class="fas fa-chevron-right"></i>
        </div>
      `;
  carouselContainer.appendChild(controls);
  // Adicionar indicadores
  const indicators = document.createElement("div");
  indicators.className = "carousel-indicators";
  topBroadcasts.slice(0, 5).forEach((_, index) => {
    const indicator = document.createElement("span");
    indicator.className = `carousel-indicator ${index === 0 ? "active" : ""}`;
    indicator.onclick = () => changeSlide(index);
    indicators.appendChild(indicator);
  });
  carouselContainer.appendChild(indicators);
  // Iniciar rotação automática
  startCarouselRotation();
}
// Função para renderizar o grid de transmissões
function renderBroadcastGrid(broadcasts, page = 1) {
  const gridContainer = document.getElementById("broadcasts-grid");
  gridContainer.innerHTML = "";
  if (broadcasts.length === 0) {
    gridContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">📺</div>
            <h3>Nenhuma transmissão encontrada</h3>
            <p>Tente ajustar seus filtros ou volte mais tarde.</p>
          </div>
        `;
    return;
  }
  const paginatedBroadcasts = paginateBroadcasts(broadcasts, page);
  paginatedBroadcasts.forEach((broadcast) => {
    const card = document.createElement("div");
    card.className = "broadcast-card";
    card.onclick = () => openModal(broadcast.id);
    // Preparar tags HTML se existirem
    let tagsHTML = "";
    if (broadcast.tags && broadcast.tags.length > 0) {
      tagsHTML = `
            <div class="card-tags">
              ${broadcast.tags
                .map((tag) => `<span class="tag">#${tag.name || tag}</span>`)
                .join("")}
            </div>
          `;
    }
    card.innerHTML = `
          <div class="card-thumbnail">
            <img src="${broadcast.preview.poster}" alt="${
      broadcast.username
    }" loading="lazy">
            <div class="card-overlay">
              <div class="play-button">
                <i class="fas fa-play"></i>
              </div>
            </div>
            <div class="live-badge">AO VIVO</div>
          </div>
          <div class="card-info">
            <div class="card-header">
              <h3 class="card-username">@${broadcast.username}</h3>
              <div class="card-country">
                <img src="https://flagcdn.com/w20/${
                  broadcast.country
                }.png" alt="${broadcast.country}" title="${getCountryName(
      broadcast.country
    )}">
              </div>
            </div>
            <div class="card-viewers">
              <i class="fas fa-eye"></i> ${formatViewers(broadcast.viewers)}
            </div>
            ${tagsHTML}
          </div>
        `;
    gridContainer.appendChild(card);
  });
  // Renderizar paginação
  renderPagination(broadcasts.length, page);
}
// Função para renderizar a paginação
function renderPagination(totalItems, currentPage) {
  const paginationContainer = document.getElementById("pagination");
  const totalPages = Math.ceil(totalItems / 15);
  if (totalPages <= 1) {
    paginationContainer.innerHTML = "";
    return;
  }
  let paginationHTML = `
        <button class="pagination-button" ${
          currentPage === 1 ? "disabled" : ""
        } onclick="changePage(1)">
          <i class="fas fa-angle-double-left"></i>
        </button>
        <button class="pagination-button" ${
          currentPage === 1 ? "disabled" : ""
        } onclick="changePage(${currentPage - 1})">
          <i class="fas fa-angle-left"></i>
        </button>
      `;
  // Lógica para mostrar páginas (atual, 2 antes e 2 depois)
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);
  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
          <button class="pagination-number ${
            i === currentPage ? "active" : ""
          }" onclick="changePage(${i})">
            ${i}
          </button>
        `;
  }
  paginationHTML += `
        <button class="pagination-button" ${
          currentPage === totalPages ? "disabled" : ""
        } onclick="changePage(${currentPage + 1})">
          <i class="fas fa-angle-right"></i>
        </button>
        <button class="pagination-button" ${
          currentPage === totalPages ? "disabled" : ""
        } onclick="changePage(${totalPages})">
          <i class="fas fa-angle-double-right"></i>
        </button>
      `;
  paginationContainer.innerHTML = paginationHTML;
}
// Função para abrir o modal de transmissão
function openModal(broadcastId) {
  const broadcast = allBroadcasts.find((b) => b.id === broadcastId);
  if (!broadcast) return;
  const modal = document.getElementById("broadcast-modal");
  const modalContent = document.getElementById("modal-content");
  // Preparar tags HTML se existirem
  let tagsHTML = "";
  if (broadcast.tags && broadcast.tags.length > 0) {
    tagsHTML = `
          <div class="modal-tags">
            ${broadcast.tags
              .map((tag) => `<span class="tag">#${tag.name || tag}</span>`)
              .join("")}
          </div>
        `;
  }
  modalContent.innerHTML = `
        <div class="modal-header">
          <h2 class="modal-title">@${broadcast.username}</h2>
          <button class="modal-close" onclick="closeModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="modal-player">
            <div class="player-container" id="player-container">
              <div class="player-placeholder" style="background-image: url('${
                broadcast.preview.poster
              }')">
                <div class="play-button-large" onclick="loadPlayer('${
                  broadcast.id
                }')">
                  <i class="fas fa-play"></i>
                </div>
              </div>
            </div>
            <div class="modal-info">
              <div class="streamer-info">
                <div class="streamer-avatar">
                  <img src="${broadcast.profileImageURL}" alt="${
    broadcast.username
  }">
                </div>
                <div class="streamer-details">
                  <h3>@${broadcast.username}</h3>
                  <div class="streamer-meta">
                    <span class="country">
                      <img src="https://flagcdn.com/w20/${
                        broadcast.country
                      }.png" alt="${broadcast.country}">
                      ${getCountryName(broadcast.country)}
                    </span>
                    <span class="viewers">
                      <i class="fas fa-eye"></i> ${formatViewers(
                        broadcast.viewers
                      )} espectadores
                    </span>
                  </div>
                </div>
              </div>
              ${tagsHTML}
              <div class="additional-info">
                <span class="info-item">
                  <i class="fas fa-venus-mars"></i> ${
                    genderTranslations[broadcast.gender] || broadcast.gender
                  }
                </span>
                <span class="info-item">
                  <i class="fas fa-heart"></i> ${
                    orientationTranslations[broadcast.sexualOrientation] ||
                    broadcast.sexualOrientation
                  }
                </span>
              </div>
            </div>
          </div>
          <div class="related-broadcasts">
            <h3>Transmissões Relacionadas</h3>
            <div class="related-grid" id="related-grid">
              <!-- Será preenchido dinamicamente -->
            </div>
          </div>
        </div>
      `;
  modal.classList.add("active");
  document.body.classList.add("modal-open");
  // Carregar transmissões relacionadas
  loadRelatedBroadcasts(broadcast);
}
// Função para carregar o player
function loadPlayer(broadcastId) {
  const playerContainer = document.getElementById("player-container");
  playerContainer.innerHTML = `
        <iframe 
          src="https://xcam.gay/cam/?id=${broadcastId}" 
          frameborder="0" 
          allowfullscreen
          class="player-iframe">
        </iframe>
      `;
}
// Função para carregar transmissões relacionadas
function loadRelatedBroadcasts(currentBroadcast) {
  const relatedGrid = document.getElementById("related-grid");
  // Filtrar transmissões com mesmo gênero ou país, excluindo a atual
  const related = allBroadcasts
    .filter(
      (b) =>
        b.id !== currentBroadcast.id &&
        (b.gender === currentBroadcast.gender ||
          b.country === currentBroadcast.country)
    )
    .slice(0, 4);
  if (related.length === 0) {
    relatedGrid.innerHTML =
      "<p>Nenhuma transmissão relacionada encontrada.</p>";
    return;
  }
  relatedGrid.innerHTML = "";
  related.forEach((broadcast) => {
    const relatedCard = document.createElement("div");
    relatedCard.className = "related-card";
    relatedCard.onclick = () => {
      closeModal();
      setTimeout(() => openModal(broadcast.id), 300);
    };
    relatedCard.innerHTML = `
          <div class="related-thumbnail">
            <img src="${broadcast.preview.poster}" alt="${
      broadcast.username
    }" loading="lazy">
            <div class="related-overlay">
              <div class="related-play">
                <i class="fas fa-play"></i>
              </div>
            </div>
            <div class="related-badge">AO VIVO</div>
          </div>
          <div class="related-info">
            <h4>@${broadcast.username}</h4>
            <div class="related-meta">
              <span class="related-country">
                <img src="https://flagcdn.com/w20/${
                  broadcast.country
                }.png" alt="${broadcast.country}">
              </span>
              <span class="related-viewers">
                <i class="fas fa-eye"></i> ${formatViewers(broadcast.viewers)}
              </span>
            </div>
          </div>
        `;
    relatedGrid.appendChild(relatedCard);
  });
}
// Função para fechar o modal
function closeModal() {
  const modal = document.getElementById("broadcast-modal");
  modal.classList.remove("active");
  document.body.classList.remove("modal-open");
  // Limpar o player para parar qualquer reprodução
  setTimeout(() => {
    const playerContainer = document.getElementById("player-container");
    if (playerContainer) {
      playerContainer.innerHTML = "";
    }
  }, 300);
}
// Função para formatar número de espectadores
function formatViewers(viewers) {
  if (viewers >= 1000) {
    return (viewers / 1000).toFixed(1) + "k";
  }
  return viewers.toString();
}
// Função para obter nome do país a partir do código
function getCountryName(countryCode) {
  return countryNames[countryCode] || countryCode.toUpperCase();
}
// Função para mostrar notificações toast
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  const icons = {
    success: "fas fa-check-circle",
    error: "fas fa-exclamation-circle",
    info: "fas fa-info-circle",
    warning: "fas fa-exclamation-triangle"
  };
  toast.innerHTML = `
        <div class="toast-icon">
          <i class="${icons[type]}"></i>
        </div>
        <div class="toast-message">${message}</div>
      `;
  const toastContainer = document.getElementById("toast-container");
  toastContainer.appendChild(toast);
  // Animar entrada
  setTimeout(() => {
    toast.classList.add("show");
  }, 10);
  // Remover após 3 segundos
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}
// Função para controle do carrossel
let carouselInterval;
let currentSlide = 0;

function startCarouselRotation() {
  carouselInterval = setInterval(() => {
    nextSlide();
  }, 5000);
}

function stopCarouselRotation() {
  clearInterval(carouselInterval);
}

function changeSlide(index) {
  const slides = document.querySelectorAll(".carousel-slide");
  const indicators = document.querySelectorAll(".carousel-indicator");
  if (slides.length === 0) return;
  if (index >= slides.length) index = 0;
  if (index < 0) index = slides.length - 1;
  // Remover classe active de todos
  slides.forEach((slide) => slide.classList.remove("active"));
  indicators.forEach((indicator) => indicator.classList.remove("active"));
  // Adicionar classe active ao slide atual
  slides[index].classList.add("active");
  indicators[index].classList.add("active");
  currentSlide = index;
  // Reiniciar rotação
  stopCarouselRotation();
  startCarouselRotation();
}

function nextSlide() {
  changeSlide(currentSlide + 1);
}

function prevSlide() {
  changeSlide(currentSlide - 1);
}
// Toggle do menu mobile
function toggleMobileMenu() {
  const mobileMenu = document.getElementById("mobile-menu");
  mobileMenu.classList.toggle("active");
}
// Função para aplicar filtros
function applyFilters() {
  currentFilters.country = document.getElementById("country-filter").value;
  currentFilters.gender = document.getElementById("gender-filter").value;
  currentFilters.orientation = document.getElementById(
    "orientation-filter"
  ).value;
  filteredBroadcasts = filterBroadcasts(allBroadcasts, currentFilters);
  currentPage = 1;
  renderBroadcastGrid(filteredBroadcasts, currentPage);
  showToast("Filtros aplicados com sucesso!", "success");
}
// Função para mudar de página
function changePage(page) {
  currentPage = page;
  renderBroadcastGrid(filteredBroadcasts, currentPage);
  // Scroll para o topo do grid
  document.getElementById("broadcasts-grid").scrollIntoView({
    behavior: "smooth"
  });
}
// Função para popular opções de países no filtro
function populateCountryOptions() {
  const countrySelect = document.getElementById("country-filter");
  if (!countrySelect) return;
  // Obter países únicos das transmissões
  const uniqueCountries = [...new Set(allBroadcasts.map((b) => b.country))];
  // Adicionar opção "Todos"
  countrySelect.innerHTML = '<option value="all">Todos os países</option>';
  // Adicionar opções para cada país
  uniqueCountries.forEach((countryCode) => {
    const option = document.createElement("option");
    option.value = countryCode;
    option.textContent = getCountryName(countryCode);
    countrySelect.appendChild(option);
  });
}
// Configurar pesquisa
function setupSearch() {
  const searchInput = document.getElementById("search-input");
  const mobileSearchInput = document.getElementById("mobile-search-input");
  // Função de debounce para evitar muitas chamadas
  let searchTimeout;

  function performSearch(value) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentFilters.search = value;
      filteredBroadcasts = filterBroadcasts(allBroadcasts, currentFilters);
      currentPage = 1;
      renderBroadcastGrid(filteredBroadcasts, currentPage);
    }, 300);
  }
  searchInput.addEventListener("input", (e) => {
    const value = e.target.value;
    mobileSearchInput.value = value;
    performSearch(value);
  });
  mobileSearchInput.addEventListener("input", (e) => {
    const value = e.target.value;
    searchInput.value = value;
    performSearch(value);
  });
}
// Inicialização da aplicação
async function initApp() {
  // Mostrar estado de carregamento
  document.getElementById("broadcasts-grid").innerHTML = `
        <div class="loading-state">
          <div class="loader"></div>
          <p>Carregando transmissões...</p>
        </div>
      `;
  try {
    // Carregar dados da API
    const data = await fetchBroadcasts();
    allBroadcasts = data.broadcasts.items;
    // Ordenar por número de espectadores
    allBroadcasts = sortBroadcastsByViewers(allBroadcasts);
    // Aplicar filtros iniciais
    filteredBroadcasts = [...allBroadcasts];
    // Renderizar carrossel com top 5
    renderCarousel(allBroadcasts.slice(0, 5));
    // Renderizar grid de transmissões
    renderBroadcastGrid(filteredBroadcasts, currentPage);
    // Preencher opções de países no filtro
    populateCountryOptions();
    // Configurar pesquisa
    setupSearch();
    // Mostrar toast de sucesso
    showToast("Transmissões carregadas com sucesso!", "success");
  } catch (error) {
    console.error("Erro na inicialização:", error);
    document.getElementById("broadcasts-grid").innerHTML = `
          <div class="error-state">
            <div class="error-icon">❌</div>
            <h3>Ops! Algo deu errado</h3>
            <p>Não foi possível carregar as transmissões.</p>
            <button onclick="initApp()">Tentar novamente</button>
          </div>
        `;
  }
}
// Fechar modal ao clicar fora
window.addEventListener("click", (e) => {
  const modal = document.getElementById("broadcast-modal");
  if (e.target === modal) {
    closeModal();
  }
});
// Iniciar a aplicação quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", initApp);
