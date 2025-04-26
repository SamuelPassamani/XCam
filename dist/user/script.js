"use strict";

const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get("id"); // Obtém o ID do usuário da URL

if (!userId) {
  console.error("Nenhum ID foi fornecido na URL. Adicione ?id=valor na URL.");
} else {
  // Busca os dados do JSON
  fetch("https://site.my.eu.org/1:/male.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erro ao acessar o arquivo JSON: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      // Verifica se broadcasts.items existe no JSON
      if (data && data.broadcasts && Array.isArray(data.broadcasts.items)) {
        const camera = data.broadcasts.items.find((item) => item.username === userId);

        if (!camera) {
          console.error(`Nenhuma câmera encontrada com o username: ${userId}`);
          return;
        }

        // Atualiza o player
        const player = document.getElementById("live-player");
        player.src = `https://xxx.filmes.net.eu.org/cam/?id=${camera.id}`;

        // Atualiza as informações do perfil
        document.getElementById("profile-image").src = camera.profileImageURL;
        document.getElementById("username").textContent = `Usuário: ${camera.username}`;
        document.getElementById("country").innerHTML = getCountryFlag(camera.country);
        document.getElementById("gender").textContent = camera.gender;
        document.getElementById("sexual-orientation").textContent = translateOrientation(camera.sexualOrientation);
      } else {
        console.error("Estrutura do JSON inválida ou items não encontrados.");
      }
    })
    .catch((error) => {
      console.error("Erro ao carregar o arquivo JSON:", error);
    });
}

// Função para converter país em ícone de bandeira
function getCountryFlag(countryCode) {
  return `<img src="https://flagcdn.com/h40/${countryCode.toLowerCase()}.png" alt="${countryCode}" class="country-flag">`;
}

// Função para traduzir orientação sexual para português
function translateOrientation(orientation) {
  const translations = {
    "straight": "Heterossexual",
    "gay": "Homossexual",
    "bisexual": "Bissexual",
    "lesbian": "Lésbica",
    "transgender": "Transgênero",
    "queer": "Queer",
    "other": "Outro"
  };
  return translations[orientation] || orientation;
}
