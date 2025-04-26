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
let currentDisplayIndex = 0; // Índice atual de câmeras exibidas
let camerasPerLoad = 0; // Número dinâmico de câmeras por carregamento

// Função para buscar os dados das câmeras
async function fetchCamerasData() {
  const url = "https://site.my.eu.org/1:/male.json";

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erro na requisição: ${response.status}`);

    // Armazena os dados na variável global
    const data = await response.json();

    // Verifica se a estrutura do JSON contém broadcasts.items
    if (data && data.broadcasts && Array.isArray(data.broadcasts.items)) {
      camerasData = data.broadcasts.items;
      camerasPerLoad = data.broadcasts.total; // Atualiza o valor de camerasPerLoad com o valor de "total"
    } else {
      throw new Error(
        "Estrutura do JSON inválida ou items não encontrados em broadcasts"
      );
    }

    // Exibe as câmeras
    renderCameras();
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

  // Obtém o próximo lote de câmeras a serem exibidas
  const nextBatch = camerasData.slice(
    currentDisplayIndex,
    currentDisplayIndex + camerasPerLoad
  );

  // Atualiza o índice atual
  currentDisplayIndex += camerasPerLoad;

  // Adiciona os cartões de câmeras ao grid
  nextBatch.forEach((camera) => {
    const cameraCard = `
        <a href="https://xxx.filmes.net.eu.org/user/?id=${camera.username}" class="movie-card"> 
            <div class="movie-card">
                <div class="card-head">
                    <img src="${camera.preview.poster}" alt="${camera.username}" class="card-img">
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

  // Mostra ou oculta o botão "CARREGAR MAIS"
  const loadMoreButton = document.querySelector(".load-more");
  if (currentDisplayIndex >= camerasData.length) {
    loadMoreButton.style.display = "none";
  }
}

// Carrega as câmeras ao carregar a página
document.addEventListener("DOMContentLoaded", () => fetchCamerasData());

// Função para carregar mais câmeras ao clicar no botão "CARREGAR MAIS"
const loadMoreButton = document.querySelector(".load-more");
if (loadMoreButton) {
  loadMoreButton.addEventListener("click", renderCameras);
}
