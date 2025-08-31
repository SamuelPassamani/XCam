// Importa as traduções do script externo;
import {
  COUNTRY_NAMES,;
  TRANSLATIONS;
} from "https://xcam.gay/translations.js";
// --- LÓGICA DA APLICAÇÃO ---;
// Constantes para os ícones;
// Declaração de variável: GENDER_ICON_SVG
const GENDER_ICON_SVG =;
  "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IS0tIFVwbG9hZGVkIHRvOiBTVkcgUmVwbywgd3d3LnN2Z3JlcG8uY29tLCBHZW5lcmF0b3I6IFNWRyBSZXBvIE1peGVyIFRvb2xzIC0tPgo8c3ZnIGZpbGw9IiNGRkZGRkYiIHdpZHRoPSI4MDBweCIgaGVpZHRoPSI4MDBweCIgdmlld0JveD0iMCAwIDI1NiAyNTYiIGlkPSJGbGF0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxwYXRoIGQ9Ik0yMTkuOTk3OCwyMy45NTU1N3EtLjAwMjE5LS41Njk4NC0uMDU3NDktMS4xMzgxOWMtLjAxOC0uMTg0MDgtLjA1MjM3LS4zNjI3OS0uMDc4NDktLjU0NDQzLS4wMjk3OS0uMjA1NTctLjA1MzcxLS40MTIxMS0uMDk0MjQtLjYxNjIxLS4wNDAyOS0uMjAzNjItLjA5NjA3LS40MDA4OC0uMTQ2NDktLjYwMDU5LS4wNDU0MS0uMTgwMTctLjA4NDg0LS4zNjA4NC0uMTM4NjctLjUzOTA2LS4wNTg4NC0uMTk0MzQtLjEzMTU5LS4zODEzNS0uMTk5NzEtLjU3MTI5LS4wNjQ0NS0uMTc5NjktLjEyMzUzLS4zNjA4NC0uMTk2NzctLjUzNzYtLjA3MzQ5LS4xNzcyNC0uMTU5NjctLjM0NjY4LS4yNDEwOS0uNTE5NTMtLjA4NTgyLS4xODIxMy0uMTY2ODctLjM2NjIxLS4yNjI1Ny0uNTQ0OTItLjA4OC0uMTY0NTUtLjE4ODI0LS4zMjAzMS0uMjgzNy0uNDgwNDctLjEwNTM0LS4xNzYyNy0uMjA1Mi0uMzU1LS4zMjAzMS0uNTI2ODUtLjExNTcyLS4xNzMzNC0uMjQ0NzUtLjMzNTQ1LS4zNjktLjUwMi0uMTEtLjE0NzQ2LS4yMTI1Mi0uMjk4MzQtLjMzMDItLjQ0MTQtLjIzNDYyLS4yODYxNC0uNDgzNC0uNTU5NTctLjc0MzE2LS44MjIyNy0uMDE3ODItLjAxODA3LS4wMzI0Ny0uMDM4MDktLjA1MDU0LS4wNTYxNS0uMDE4MzEtLjAxODU2LS4wMzg1Ny0uMDMzMi0uMDU2ODgtLjA1MTI3cS0uMzk0NDEtLjM4OTY2LS44MjIyNy0uNzQzMTdjLS4xMzk2NS0uMTE0NzQtLjI4Njg2LS4yMTQzNS0uNDMwNDItLjMyMTc3LS4xNjk5Mi0uMTI3LS4zMzYwNi0uMjU4NzktLjUxMjY5LS4zNzctLjE2ODgzLS4xMTMyOC0uMzQ0MjQtLjIxMDkzLS41MTczNC0uMzE0NDUtLjE2MzMzLS4wOTc2NS0uMzIzMjQtLjIwMDE5LS40OTE0NS0uMjktLjE3MzEtLjA5Mjc3LS4zNTEyLS4xNzA5LS41Mjc1OS0uMjU0MzktLjE3ODcxLS4wODQ0OC0uMzU0NjItLjE3MzgzLS41MzgtLjI0OTUxLS4xNjkzMi0uMDcwMzItLjM0MjI5LS4xMjY0Ny0uNTE0LS4xODg0OC0uMTk3NTEtLjA3MTI5LS4zOTMwNy0uMTQ2NDktLjU5NTM0LS4yMDgtLjE2ODgyLS4wNTA3OC0uMzQwNDUtLjA4Nzg5LS41MTA4Ni0uMTMxMzUtLjIwODc0LS4wNTMyMi0uNDE1MjktLjExMTMyLS42MjgxOC0uMTUzMzItLjE5MDU1LS4wMzc1OS0uMzgzLS4wNTk1Ny0uNTc1MDctLjA4Nzg5LS4xOTU0NC0uMDI4ODEtLjM4ODMxLS4wNjQ5NC0uNTg2NzktLjA4NDQ3LS4zMzI1Mi0uMDMyNzEtLjY2Ni0uMDQ1NDEtLjk5OTg4LS4wNTA3OEMyMDguMTE4NTMsMTIuMDA4MywyMDguMDYwMywxMiwyMDgsMTJIMTcyYTEyLDEyLDAsMCwwLDAsMjRoNy4wMjkzbC0xNS4wNTEsMTUuMDUxMjdBNzEuOTc1MjYsNzEuOTc1MjYsMCwxLDAsMTA4LDE3OC45ODFWMTkySDg4YTEyLDEyLDAsMCwwLDAsMjRoMjB2MTZhMTIsMTIsMCwwLDAsMjQsMFYyMTZoMjBhMTIsMTIsMCwwLDAsMC0yNEgxMzJWMTc4Ljk4MUE3MS45MjgsNzEuOTI4LDAsMCwwLDE4MC4yNzc4Myw2OC42OTI4N0wxOTYsNTIuOTcwN1Y2MGExMiwxMiwwLDAsMCwyNCwwVjI0QzIyMCwyMy45ODQ4NiwyMTkuOTk3OCwyMy45NzAyMSwyMTkuOTk3OCwyMy45NTU1N1pNMTIwLDE1NmE0OCw0OCwwLDEsMSw0OC00OEE0OC4wNTQ2OCw0OC4wNTQ2OCwwLDAsMSwxMjAsMTU2WiIvPgo8L3N2Zz4=";
