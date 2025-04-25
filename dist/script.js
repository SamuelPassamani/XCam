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
const moviesPerPage = 24;

// Função para carregar filmes
function loadMovies(page = 1, filters = {}) {
  const {
    quality,
    minimumRating,
    queryTerm,
    genre,
    sortBy,
    orderBy
  } = filters;

  // Construção da URL da API com base nos filtros aplicados
  const apiUrl =
    `https://yts.mx/api/v2/list_movies.json?limit=${moviesPerPage}&page=${page}` +
    (quality ? `&quality=${quality}` : "") +
    (minimumRating ? `&minimum_rating=${minimumRating}` : "") +
    (queryTerm ? `&query_term=${queryTerm}` : "") +
    (genre ? `&genre=${genre}` : "") +
    (sortBy ? `&sort_by=${sortBy}` : "") +
    (orderBy ? `&order_by=${orderBy}` : "");

  console.log("Fetching movies with URL:", apiUrl); // Log para depuração

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.data && data.data.movies) {
        const movies = data.data.movies;
        const moviesGrid = document.querySelector(".movies-grid");

        // Limpa a grade de filmes antes de adicionar novos
        if (page === 1) {
          moviesGrid.innerHTML = "";
        }

        // Adiciona os filmes à grade
        movies.forEach((movie) => {
          const movieCard = `
          <a href="https://makingoff.eu.org/db/?id=${movie.imdb_code}" class="movie-card"> 
            <div class="movie-card">
              <div class="card-head">
                <img src="${movie.medium_cover_image}" alt="${movie.title}" class="card-img">
                <div class="card-overlay">
                  <div class="bookmark">
                    <ion-icon name="bookmark"></ion-icon>
                  </div>
                  <div class="rating">
                    <ion-icon name="star-outline"></ion-icon>
                    <span>${movie.rating}</span>
                  </div>
                  <div class="play">
                    <ion-icon name="play-circle-outline"></ion-icon>
                  </div>
                </div>
              </div>
              <div class="card-body">
                <h3 class="card-title">${movie.title}</h3>
                <div class="card-info">
                  <span class="genre">${movie.genres.join(", ")}</span>
                  <span class="year">${movie.year}</span>
                </div>
              </div>
            </div>
          </a>
          `;
          moviesGrid.insertAdjacentHTML("beforeend", movieCard);
        });
      } else {
        console.error("Nenhum filme encontrado.");
      }
    })
    .catch((error) => console.error("Erro ao carregar filmes:", error));
}

// Carrega os filmes quando a página é carregada
window.addEventListener("DOMContentLoaded", () => loadMovies());

// Função para carregar mais filmes ao clicar no botão "CARREGAR MAIS"
const loadMoreButton = document.querySelector(".load-more");
if (loadMoreButton) {
  loadMoreButton.addEventListener("click", () => {
    currentPage++;
    const filters = getFilters();
    loadMovies(currentPage, filters);
  });
}

// Função para aplicar os filtros
const applyFilters = () => {
  currentPage = 1;
  const filters = getFilters();
  loadMovies(currentPage, filters);
};

// Função para obter os valores dos filtros
const getFilters = () => {
  const genre = document.querySelector('.filter-dropdowns select[name="genre"]')?.value;
  const quality = document.querySelector(".filter-dropdowns select.quality-filter")?.value;
  const minimumRating = document.querySelector(".filter-dropdowns select.rating-filter")?.value;
  const sortBy = document.querySelector(".filter-dropdowns select.sort-by-filter")?.value;
  const orderBy = document.querySelector(".filter-dropdowns select.order-by-filter")?.value;

  return {
    genre: genre && genre !== "all genres" ? genre : null,
    quality: quality || null,
    minimumRating: minimumRating || null,
    sortBy: sortBy || null,
    orderBy: orderBy || null
  };
};

// Adiciona evento para aplicar os filtros
const filterBar = document.querySelector(".filter-bar");
if (filterBar) {
  filterBar.addEventListener("change", applyFilters);
}
