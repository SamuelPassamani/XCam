"use strict";

const header = document.querySelector("header");
const nav = document.querySelector("nav");
const navbarMenuBtn = document.querySelector(".navbar-menu-btn");

const navbarForm = document.querySelector(".navbar-form");
const navbarFormCloseBtn = document.querySelector(".navbar-form-close");
const navbarSearchBtn = document.querySelector(".navbar-search-btn");

function navIsActive() {
  header.classList.toggle("active");
  nav.classList.toggle("active");
  navbarMenuBtn.classList.toggle("active");
}

navbarMenuBtn.addEventListener("click", navIsActive);

const searchBarIsActive = () => navbarForm.classList.toggle("active");

navbarSearchBtn.addEventListener("click", searchBarIsActive);
navbarFormCloseBtn.addEventListener("click", searchBarIsActive);

// Variáveis para controle de exibição
let camerasData = []; // Armazena todos os dados das câmeras
let currentPage = 1; // Página atual
const camerasPerPage = 24; // Número de câmeras por página

// Função para buscar os dados das câmeras
async function fetchCamerasData() {
  const url = "https://site.my.eu.org/1:/male1.json";

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erro na requisição: ${response.status}`);

    // Armazena os dados na variável global
    const data = await response.json();

    // Verifica se a estrutura do JSON contém broadcasts.items
    if (data && data.broadcasts && Array.isArray(data.broadcasts.items)) {
      camerasData = data.broadcasts.items;

      // Depuração: Verifica o total de itens no array
      console.log(`Total de itens carregados: ${camerasData.length}`);

      // Renderiza a primeira página
      renderCameras();
      renderPagination();
    } else {
      throw new Error(
        "Estrutura do JSON inválida ou items não encontrados em broadcasts"
      );
    }
  } catch (error) {
    console.error("Erro ao carregar os dados:", error);
  }
}

// Função para renderizar as câmeras
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

  // Obtém as câmeras da página atual
  const currentBatch = camerasData.slice(startIndex, endIndex);

  // Depuração: Verifica o lote atual de câmeras
  console.log(`Exibindo câmeras da página ${currentPage}:`, currentBatch);

  // Adiciona os cartões de câmeras ao grid
  currentBatch.forEach((camera) => {
    const cameraCard = `
      <a href="https://xxx.filmes.net.eu.org/user/?id=${camera.username}" class="movie-card"> 
          <div class="movie-card">
              <div class="card-head">
                  <img src="${camera.preview?.poster || camera.profileImageURL}" alt="${camera.username}" class="card-img">
                  <div class="card-overlay">
                      <div class="bookmark">
                          <ion-icon name="bookmark"></ion-icon>
                      </div>
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
                  <h3 class="card-title">@${camera.username}</h3>
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

// Função para renderizar os botões de paginação
function renderPagination() {
  const paginationContainer = document.querySelector("#pagination");
  if (!paginationContainer) {
    console.error("Elemento #pagination não encontrado!");
    return;
  }

  // Limpa o container antes de adicionar novos botões
  paginationContainer.innerHTML = "";

  const totalPages = Math.ceil(camerasData.length / camerasPerPage);

  // Depuração: Verifica o total de páginas
  console.log(`Total de páginas: ${totalPages}`);

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

  // Botões de números das páginas
  for (let page = 1; page <= totalPages; page++) {
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

  // Botão "PROXIMA"
  if (currentPage < totalPages) {
    const nextButton = document.createElement("button");
    nextButton.textContent = "PROXIMA";
    nextButton.className = "pagination-button";
    nextButton.addEventListener("click", () => {
      currentPage++;
      renderCameras();
      renderPagination();
    });
    paginationContainer.appendChild(nextButton);
  }
}

// Carrega as câmeras ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
  fetchCamerasData();
});
