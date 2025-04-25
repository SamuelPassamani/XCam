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

// Nova função para buscar os dados e alimentar o grid
async function fetchMoviesData() {
    const url = 'https://site.my.eu.org/1:/male.json';

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erro na requisição: ${response.status}`);

        const data = await response.json();

        const moviesGrid = document.querySelector('#movies-grid');
        if (!moviesGrid) {
            console.error('Elemento #movies-grid não encontrado!');
            return;
        }

        // Gera os cards dinamicamente
        moviesGrid.innerHTML = data.items.map(item => `
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
    } catch (error) {
        console.error('Erro ao carregar os dados:', error);
    }
}

// Chama a função ao carregar a página
document.addEventListener('DOMContentLoaded', fetchMoviesData);
