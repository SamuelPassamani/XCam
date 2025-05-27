// Configuração da API
const API_BASE_URL = "https://api.xcam.gay/";

// Estado global
const state = {
  broadcasts: [],
  featuredBroadcasts: [],
  currentPage: 1,
  filters: {
    gender: "",
    country: "",
    orientation: "",
    tag: "",
    search: ""
  },
  countries: new Map(),
  isLoading: false
};

// Elementos DOM
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

// Elementos do novo modal de usuário/transmissão
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

// Utilitários e internacionalização
function showLoading() {
  state.isLoading = true;
  loadingOverlay.classList.remove("hidden");
}
function hideLoading() {
  state.isLoading = false;
  loadingOverlay.classList.add("hidden");
}
function formatViewerCount(count) {
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + "K";
  }
  return count;
}
function getCountryName(countryCode) {
  if (!countryCode) return "Desconhecido";
  return state.countries.get(countryCode.toUpperCase()) || countryCode;
}
function getGenderTranslation(gender) {
  const translations = {
    male: "Masculino",
    female: "Feminino",
    trans: "Trans",
    "non-binary": "Não-binário"
  };
  return translations[gender] || gender || "Não especificado";
}
function getOrientationTranslation(orientation) {
  const translations = {
    straight: "Heterossexual",
    gay: "Gay",
    lesbian: "Lésbica",
    bisexual: "Bissexual",
    pansexual: "Pansexual"
  };
  return translations[orientation] || orientation || "Não especificado";
}
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
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// --- Funções de API ---
async function fetchAPI(endpoint, params = {}) {
  try {
    const url = new URL(endpoint, API_BASE_URL);
    Object.keys(params).forEach((key) => {
      if (params[key]) url.searchParams.append(key, params[key]);
    });
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`API request failed with status ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    showToast("Erro ao carregar dados. Tente novamente.", "error");
    return null;
  }
}
async function fetchBroadcasts(page = 1, limit = 30) {
  showLoading();
  const apiParams = { page, limit };
  if (state.filters.gender) apiParams.gender = state.filters.gender;
  if (state.filters.country) apiParams.country = state.filters.country;
  if (state.filters.orientation)
    apiParams.sexualOrientation = state.filters.orientation;
  if (state.filters.tag) apiParams.tag = state.filters.tag;
  if (state.filters.search) apiParams.search = state.filters.search;
  const data = await fetchAPI("", apiParams);
  hideLoading();
  if (data && data.broadcasts && data.broadcasts.items) {
    if (page === 1) {
      state.broadcasts = data.broadcasts.items;
    } else {
      state.broadcasts = [...state.broadcasts, ...data.broadcasts.items];
    }
    return data.broadcasts.items;
  }
  return [];
}
async function fetchFeaturedBroadcasts() {
  const data = await fetchAPI("", { limit: 10 });
  if (data && data.broadcasts && data.broadcasts.items) {
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
  try {
    // Este array pode ser substituído por um endpoint real futuramente
    const countries = [
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
    const countryMap = new Map();
    countries.forEach((country) => countryMap.set(country.code, country.name));
    state.countries = countryMap;
    // Popular select de países
    countries.forEach((country) => {
      const option = document.createElement("option");
      option.value = country.code.toLowerCase();
      option.textContent = country.name;
      countrySelect.appendChild(option);
    });
    return countryMap;
  } catch (error) {
    console.error("Error fetching countries:", error);
    return new Map();
  }
}

// --- Renderização de UI ---
function renderCarousel(broadcasts) {
  if (!broadcasts || broadcasts.length === 0) return;
  carouselSlides.innerHTML = "";
  carouselIndicators.innerHTML = "";
  broadcasts.forEach((broadcast, index) => {
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
    // Indicadores
    const indicator = document.createElement("button");
    indicator.className = `carousel-indicator h-1 w-4 bg-gray-500 rounded-full transition-all ${
      index === 0 ? "active" : ""
    }`;
    indicator.dataset.index = index;
    carouselIndicators.appendChild(indicator);
  });
  document.querySelectorAll(".watch-stream").forEach((button) => {
    button.addEventListener("click", () => {
      openUserModalByUsername(button.dataset.username);
    });
  });
  document.querySelectorAll(".carousel-indicator").forEach((indicator) => {
    indicator.addEventListener("click", () => {
      currentSlide = parseInt(indicator.dataset.index);
      updateCarouselPosition();
    });
  });
  updateCarouselPosition();
}

function renderStreams(broadcasts) {
  if (!broadcasts || broadcasts.length === 0) {
    streamsContainer.innerHTML =
      '<div class="col-span-full text-center py-8 text-gray-400">Nenhuma transmissão encontrada.</div>';
    return;
  }
  streamsContainer.innerHTML = "";
  broadcasts.forEach((broadcast) => {
    const card = document.createElement("div");
    card.className =
      "stream-card relative rounded-lg overflow-hidden bg-xcam-gray cursor-pointer";
    card.dataset.username = broadcast.username;
    const posterUrl =
      broadcast.preview?.poster ||
      "https://via.placeholder.com/640x360?text=No+Image";
    let tagsHtml = "";
    if (broadcast.tags && broadcast.tags.length > 0) {
      tagsHtml = broadcast.tags
        .slice(0, 3)
        .map(
          (tag) =>
            `<span class="tag text-xs text-white px-2 py-0.5 rounded-full">#${
              tag.name || tag
            }</span>`
        )
        .join("");
    }
    card.innerHTML = `
      <div class="aspect-w-16 aspect-h-9 relative">
        <img src="${posterUrl}" alt="${
      broadcast.username
    }" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
        <div class="absolute inset-0 flex items-center justify-center">
          <button class="play-button bg-xcam-pink bg-opacity-70 hover:bg-opacity-90 rounded-full p-3 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>
      <div class="p-3">
        <div class="flex justify-between items-center mb-1">
          <h3 class="font-medium text-white">@${broadcast.username}</h3>
          <div class="flex items-center text-xs text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            ${formatViewerCount(broadcast.viewers)}
          </div>
        </div>
        <div class="flex items-center mb-2">
          <img src="https://flagcdn.com/w20/${
            broadcast.country?.toLowerCase() || "xx"
          }.png" alt="${getCountryName(
      broadcast.country
    )}" class="w-4 h-3 mr-1" title="${getCountryName(broadcast.country)}">
          <span class="text-xs text-gray-300">${getCountryName(
            broadcast.country
          )}</span>
        </div>
        <div class="flex flex-wrap gap-1">${tagsHtml}</div>
      </div>
    `;
    streamsContainer.appendChild(card);
    card.addEventListener("click", () => {
      openUserModalByUsername(broadcast.username);
    });
  });
}

// --- Modal de Usuário/Transmissão ---
async function openUserModalByUsername(username) {
  showLoading();
  try {
    // Busca detalhes do usuário e transmissão ao vivo
    const userDetails = await fetchUserDetails(username);
    const liveInfo = await fetchUserLiveInfo(username);

    // Preenche campos do modal com os dados recebidos
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

    // Estatísticas (exemplo: gênero e orientação)
    userModalStats.innerHTML = "";
    userModalStats.innerHTML += `
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
        userModalTags.innerHTML += `<div class="tag">#${tag.name || tag}</div>`;
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
      // Adicione outros ícones conforme necessário
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

    // Exibe o modal
    userModalOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  } catch (e) {
    showToast("Erro ao carregar usuário", "error");
  }
  hideLoading();
}

