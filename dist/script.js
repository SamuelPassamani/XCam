'use strict';

const header = document.querySelector('header');
const nav = document.querySelector('nav');
const navbarMenuBtn = document.querySelector('.navbar-menu-btn');

const navbarForm = document.querySelector('.navbar-form');
const navbarFormCloseBtn = document.querySelector('.navbar-form-close');
const navbarSearchBtn = document.querySelector('.navbar-search-btn');

function navIsActive() {
    header.classList.toggle('active');
    nav.classList.toggle('active');
    navbarMenuBtn.classList.toggle('active');
}

navbarMenuBtn.addEventListener('click', navIsActive);

const searchBarIsActive = () => navbarForm.classList.toggle('active');

navbarSearchBtn.addEventListener('click', searchBarIsActive);
navbarFormCloseBtn.addEventListener('click', searchBarIsActive);

// Variáveis para controle de exibição
let camerasData = []; // Armazena todos os dados das câmeras
let currentDisplayIndex = 0; // Índice atual de câmeras exibidas
const camerasPerLoad = 28; // Número de câmeras por carregamento

// Função para buscar os dados das câmeras
async function fetchMoviesData() {
    const url = 'https://site.my.eu.org/1:/male.json';

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erro na requisição: ${response.status}`);

        // Armazena os dados na variável global
        camerasData = await response.json();

        // Exibe as primeiras 28 câmeras
        renderCameras();

    } catch (error) {
        console.error('Erro ao carregar os dados:', error);
    }
}

// Função para renderizar as câmeras
function renderCameras() {
    const moviesGrid = document.querySelector('#movies-grid');
    if (!moviesGrid) {
        console.error('Elemento #movies-grid não encontrado!');
        return;
    }

    // Obtém o próximo lote de câmeras a serem exibidas
    const nextBatch = camerasData.items.slice(currentDisplayIndex, currentDisplayIndex + camerasPerLoad);

    // Atualiza o índice atual
    currentDisplayIndex += camerasPerLoad;

    // Adiciona os novos cartões ao grid
    moviesGrid.innerHTML += nextBatch.map(item => `
        <div class="movie-card">
            <div class="card-head">
                <img src="${item.previewPoster}" alt="${item.username}" class="card-img">

                <div class="card-overlay">
                    <div class="viewers">
                        <ion-icon name="eye-outline"></ion-icon>
                        <span>${item.viewers}</span>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <h3 class="card-title">${item.username}</h3>
                <div class="card-info">
                    <span class="tags">${item.tags.join(', ')}</span>
                </div>
            </div>
        </div>
    `).join('');

    // Mostra ou oculta o botão "LOAD MORE"
    const loadMoreButton = document.querySelector('.load-more');
    if (currentDisplayIndex >= camerasData.items.length) {
        loadMoreButton.style.display = 'none';
    }
}

// Adiciona funcionalidade ao botão "LOAD MORE"
document.querySelector('.load-more').addEventListener('click', renderCameras);

// Chama a função ao carregar a página
document.addEventListener('DOMContentLoaded', fetchMoviesData);
