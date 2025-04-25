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

// Função para buscar dados da URL JSON e exibir na página
async function fetchCameraData() {
    try {
        const response = await fetch('https://site.my.eu.org/1:/male.json');
        if (!response.ok) {
            throw new Error(`Erro ao buscar dados: ${response.status}`);
        }
        const data = await response.json();

        // Seleciona o elemento container onde os dados serão exibidos
        const cameraContainer = document.querySelector('#camera-container');
        if (!cameraContainer) {
            console.error('Elemento #camera-container não encontrado na página!');
            return;
        }

        // Gera o HTML para exibir as câmeras
        cameraContainer.innerHTML = data.cameras
            .map(camera => `
                <div class="camera-item">
                    <img src="${camera.image}" alt="${camera.name}" />
                    <p>${camera.name}</p>
                </div>
            `)
            .join('');

    } catch (error) {
        console.error('Erro ao carregar os dados das câmeras:', error);
    }
}

// Chama a função ao carregar a página
document.addEventListener('DOMContentLoaded', fetchCameraData);