// Fechar modal (botão, overlay, ESC)
userModalClose.addEventListener("click", closeUserModal);
userModalOverlay.addEventListener("click", function (e) {
  if (e.target === this) closeUserModal();
});
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && userModalOverlay.classList.contains("active")) {
    closeUserModal();
  }
});
function closeUserModal() {
  userModalOverlay.classList.remove("active");
  userModalPlayer.src = "";
  document.body.style.overflow = "";
}

// --- Navegação carousel ---
let currentSlide = 0;
let slidesPerView = 1;
function updateSlidesPerView() {
  if (window.innerWidth < 768) {
    slidesPerView = 1;
  } else if (window.innerWidth < 1024) {
    slidesPerView = 2;
  } else {
    slidesPerView = 3;
  }
}
function updateCarouselPosition() {
  const slideWidth = 100 / slidesPerView;
  carouselSlides.style.transform = `translateX(-${currentSlide * slideWidth}%)`;
  document
    .querySelectorAll(".carousel-indicator")
    .forEach((indicator, index) => {
      if (index === currentSlide) {
        indicator.classList.add("active");
      } else {
        indicator.classList.remove("active");
      }
    });
}

// --- Eventos globais ---
mobileMenuButton.addEventListener("click", () => {
  mobileMenu.classList.toggle("hidden");
});
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
applyFiltersButton.addEventListener("click", async () => {
  state.filters.country = countrySelect.value;
  state.filters.gender = genderSelect.value;
  state.filters.orientation = orientationSelect.value;
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
window.addEventListener("resize", () => {
  updateSlidesPerView();
  updateCarouselPosition();
});

// Inicialização principal
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