// Declaração de variável: BROADCAST_TYPE_ICON_SVG
const BROADCAST_TYPE_ICON_SVG =;
  "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjwhLS0gVXBsb2FkZWQgdG86IFNWRyBSZXBvLCB3d3cuc3ZncmVwby5jb20sIEdlbmVyYXRvcjogU1ZHIFJlcG8gTWl4ZXIgVG9vbHMgLS0+CjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iX3gzMl8iIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIAoJIHdpZHRoPSI4MDBweCIgaGVpZHRoPSI4MDBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiICB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KPCFbQ0RBVEFbCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cl1dPgo8L3N0eWxlPgo8Zz4KCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0xMDMuMTY5LDI1Ni44MjhjNDMuNzAzLDAsNzkuMTI1LTM1LjQzOCw3OS4xMjUtNzkuMTQxYzAtNDMuNjg4LTM1LjQyMi03OS4xMjUtNzkuMTI1LTc5LjEyNQoJCVMyNC4wNDQsMTM0LDI0LjA0NCwxNzcuNjg4QzI0LjA0NCwyMjEuMzkxLDU5LjQ2NiwyNTYuODI4LDEwMy4xNjksMjU2LjgyOHoiLz4KCTxjaXJjbGUgY2xhc3M9InN0MCIgY3g9IjMwMi42MzgiIGN5PSIxNDQuNzE5IiByPSIxMDYuODI4Ii8+Cgk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMy4wMDAxMiwyODAuMjM0SDc0LjE1M3YxNzEuNDM4YzAsMTIuMzkxLDEwLjA0NywyMi40MzgsMjIuNDM4LDIyLjQzOGgyMzYuMDQ3CgkJYzEyLjM3NSwwLDIyLjQyMi0xMC4wNDcsMjIuNDIyLTIyLjQzOHYtMTQ5QzM1NS4wNiwyOTAuMjgxLDM0NS4wMTMsMjgwLjIzNCwzMzIuNjM4LDI4MC4yMzR6Ii8+Cgk8cmVjdCB4PSIzNzEuMjE2IiB5PSIzMzEuNjcyIiBjbGFzcz0ic3QwIiB3aWR0aD0iMzQuMjk3IiBoZWlnaHQ9Ijk5LjY1NiIvPgoJPHBhdGggY2xhc3M9InN0MCIgZD0iTTUwNi41OTEsMjkzLjQzOGMtMy4zNTktMi4wMzEtNy41NDctMi4xNTYtMTEuMDMxLTAuMzEzbC03My4yMzQsMzguNTQ3djk4LjU0N2w3My4yMzQsMzguNTQ3CgkJYzMuNDg0LDEuODQ0LDcuNjcyLDEuNzE5LDExLjAzMS0wLjMxM3M1LjQwNi01LjY3Miw1LjQwNi05LjYwOVYzMDMuMDQ3QzUxMS45OTcsMjk5LjEwOSw1MDkuOTUsMjk1LjQ2OSw1MDYuNTkxLDI5My40Mzh6Ii8+Cgk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMC44NTYsMjg3LjE1NmMtMS43MzQsNC4xODgtMC43ODEsOS4wMTYsMi40MzgsMTIuMjM0bDU0LjA0Nyw1NC4wNDd2LTczLjIwM0gxMS4yMTYKCQlDNi42ODUsMjgwLjIzNCwyLjU5MSwyODIuOTY5LDAuODU2LDI4Ny4xNTZ6Ii8+CjwvZz4KPC9zdmc+";
// Declaração de variável: ORIENTATION_ICON_SVG
const ORIENTATION_ICON_SVG =;
  "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48c3ZnIHdpZHRoPSI4MDBweCIgaGVpZHRoPSI4MDBweCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNOC41NTI4NCAzLjAwMDEyQzcuOTM1OTggMy4wMDAxMiA3LjIzODQxIDMuMDY1MTQgNi41NzIwOSAzLjI5MjI0QzIuNTU0OTQgNC42MDM4NyAxLjI2MzQxIDguODk0IDIuMzk4NzcgMTIuNDNMMi40MDM1NCAxMi40NDQ4TDIuNDA4NzcgMTIuNDU5NUMzLjAzNDM1IDE0LjIxNzQgNC4wNDIyNiAxNS44MTI3IDUuMzUzMzYgMTcuMTI0OUw1LjM2MDkxIDE3LjEzMjRMNS4zNjg2MiAxNy4xMzk4QzcuMjM3ODIgMTguOTMyMyA5LjI3MjU0IDIwLjQ5NTMgMTEuNDc1NiAyMS44NTE1TDExLjk5MzQgMjIuMTcwM0wxMi41MTQ3IDIxLjg1NzNDMTQuNzIyNiAyMC41MzE1IDE2Ljc5NjQgMTguOTI1NCAxOC42NDMyIDE3LjE0NzRMMTguNjQ5IDE3LjE0MTlMMTguNjU0NyAxNy4xMzYyQzE5Ljk3NzEgMTUuODIxNSAyMC45ODUxIDE0LjIxNDQgMjEuNjAxNSAxMi40NTQ5TDIxLjYwNjYgMTIuNDQwMkwyMS42MTEzIDEyLjQyNTNDMjIuNzI1MSA4Ljg5NzAzIDIxLjQ0MDEgNC42MDE3NiAxNy40NTA3IDMuMzA5NDhDMTYuNzk3NiAzLjA5MjIxIDE2LjEyMzYgMy4wMDAxMiAxNS40NjQ4IDMuMDAwMTJDMTMuOTgyOCAzLjAwMDExIDEyLjg4NTggMy42MjA2NCAxMi4wMDA0IDQuMjUzMDlDMTEuMTIxOSAzLjYyNTQ1IDEwLjAxNzYgMy4wMDAxMiA4LjU1Mjg0IDMuMDAwMTJaIiBmaWxsPSIjRkZGRkZGIi8+PC9zdmc+";
