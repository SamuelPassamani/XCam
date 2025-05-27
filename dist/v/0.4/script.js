// XCam - script.js v0.4
// Arquitetura modular e Clean Architecture, unificando o melhor de /v/0.2/ e /v/0.3/
// Inclui: padrão de exibição dos cards conforme referência visual, tags clicáveis para filtragem, comentários detalhados.

// ======================
// Configuração global & Estado
// ======================
const API_BASE_URL = "https://api.xcam.gay/";

const state = {
  broadcasts: [],
  featuredBroadcasts: [],
  currentPage: 1,
  filters: {
    gender: "",
    country: "",
    orientation: "",
    tag: "",
    tags: [],
    search: ""
  },
  countries: new Map(),
  isLoading: false
};

// ======================
// Elementos DOM globais
// ======================
const mobileMenuButton = document.getElementById("mobile-menu-button");
const mobileMenu = document.getElementById("mobile-menu");
const prevSlideButton = document.getElementById("prev-slide");
const nextSlideButton = document.getElementById("next-slide");
const carouselSlides = document.getElementById("carousel-slides");
const carouselIndicators = document.getElementById("carousel-indicators");
const streamsContainer = document.getElementById("streams-container");
const applyFiltersButton = document.getElementById("apply-filters");
const refreshStreamsButton = document.getElementById("refresh-streams");
const loadMoreButton = document.getElementById("load-more");
const toastContainer = document.getElementById("toast-container");
const countrySelect = document.getElementById("country");
const genderSelect = document.getElementById("gender");
const orientationSelect = document.getElementById("orientation");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const mobileSearchInput = document.getElementById("mobile-search-input");
const mobileSearchButton = document.getElementById("mobile-search-button");
const loadingOverlay = document.getElementById("loading-overlay");

// Elementos do modal modular de usuário/transmissão
const userModalOverlay = document.getElementById("user-modal-overlay");
const userModalClose = document.getElementById("user-modal-close");
const userModalPlayer = document.getElementById("user-modal-player");
const userModalTitle = document.getElementById("user-modal-title");
const userModalLogo = document.getElementById("user-modal-logo");
const userModalAvatar = document.getElementById("user-modal-avatar");
const userModalUsername = document.getElementById("user-modal-username");
const userModalCountryFlag = document.getElementById("user-modal-country-flag");
const userModalCountryName = document.getElementById("user-modal-country-name");
const userModalViewers = document.getElementById("user-modal-viewers");
const userModalStats = document.getElementById("user-modal-stats");
const userModalTags = document.getElementById("user-modal-tags");
const userModalBio = document.getElementById("user-modal-bio");
const userModalSocial = document.getElementById("user-modal-social");

// ======================
// Utilitários e internacionalização
// ======================

