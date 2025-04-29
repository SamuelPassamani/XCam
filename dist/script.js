"use strict";

/* ============================
        Variáveis Globais
============================ */
const header = document.querySelector("header");
const nav = document.querySelector("nav");
const navbarMenuBtn = document.querySelector(".navbar-menu-btn");
const navbarForm = document.querySelector(".navbar-form");
const navbarFormCloseBtn = document.querySelector(".navbar-form-close");
const navbarSearchBtn = document.querySelector(".navbar-search-btn");

let camerasData = []; // Armazena os dados das câmeras
let currentPage = 1; // Controla a página atual
const camerasPerPage = 24; // Número de câmeras por página

/* ============================
        Funções de Navegação
============================ */

// Alterna o estado ativo do menu de navegação
function navIsActive() {
  header.classList.toggle("active");
  nav.classList.toggle("active");
  navbarMenuBtn.classList.toggle("active");
}

// Adiciona event listener ao botão do menu
navbarMenuBtn.addEventListener("click", navIsActive);

// Alterna o estado ativo da barra de pesquisa
const searchBarIsActive = () => navbarForm.classList.toggle("active");

// Adiciona event listeners nos botões de busca
navbarSearchBtn.addEventListener("click", searchBarIsActive);
navbarFormCloseBtn.addEventListener("click", searchBarIsActive);

/* ============================
        Função Fetch
============================ */

// Busca os dados das câmeras no arquivo JSON
async function fetchCamerasData() {
  const url = "https://site.my.eu.org/1:/male.json";

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erro na requisição: ${response.status}`);

    // Processa os dados recebidos
    const data = await response.json();

    // Verifica se a estrutura do JSON contém os dados esperados
    if (data && data.broadcasts && Array.isArray(data.broadcasts.items)) {
      camerasData = data.broadcasts.items;

      console.log(`Total de itens carregados: ${camerasData.length}`);

      // Renderiza a página inicial de câmeras e botões de paginação
      renderCameras();
      renderPagination();
    } else {
      throw new Error(
        "Estrutura do JSON inválida ou items não encontrados em broadcasts"
      );
    }
  } catch (error) {
    console.error("Erro ao carregar os dados:", error.message);
  }
}

/* ============================
        Função Auxiliar
============================ */

// Função para converter o código do país em ícone de bandeira
function getCountryFlag(countryCode) {
  if (!countryCode) {
    console.warn("Código do país ausente ou inválido:", countryCode);
    return `
      <div class="country">
        <span>Desconhecido</span>
      </div>`;
  }
  return `
    <div class="country">
      <img src="https://flagcdn.com/w40/${countryCode.toLowerCase()}.png" alt="${countryCode}" title="${countryCode}">
    </div>`;
}

/* ============================
        Renderização
============================ */

// Renderiza as câmeras no grid
function renderCameras() {
  const moviesGrid = document.querySelector("#movies-grid");
  if (!moviesGrid) {
    console.error("Elemento #movies-grid não encontrado!");
    return;
  }

  // Limpa o grid antes de adicionar novas câmeras
  moviesGrid.innerHTML = "";

  // Calcula o índice inicial e final com base na página atual
  const startIndex = (currentPage - 1) * camerasPerPage;
  const endIndex = startIndex + camerasPerPage;

  // Obtém o lote de câmeras para a página atual
  const currentBatch = camerasData.slice(startIndex, endIndex);

  console.log(`Exibindo câmeras da página ${currentPage}:`, currentBatch);

  // Adiciona os cartões de câmeras ao grid
  currentBatch.forEach((camera) => {
    const cameraCard = `
      <a href="https://xxx.filmes.net.eu.org/user/?id=${camera.username}" class="movie-card"> 
        <div class="movie-card">
          <div class="card-head">
            <img src="${camera.preview?.poster || camera.profileImageURL}" alt="${camera.username}" class="card-img">
            <div class="card-overlay">
              ${getCountryFlag(camera.countryCode)} <!-- Usa a função atualizada -->
              <div class="viewers">
                <ion-icon name="eye-outline"></ion-icon>
                <span>${camera.viewers}</span>
              </div>
              <div class="play">
                <ion-icon name="play-circle-outline"></ion-icon>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div class="user-info user-profile-small">
              <img src="${camera.profileImageURL}" alt="${camera.username}" class="user-profile-small-img">
              <h3 class="card-title">@${camera.username}</h3>
            </div>
            <div class="card-info">
              <span class="tags">${camera.tags
                .map((tag) => tag.name)
                .join(", ")}</span>
            </div>
          </div>
        </div>
      </a>`;
    moviesGrid.insertAdjacentHTML("beforeend", cameraCard);
  });
}

// Renderiza os botões de paginação
function renderPagination() {
  const paginationContainer = document.querySelector("#pagination");
  if (!paginationContainer) {
    console.error("Elemento #pagination não encontrado!");
    return;
  }

  // Limpa o container da paginação
  paginationContainer.innerHTML = "";

  const totalPages = Math.ceil(camerasData.length / camerasPerPage);

  console.log(`Total de páginas: ${totalPages}`);

  const maxButtons = window.innerWidth <= 768 ? 3 : 7; // Define o número de botões com base no tamanho da tela
  const halfMaxButtons = Math.floor(maxButtons / 2);

  let startPage = Math.max(currentPage - halfMaxButtons, 1);
  let endPage = Math.min(startPage + maxButtons - 1, totalPages);

  if (endPage - startPage + 1 < maxButtons && startPage > 1) {
    startPage = Math.max(endPage - maxButtons + 1, 1);
  }

  // Botão "ANTERIOR"
  if (currentPage > 1) {
    const prevButton = document.createElement("button");
    prevButton.textContent = "ANTERIOR";
    prevButton.className = "pagination-button";
    prevButton.addEventListener("click", () => {
      currentPage--;
      renderCameras();
      renderPagination();
    });
    paginationContainer.appendChild(prevButton);
  }

  // Botões de número de página
  for (let page = startPage; page <= endPage; page++) {
    const pageButton = document.createElement("button");
    pageButton.textContent = page;
    pageButton.className = `pagination-button ${
      page === currentPage ? "active" : ""
    }`;
    pageButton.addEventListener("click", () => {
      currentPage = page;
      renderCameras();
      renderPagination();
    });
    paginationContainer.appendChild(pageButton);
  }

  // Botão "PRÓXIMA"
  if (currentPage < totalPages) {
    const nextButton = document.createElement("button");
    nextButton.textContent = "PRÓXIMA";
    nextButton.className = "pagination-button";
    nextButton.addEventListener("click", () => {
      currentPage++;
      renderCameras();
      renderPagination();
    });
    paginationContainer.appendChild(nextButton);
  }
}

// Recalcula a páginação ao redimensionar a janela
window.addEventListener("resize", () => {
  renderPagination();
});

// Carrega os dados das câmeras ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
  fetchCamerasData();
});
