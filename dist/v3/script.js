// Sample data for fallback
const sampleData = {
  broadcasts: {
    total: 889,
    items: [
      {
        itemNumber: 1,
        id: "46920386",
        username: "arnold9725",
        country: "it",
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
        tags: ["fitness", "music"]
      },
      {
        itemNumber: 2,
        id: "12345678",
        username: "sophia_star",
        country: "br",
        sexualOrientation: "bisexual",
        profileImageURL:
          "https://via.placeholder.com/400x300/121212/FFFFFF?text=XCam",
        preview: {
          src:
            "https://stackvaults-hls.xcdnpro.com/a55edd56-19a4-42f1-b3c5-28443aec56cb/hls/as+9744f5df-0047-47d0-a722-0bbed74d9d00/index.m3u8",
          poster: "https://via.placeholder.com/400x300/121212/FFFFFF?text=XCam"
        },
        viewers: 452,
        broadcastType: "female",
        gender: "female",
        tags: ["dance", "music", "talk"]
      }
    ]
  }
};
// Country names mapping
const countryNames = {
  us: "Estados Unidos",
  br: "Brasil",
  es: "Espanha",
  fr: "França",
  it: "Itália",
  de: "Alemanha",
  jp: "Japão",
  kr: "Coreia do Sul",
  ru: "Rússia",
  ca: "Canadá",
  uk: "Reino Unido",
  au: "Austrália",
  mx: "México",
  ar: "Argentina",
  co: "Colômbia",
  pt: "Portugal",
  nl: "Holanda",
  se: "Suécia",
  no: "Noruega",
  fi: "Finlândia",
  dk: "Dinamarca",
  pl: "Polônia",
  cz: "República Tcheca",
  hu: "Hungria",
  ro: "Romênia",
  gr: "Grécia",
  tr: "Turquia",
  za: "África do Sul",
  in: "Índia",
  cn: "China",
  th: "Tailândia",
  sg: "Singapura",
  ph: "Filipinas",
  my: "Malásia",
  id: "Indonésia",
  vn: "Vietnã",
  ae: "Emirados Árabes Unidos",
  sa: "Arábia Saudita",
  eg: "Egito",
  ng: "Nigéria",
  ke: "Quênia",
  il: "Israel",
  ua: "Ucrânia",
  by: "Bielorrússia",
  kz: "Cazaquistão",
  cl: "Chile",
  pe: "Peru",
  ve: "Venezuela",
  ec: "Equador",
  bo: "Bolívia",
  py: "Paraguai",
  uy: "Uruguai",
  nz: "Nova Zelândia"
};
// Gender and orientation translations
const genderTranslations = {
  male: "Masculino",
  female: "Feminino",
  trans: "Trans",
  couple: "Casal"
};
const orientationTranslations = {
  straight: "Hetero",
  gay: "Gay",
  lesbian: "Lésbica",
  bisexual: "Bissexual"
};
// Global variables
let broadcasts = [];
let currentPage = 1;
let itemsPerPage = 9;
let totalPages = 1;
let currentCarouselIndex = 0;
let carouselItems = [];
let topStreamers = [];
let filters = {
  search: "",
  country: "",
  gender: "",
  orientation: ""
};
// DOM Elements
const mobileMenuButton = document.getElementById("mobile-menu-button");
const mobileMenu = document.getElementById("mobile-menu");
const searchInput = document.getElementById("search-input");
const mobileSearchInput = document.getElementById("mobile-search-input");
const carousel = document.getElementById("carousel");
const carouselItemsContainer = document.getElementById("carousel-items");
const carouselIndicators = document.getElementById("carousel-indicators");
const prevSlideButton = document.getElementById("prev-slide");
const nextSlideButton = document.getElementById("next-slide");
const broadcastsGrid = document.getElementById("broadcasts-grid");
const loadingState = document.getElementById("loading-state");
const errorState = document.getElementById("error-state");
const emptyState = document.getElementById("empty-state");
const retryButton = document.getElementById("retry-button");
const pagination = document.getElementById("pagination");
const pageNumbers = document.getElementById("page-numbers");
const firstPageButton = document.getElementById("first-page");
const prevPageButton = document.getElementById("prev-page");
const nextPageButton = document.getElementById("next-page");
const lastPageButton = document.getElementById("last-page");
const topStreamersContainer = document.getElementById("top-streamers");
const filterCountry = document.getElementById("filter-country");
const filterGender = document.getElementById("filter-gender");
const filterOrientation = document.getElementById("filter-orientation");
const applyFiltersButton = document.getElementById("apply-filters");
const broadcastModal = document.getElementById("broadcast-modal");
const closeModal = document.querySelector(".close-modal");
const modalUsername = document.getElementById("modal-username");
const modalAvatar = document.getElementById("modal-avatar");
const modalCountryFlag = document.getElementById("modal-country-flag");
const modalCountryName = document.getElementById("modal-country-name");
const modalViewers = document.getElementById("modal-viewers");
const modalGender = document.getElementById("modal-gender");
const modalOrientation = document.getElementById("modal-orientation");
const modalType = document.getElementById("modal-type");
const modalTags = document.getElementById("modal-tags");
const modalThumbnail = document.getElementById("modal-thumbnail");
const modalIframe = document.getElementById("modal-iframe");
const playButton = document.getElementById("play-button");
const relatedBroadcasts = document.getElementById("related-broadcasts");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toast-message");
// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  initApp();
  setupEventListeners();
});
// Initialize the application
function initApp() {
  fetchBroadcasts();
}
// Setup event listeners
function setupEventListeners() {
  // Mobile menu toggle
  mobileMenuButton.addEventListener("click", toggleMobileMenu);
  // Search functionality
  searchInput.addEventListener("input", handleSearch);
  mobileSearchInput.addEventListener("input", handleSearch);
  // Carousel navigation
  prevSlideButton.addEventListener("click", showPrevSlide);
  nextSlideButton.addEventListener("click", showNextSlide);
  // Retry button
  retryButton.addEventListener("click", fetchBroadcasts);
  // Pagination
  firstPageButton.addEventListener("click", () => goToPage(1));
  prevPageButton.addEventListener("click", () => goToPage(currentPage - 1));
  nextPageButton.addEventListener("click", () => goToPage(currentPage + 1));
  lastPageButton.addEventListener("click", () => goToPage(totalPages));
  // Filters
  applyFiltersButton.addEventListener("click", applyFilters);
  // Modal
  closeModal.addEventListener("click", closeModalHandler);
  playButton.addEventListener("click", playVideo);
  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === broadcastModal) {
      closeModalHandler();
    }
  });
}
// Toggle mobile menu
function toggleMobileMenu() {
  mobileMenu.classList.toggle("hidden");
}
// Handle search input
function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase();
  filters.search = searchTerm;
  // Sync search inputs
  if (e.target === searchInput) {
    mobileSearchInput.value = searchTerm;
  } else {
    searchInput.value = searchTerm;
  }
  filterBroadcasts();
}
// Apply filters
function applyFilters() {
  filters.country = filterCountry.value;
  filters.gender = filterGender.value;
  filters.orientation = filterOrientation.value;
  filterBroadcasts();
  showToast("Filtros aplicados com sucesso!");
}
// Filter broadcasts based on current filters
function filterBroadcasts() {
  const filteredBroadcasts = broadcasts.filter((broadcast) => {
    // Search filter
    if (
      filters.search &&
      !broadcast.username.toLowerCase().includes(filters.search)
    ) {
      return false;
    }
    // Country filter
    if (filters.country && broadcast.country !== filters.country) {
      return false;
    }
    // Gender filter
    if (filters.gender && broadcast.gender !== filters.gender) {
      return false;
    }
    // Orientation filter
    if (
      filters.orientation &&
      broadcast.sexualOrientation !== filters.orientation
    ) {
      return false;
    }
    return true;
  });
  renderBroadcasts(filteredBroadcasts);
}
// Fetch broadcasts from API
function fetchBroadcasts() {
  showLoadingState();
  // Try to fetch from API
  fetch("https://site.my.eu.org/0:/male.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      broadcasts = data.broadcasts.items;
      setupCarousel();
      setupTopStreamers();
      renderBroadcasts(broadcasts);
    })
    .catch((error) => {
      console.error("Error fetching broadcasts:", error);
      // Use sample data as fallback
      broadcasts = sampleData.broadcasts.items;
      setupCarousel();
      setupTopStreamers();
      renderBroadcasts(broadcasts);
    });
}
// Show loading state
function showLoadingState() {
  loadingState.classList.remove("hidden");
  broadcastsGrid.classList.add("hidden");
  errorState.classList.add("hidden");
  emptyState.classList.add("hidden");
  pagination.classList.add("hidden");
}
// Show error state
function showErrorState() {
  loadingState.classList.add("hidden");
  broadcastsGrid.classList.add("hidden");
  errorState.classList.remove("hidden");
  emptyState.classList.add("hidden");
  pagination.classList.add("hidden");
}
// Show empty state
function showEmptyState() {
  loadingState.classList.add("hidden");
  broadcastsGrid.classList.add("hidden");
  errorState.classList.add("hidden");
  emptyState.classList.remove("hidden");
  pagination.classList.add("hidden");
}
// Show broadcasts grid
function showBroadcastsGrid() {
  loadingState.classList.add("hidden");
  broadcastsGrid.classList.remove("hidden");
  errorState.classList.add("hidden");
  emptyState.classList.add("hidden");
  pagination.classList.remove("hidden");
}
// Setup carousel with top broadcasts
function setupCarousel() {
  carouselItems = broadcasts.slice(0, 5);
  // Clear carousel items
  carouselItemsContainer.innerHTML = "";
  carouselIndicators.innerHTML = "";
  // Create carousel items
  carouselItems.forEach((broadcast, index) => {
    const item = document.createElement("div");
    item.className = `carousel-item absolute inset-0 transition-opacity duration-500 ${
      index === 0 ? "opacity-100" : "opacity-0"
    }`;
    item.innerHTML = `
          <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10"></div>
          <img src="${broadcast.preview.poster}" alt="${broadcast.username}" class="w-full h-full object-cover">
          <div class="absolute bottom-0 left-0 p-6 z-20">
            <span class="bg-xcam-pink text-white px-2 py-1 rounded-md text-sm font-medium mb-2 inline-block">AO VIVO</span>
            <h2 class="text-2xl md:text-3xl font-bold text-white mb-1">@${broadcast.username}</h2>
            <p class="text-gray-300 mb-3">${broadcast.viewers} espectadores</p>
            <button class="bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-opacity-90 transition-colors" onclick="openModal('${broadcast.id}')">Assistir</button>
          </div>
        `;
    carouselItemsContainer.appendChild(item);
    // Create indicator
    const indicator = document.createElement("button");
    indicator.className = `w-3 h-3 rounded-full ${
      index === 0 ? "bg-white" : "bg-gray-500"
    }`;
    indicator.addEventListener("click", () => goToSlide(index));
    carouselIndicators.appendChild(indicator);
  });
  // Start carousel auto-rotation
  startCarouselRotation();
}
// Start carousel auto-rotation
function startCarouselRotation() {
  setInterval(() => {
    showNextSlide();
  }, 5000);
}
// Go to specific carousel slide
function goToSlide(index) {
  const items = document.querySelectorAll(".carousel-item");
  const indicators = document.querySelectorAll("#carousel-indicators button");
  // Hide all slides
  items.forEach((item) => {
    item.classList.add("opacity-0");
    item.classList.remove("opacity-100");
  });
  // Update indicators
  indicators.forEach((indicator, i) => {
    if (i === index) {
      indicator.classList.add("bg-white");
      indicator.classList.remove("bg-gray-500");
    } else {
      indicator.classList.add("bg-gray-500");
      indicator.classList.remove("bg-white");
    }
  });
  // Show selected slide
  items[index].classList.add("opacity-100");
  items[index].classList.remove("opacity-0");
  currentCarouselIndex = index;
}
// Show previous carousel slide
function showPrevSlide() {
  let newIndex = currentCarouselIndex - 1;
  if (newIndex < 0) {
    newIndex = carouselItems.length - 1;
  }
  goToSlide(newIndex);
}
// Show next carousel slide
function showNextSlide() {
  let newIndex = currentCarouselIndex + 1;
  if (newIndex >= carouselItems.length) {
    newIndex = 0;
  }
  goToSlide(newIndex);
}
// Setup top streamers sidebar
function setupTopStreamers() {
  // Sort broadcasts by viewers and take top 5
  topStreamers = [...broadcasts]
    .sort((a, b) => b.viewers - a.viewers)
    .slice(0, 5);
  // Clear container
  topStreamersContainer.innerHTML = "";
  // Create top streamers items
  topStreamers.forEach((streamer) => {
    const item = document.createElement("div");
    item.className =
      "flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer";
    item.onclick = () => openModal(streamer.id);
    item.innerHTML = `
          <img src="${streamer.profileImageURL}" alt="${streamer.username}" class="w-10 h-10 rounded-full object-cover">
          <div>
            <h4 class="font-medium text-white">@${streamer.username}</h4>
            <div class="flex items-center text-sm text-gray-400">
              <span class="flag-icon" style="background-image: url(https://flagcdn.com/w20/${streamer.country}.png)"></span>
              <span>${streamer.viewers} viewers</span>
            </div>
          </div>
        `;
    topStreamersContainer.appendChild(item);
  });
}
// Render broadcasts grid
function renderBroadcasts(broadcastsList) {
  if (broadcastsList.length === 0) {
    showEmptyState();
    return;
  }
  // Calculate pagination
  totalPages = Math.ceil(broadcastsList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBroadcasts = broadcastsList.slice(startIndex, endIndex);
  // Clear grid
  broadcastsGrid.innerHTML = "";
  // Create broadcast cards
  paginatedBroadcasts.forEach((broadcast) => {
    const card = document.createElement("div");
    card.className =
      "bg-gray-900 rounded-xl overflow-hidden border border-gray-800 transition-all duration-300 card-hover";
    card.onclick = () => openModal(broadcast.id);
    // Create tags HTML
    const tagsHTML =
      broadcast.tags.length > 0
        ? broadcast.tags
            .map(
              (tag) =>
                `<span class="bg-gray-800 text-gray-300 px-2 py-1 rounded-full text-xs">#${tag}</span>`
            )
            .join(" ")
        : "";
    card.innerHTML = `
          <div class="relative">
            <img src="${broadcast.preview.poster}" alt="${
      broadcast.username
    }" class="w-full aspect-video object-cover">
            <span class="badge-live absolute top-2 right-2 px-2 py-1 rounded-md text-white text-xs font-medium">AO VIVO</span>
            <div class="absolute bottom-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded-md text-white text-xs flex items-center">
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              ${broadcast.viewers}
            </div>
          </div>
          <div class="p-4">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold text-white">@${broadcast.username}</h3>
              <div class="flex items-center text-sm text-gray-400">
                <span class="flag-icon" style="background-image: url(https://flagcdn.com/w20/${
                  broadcast.country
                }.png)"></span>
                <span>${getCountryName(broadcast.country)}</span>
              </div>
            </div>
            <div class="flex flex-wrap gap-2 mb-2">
              <span class="bg-gray-800 text-gray-300 px-2 py-1 rounded-full text-xs">${
                genderTranslations[broadcast.gender] || broadcast.gender
              }</span>
              <span class="bg-gray-800 text-gray-300 px-2 py-1 rounded-full text-xs">${
                orientationTranslations[broadcast.sexualOrientation] ||
                broadcast.sexualOrientation
              }</span>
            </div>
            <div class="flex flex-wrap gap-1 mt-2">
              ${tagsHTML}
            </div>
          </div>
        `;
    broadcastsGrid.appendChild(card);
  });
  // Update pagination
  updatePagination();
  // Show broadcasts grid
  showBroadcastsGrid();
}
// Update pagination controls
function updatePagination() {
  // Clear page numbers
  pageNumbers.innerHTML = "";
  // Determine range of page numbers to show
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);
  // Ensure we always show 5 pages if possible
  if (endPage - startPage < 4) {
    if (startPage === 1) {
      endPage = Math.min(5, totalPages);
    } else if (endPage === totalPages) {
      startPage = Math.max(1, totalPages - 4);
    }
  }
  // Create page number buttons
  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement("button");
    pageButton.className = `pagination-btn w-8 h-8 flex items-center justify-center rounded-md text-sm ${
      i === currentPage ? "pagination-active" : "bg-gray-800 hover:bg-gray-700"
    }`;
    pageButton.textContent = i;
    pageButton.addEventListener("click", () => goToPage(i));
    pageNumbers.appendChild(pageButton);
  }
  // Update button states
  firstPageButton.disabled = currentPage === 1;
  prevPageButton.disabled = currentPage === 1;
  nextPageButton.disabled = currentPage === totalPages;
  lastPageButton.disabled = currentPage === totalPages;
  // Update button styles
  [firstPageButton, prevPageButton, nextPageButton, lastPageButton].forEach(
    (button) => {
      if (button.disabled) {
        button.classList.add("opacity-50", "cursor-not-allowed");
      } else {
        button.classList.remove("opacity-50", "cursor-not-allowed");
      }
    }
  );
}
// Go to specific page
function goToPage(page) {
  if (page < 1 || page > totalPages || page === currentPage) {
    return;
  }
  currentPage = page;
  filterBroadcasts();
}
// Open broadcast modal
function openModal(broadcastId) {
  const broadcast = broadcasts.find((b) => b.id === broadcastId);
  if (!broadcast) {
    showToast("Transmissão não encontrada");
    return;
  }
  // Set modal content
  modalUsername.textContent = `@${broadcast.username}`;
  modalAvatar.src = broadcast.profileImageURL;
  modalCountryFlag.style.backgroundImage = `url(https://flagcdn.com/w20/${broadcast.country}.png)`;
  modalCountryName.textContent = getCountryName(broadcast.country);
  modalViewers.textContent = broadcast.viewers;
  modalGender.textContent =
    genderTranslations[broadcast.gender] || broadcast.gender;
  modalOrientation.textContent =
    orientationTranslations[broadcast.sexualOrientation] ||
    broadcast.sexualOrientation;
  modalType.textContent = broadcast.broadcastType;
  modalThumbnail.src = broadcast.preview.poster;
  // Reset iframe
  modalIframe.classList.add("hidden");
  modalIframe.src = "";
  document.getElementById("modal-player").classList.remove("hidden");
  // Set tags
  modalTags.innerHTML = "";
  if (broadcast.tags && broadcast.tags.length > 0) {
    broadcast.tags.forEach((tag) => {
      const tagElement = document.createElement("span");
      tagElement.className =
        "bg-xcam-blue bg-opacity-30 text-xcam-blue px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-opacity-50 transition-colors";
      tagElement.textContent = `#${tag}`;
      tagElement.addEventListener("click", () => {
        filters.search = tag;
        searchInput.value = tag;
        mobileSearchInput.value = tag;
        closeModalHandler();
        filterBroadcasts();
      });
      modalTags.appendChild(tagElement);
    });
  }
  // Set related broadcasts
  const relatedBroadcastsList = broadcasts
    .filter(
      (b) =>
        b.id !== broadcastId &&
        (b.gender === broadcast.gender ||
          b.sexualOrientation === broadcast.sexualOrientation ||
          b.country === broadcast.country)
    )
    .slice(0, 3);
  relatedBroadcasts.innerHTML = "";
  relatedBroadcastsList.forEach((related) => {
    const relatedItem = document.createElement("div");
    relatedItem.className =
      "cursor-pointer hover:opacity-90 transition-opacity";
    relatedItem.onclick = () => {
      openModal(related.id);
    };
    relatedItem.innerHTML = `
          <div class="relative">
            <img src="${related.preview.poster}" alt="${related.username}" class="w-full aspect-video object-cover rounded-lg">
            <span class="badge-live absolute top-2 right-2 px-2 py-1 rounded-md text-white text-xs font-medium">AO VIVO</span>
          </div>
          <h4 class="font-medium text-white mt-2">@${related.username}</h4>
          <div class="flex items-center text-sm text-gray-400">
            <span class="flag-icon" style="background-image: url(https://flagcdn.com/w20/${related.country}.png)"></span>
            <span>${related.viewers} viewers</span>
          </div>
        `;
    relatedBroadcasts.appendChild(relatedItem);
  });
  // Store broadcast ID for play button
  playButton.setAttribute("data-broadcast-id", broadcastId);
  // Show modal
  broadcastModal.style.display = "block";
  document.body.style.overflow = "hidden";
}
// Close modal handler
function closeModalHandler() {
  broadcastModal.style.display = "none";
  document.body.style.overflow = "auto";
  // Stop video if playing
  modalIframe.src = "";
}
// Play video
function playVideo() {
  const broadcastId = playButton.getAttribute("data-broadcast-id");
  const videoUrl = `https://xcam.gay/cam/?id=${broadcastId}`;
  // Hide player controls and show iframe
  document.getElementById("modal-player").classList.add("hidden");
  modalIframe.src = videoUrl;
  modalIframe.classList.remove("hidden");
  showToast("Carregando transmissão...");
}
// Show toast notification
function showToast(message) {
  toastMessage.textContent = message;
  toast.classList.remove("hidden");
  // Hide toast after 3 seconds
  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}
// Get country name from country code
function getCountryName(countryCode) {
  return countryNames[countryCode] || countryCode.toUpperCase();
}
// Make functions available globally
window.openModal = openModal;
window.closeModalHandler = closeModalHandler;
window.playVideo = playVideo;

(function () {
  function c() {
    var b = a.contentDocument || a.contentWindow.document;
    if (b) {
      var d = b.createElement("script");
      d.innerHTML =
        "window.__CF$cv$params={r:'93cd3eb59322df41',t:'MTc0Njc1MjI3MC4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";
      b.getElementsByTagName("head")[0].appendChild(d);
    }
  }
  if (document.body) {
    var a = document.createElement("iframe");
    a.height = 1;
    a.width = 1;
    a.style.position = "absolute";
    a.style.top = 0;
    a.style.left = 0;
    a.style.border = "none";
    a.style.visibility = "hidden";
    document.body.appendChild(a);
    if ("loading" !== document.readyState) c();
    else if (window.addEventListener)
      document.addEventListener("DOMContentLoaded", c);
    else {
      var e = document.onreadystatechange || function () {};
      document.onreadystatechange = function (b) {
        e(b);
        "loading" !== document.readyState &&
          ((document.onreadystatechange = e), c());
      };
    }
  }
})();