function showLoading() {
  state.isLoading = true;
  loadingOverlay.classList.remove("hidden");
}
function hideLoading() {
  state.isLoading = false;
  loadingOverlay.classList.add("hidden");
}
function formatViewerCount(count) {
  if (count >= 1000) return (count / 1000).toFixed(1) + "K";
  return count;
}
function getCountryName(code) {
  if (!code) return "Desconhecido";
  return state.countries.get(code.toUpperCase()) || code;
}
function getGenderTranslation(gender) {
  const map = {
    male: "Masculino",
    female: "Feminino",
    trans: "Trans",
    "non-binary": "Não-binário"
  };
  return map[gender] || gender || "Não especificado";
}
function getOrientationTranslation(orientation) {
  const map = {
    straight: "Heterossexual",
    gay: "Gay",
    lesbian: "Lésbica",
    bisexual: "Bissexual",
    pansexual: "Pansexual"
  };
  return map[orientation] || orientation || "Não especificado";
}
/**
 * Exibe uma mensagem de toast no canto superior direito.
 */
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  let bgColor = "bg-blue-500";
  if (type === "success") bgColor = "bg-green-500";
  if (type === "error") bgColor = "bg-red-500";
  if (type === "warning") bgColor = "bg-yellow-500";
  toast.className = `toast ${bgColor} text-white px-4 py-2 rounded-md shadow-lg flex items-center`;
  toast.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <span>${message}</span>
  `;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ======================
// API - Funções assíncronas
// ======================

/**
 * Consulta a API principal do XCam, aceitando endpoint e params.
 * Trate erros e exibe toast em caso de falha.
 */
async function fetchAPI(endpoint, params = {}) {
  try {
    const url = new URL(endpoint, API_BASE_URL);
    Object.keys(params).forEach((key) => {
      if (
        params[key] !== undefined &&
        params[key] !== null &&
        params[key] !== ""
      ) {
        url.searchParams.append(key, params[key]);
      }
    });
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Erro API: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error(error);
    showToast("Erro ao carregar dados. Tente novamente.", "error");
    return null;
  }
}

/**
 * Busca transmissões com filtros e paginação.
 * Suporte a filtro por tags múltiplas.
 */
async function fetchBroadcasts(page = 1, limit = 30) {
  showLoading();
  const params = { page, limit };
  if (state.filters.gender) params.gender = state.filters.gender;
  if (state.filters.country) params.country = state.filters.country;
  if (state.filters.orientation)
    params.sexualOrientation = state.filters.orientation;
  if (state.filters.tag) params.tag = state.filters.tag;
  if (state.filters.tags && state.filters.tags.length)
    params.tags = state.filters.tags.join(",");
  if (state.filters.search) params.search = state.filters.search;
  const data = await fetchAPI("", params);
  hideLoading();
  if (data?.broadcasts?.items) {
    if (page === 1) state.broadcasts = data.broadcasts.items;
    else state.broadcasts = [...state.broadcasts, ...data.broadcasts.items];
    return data.broadcasts.items;
  }
  return [];
}

/**
 * Busca as transmissões em destaque (top 10 por viewers).
 */
async function fetchFeaturedBroadcasts() {
  const data = await fetchAPI("", { limit: 10 });
  if (data?.broadcasts?.items) {
    state.featuredBroadcasts = data.broadcasts.items.sort(
      (a, b) => b.viewers - a.viewers
    );
    return state.featuredBroadcasts;
  }
  return [];
}
async function fetchUserDetails(username) {
  return await fetchAPI(`user/${username}`);
}
async function fetchUserLiveInfo(username) {
  return await fetchAPI(`user/${username}/liveInfo`);
}
async function fetchCountries() {
  // Lista estática para exemplo. Recomenda-se API real.
  const list = [
    { code: "BR", name: "Brasil" },
    { code: "US", name: "Estados Unidos" },
    { code: "ES", name: "Espanha" },
    { code: "FR", name: "França" },
    { code: "JP", name: "Japão" },
    { code: "DE", name: "Alemanha" },
    { code: "IT", name: "Itália" },
    { code: "CA", name: "Canadá" },
    { code: "MX", name: "México" },
    { code: "AR", name: "Argentina" },
    { code: "CO", name: "Colômbia" },
    { code: "PT", name: "Portugal" },
    { code: "RU", name: "Rússia" },
    { code: "CN", name: "China" },
    { code: "IN", name: "Índia" }
  ];
  const map = new Map();
  list.forEach((c) => map.set(c.code, c.name));
  state.countries = map;
  // Popular o select de países
  countrySelect.innerHTML = '<option value="">Todos os países</option>';
  list.forEach((c) => {
    const o = document.createElement("option");
    o.value = c.code.toLowerCase();
    o.textContent = c.name;
    countrySelect.appendChild(o);
  });
  return map;
}

// ======================
// Renderização de UI - Modular
// ======================

/**
 * Renderiza o carrossel de transmissões em destaque.
 * Estrutura modular para fácil manutenção.
 */
function renderCarousel(broadcasts) {
  if (!broadcasts || broadcasts.length === 0) return;
  carouselSlides.innerHTML = "";
  carouselIndicators.innerHTML = "";
  broadcasts.forEach((broadcast, idx) => {
    const slide = document.createElement("div");
    slide.className = `carousel-slide min-w-full md:min-w-[50%] lg:min-w-[33.333%] p-2`;
    const posterUrl =
      broadcast.preview?.poster ||
      "https://via.placeholder.com/640x360?text=No+Image";
    slide.innerHTML = `
      <div class="relative h-64 rounded-lg overflow-hidden bg-xcam-gray" style="background: url('${posterUrl}') center/cover no-repeat;">
        <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
        <div class="absolute bottom-0 left-0 p-4 w-full">
          <div class="flex items-center mb-2">
            <span class="bg-xcam-pink text-white text-xs px-2 py-1 rounded-full mr-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              ${formatViewerCount(broadcast.viewers)}
            </span>
            <div class="flex items-center">
              <img src="https://flagcdn.com/w20/${
                broadcast.country?.toLowerCase() || "xx"
              }.png" alt="${getCountryName(
      broadcast.country
    )}" class="w-4 h-3 mr-1" title="${getCountryName(broadcast.country)}">
            </div>
          </div>
          <h3 class="text-white font-semibold">@${broadcast.username}</h3>
          <button class="mt-2 bg-xcam-pink hover:bg-opacity-80 text-white py-1 px-4 rounded-full text-sm font-medium transition-colors watch-stream" data-username="${
            broadcast.username
          }">
            Assistir
          </button>
        </div>
      </div>
    `;
    carouselSlides.appendChild(slide);
    // Indicadores do carrossel
    const indicator = document.createElement("button");
    indicator.className = `carousel-indicator h-1 w-4 bg-gray-500 rounded-full transition-all ${
      idx === 0 ? "active" : ""
    }`;
    indicator.dataset.index = idx;
    carouselIndicators.appendChild(indicator);
  });
  // Eventos: botão assistir
  document.querySelectorAll(".watch-stream").forEach((btn) => {
    btn.addEventListener("click", () =>
      openUserModalByUsername(btn.dataset.username)
    );
  });
  // Indicadores
  document.querySelectorAll(".carousel-indicator").forEach((ind) => {
    ind.addEventListener("click", () => {
      currentSlide = parseInt(ind.dataset.index);
      updateCarouselPosition();
    });
  });
  updateCarouselPosition();
}

/**
 * Renderiza a grade de cards das transmissões.
 * Layout padronizado conforme referência visual (imagem 1).
 * Tags são clicáveis e filtram as transmissões.
 */
function renderStreams(broadcasts) {
  if (!broadcasts || broadcasts.length === 0) {
    streamsContainer.innerHTML =
      '<div class="col-span-full text-center py-8 text-gray-400">Nenhuma transmissão encontrada.</div>';
    return;
  }
  streamsContainer.innerHTML = "";
  broadcasts.forEach((broadcast) => {
    // Criação do card conforme padrão visual
    const card = document.createElement("div");
    card.className =
      "stream-card rounded-lg overflow-hidden bg-xcam-gray flex flex-col shadow-md hover:shadow-lg transition-shadow cursor-pointer";
    card.dataset.username = broadcast.username;

    // Poster do vídeo
    const posterUrl =
      broadcast.preview?.poster ||
      "https://via.placeholder.com/640x360?text=No+Image";

    // Tags
    let tagsHtml = "";
    if (broadcast.tags && broadcast.tags.length > 0) {
      tagsHtml = broadcast.tags
        .map(
          (tag) =>
            `<span class="tag bg-xcam-purple text-white px-3 py-1 rounded-full text-xs font-semibold mr-2 mb-2 inline-block cursor-pointer transition-all hover:bg-xcam-pink" data-tag="${(
              tag.name || tag
            ).toLowerCase()}">#${tag.name || tag}</span>`
        )
        .join("");
    }

    // Card HTML - padrão visual (imagem 1)
    card.innerHTML = `
      <div class="relative w-full h-48 flex-shrink-0">
        <img src="${posterUrl}" alt="@${
      broadcast.username
    }" class="absolute inset-0 w-full h-full object-cover" />
        <div class="absolute inset-0 bg-black bg-opacity-50"></div>
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="play-button bg-xcam-pink bg-opacity-90 rounded-full p-3 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="10" fill="#ff2a6d" opacity="0.7"/>
              <polygon points="10,8 16,12 10,16" fill="white"/>
            </svg>
          </div>
        </div>
      </div>
      <div class="flex-1 flex flex-col p-4">
        <div class="flex items-center mb-1">
          <span class="font-bold text-base text-white mr-2">@${
            broadcast.username
          }</span>
          <span class="flex items-center ml-auto text-gray-300 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            ${formatViewerCount(broadcast.viewers)}
          </span>
        </div>
        <div class="flex items-center mb-2">
          <img src="https://flagcdn.com/w20/${
            broadcast.country?.toLowerCase() || "xx"
          }.png" alt="${getCountryName(
      broadcast.country
    )}" class="w-4 h-3 mr-2" title="${getCountryName(broadcast.country)}">
          <span class="text-gray-200 text-sm">${getCountryName(
            broadcast.country
          )}</span>
        </div>
        <div class="flex flex-wrap gap-1 mt-1">${tagsHtml}</div>
      </div>
    `;

    // Evento: abrir modal ao clicar no card (exceto tags)
    card.addEventListener("click", (e) => {
      // Ao clicar em uma tag, não abrir o modal (será tratado no evento de tag)
      if (e.target.classList.contains("tag")) return;
      openUserModalByUsername(broadcast.username);
    });

    // Tornar todas as tags clicáveis: filtragem por tags
    card.querySelectorAll(".tag").forEach((tagEl) => {
      tagEl.addEventListener("click", (e) => {
        e.stopPropagation();
        const tag = tagEl.dataset.tag;
        if (!tag) return;
        setFilterByTag(tag);
      });
    });

    streamsContainer.appendChild(card);
  });
}