// Global variables;
// Declaração de variável: broadcasts
let broadcasts = []; // Acts as a cache for modal details;
// Declaração de variável: currentPage
let currentPage = 1;
// Declaração de variável: itemsPerPage
let itemsPerPage = 17; // Increased for better grid view;
// Declaração de variável: totalPages
let totalPages = 1;
// Declaração de variável: currentCarouselIndex
let currentCarouselIndex = 0;
// Declaração de variável: carouselItems
let carouselItems = [];
let searchTimeout;
// Declaração de variável: filters
let filters = {
  search: "",;
  country: "",;
  gender: "",;
  orientation: "",;
  tags: "";
};
// Declaração de variável: order
let order = "mostViewers"; // Parâmetro global de ordenação;
// DOM Elements;
// Declaração de variável: mobileMenuButton
const mobileMenuButton = document.getElementById("mobile-menu-button");
// Declaração de variável: mobileMenu
const mobileMenu = document.getElementById("mobile-menu");
// Declaração de variável: searchInput
const searchInput = document.getElementById("search-input");
// Declaração de variável: mobileSearchInput
const mobileSearchInput = document.getElementById("mobile-search-input");
// Declaração de variável: carouselItemsContainer
const carouselItemsContainer = document.getElementById("carousel-items");
// Declaração de variável: carouselIndicators
const carouselIndicators = document.getElementById("carousel-indicators");
// Declaração de variável: prevSlideButton
const prevSlideButton = document.getElementById("prev-slide");
// Declaração de variável: nextSlideButton
const nextSlideButton = document.getElementById("next-slide");
// Declaração de variável: broadcastsGrid
const broadcastsGrid = document.getElementById("broadcasts-grid");
// Declaração de variável: loadingState
const loadingState = document.getElementById("loading-state");
// Declaração de variável: errorState
const errorState = document.getElementById("error-state");
// Declaração de variável: emptyState
const emptyState = document.getElementById("empty-state");
// Declaração de variável: retryButton
const retryButton = document.getElementById("retry-button");
// Declaração de variável: pagination
const pagination = document.getElementById("pagination");
// Declaração de variável: pageNumbers
const pageNumbers = document.getElementById("page-numbers");
// Declaração de variável: firstPageButton
const firstPageButton = document.getElementById("first-page");
// Declaração de variável: prevPageButton
const prevPageButton = document.getElementById("prev-page");
// Declaração de variável: nextPageButton
const nextPageButton = document.getElementById("next-page");
// Declaração de variável: lastPageButton
const lastPageButton = document.getElementById("last-page");
// Declaração de variável: topStreamersContainer
const topStreamersContainer = document.getElementById("top-streamers");
// Declaração de variável: filterCountry
const filterCountry = document.getElementById("filter-country");
// Declaração de variável: filterGender
const filterGender = document.getElementById("filter-gender");
// Declaração de variável: filterOrientation
const filterOrientation = document.getElementById("filter-orientation");
// Declaração de variável: applyFiltersButton
const applyFiltersButton = document.getElementById("apply-filters");
// Declaração de variável: surpriseMeBtn
const surpriseMeBtn = document.getElementById("surprise-me-btn");
// Declaração de variável: broadcastModal
const broadcastModal = document.getElementById("broadcast-modal");
// Declaração de variável: closeModal
const closeModal = document.querySelector(".close-modal");
// Declaração de variável: modalUsername
const modalUsername = document.getElementById("modal-username");
// Declaração de variável: modalAvatar
const modalAvatar = document.getElementById("modal-avatar");
// Declaração de variável: modalCountryFlag
const modalCountryFlag = document.getElementById("modal-country-flag");
// Declaração de variável: modalCountryName
const modalCountryName = document.getElementById("modal-country-name");
// Declaração de variável: modalViewers
const modalViewers = document.getElementById("modal-viewers");
// Declaração de variável: modalGender
const modalGender = document.getElementById("modal-gender");
// Declaração de variável: modalOrientation
const modalOrientation = document.getElementById("modal-orientation");
// Declaração de variável: modalType
const modalType = document.getElementById("modal-type");
// Declaração de variável: modalTags
const modalTags = document.getElementById("modal-tags");
// Declaração de variável: modalThumbnail
const modalThumbnail = document.getElementById("modal-thumbnail");
// Declaração de variável: modalIframe
const modalIframe = document.getElementById("modal-iframe");
// Declaração de variável: generateBioBtn
const generateBioBtn = document.getElementById("generate-bio-btn");
// Declaração de variável: geminiBioContent
const geminiBioContent = document.getElementById("gemini-bio-content");
// Declaração de variável: playButton
const playButton = document.getElementById("play-button");
// Declaração de variável: relatedBroadcasts
const relatedBroadcasts = document.getElementById("related-broadcasts");
// Declaração de variável: toast
const toast = document.getElementById("toast");
// Declaração de variável: toastMessage
const toastMessage = document.getElementById("toast-message");
// Initialize the application;
document.addEventListener("DOMContentLoaded", () => {
  // --- AGE GATE MODAL LOGIC ---;
  // Declaração de variável: ageGateModal
const ageGateModal = document.getElementById("age-gate-modal");
  // Declaração de variável: confirmBtn
const confirmBtn = document.getElementById("age-confirm-btn");
  // Declaração de variável: denyBtn
const denyBtn = document.getElementById("age-deny-btn");
  // Declaração de variável: isAgeVerified
const isAgeVerified = localStorage.getItem("ageVerified");
  if (!isAgeVerified) {
    ageGateModal.style.display = "flex";
    document.body.style.overflow = "hidden"; // Prevent scrolling behind the modal;
  }
  confirmBtn.addEventListener("click", () => {
    localStorage.setItem("ageVerified", "true");
    ageGateModal.style.display = "none";
    document.body.style.overflow = "auto";
  });
  denyBtn.addEventListener("click", () => {
    // Redirect to a neutral site;
    window.location.href = "https://www.google.com";
  });
  // --- END AGE GATE MODAL LOGIC ---;
  initApp();
});
// Initialize the application;
async 
// Função: initApp
function initApp() {
  setupEventListeners();
  populateCountryFilter();
  // Fetch initial data for decoration (carousel, top streamers);
  await fetchInitialData();
  // Initialize main content based on URL parameters;
  initializeFromUrl();
}
// Setup event listeners;

// Função: setupEventListeners
function setupEventListeners() {
  mobileMenuButton.addEventListener("click", toggleMobileMenu);
  searchInput.addEventListener("input", handleSearch);
  mobileSearchInput.addEventListener("input", handleSearch);
  prevSlideButton.addEventListener("click", showPrevSlide);
  nextSlideButton.addEventListener("click", showNextSlide);
  retryButton.addEventListener("click", () => {
    // Declaração de variável: params
const params = new URLSearchParams(window.location.search);
    // Declaração de variável: page
const page = parseInt(params.get("page"), 10) || 1;
    fetchBroadcasts(page, filters);
  });
  firstPageButton.addEventListener("click", () => goToPage(1));
  prevPageButton.addEventListener("click", () => goToPage(currentPage - 1));
  nextPageButton.addEventListener("click", () => goToPage(currentPage + 1));
  lastPageButton.addEventListener("click", () => goToPage(totalPages));
  applyFiltersButton.addEventListener("click", applyFilters);
  surpriseMeBtn.addEventListener("click", handleSurpriseMe);
  closeModal.addEventListener("click", closeModalHandler);
  window.addEventListener("click", (e) => {
    if (e.target === broadcastModal) closeModalHandler();
  });
  // Eventos para menu de ordem;
  document.querySelectorAll('.order-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      // Declaração de variável: selectedOrder
const selectedOrder = btn.getAttribute('data-order');
      setOrder(selectedOrder);
      setOrderMenuActive(selectedOrder);
    });
  });

  // Troca para Pink no hover;
  document.querySelectorAll('.order-btn').forEach(btn => {
    // Declaração de variável: icon
const icon = btn.querySelector('.order-icon-img');
    // Declaração de variável: orderType
const orderType = btn.getAttribute('data-order');
    btn.addEventListener('mouseenter', () => {
      if (!btn.classList.contains('selected')) {
        icon.src = 'assets/icons/buttons/${orderType}Pink.svg';
      }
    });
    btn.addEventListener('mouseleave', () => {
      if (!btn.classList.contains('selected')) {
        icon.src = 'assets/icons/buttons/${orderType}White.svg';
      }
    });
  });
}


// Função: setOrderMenuActive
function setOrderMenuActive(selectedOrder) {
  document.querySelectorAll('.order-btn').forEach(btn => {
    // Declaração de variável: icon
const icon = btn.querySelector('.order-icon-img');
    // Declaração de variável: orderType
const orderType = btn.getAttribute('data-order');
    // Declaração de variável: isSelected
const isSelected = orderType === selectedOrder;
    btn.classList.toggle('selected', isSelected);

    // Troca o SVG conforme o estado;
    if (isSelected) {
      icon.src = 'assets/icons/buttons/${orderType}Black.svg';
    } else {
      icon.src = 'assets/icons/buttons/${orderType}White.svg';
    }
  });
}
// --- Gemini API Integration ---;
async 
// Função: callGeminiAPI
function callGeminiAPI(prompt) {
  // Declaração de variável: apiKey
const apiKey = "AIzaSyAnXS2Mg_XlR78L1l08q5rSIsXvhwtt2L4"; // API key is handled by the environment;
  // Declaração de variável: apiUrl
const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}';
  // Declaração de variável: payload
