// API Configuration
const API_BASE_URL = "https://api.xcam.gay/";
// Global state
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
  countries: new Map(), // To store country codes and names
  isLoading: false
};
// DOM Elements
const mobileMenuButton = document.getElementById("mobile-menu-button");
const mobileMenu = document.getElementById("mobile-menu");
const prevSlideButton = document.getElementById("prev-slide");
const nextSlideButton = document.getElementById("next-slide");
const carouselSlides = document.getElementById("carousel-slides");
const carouselIndicators = document.getElementById("carousel-indicators");
const streamModal = document.getElementById("stream-modal");
const closeModalButton = document.getElementById("close-modal");
const streamIframe = document.getElementById("stream-iframe");
const modalUsername = document.getElementById("modal-username");
const modalAvatar = document.getElementById("modal-avatar");
const modalCountryFlag = document.getElementById("modal-country-flag");
const modalCountry = document.getElementById("modal-country");
const modalGender = document.getElementById("modal-gender");
const modalOrientation = document.getElementById("modal-orientation");
const modalBio = document.getElementById("modal-bio");
const modalSocial = document.getElementById("modal-social");
const relatedStreams = document.getElementById("related-streams");
const applyFiltersButton = document.getElementById("apply-filters");
const refreshStreamsButton = document.getElementById("refresh-streams");
const loadMoreButton = document.getElementById("load-more");
const toastContainer = document.getElementById("toast-container");
const streamsContainer = document.getElementById("streams-container");
const countrySelect = document.getElementById("country");
const genderSelect = document.getElementById("gender");
const orientationSelect = document.getElementById("orientation");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const mobileSearchInput = document.getElementById("mobile-search-input");
const mobileSearchButton = document.getElementById("mobile-search-button");
const loadingOverlay = document.getElementById("loading-overlay");
// Helper Functions
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
// Toast Messages
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
  // Remove toast after animation completes
  setTimeout(() => {
    toast.remove();
  }, 3000);
}
// API Functions
async function fetchAPI(endpoint, params = {}) {
  try {
    const url = new URL(endpoint, API_BASE_URL);
    // Add params to URL
    Object.keys(params).forEach((key) => {
      if (params[key]) {
        url.searchParams.append(key, params[key]);
      }
    });
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    showToast("Erro ao carregar dados. Tente novamente.", "error");
    return null;
  }
}
async function fetchBroadcasts(page = 1, limit = 30) {
  showLoading();
  // Map our filter names to API parameter names
  const apiParams = {
    page: page,
    limit: limit
  };
  // Map gender filter
  if (state.filters.gender) {
    apiParams.gender = state.filters.gender;
  }
  // Map country filter
  if (state.filters.country) {
    apiParams.country = state.filters.country;
  }
  // Map orientation filter (API uses sexualOrientation)
  if (state.filters.orientation) {
    apiParams.sexualOrientation = state.filters.orientation;
  }
  // Map tag filter
  if (state.filters.tag) {
    apiParams.tag = state.filters.tag;
  }
  // Map search filter
  if (state.filters.search) {
    apiParams.search = state.filters.search;
  }
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
  // For featured broadcasts, we'll get the top 10 by viewers
  const data = await fetchAPI("", {
    limit: 10
  });
  if (data && data.broadcasts && data.broadcasts.items) {
    // Sort by viewer count descending
    state.featuredBroadcasts = data.broadcasts.items.sort(
      (a, b) => b.viewers - a.viewers
    );
    return state.featuredBroadcasts;
  }
  return [];
}
async function fetchUserDetails(username) {
  const data = await fetchAPI(`user/${username}`);
  return data;
}
async function fetchUserLiveInfo(username) {
  const data = await fetchAPI(`user/${username}/liveInfo`);
  return data;
}
async function fetchCountries() {
  try {
    // This would typically come from the API, but for this example we'll use a static list
    const countries = [
      {
        code: "BR",
        name: "Brasil"
      },
      {
        code: "US",
        name: "Estados Unidos"
      },
      {
        code: "ES",
        name: "Espanha"
      },
      {
        code: "FR",
        name: "França"
      },
      {
        code: "JP",
        name: "Japão"
      },
      {
        code: "DE",
        name: "Alemanha"
      },
      {
        code: "IT",
        name: "Itália"
      },
      {
        code: "CA",
        name: "Canadá"
      },
      {
        code: "MX",
        name: "México"
      },
      {
        code: "AR",
        name: "Argentina"
      },
      {
        code: "CO",
        name: "Colômbia"
      },
      {
        code: "PT",
        name: "Portugal"
      },
      {
        code: "RU",
        name: "Rússia"
      },
      {
        code: "CN",
        name: "China"
      },
      {
        code: "IN",
        name: "Índia"
      }
    ];
    // Create a Map for easy lookup
    const countryMap = new Map();
    countries.forEach((country) => {
      countryMap.set(country.code, country.name);
    });
    state.countries = countryMap;
    // Populate country select
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
// UI Functions
function renderCarousel(broadcasts) {
  if (!broadcasts || broadcasts.length === 0) return;
  carouselSlides.innerHTML = "";
  carouselIndicators.innerHTML = "";
  broadcasts.forEach((broadcast, index) => {
    const slide = document.createElement("div");
    slide.className = `carousel-slide min-w-full md:min-w-[50%] lg:min-w-[33.333%] p-2`;
    // Get background image URL (poster)
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
                                    }.png" 
                                         alt="${getCountryName(
                                           broadcast.country
                                         )}" 
                                         class="w-4 h-3 mr-1" 
                                         title="${getCountryName(
                                           broadcast.country
                                         )}">
                                </div>
                            </div>
                            <h3 class="text-white font-semibold">@${
                              broadcast.username
                            }</h3>
                            <button class="mt-2 bg-xcam-pink hover:bg-opacity-80 text-white py-1 px-4 rounded-full text-sm font-medium transition-colors watch-stream" data-username="${
                              broadcast.username
                            }">
                                Assistir
                            </button>
                        </div>
                    </div>
                `;
    carouselSlides.appendChild(slide);
    // Create indicator
    const indicator = document.createElement("button");
    indicator.className = `carousel-indicator h-1 w-4 bg-gray-500 rounded-full transition-all ${
      index === 0 ? "active" : ""
    }`;
    indicator.dataset.index = index;
    carouselIndicators.appendChild(indicator);
  });
  // Add event listeners to watch buttons
  document.querySelectorAll(".watch-stream").forEach((button) => {
    button.addEventListener("click", () => {
      openStreamModal(button.dataset.username);
    });
  });
  // Add event listeners to indicators
  document.querySelectorAll(".carousel-indicator").forEach((indicator) => {
    indicator.addEventListener("click", () => {
      currentSlide = parseInt(indicator.dataset.index);
      updateCarouselPosition();
    });
  });
  // Initialize carousel position
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
    // Get background image URL (poster)
    const posterUrl =
      broadcast.preview?.poster ||
      "https://via.placeholder.com/640x360?text=No+Image";
    // Create tags HTML
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
                            <h3 class="font-medium text-white">@${
                              broadcast.username
                            }</h3>
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
                            }.png" 
                                 alt="${getCountryName(broadcast.country)}" 
                                 class="w-4 h-3 mr-1" 
                                 title="${getCountryName(broadcast.country)}">
                            <span class="text-xs text-gray-300">${getCountryName(
                              broadcast.country
                            )}</span>
                        </div>
                        <div class="flex flex-wrap gap-1">
                            ${tagsHtml}
                        </div>
                    </div>
                `;
    streamsContainer.appendChild(card);
    // Add click event to open modal
    card.addEventListener("click", () => {
      openStreamModal(broadcast.username);
    });
  });
}
async function openStreamModal(username) {
  showLoading();
  // Set iframe source
  streamIframe.src = `https://player.xcam.gay/?user=${username}`;
  // Set username
  modalUsername.textContent = `@${username}`;
  try {
    // Fetch user details
    const userDetails = await fetchUserDetails(username);
    const liveInfo = await fetchUserLiveInfo(username);
    if (userDetails) {
      // Set country
      const countryCode = userDetails.country || "xx";
      const countryName = getCountryName(countryCode);
      modalCountryFlag.src = `https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`;
      modalCountryFlag.alt = countryName;
      modalCountry.textContent = countryName;
      // Set gender and orientation
      modalGender.textContent = getGenderTranslation(userDetails.gender);
      modalOrientation.textContent = getOrientationTranslation(
        userDetails.sexualOrientation
      );
      // Set bio
      modalBio.textContent = userDetails.bio || "Sem biografia disponível.";
      // Set avatar
      if (userDetails.profileImageURL) {
        modalAvatar.innerHTML = `<img src="${userDetails.profileImageURL}" alt="${username}" class="w-full h-full object-cover">`;
      } else {
        const initial = username.charAt(0).toUpperCase();
        modalAvatar.innerHTML = `<div class="w-full h-full flex items-center justify-center text-white font-bold text-xl">${initial}</div>`;
      }
      // Set social links
      if (userDetails.social && Object.keys(userDetails.social).length > 0) {
        modalSocial.innerHTML = "";
        // Map of social network names to icons
        const socialIcons = {
          twitter: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                                      </svg>`,
          instagram: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                        </svg>`,
          facebook: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                         <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                                       </svg>`,
          youtube: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                       <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                                     </svg>`,
          tiktok: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                                    </svg>`
        };
        for (const [network, url] of Object.entries(userDetails.social)) {
          const link = document.createElement("a");
          link.href = url;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.className =
            "text-gray-300 hover:text-xcam-pink transition-colors";
          // Use the appropriate icon or a generic one
          link.innerHTML =
            socialIcons[network.toLowerCase()] ||
            `
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            `;
          modalSocial.appendChild(link);
        }
      } else {
        modalSocial.innerHTML =
          '<span class="text-gray-400 text-sm">Nenhuma rede social disponível</span>';
      }
      // Fetch related broadcasts (same country or tags)
      let relatedParams = {};
      if (userDetails.country) {
        relatedParams.country = userDetails.country;
      }
      if (userDetails.gender) {
        relatedParams.gender = userDetails.gender;
      }
      const relatedData = await fetchAPI("", {
        ...relatedParams,
        limit: 4
      });
      if (
        relatedData &&
        relatedData.broadcasts &&
        relatedData.broadcasts.items
      ) {
        // Filter out the current broadcast
        const filteredBroadcasts = relatedData.broadcasts.items.filter(
          (b) => b.username !== username
        );
        if (filteredBroadcasts.length > 0) {
          relatedStreams.innerHTML = "";
          filteredBroadcasts.slice(0, 3).forEach((broadcast) => {
            const relatedItem = document.createElement("div");
            relatedItem.className =
              "flex items-center bg-xcam-dark rounded-md p-2 cursor-pointer hover:bg-opacity-80 transition-colors";
            relatedItem.dataset.username = broadcast.username;
            // Get thumbnail
            const thumbnailUrl =
              broadcast.preview?.poster ||
              "https://via.placeholder.com/160x120?text=No+Image";
            relatedItem.innerHTML = `
                                    <div class="w-16 h-12 bg-xcam-purple rounded overflow-hidden mr-3 flex-shrink-0">
                                        <img src="${thumbnailUrl}" alt="${
              broadcast.username
            }" class="w-full h-full object-cover">
                                    </div>
                                    <div>
                                        <p class="text-white text-sm font-medium">@${
                                          broadcast.username
                                        }</p>
                                        <div class="flex items-center">
                                            <img src="https://flagcdn.com/w20/${
                                              broadcast.country?.toLowerCase() ||
                                              "xx"
                                            }.png" 
                                                 alt="${getCountryName(
                                                   broadcast.country
                                                 )}" 
                                                 class="w-3 h-2 mr-1">
                                            <span class="text-xs text-gray-400">${formatViewerCount(
                                              broadcast.viewers
                                            )} viewers</span>
                                        </div>
                                    </div>
                                `;
            relatedStreams.appendChild(relatedItem);
            // Add click event to open related stream
            relatedItem.addEventListener("click", () => {
              openStreamModal(broadcast.username);
            });
          });
        } else {
          relatedStreams.innerHTML =
            '<div class="text-gray-400 text-sm">Nenhuma transmissão relacionada encontrada</div>';
        }
      }
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
    modalBio.textContent = "Erro ao carregar detalhes do usuário.";
    modalSocial.innerHTML =
      '<span class="text-gray-400 text-sm">Erro ao carregar redes sociais</span>';
    relatedStreams.innerHTML =
      '<div class="text-gray-400 text-sm">Erro ao carregar transmissões relacionadas</div>';
  }
  hideLoading();
  streamModal.classList.remove("hidden");
  document.body.style.overflow = "hidden"; // Prevent scrolling when modal is open
}
// Carousel Navigation
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
  // Update indicators
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
// Event Listeners
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
closeModalButton.addEventListener("click", () => {
  streamModal.classList.add("hidden");
  streamIframe.src = "";
  document.body.style.overflow = ""; // Re-enable scrolling
});
streamModal.addEventListener("click", (e) => {
  if (e.target === streamModal) {
    streamModal.classList.add("hidden");
    streamIframe.src = "";
    document.body.style.overflow = "";
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
  if (e.key === "Enter") {
    handleSearch();
  }
});
mobileSearchButton.addEventListener("click", handleSearch);
mobileSearchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    handleSearch();
  }
});
// Window resize event
window.addEventListener("resize", () => {
  updateSlidesPerView();
  updateCarouselPosition();
});
// Initialize
async function initialize() {
  showToast("Bem-vindo ao XCam!", "info");
  // Fetch countries for filter
  await fetchCountries();
  // Update slides per view based on screen size
  updateSlidesPerView();
  // Fetch featured broadcasts for carousel
  const featuredBroadcasts = await fetchFeaturedBroadcasts();
  renderCarousel(featuredBroadcasts);
  // Fetch initial broadcasts
  const broadcasts = await fetchBroadcasts();
  renderStreams(broadcasts);
}
// Start the app
initialize();
