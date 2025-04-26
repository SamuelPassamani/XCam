"use strict";

// Obtém o ID do usuário da URL
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get("id");

if (!userId) {
  console.error("Nenhum ID foi fornecido na URL. Adicione ?id=valor na URL.");
} else {
  fetchUserData(userId);
}

// Função para buscar os dados do usuário no JSON
function fetchUserData(userId) {
  fetch("https://site.my.eu.org/1:/male.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erro ao acessar o arquivo JSON: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data && data.broadcasts && Array.isArray(data.broadcasts.items)) {
        const camera = data.broadcasts.items.find(
          (item) => item.username === userId
        );

        if (!camera) {
          console.error(`Nenhuma câmera encontrada com o username: ${userId}`);
          return;
        }

        updatePlayer(camera);
        updateProfileInfo(camera);
      } else {
        console.error("Estrutura do JSON inválida ou items não encontrados.");
      }
    })
    .catch((error) => {
      console.error("Erro ao carregar o arquivo JSON:", error);
    });
}

// Função para atualizar o player
function updatePlayer(camera) {
  const player = document.getElementById("live-player");
  if (player) {
    player.src = `https://xxx.filmes.net.eu.org/cam/?id=${camera.id}`;
  } else {
    console.error("Elemento do player não encontrado no DOM.");
  }
}

// Função para atualizar as informações do perfil
function updateProfileInfo(camera) {
  const profileImage = document.getElementById("profile-image");
  const username = document.getElementById("username");
  const country = document.getElementById("country");
  const gender = document.getElementById("gender");
  const sexualOrientation = document.getElementById("sexual-orientation");

  if (profileImage) profileImage.src = camera.profileImageURL;
  if (username) username.textContent = `Usuário: ${camera.username}`;
  if (country) country.innerHTML = getCountryFlag(camera.country);
  if (gender) gender.textContent = translateGender(camera.gender);
  if (sexualOrientation)
    sexualOrientation.textContent = translateOrientation(
      camera.sexualOrientation
    );
}

// Função para converter país em ícone de bandeira
function getCountryFlag(countryCode) {
  if (!countryCode) return "Desconhecido";
  return `<img src="https://flagcdn.com/h40/${countryCode.toLowerCase()}.png" alt="${countryCode}" class="country-flag">`;
}

// Função para traduzir orientação sexual para português
function translateOrientation(orientation) {
  const translations = {
    straight: "Heterossexual",
    gay: "Homossexual",
    bisexual: "Bissexual",
    bicurious: "Bicurioso",
    lesbian: "Lésbica",
    transgender: "Transgênero",
    queer: "Queer",
    other: "Outro",
    unknown: "Não Definido",
  };
  return translations[orientation] || "Não especificado";
}

// Função para traduzir gêneros para português
function translateGender(gender) {
  const translations = {
    male: "Homem",
    female: "Mulher",
    nonbinary: "Não-binário",
    other: "Outro",
  };
  return translations[gender] || "Não especificado";
}