const payload = {
    contents: [;
      {
        parts: [;
          {
            text: prompt;
          }
        ];
      }
    ];
  };
  try {
    // Declaração de variável: response
const response = await fetch(apiUrl, {
      method: "POST",;
      headers: {
        "Content-Type": "application/json";
      },;
      body: JSON.stringify(payload);
    });
    if (!response.ok) {
      // Declaração de variável: errorBody
const errorBody = await response.json();
      console.error("Gemini API Error:", errorBody);
      throw new Error('API request failed with status ${response.status}');
    }
    // Declaração de variável: result
const result = await response.json();
    if (;
      result.candidates &&;
      result.candidates.length > 0 &&;
      result.candidates[0].content &&;
      result.candidates[0].content.parts &&;
      result.candidates[0].content.parts.length > 0;
    ) {
      return result.candidates[0].content.parts[0].text;
    } else {
      console.error("Unexpected API response structure:", result);
      return null;
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return null;
  }
}
async 
// Função: handleSurpriseMe
function handleSurpriseMe() {
  showToast("✨ A IA está buscando uma sugestão para você...");
  // Declaração de variável: prompt
const prompt = 'Sugira um tema criativo para encontrar streamers na plataforma XCam. Responda APENAS com um objeto JSON com as chaves "country", "gender", "orientation", e "search". Use os seguintes valores possíveis: country (br, us, es, fr, it, de, jp, kr, ru, ca), gender (male, female, trans, couple), orientation (straight, gay, lesbian, bisexual). A chave "search" deve ser um termo de busca criativo em português. Exemplo: {"country": "br", "gender": "male", "orientation": "gay", "search": "músicos tocando ao vivo"}';
  // Declaração de variável: result
const result = await callGeminiAPI(prompt);
  if (result) {
    try {
      // Declaração de variável: suggestion
const suggestion = JSON.parse(result);
      filterCountry.value = suggestion.country || "";
      filterGender.value = suggestion.gender || "";
      filterOrientation.value = suggestion.orientation || "";
      searchInput.value = suggestion.search || "";
      mobileSearchInput.value = suggestion.search || "";
      filters.search = suggestion.search || "";
      applyFilters();
    } catch (e) {
      console.error("Failed to parse Gemini suggestion:", e);
      showToast("Não foi possível aplicar a sugestão da IA.");
    }
  } else {
    showToast("A IA não conseguiu gerar uma sugestão. Tente novamente.");
  }
}
async 
// Função: handleGenerateBio
function handleGenerateBio(broadcast) {
  // Declaração de variável: btn
const btn = document.getElementById("generate-bio-btn");
  btn.disabled = true;
  btn.innerHTML = '<span class="loader !w-6 !h-6 !border-4"></span> Carregando Bio do Usuário @${broadcast.username}...';

  // Declaração de variável: additionalDetails
let additionalDetails = "";
  try {
    // Declaração de variável: userInfoResponse
const userInfoResponse = await fetch(;
      'https://api.xcam.gay/user/${broadcast.username}/Info';
    );
    if (userInfoResponse.ok) {
      // Declaração de variável: userInfo
const userInfo = await userInfoResponse.json();
      // Declaração de variável: details
const details = [];
      if (userInfo.age) details.push('Idade: ${userInfo.age}');
      if (userInfo.ethnicity) details.push('Etnia: ${userInfo.ethnicity}');
      if (userInfo.maritalStatus);
        details.push('Estado Civil: ${userInfo.maritalStatus}');
      if (userInfo.hairColor);
        details.push('Cor do Cabelo: ${userInfo.hairColor}');
      if (userInfo.bodyHair);
        details.push('Pelos Corporais: ${userInfo.bodyHair}');
      if (userInfo.bodyDecorations && userInfo.bodyDecorations.length > 0);
        details.push(;
          'Decorações Corporais: ${userInfo.bodyDecorations.join(", ")}';
        );
      if (userInfo.maleBodyType);
        details.push('Tipo de Corpo: ${userInfo.maleBodyType}');
      if (userInfo.maleRole) details.push('Função: ${userInfo.maleRole}');
      if (userInfo.bio && userInfo.bio.trim() !== "") {
        // Declaração de variável: cleanBio
const cleanBio = userInfo.bio.replace(/\[.*?\]/g, "");
        details.push('Bio Original: "${cleanBio}"');
      }
      if (details.length > 0) {
        additionalDetails = '\n- Detalhes Adicionais: ${details.join("; ")}';
      }
    }
  } catch (error) {
    console.error("Falha ao buscar informações do usuário:", error);
  }
  // Declaração de variável: prompt
const prompt = 'Crie uma biografia curta, criativa e envolvente em português para um(a) streamer da plataforma XCam com as seguintes informações:;
        - Nome de usuário: ${broadcast.username}
        - País: ${getCountryName(broadcast.country)}
        - Gênero: ${TRANSLATIONS.gender[broadcast.gender] || broadcast.gender}
        - Orientação: ${
          TRANSLATIONS.sexPreference[broadcast.sexualOrientation] ||;
          broadcast.sexualOrientation;
        }
        - Tags: ${broadcast.tags;
          .map((t) => t.name);
          .join(", ")}${additionalDetails}

        Seja criativo e use um tom que combine com uma plataforma de streaming ao vivo. Não inclua informações que não foram fornecidas. Se a bio original for fornecida, use-a como inspiração para o tom e estilo, mas não a copie.';
  // Declaração de variável: bio
const bio = await callGeminiAPI(prompt);

  geminiBioContent.classList.remove("hidden");

  if (bio) {
    geminiBioContent.textContent = bio;
    btn.style.display = "none"; // Oculta o botão em caso de sucesso;
  } else {
    geminiBioContent.textContent =;
      "Não foi possível carregar a biografia no momento.";
    btn.disabled = false;
    btn.innerHTML = "✨ Tentar Novamente"; // Altera o texto para permitir nova tentativa;
    btn.style.display = "flex"; // Garante que o botão está visível em caso de falha;
  }
}
// Toggle mobile menu;

// Função: toggleMobileMenu
function toggleMobileMenu() {
  mobileMenu.classList.toggle("hidden");
}
// Handle search input with debounce;

// Função: handleSearch
function handleSearch(e) {
  // Declaração de variável: searchTerm
const searchTerm = e.target.value.toLowerCase();
  if (e.target === searchInput) mobileSearchInput.value = searchTerm;
  else searchInput.value = searchTerm;
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    filters.search = searchTerm;
    filters.tags = searchTerm.replace(/ /g, ",");
    goToPage(1);
  }, 500);
}
// Apply filters from dropdowns;

// Função: applyFilters
function applyFilters() {
  filters.country = filterCountry.value;
  filters.gender = filterGender.value;
  filters.orientation = filterOrientation.value;
  goToPage(1);
  showToast("Filtros aplicados com sucesso!");
}
// Initialize filters and fetch data based on URL parameters;

