"use strict";

// Pega os parâmetros da URL para identificar o filme
const urlParams = new URLSearchParams(window.location.search);
const imdbId = urlParams.get("id"); // Exemplo de uso: movie.html?id={imdb_id_do_filme}

// Função para converter o tempo de minutos para o formato HH:MM
function formatRuntime(runtimeInMinutes) {
  const hours = Math.floor(runtimeInMinutes / 60);
  const minutes = Math.floor(runtimeInMinutes % 60);

  // Formata os valores com dois dígitos
  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");
  
  return `${formattedHours}:${formattedMinutes}`;
}

// Função para carregar os detalhes do filme
function loadMovieDetails(imdbId) {
  const apiUrl = `https://yts.mx/api/v2/movie_details.json?with_images=true&with_cast=true&imdb_id=${imdbId}`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      if (data.data && data.data.movie) {
        const movie = data.data.movie;

        // Atualiza o título da página com o valor de title_long
        document.title = movie.title_long || "Detalhes do Filme";

        // Preenche os detalhes do filme no DOM
        document.querySelector("#movie-title").textContent = movie.title;
        document.querySelector("#movie-genre").textContent = movie.genres.join(", ");
        document.querySelector("#movie-year").textContent = movie.year;
        document.querySelector("#movie-duration").textContent = formatRuntime(movie.runtime);
        document.querySelector("#movie-quality").textContent = movie.quality || "HD";
        document.querySelector("#movie-description").textContent = movie.description_full;
        document.querySelector(".banner-img").src = movie.large_screenshot_image1;

        // Preenche a capa do filme
        document.querySelector("#movie-cover-img").src = movie.large_cover_image;

        // Preenche o player do filme
        const playerUrl = `https://player.filmes.net.eu.org/?id=${movie.imdb_code}`;
        document.querySelector("#movie-player").src = playerUrl;
      } else {
        console.error("Filme não encontrado.");
        document.title = "Filme não encontrado";
      }
    })
    .catch((error) => {
      console.error("Erro ao carregar os detalhes do filme:", error);
      document.title = "Erro ao carregar o filme";
    });
}

// Chama a função ao carregar a página
window.addEventListener("DOMContentLoaded", () => {
  if (imdbId) {
    loadMovieDetails(imdbId);
  } else {
    console.error("Nenhum ID de filme foi fornecido.");
    document.title = "ID do Filme Não Encontrado";
  }
});
