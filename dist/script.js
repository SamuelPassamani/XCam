"use strict"; // Modo estrito para evitar erros comuns de JavaScript

// Seleção de elementos HTML do cabeçalho e navegação
const header = document.querySelector("header");
const nav = document.querySelector("nav");
const navbarMenuBtn = document.querySelector(".navbar-menu-btn");

// Seleção de elementos relacionados à barra de pesquisa
const navbarForm = document.querySelector(".navbar-form");
const navbarFormCloseBtn = document.querySelector(".navbar-form-close");
const navbarSearchBtn = document.querySelector(".navbar-search-btn");

/**
 * Função para alternar o estado ativo do menu de navegação.
 * Quando o botão do menu é clicado, as classes 'active' são alternadas
 * no cabeçalho, na navegação e no botão.
 */
function navIsActive() {
  header.classList.toggle("active");
  nav.classList.toggle("active");
  navbarMenuBtn.classList.toggle("active");
}

// Adiciona o evento de clique no botão do menu para ativar/desativar o menu
navbarMenuBtn.addEventListener("click", navIsActive);

/**
 * Função para alternar o estado ativo da barra de pesquisa.
 * Essa função mostra ou oculta a barra de pesquisa ao alternar a classe 'active'.
 */
const searchBarIsActive = () => navbarForm.classList.toggle("active");

// Adiciona eventos de clique para abrir e fechar a barra de pesquisa
navbarSearchBtn.addEventListener("click", searchBarIsActive);
navbarFormCloseBtn.addEventListener("click", searchBarIsActive);

// Variáveis globais para controle de exibição de câmeras
let camerasData = []; // Armazena os dados das câmeras
let currentPage = 1; // Controla qual página está sendo exibida
const camerasPerPage = 24; // Número de câmeras exibidas por página

/**
 * Função assíncrona para buscar os dados das câmeras de uma URL.
 * Os dados são armazenados na variável global `camerasData` após serem carregados.
 */
async function fetchCamerasData() {
  const url = "https://site.my.eu.org/1:/male.json";

  try {
    // Faz uma requisição para buscar os dados JSON
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erro na requisição: ${response.status}`);

    // Armazena os dados recebidos
    const data = await response.json();

    // Verifica a estrutura do JSON para garantir que os dados esperados estão presentes
    if (data && data.broadcasts && Array.isArray(data.broadcasts.items)) {
      camerasData = data.broadcasts.items;

      // Loga o total de itens carregados para depuração
      console.log(`Total de itens carregados: ${camerasData.length}`);

      // Renderiza a primeira página de câmeras e os botões de paginação
      renderCameras();
      renderPagination();
    } else {
      throw new Error(
        "Estrutura do JSON inválida ou items não encontrados em broadcasts"
      );
    }
  } catch (error) {
    // Loga erros no console para depuração
    console.error("Erro ao carregar os dados:", error);
  }
}

/**
 * Função auxiliar para converter o código do país em um ícone de bandeira.
 * Se o código do país for inválido ou ausente, exibe um fallback.
 * 
 * @param {string} countryCode - Código do país (ex: "US", "BR").
 * @returns {string} - HTML do ícone de bandeira ou fallback.
 */
function getCountryFlag(countryCode) {
  if (!countryCode) {
    console.warn("Código do país ausente ou inválido:", countryCode);
    return `
      <div class="country fallback">
        N/A
      </div>`;
  }
  return `
    <div class="country">
      <img src="https://flagcdn.com/w40/${countryCode.toLowerCase()}.png" alt="${countryCode}" title="${countryCode}">
    </div>`;
}

/**
 * Função para renderizar as câmeras no grid da página.
 * Exibe apenas as câmeras que pertencem à página atual.
 */
function renderCameras() {
  const moviesGrid = document.querySelector("#movies-grid");
  if (!moviesGrid) {
    console.error("Elemento #movies-grid não encontrado!");
    return;
  }

  // Limpa o grid antes de adicionar novos itens
  moviesGrid.innerHTML = "";

  // Calcula o índice inicial e final para os itens da página atual
  const startIndex = (currentPage - 1) * camerasPerPage;
  const endIndex = startIndex + camerasPerPage;

  // Obtém o lote de câmeras para a página atual
  const currentBatch = camerasData.slice(startIndex, endIndex);

  // Loga o lote atual para depuração
  console.log(`Exibindo câmeras da página ${currentPage}:`, currentBatch);

  // Cria os cartões de câmera e adiciona ao grid
  currentBatch.forEach((camera) => {
    const cameraCard = `
      <a href="https://xxx.filmes.net.eu.org/user/?id=${camera.username}" class="movie-card"> 
        <div class="movie-card">
          <div class="card-head">
            <img src="${camera.preview?.poster || camera.profileImageURL}" alt="${camera.username}" class="card-img">
            <div class="card-overlay">
              ${getCountryFlag(camera.countryCode)} <!-- Insere a bandeira -->
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

/**
 * Função para renderizar os botões de paginação.
 * Cria botões para navegar entre as páginas de câmeras.
 */
function renderPagination() {
  const paginationContainer = document.querySelector("#pagination");
  if (!paginationContainer) {
    console.error("Elemento #pagination não encontrado!");
    return;
  }

  // Limpa o container antes de adicionar novos botões
  paginationContainer.innerHTML = "";

  // Calcula o total de páginas
  const totalPages = Math.ceil(camerasData.length / camerasPerPage);

  // Loga o total de páginas para depuração
  console.log(`Total de páginas: ${totalPages}`);

  // Define o número máximo de botões exibidos com base na largura da tela
  const maxButtons = window.innerWidth <= 768 ? 3 : 7; // Ajusta para dispositivos móveis
  const halfMaxButtons = Math.floor(maxButtons / 2);

  // Calcula o intervalo de páginas para os botões
  let startPage = Math.max(currentPage - halfMaxButtons, 1);
  let endPage = Math.min(startPage + maxButtons - 1, totalPages);

  // Ajusta o intervalo se necessário
  if (endPage - startPage + 1 < maxButtons && startPage > 1) {
    startPage = Math.max(endPage - maxButtons + 1, 1);
  }

  // Cria o botão "ANTERIOR", se aplicável
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

  // Cria botões para cada página no intervalo
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

  // Cria o botão "PRÓXIMA", se aplicável
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

// Atualiza os botões de paginação ao redimensionar a janela
window.addEventListener("resize", () => {
  renderPagination();
});

// Carrega os dados das câmeras ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
  fetchCamerasData();
});