// Função: initializeFromUrl
function initializeFromUrl() {
  // Declaração de variável: params
const params = new URLSearchParams(window.location.search);
  // Declaração de variável: page
const page = parseInt(params.get("page"), 10) || 1;
  // Declaração de variável: limit
const limit = parseInt(params.get("limit"), 10) || 17;
  // Declaração de variável: country
const country = params.get("country") || "";
  // Declaração de variável: tags
const tags = params.get("tags") || "";
  // Declaração de variável: urlOrder
const urlOrder = params.get("order") || "mostViewers";
  itemsPerPage = limit;
  currentPage = page;
  filters.country = country;
  filters.tags = tags;
  filters.search = tags.replace(/,/g, " "); // Sync search input with tags;
  order = urlOrder;
  // Update UI to reflect URL state;
  filterCountry.value = country;
  searchInput.value = filters.search;
  mobileSearchInput.value = filters.search;
  setOrderMenuActive(order);
  fetchBroadcasts(currentPage, filters);
}
// Fetch initial data for Carousel and Top Streamers (unfiltered);
async 
// Função: fetchInitialData
function fetchInitialData() {
  // Declaração de variável: API_URL
const API_URL = "https://api.xcam.gay/";
  try {
    // Declaração de variável: response
const response = await fetch('${API_URL}?limit=5&page=1');
    if (!response.ok) throw new Error("Failed to fetch initial data");
    // Declaração de variável: data
const data = await response.json();
    // Declaração de variável: items
const items = data.broadcasts.items || [];
    setupCarousel(items);
    setupTopStreamers(items);
  } catch (error) {
    console.error("Error fetching initial data:", error);
    // Handle error for these specific components if necessary;
  }
}
// Fetch broadcasts for the main grid, respecting filters;
async 
// Função: fetchBroadcasts
function fetchBroadcasts(page = 1, queryFilters = {}) {
  showLoadingState();
  // Declaração de variável: API_URL
const API_URL = "https://api.xcam.gay/";
  // Declaração de variável: params
const params = new URLSearchParams({
    limit: itemsPerPage,;
    page: page;
  });
  if (order) params.append("order", order); // Adiciona order na query;
  // Append filters to params if they have values;
  if (queryFilters.search) params.append("username", queryFilters.search);
  if (queryFilters.country) params.append("country", queryFilters.country);
  if (queryFilters.gender) params.append("gender", queryFilters.gender);
  if (queryFilters.orientation);
    params.append("sexualOrientation", queryFilters.orientation);
  if (queryFilters.tags) params.append("tags", queryFilters.tags);
  try {
    // Declaração de variável: response
const response = await fetch('${API_URL}?${params.toString()}');
    if (!response.ok) throw new Error('HTTP error! status: ${response.status}');
    // Declaração de variável: data
const data = await response.json();
    // Declaração de variável: newItems
const newItems = data.broadcasts.items || [];
    // Declaração de variável: totalBroadcasts
const totalBroadcasts = data.broadcasts.total || 0;
    // Declaração de variável: broadcastsTitle
const broadcastsTitle = document.getElementById("broadcasts-title");
    if (broadcastsTitle) {
      broadcastsTitle.textContent = '${totalBroadcasts.toLocaleString(;
        "pt-BR";
      )} Transmissões ao Vivo';
    }
    newItems.forEach((item) => {
      if (!broadcasts.some((b) => b.id === item.id)) {
        broadcasts.push(item);
      }
    });
    totalPages = data.broadcasts.totalPages;
    currentPage = page;
    renderBroadcasts(newItems);
  } catch (error) {
    console.error("Error fetching broadcasts:", error);
    showErrorState();
  }
}
// UI State Management;

// Função: showLoadingState
function showLoadingState() {
  loadingState.classList.remove("hidden");
  broadcastsGrid.classList.add("hidden");
  errorState.classList.add("hidden");
  emptyState.classList.add("hidden");
  pagination.classList.add("hidden");
}


// Função: showErrorState
function showErrorState() {
  loadingState.classList.add("hidden");
  errorState.classList.remove("hidden");
}


// Função: showEmptyState
function showEmptyState() {
  loadingState.classList.add("hidden");
  emptyState.classList.remove("hidden");
}


// Função: showBroadcastsGrid
function showBroadcastsGrid() {
  loadingState.classList.add("hidden");
  broadcastsGrid.classList.remove("hidden");
  pagination.classList.remove("hidden");
  errorState.classList.add("hidden");
  emptyState.classList.add("hidden");
}
// Setup UI Components;

// Função: populateCountryFilter
function populateCountryFilter() {
  // Declaração de variável: selectElement
const selectElement = document.getElementById("filter-country");
  // Sort countries by name for better UX;
  // Declaração de variável: sortedCountries
const sortedCountries = Object.entries(;
    COUNTRY_NAMES;
  ).sort(([, nameA], [, nameB]) => nameA.localeCompare(nameB));
  for (const [code, name] of sortedCountries) {
    if (code === "other") continue; // Skip 'other' category;
    // Declaração de variável: option
const option = document.createElement("option");
    option.value = code;
    option.textContent = name;
    selectElement.appendChild(option);
  }
}


// Função: setupCarousel
function setupCarousel(items) {
  if (!items || items.length === 0) return;
  carouselItems = items.slice(0, 5);
  carouselItemsContainer.innerHTML = "";
  carouselIndicators.innerHTML = "";
  carouselItems.forEach((broadcast, index) => {
    // Declaração de variável: posterUrl
const posterUrl = 'https://api.xcam.gay/poster/${broadcast.username}.jpg';
    // Declaração de variável: item
const item = document.createElement("div");
    item.className = 'carousel-item opacity-0';
    item.dataset.username = broadcast.username; // Store username for iframe;
    item.innerHTML = '<div class="carousel-media-container absolute inset-0 bg-black">;
             <img src="${posterUrl}" alt="${broadcast.username}" class="w-full h-full object-cover carousel-poster">;
             <div class="viewer-count">;
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">;
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>;
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>;
               </svg>;
               ${broadcast.viewers} <span class="viewer-label">espectadores</span>;
             </div>;
             <div class="badge-live">AO VIVO</div>;
          </div>;
          <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10"></div>;
          <div class="absolute bottom-0 left-0 p-6 z-20">;
            <h2 class="text-2xl md:text-3xl font-bold text-white mb-1">@${broadcast.username}</h2>;
            <button class="bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-opacity-90 transition-colors" onclick="openModal('${broadcast.id}')">Assistir</button>;
          </div>';
    carouselItemsContainer.appendChild(item);
    // Declaração de variável: indicator
const indicator = document.createElement("button");
    indicator.className = 'w-3 h-3 rounded-full ${
      index === 0 ? "bg-white" : "bg-gray-500";
    }';
    indicator.addEventListener("click", () => goToSlide(index));
    carouselIndicators.appendChild(indicator);
  });
  goToSlide(0); // Initialize the first slide with an iframe;
  startCarouselRotation();
}


// Função: startCarouselRotation
function startCarouselRotation() {
  setInterval(showNextSlide, 15000);
}