/**
 * Seta o filtro de tags e atualiza as transmissões.
 * Suporta múltiplas tags.
 */
function setFilterByTag(tag) {
  // Adiciona/remover tag do filtro
  if (!state.filters.tags.includes(tag)) state.filters.tags.push(tag);
  else state.filters.tags = state.filters.tags.filter((t) => t !== tag);
  state.filters.tag = ""; // zera filtro antigo para evitar conflito
  state.currentPage = 1;
  showToast(`Filtrando por tag: #${tag}`, "info");
  fetchBroadcasts(1).then(renderStreams);
}

// ======================
// Modal modular de usuário/transmissão
// ======================
/**
 * Abre o modal modular, preenchendo campos com dados do usuário/transmissão.
 * Modular, limpo e adaptável.
 */
async function openUserModalByUsername(username) {
  showLoading();
  try {
    const userDetails = await fetchUserDetails(username);
    const liveInfo = await fetchUserLiveInfo(username);

    // Preenche campos do modal
    userModalTitle.textContent = `@${username}`;
    userModalPlayer.src = `https://player.xcam.gay/?user=${username}`;
    userModalLogo.src = "https://xcam.gay/logo.svg";
    userModalUsername.textContent = `@${username}`;
    // Avatar
    if (userDetails?.profileImageURL) {
      userModalAvatar.innerHTML = `<img src="${userDetails.profileImageURL}" alt="${username}" class="w-full h-full object-cover">`;
    } else {
      userModalAvatar.innerHTML = `<span>${username
        .charAt(0)
        .toUpperCase()}</span>`;
    }
    // País
    const countryCode = userDetails?.country || "xx";
    const countryName = getCountryName(countryCode);
    userModalCountryFlag.src = `https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`;
    userModalCountryFlag.alt = countryName;
    userModalCountryName.textContent = countryName;
    // Espectadores
    userModalViewers.textContent = liveInfo?.viewers
      ? `${formatViewerCount(liveInfo.viewers)} espectadores`
      : "";
    // Estatísticas
    userModalStats.innerHTML = `
      <div class="stat-item"><span>${getGenderTranslation(
        userDetails?.gender
      )}</span></div>
      <div class="stat-item"><span>${getOrientationTranslation(
        userDetails?.sexualOrientation
      )}</span></div>
    `;
    // Tags
    userModalTags.innerHTML = "";
    if (liveInfo?.tags && liveInfo.tags.length > 0) {
      for (const tag of liveInfo.tags) {
        const tagName = tag.name || tag;
        const tagEl = document.createElement("span");
        tagEl.className =
          "tag bg-xcam-purple text-white px-3 py-1 rounded-full text-xs font-semibold mr-2 mb-2 inline-block cursor-pointer transition-all hover:bg-xcam-pink";
        tagEl.textContent = `#${tagName}`;
        tagEl.dataset.tag = tagName.toLowerCase();
        tagEl.addEventListener("click", (e) => {
          e.stopPropagation();
          setFilterByTag(tagName.toLowerCase());
          closeUserModal();
        });
        userModalTags.appendChild(tagEl);
      }
    }
    // Bio
    userModalBio.textContent = userDetails?.bio || "Sem descrição.";
    // Redes sociais
    userModalSocial.innerHTML = "";
    const socialIcons = {
      twitter:
        '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775..."/></svg>',
      instagram:
        '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="..."/></svg>',
      onlyfans:
        '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="..."/></svg>'
    };
    if (userDetails?.social && typeof userDetails.social === "object") {
      Object.entries(userDetails.social).forEach(([network, url]) => {
        userModalSocial.innerHTML += `
          <a href="${url}" class="social-link" target="_blank" rel="noopener" title="${network}">
            ${socialIcons[network.toLowerCase()] || "<svg ...></svg>"}
          </a>
        `;
      });
    }
    // Mostra o modal
    userModalOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  } catch (e) {
    showToast("Erro ao carregar usuário", "error");
  }
  hideLoading();
}
/** Fecha o modal modular e limpa player */
function closeUserModal() {
  userModalOverlay.classList.remove("active");
  userModalPlayer.src = "";
  document.body.style.overflow = "";
}

