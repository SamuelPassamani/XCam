"use strict";

const header = document.querySelector("header");
const nav = document.querySelector("nav");
const navbarMenuBtn = document.querySelector(".navbar-menu-btn");

const navbarForm = document.querySelector(".navbar-form");
const navbarFormCloseBtn = document.querySelector(".navbar-form-close");
const navbarSearchBtn = document.querySelector(".navbar-search-btn");

// Função para alternar a visibilidade do menu de navegação
function navIsActive() {
  header.classList.toggle("active");
  nav.classList.toggle("active");
  navbarMenuBtn.classList.toggle("active");
}

navbarMenuBtn.addEventListener("click", navIsActive);

const searchBarIsActive = () => navbarForm.classList.toggle("active");

navbarSearchBtn.addEventListener("click", searchBarIsActive);
navbarFormCloseBtn.addEventListener("click", searchBarIsActive);

// Variáveis globais para controle da paginação
let currentPage = 1;

// Função para carregar as câmeras ao vivo
function loadLiveCameras() {
  const apiUrl = `https://site.my.eu.org/1:/male.json`; // URL do JSON com os dados das câmeras

  console.log("Fetching live cameras with URL:", apiUrl); // Log para depuração

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data && Array.isArray(data)) {
        const cameras = data;
        const camerasGrid = document.querySelector(".movies-grid"); // Reutilizando o container da grade de filmes

        // Limpa a grade antes de adicionar novos itens
        camerasGrid.innerHTML = "";

        // Adiciona as câmeras à grade
        cameras.forEach((camera) => {
          const cameraCard = `
          <a href="${camera.preview.src}" class="camera-card" target="_blank">
            <div class="camera-card">
              <div class="card-head">
                <img src="${camera.preview.poster}" alt="${camera.username}" class="card-img">
                <div class="card-overlay">
                  <div class="viewer-count">
                    <ion-icon name="eye-outline"></ion-icon>
                    <span>${camera.viewers} espectadores</span>
                  </div>
                  <div class="play">
                    <ion-icon name="play-circle-outline"></ion-icon>
                  </div>
                </div>
              </div>
              <div class="card-body">
                <h3 class="card-title">${camera.username}</h3>
                <div class="card-info">
                  <span class="country">${camera.country || "Desconhecido"}</span>
                  <span class="tags">${camera.tags.map(tag => tag.name).join(", ")}</span>
                </div>
              </div>
            </div>
          </a>
          `;
          camerasGrid.insertAdjacentHTML("beforeend", cameraCard);
        });
      } else {
        console.error("Nenhuma câmera ao vivo encontrada.");
      }
    })
    .catch((error) => console.error("Erro ao carregar as câmeras ao vivo:", error));
}

// Carrega as câmeras ao vivo quando a página é carregada
window.addEventListener("DOMContentLoaded", () => loadLiveCameras());