// Função: goToSlide
function goToSlide(index) {
  // Declaração de variável: items
const items = document.querySelectorAll(".carousel-item");
  // Declaração de variável: indicators
const indicators = document.querySelectorAll("#carousel-indicators button");
  items.forEach((item, i) => {
    // Declaração de variável: mediaContainer
const mediaContainer = item.querySelector(".carousel-media-container");
    if (i === index) {
      item.classList.remove("opacity-0");
      // Se não existe um poster, adiciona;
      if (!mediaContainer.querySelector("img")) {
        // Declaração de variável: broadcast
const broadcast = carouselItems[i];
        // Declaração de variável: posterUrl
const posterUrl = 'https://api.xcam.gay/poster/${broadcast.username}.jpg';
        '<img src="${posterUrl}" alt="${broadcast.username}" class="w-full h-full object-cover carousel-poster">\n             <div class="viewer-count">\n               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">\n                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>\n                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>\n               </svg>\n               ${broadcast.viewers} <span class="viewer-label">espectadores</span>\n             </div>\n             <div class="badge-live">AO VIVO</div>';
      }
      // Se não existe um loader, adiciona;
      if (!mediaContainer.querySelector(".carousel-loader")) {
        // Declaração de variável: loader
const loader = document.createElement("div");
        loader.className =;
          "carousel-loader absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10";
        loader.innerHTML = '<span class="loader"></span>';
        mediaContainer.appendChild(loader);
      }
      // Se não existe um iframe, adiciona;
      if (!mediaContainer.querySelector("iframe")) {
        // Declaração de variável: username
const username = item.dataset.username;
        // Declaração de variável: iframe
const iframe = document.createElement("iframe");
        iframe.className = "w-full h-full border-0 absolute inset-0";
        iframe.src = 'https://player.xcam.gay/hls/?user=${username}';
        iframe.setAttribute("allow", "autoplay; encrypted-media");
        iframe.style.opacity = "0";
        iframe.onload = () => {
          // Remove loader;
          // Declaração de variável: loader
const loader = mediaContainer.querySelector(".carousel-loader");
          if (loader) loader.remove();
          // Remove poster;
          // Declaração de variável: poster
const poster = mediaContainer.querySelector(".carousel-poster");
          if (poster) poster.remove();
          iframe.style.opacity = "1";
        };
        mediaContainer.appendChild(iframe);
      }
    } else {
      item.classList.add("opacity-0");
      // Remove iframe e loader, restaura poster;
      // Declaração de variável: broadcast
const broadcast = carouselItems[i];
      // Declaração de variável: posterUrl
const posterUrl = 'https://api.xcam.gay/poster/${broadcast.username}.jpg';
      '<img src="${posterUrl}" alt="${broadcast.username}" class="w-full h-full object-cover carousel-poster">\n             <div class="viewer-count">\n               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">\n                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>\n                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>\n               </svg>\n               ${broadcast.viewers} <span class="viewer-label">espectadores</span>\n             </div>\n             <div class="badge-live">AO VIVO</div>';
    }
  });
  indicators.forEach((indicator, i) => {
    indicator.classList.toggle("bg-white", i === index);
    indicator.classList.toggle("bg-gray-500", i !== index);
  });
  currentCarouselIndex = index;
}


// Função: showPrevSlide
function showPrevSlide() {
  // Declaração de variável: newIndex
let newIndex = currentCarouselIndex - 1;
  if (newIndex < 0) newIndex = carouselItems.length - 1;
  goToSlide(newIndex);
}


// Função: showNextSlide
function showNextSlide() {
  // Declaração de variável: newIndex
let newIndex = currentCarouselIndex + 1;
  if (newIndex >= carouselItems.length) newIndex = 0;
  goToSlide(newIndex);
}


// Função: setupTopStreamers
function setupTopStreamers(items) {
  if (!items || items.length === 0) return;
  // Declaração de variável: topStreamers
const topStreamers = [...items];
    .sort((a, b) => b.viewers - a.viewers);
    .slice(0, 5);
  topStreamersContainer.innerHTML = "";
  topStreamers.forEach((streamer) => {
    // Declaração de variável: item
const item = document.createElement("div");
    item.className =;
      "flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer";
    item.onclick = () => openModal(streamer.id);
    item.innerHTML = ';
          <img src="${streamer.profileImageURL}" alt="${streamer.username}" class="w-10 h-10 rounded-full object-cover">;
          <div>;
            <h4 class="font-medium text-white">@${streamer.username}</h4>;
            <div class="flex items-center text-sm text-gray-400">;
              <span class="flag-icon" style="background-image: url(https://flagcdn.com/w20/${streamer.country}.png)"></span>;
              <span>${streamer.viewers} espectadores</span>;
            </div>;
          </div>;
        ';
    topStreamersContainer.appendChild(item);
  });
}
 /**;
 * Handles the mouse entering the preview area of a broadcast card.;
 * It creates and displays an iframe for a live preview.;
 * @param {MouseEvent} event The mouseenter event.;
 */;

// Função: handleCardHover
function handleCardHover(event) {
  // Declaração de variável: previewContainer
const previewContainer = event.currentTarget;
  // Declaração de variável: username
const username = previewContainer.dataset.username;
  if (!username) return;
  // Find existing elements;
  // Declaração de variável: poster
const poster = previewContainer.querySelector(".card-poster");
  // If an iframe is already there, do nothing;
  if (previewContainer.querySelector("iframe")) return;
  // Create a loader element;
  // Declaração de variável: loader
const loader = document.createElement("div");
  loader.className =;
    "card-loader absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10";
  loader.innerHTML = '<span class="loader"></span>';
  previewContainer.appendChild(loader);
  // Create the iframe for the live preview;
  // Declaração de variável: iframe
const iframe = document.createElement("iframe");
  iframe.style.opacity = "0"; // Start hidden;
  iframe.className =;
    "absolute inset-0 w-full h-full border-0 transition-opacity duration-300 aspect-video";
  iframe.src = 'https://player.xcam.gay/hls/?user=${username}';
  iframe.setAttribute("frameborder", "0");
  iframe.setAttribute("allow", "autoplay; encrypted-media");
  iframe.setAttribute("allowfullscreen", "true");
  // When the iframe has loaded, fade it in and remove the loader;
  iframe.onload = () => {
    if (loader) loader.remove();
    if (poster) poster.style.display = "none"; // Hide poster completely;
    iframe.style.opacity = "1";
  };
  // Add the iframe to the container, but before the overlays;
  // Declaração de variável: badge
const badge = previewContainer.querySelector(".badge-live");
  // Declaração de variável: viewers
const viewers = previewContainer.querySelector(;
    "div.absolute.bottom-2.right-2";
  );
  previewContainer.insertBefore(iframe, badge);
}
/**;
 * Handles the mouse leaving the preview area of a broadcast card.;
 * It removes the iframe and restores the poster image.;
 * @param {MouseEvent} event The mouseleave event.;
 */;

// Função: handleCardMouseLeave
function handleCardMouseLeave(event) {
  // Declaração de variável: previewContainer
const previewContainer = event.currentTarget;
  // Find elements;
  // Declaração de variável: poster
const poster = previewContainer.querySelector(".card-poster");
  // Declaração de variável: iframe
const iframe = previewContainer.querySelector("iframe");
  // Declaração de variável: loader
const loader = previewContainer.querySelector(".card-loader");
  // Restore the poster image;
  if (poster) {
    poster.style.display = "block";
  }
  // Stop and remove the iframe and loader;
  if (iframe) {
    iframe.src = "about:blank";
    iframe.remove();
  }
  if (loader) {
    loader.remove();
  }
}
// Render broadcasts grid;