// ======================
// Eventos globais e navegação
// ======================

// Eventos do modal
userModalClose.addEventListener("click", closeUserModal);
userModalOverlay.addEventListener("click", (e) => {
  if (e.target === userModalOverlay) closeUserModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && userModalOverlay.classList.contains("active")) {
    closeUserModal();
  }
});

// Navegação do carrossel
let currentSlide = 0;
let slidesPerView = 1;
function updateSlidesPerView() {
  if (window.innerWidth < 768) slidesPerView = 1;
  else if (window.innerWidth < 1024) slidesPerView = 2;
  else slidesPerView = 3;
}
function updateCarouselPosition() {
  const slideWidth = 100 / slidesPerView;
  carouselSlides.style.transform = `translateX(-${currentSlide * slideWidth}%)`;
  document.querySelectorAll(".carousel-indicator").forEach((ind, idx) => {
    if (idx === currentSlide) ind.classList.add("active");
    else ind.classList.remove("active");
  });
}

// Filtros e busca
applyFiltersButton.addEventListener("click", async () => {
  state.filters.country = countrySelect.value;
  state.filters.gender = genderSelect.value;
  state.filters.orientation = orientationSelect.value;
  state.filters.tags = [];
  state.filters.tag = "";
  state.currentPage = 1;
  showToast("Aplicando filtros...", "info");
  const broadcasts = await fetchBroadcasts(1);
  renderStreams(broadcasts);
  showToast("Filtros aplicados com sucesso!", "success");
});
refreshStreamsButton.addEventListener("click", async () => {
  showToast("Atualizando transmissões...", "info");
  state.currentPage = 1;
  const broadcasts = await fetchBroadcasts(1);
  renderStreams(broadcasts);
  showToast("Transmissões atualizadas!", "success");
});
loadMoreButton.addEventListener("click", async () => {
  showToast("Carregando mais transmissões...", "info");
  state.currentPage++;
  const newBroadcasts = await fetchBroadcasts(state.currentPage);
  if (newBroadcasts.length > 0) {
    renderStreams([...state.broadcasts]);
    showToast("Mais transmissões carregadas!", "success");
  } else {
    showToast("Não há mais transmissões para carregar.", "warning");
  }
});
function handleSearch() {
  const searchTerm = (searchInput.value || mobileSearchInput.value).trim();
  if (searchTerm) {
    state.filters.search = searchTerm;
    state.filters.tags = [];
    state.filters.tag = "";
    state.currentPage = 1;
    showToast(`Buscando por "${searchTerm}"...`, "info");
    fetchBroadcasts(1).then((broadcasts) => {
      renderStreams(broadcasts);
      if (broadcasts.length > 0) {
        showToast(
          `${broadcasts.length} resultados encontrados para "${searchTerm}"`,
          "success"
        );
      } else {
        showToast(
          `Nenhum resultado encontrado para "${searchTerm}"`,
          "warning"
        );
      }
    });
  }
}
searchButton.addEventListener("click", handleSearch);
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleSearch();
});
mobileSearchButton.addEventListener("click", handleSearch);
mobileSearchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleSearch();
});

// Menu mobile
mobileMenuButton.addEventListener("click", () =>
  mobileMenu.classList.toggle("hidden")
);

// Carrossel: navegação
prevSlideButton.addEventListener("click", () => {
  if (currentSlide > 0) {
    currentSlide--;
    updateCarouselPosition();
  }
});
nextSlideButton.addEventListener("click", () => {
  const maxSlide =
    Math.ceil(state.featuredBroadcasts.length / slidesPerView) - 1;
  if (currentSlide < maxSlide) {
    currentSlide++;
    updateCarouselPosition();
  }
});
window.addEventListener("resize", () => {
  updateSlidesPerView();
  updateCarouselPosition();
});

// ======================
// Inicialização principal
// ======================
async function initialize() {
  showToast("Bem-vindo ao XCam!", "info");
  await fetchCountries();
  updateSlidesPerView();
  const featuredBroadcasts = await fetchFeaturedBroadcasts();
  renderCarousel(featuredBroadcasts);
  const broadcasts = await fetchBroadcasts();
  renderStreams(broadcasts);
}
initialize();