// Função: renderBroadcasts
function renderBroadcasts(broadcastsList) {
  if (!broadcastsList || broadcastsList.length === 0) {
    showEmptyState();
    return;
  }
  broadcastsGrid.innerHTML = "";
  broadcastsList.forEach((broadcast) => {
    // Declaração de variável: posterUrl
const posterUrl = 'https://api.xcam.gay/poster/${broadcast.username}.jpg';
    // Declaração de variável: card
const card = document.createElement("div");
    card.className =;
      "bg-gray-900 rounded-xl overflow-hidden border border-gray-800 transition-all duration-300 card-hover flex flex-col max-w-full";
    // tags com classe card-tag para efeito gradiente;
    // Declaração de variável: tagsHTML
const tagsHTML =;
      broadcast.tags && broadcast.tags.length > 0;
        ? broadcast.tags;
            .map((tag) => '<span class="card-tag">#${tag.name}</span>');
            .join(" ");
        : "";
    card.innerHTML = ';
          <div class="relative card-preview-container aspect-video cursor-pointer">;
            <img src="${posterUrl}" alt="${
      broadcast.username;
    }" class="card-poster w-full aspect-video object-cover pointer-events-none">;
            <span class="badge-live absolute top-2 right-2 px-2 py-1 rounded-md text-white text-xs font-medium z-20">AO VIVO</span>;
            <div class="absolute bottom-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded-md text-white text-xs flex items-center z-20">;
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>;
              ${broadcast.viewers}
            </div>;
            <div class="absolute inset-0 z-30 cursor-pointer card-click-overlay"></div>;
          </div>;
          <div class="p-4 card-info-container">;
            <div class="flex items-center justify-between mb-2">;
              <h3 class="font-bold text-white">@${broadcast.username}</h3>;
              <span class="flag-icon" style="background-image: url(https://flagcdn.com/w20/${
                broadcast.country;
              }.png)" title="${getCountryName(;
      broadcast.country;
    )}" alt="${getCountryName(broadcast.country)}"></span>;
            </div>;
            <div class="flex flex-wrap gap-2 mb-2">;
              <span class="bg-gray-800 text-gray-300 px-2 py-1 rounded-full text-xs flex items-center">;
                <img src="${GENDER_ICON_SVG}" class="w-3 h-3 mr-1.5" alt="Gender Icon">;
                ${TRANSLATIONS.gender[broadcast.gender] || broadcast.gender}
              </span>;
              <span class="bg-gray-800 text-gray-300 px-2 py-1 rounded-full text-xs flex items-center">;
                <img src="${ORIENTATION_ICON_SVG}" class="w-3 h-3 mr-1.5" alt="Orientation Icon">;
                ${
                  TRANSLATIONS.sexPreference[broadcast.sexualOrientation] ||;
                  broadcast.sexualOrientation;
                }
              </span>;
              <span class="bg-gray-800 text-gray-300 px-2 py-1 rounded-full text-xs flex items-center">;
                <img src="${BROADCAST_TYPE_ICON_SVG}" class="w-3 h-3 mr-1.5" alt="Broadcast Type Icon">;
                ${
                  TRANSLATIONS.broadcastType[broadcast.broadcastType] ||;
                  broadcast.broadcastType;
                }
              </span>;
            </div>;
            <div class="flex flex-wrap gap-1 mt-2">${tagsHTML}</div>;
          </div>;
        ';
    // Find the new containers inside the card;
    // Declaração de variável: previewContainer
const previewContainer = card.querySelector(".card-preview-container");
    previewContainer.dataset.username = broadcast.username;
    previewContainer.style.cursor = "pointer";
    card.addEventListener("mouseenter", function (e) {
      handleCardHover({
        currentTarget: previewContainer;
      });
    });
    card.addEventListener("mouseleave", function (e) {
      handleCardMouseLeave({
        currentTarget: previewContainer;
      });
    });
    // Declaração de variável: clickOverlay
const clickOverlay = previewContainer.querySelector(".card-click-overlay");
    clickOverlay.addEventListener("click", (e) => {
      e.stopPropagation();
      openModal(broadcast.id);
    });
    // Adiciona evento de clique nas tags para filtrar;
    // Declaração de variável: tagElements
const tagElements = card.querySelectorAll(".card-tag");
    tagElements.forEach((tagEl) => {
      tagEl.addEventListener("click", (e) => {
        e.stopPropagation();
        // Declaração de variável: tagName
const tagName = tagEl.textContent.replace("#", "").trim();
        filters.tags = tagName;
        searchInput.value = tagName;
        mobileSearchInput.value = tagName;
        goToPage(1);
      });
    });
    broadcastsGrid.appendChild(card);
  });
  updatePagination();
  showBroadcastsGrid();
}
// Pagination Logic;

// Função: updatePagination
function updatePagination() {
  pageNumbers.innerHTML = "";
  // Declaração de variável: isMobile
let isMobile = window.innerWidth < 640;
  let startPage, endPage;
  if (isMobile) {
    // Mostra só 3 páginas;
    startPage = Math.max(1, currentPage - 1);
    endPage = Math.min(totalPages, startPage + 2);
    if (endPage - startPage < 2) {
      startPage = Math.max(1, endPage - 2);
    }
  } else {
    startPage = Math.max(1, currentPage - 2);
    endPage = Math.min(totalPages, currentPage + 2);
    if (endPage - startPage < 4) {
      if (startPage === 1) endPage = Math.min(5, totalPages);
      else if (endPage === totalPages) startPage = Math.max(1, totalPages - 4);
    }
  }
  for (// Declaração de variável: i
let i = startPage; i <= endPage; i++) {
    // Declaração de variável: pageButton
const pageButton = document.createElement("button");
    pageButton.className = 'pagination-btn w-8 h-8 flex items-center justify-center rounded-md text-sm ${
      i === currentPage ? "pagination-active" : "bg-gray-800 hover:bg-gray-700";
    }';
    pageButton.textContent = i;
    pageButton.addEventListener("click", () => goToPage(i));
    pageNumbers.appendChild(pageButton);
  }
  // Botões de navegação;
  if (isMobile) {
    // Primeira página: seta dupla para a esquerda;
    firstPageButton.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">;
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 19l-7-7 7-7" />;
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7" />;
  </svg>';
    // Anterior: seta simples para a esquerda;
    prevPageButton.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">;
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />;
  </svg>';
    // Próxima: seta simples para a direita;
    nextPageButton.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">;
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />;
  </svg>';
    // Última página: seta dupla para a direita;
    lastPageButton.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">;
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5l7 7-7 7" />;
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7" />;
  </svg>';
    firstPageButton.title = "Primeira";
    prevPageButton.title = "Anterior";
    nextPageButton.title = "Próxima";
    lastPageButton.title = "Última";
  } else {
    firstPageButton.textContent = "Primeira";
    prevPageButton.textContent = "Anterior";
    nextPageButton.textContent = "Próxima";
    lastPageButton.textContent = "Última";
  }
  [firstPageButton, prevPageButton].forEach(;
    (btn) => (btn.disabled = currentPage === 1);
  );
  [nextPageButton, lastPageButton].forEach(;
    (btn) => (btn.disabled = currentPage === totalPages);
  );
  [firstPageButton, prevPageButton, nextPageButton, lastPageButton].forEach(;
    (button) => {
      button.classList.toggle("opacity-50", button.disabled);
      button.classList.toggle("cursor-not-allowed", button.disabled);
    }
  );
}


// Função: goToPage
function goToPage(page) {
  // Correction: Allow navigation to page 1 even if totalPages is 0 (for new searches);
  if (page < 1 || (page > totalPages && page !== 1)) return;
  currentPage = page;
  updateUrl();
  fetchBroadcasts(currentPage, filters);
}


// Função: updateUrl
function updateUrl() {
  // Declaração de variável: params
const params = new URLSearchParams();
  if (itemsPerPage !== 17) params.set("limit", itemsPerPage);
  if (currentPage > 1) params.set("page", currentPage);
  if (filters.country) params.set("country", filters.country);
  if (filters.tags) params.set("tags", filters.tags);
  // Add other filters from the state if they should be reflected in the URL;
  if (filters.gender) params.set("gender", filters.gender);
  if (filters.orientation) params.set("sexualOrientation", filters.orientation);
  if (order && order !== "mostViewers") params.set("order", order); // Adiciona order na URL;
  else if (order === "mostViewers") params.delete("order");
  // Declaração de variável: newUrl
const newUrl = '${window.location.pathname}?${params.toString()}';
  history.pushState(;
    {
      path: newUrl;
    },;
    "",;
    newUrl;
  );
}
// Função utilitária para alterar o order global e atualizar grade/página;

// Função: setOrder
function setOrder(newOrder) {
  if (order !== newOrder) {
    order = newOrder;
    goToPage(1);
  }
}
// Modal Logic;

// Função: openModal
function openModal(broadcastId) {
  // Declaração de variável: broadcast
const broadcast = broadcasts.find((b) => b.id === broadcastId);
  if (!broadcast) {
    showToast("Transmissão não encontrada. Tente recarregar.");
    return;
  }
  // Populate text and static info;
  modalUsername.textContent = '@${broadcast.username}';
  modalAvatar.src = broadcast.profileImageURL;
  modalCountryFlag.style.backgroundImage = 'url(https://flagcdn.com/w20/${broadcast.country}.png)';
  modalCountryName.textContent = getCountryName(broadcast.country);
  modalViewers.textContent = broadcast.viewers;
  modalGender.innerHTML = '<img src="${GENDER_ICON_SVG}" class="w-4 h-4 mr-2" alt="Gender Icon">${
    TRANSLATIONS.gender[broadcast.gender] || broadcast.gender;
  }';
  modalOrientation.innerHTML = '<img src="${ORIENTATION_ICON_SVG}" class="w-4 h-4 mr-2" alt="Orientation Icon">${
    TRANSLATIONS.sexPreference[broadcast.sexualOrientation] ||;
    broadcast.sexualOrientation;
  }';
  modalType.innerHTML = '<img src="${BROADCAST_TYPE_ICON_SVG}" class="w-4 h-4 mr-2" alt="Broadcast Type Icon">${
    TRANSLATIONS.broadcastType[broadcast.broadcastType] ||;
    broadcast.broadcastType;
  }';
  // Populate tags;
  modalTags.innerHTML = "";
  if (broadcast.tags && broadcast.tags.length > 0) {
    broadcast.tags.forEach((tag) => {
      // Declaração de variável: tagElement
const tagElement = document.createElement("span");
      tagElement.className =;
        "bg-xcam-blue bg-opacity-30 text-xcam-blue px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-opacity-50 transition-colors";
      tagElement.textContent = '#${tag.name}';
      tagElement.addEventListener("click", () => {
        filters.tags = tag.name;
        searchInput.value = tag.name;
        mobileSearchInput.value = tag.name;
        closeModalHandler();
        goToPage(1);
      });
      modalTags.appendChild(tagElement);
    });
  }
  // Reset and setup Gemini Bio section;
  geminiBioContent.classList.add("hidden");
  geminiBioContent.textContent = "";
  // Declaração de variável: btn
const btn = document.getElementById("generate-bio-btn");
  btn.style.display = "flex"; // Garante que o botão está visível;
  btn.innerHTML = '✨ Carregar Biografia do Usuário @${broadcast.username}';
  btn.onclick = () => handleGenerateBio(broadcast);
  handleGenerateBio(broadcast); // Chama a função automaticamente;

  // Construct the new iframe URL;
  // Declaração de variável: posterUrl
const posterUrl = encodeURIComponent(;
    'https://api.xcam.gay/poster/${broadcast.username}.jpg';
  );
  // Declaração de variável: tagsString
const tagsString = broadcast.tags;
    ? encodeURIComponent(broadcast.tags.map((tag) => tag.name).join(","));
    : "";
  // Declaração de variável: iframeUrl
const iframeUrl = 'https://xcam.gay/player/?user=${broadcast.username}&img=${posterUrl}&tags=${tagsString}';
  // Set iframe source and show it, hide the thumbnail/play button;
  modalIframe.src = iframeUrl;
  document.getElementById("modal-player").classList.add("hidden");
  modalIframe.classList.remove("hidden");
  // Populate related broadcasts;
  // Declaração de variável: related
const related = broadcasts;
    .filter(;
      (b) =>;
        b.id !== broadcastId &&;
        (b.gender === broadcast.gender ||;
          b.sexualOrientation === broadcast.sexualOrientation);
    );
    .slice(0, 3);
  relatedBroadcasts.innerHTML = "";
  related.forEach((r) => {
    // Declaração de variável: item
const item = document.createElement("div");
    item.className = "cursor-pointer hover:opacity-90 transition-opacity";
    item.onclick = () => openModal(r.id);
    item.innerHTML = ';
          <div class="relative"><img src="https://api.xcam.gay/poster/${r.username}.jpg" alt="${r.username}" class="w-full aspect-video object-cover rounded-lg"><span class="badge-live absolute top-2 right-2 px-2 py-1 rounded-md text-white text-xs font-medium">AO VIVO</span></div>;
          <h4 class="font-medium text-white mt-2">@${r.username}</h4>;
          <div class="flex items-center text-sm text-gray-400"><span class="flag-icon" style="background-image: url(https://flagcdn.com/w20/${r.country}.png)"></span><span>${r.viewers} espectadores</span></div>;
        ';
    relatedBroadcasts.appendChild(item);
  });
  // Show the modal;
  broadcastModal.style.display = "block";
  document.body.style.overflow = "hidden";
}


// Função: closeModalHandler
function closeModalHandler() {
  broadcastModal.style.display = "none";
  document.body.style.overflow = "auto";
  modalIframe.src = "";
}
// Utility Functions;

// Função: showToast
function showToast(message) {
  toastMessage.textContent = message;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 3000);
}


// Função: getCountryName
function getCountryName(countryCode) {
  return COUNTRY_NAMES[countryCode] || countryCode.toUpperCase();
}
// Make functions available globally for inline onclick attributes;
window.openModal = openModal;
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker;
      .register(;
        "https://xcam.gay/sw.js";
      );
      .then((registration) => {
        console.log("Service Worker registrado com sucesso:", registration);
      });
      .catch((error) => {
        console.log("Falha ao registrar o Service Worker:", error);
      });
  });

}