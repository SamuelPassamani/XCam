"use strict"; // Ativa o modo estrito do JavaScript, ajudando a evitar erros comuns

// Obtém o ID do usuário a partir dos parâmetros da URL
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get("id");

// Verifica se o ID do usuário foi fornecido na URL
if (!userId) {
  console.error("Nenhum ID foi fornecido na URL. Adicione ?id=valor na URL.");
} else {
  // Caso o ID seja encontrado, inicia a busca pelos dados do usuário
  fetchUserData(userId);
}

/**
 * Função para buscar os dados do usuário no arquivo JSON.
 * @param {string} userId - O ID (username) do usuário fornecido pela URL.
 */
function fetchUserData(userId) {
  // Faz a requisição para o arquivo JSON
  fetch("https://site.my.eu.org/1:/male.json")
    .then((response) => {
      if (!response.ok) {
        // Verifica se a requisição falhou e lança um erro
        throw new Error(`Erro ao acessar o arquivo JSON: ${response.status}`);
      }
      return response.json(); // Retorna os dados em formato JSON
    })
    .then((data) => {
      // Verifica se a estrutura do JSON está correta e contém os dados esperados
      if (data && data.broadcasts && Array.isArray(data.broadcasts.items)) {
        // Procura o usuário pelo username no array de itens
        const camera = data.broadcasts.items.find(
          (item) => item.username === userId
        );

        if (!camera) {
          // Caso o usuário não seja encontrado, exibe uma mensagem de erro
          console.error(`Nenhuma câmera encontrada com o username: ${userId}`);
          return;
        }

        // Atualiza o player e as informações do perfil com os dados do usuário
        updatePlayer(camera);
        updateProfileInfo(camera);
      } else {
        console.error("Estrutura do JSON inválida ou items não encontrados.");
      }
    })
    .catch((error) => {
      // Captura e exibe erros durante o carregamento dos dados
      console.error("Erro ao carregar o arquivo JSON:", error);
    });
}

/**
 * Função para atualizar o player com o vídeo ao vivo do usuário.
 * @param {Object} camera - Os dados da câmera do usuário.
 */
function updatePlayer(camera) {
  const player = document.getElementById("live-player");
  if (player) {
    // Define o atributo 'src' do player para o link ao vivo do usuário
    player.src = `https://xxx.filmes.net.eu.org/cam/?id=${camera.id}`;
  } else {
    console.error("Elemento do player não encontrado no DOM.");
  }
}

/**
 * Função para atualizar as informações do perfil do usuário.
 * Atualiza a imagem, username, país, gênero e orientação sexual.
 * @param {Object} camera - Os dados da câmera do usuário.
 */
function updateProfileInfo(camera) {
  // Seleciona os elementos do DOM onde as informações serão exibidas
  const profileImage = document.getElementById("profile-image");
  const username = document.getElementById("username");
  const country = document.getElementById("country");
  const gender = document.getElementById("gender");
  const sexualOrientation = document.getElementById("sexual-orientation");

  // Atualiza o elemento da imagem do perfil com a URL fornecida
  if (profileImage) profileImage.src = camera.profileImageURL;

  // Atualiza o username no elemento correspondente
  if (username) username.textContent = `Usuário: ${camera.username}`;

  // Atualiza o país usando a função getCountryFlag
  if (country) country.innerHTML = getCountryFlag(camera.country); // Corrigido para usar `camera.country`

  // Atualiza o gênero traduzido para português
  if (gender) gender.textContent = translateGender(camera.gender);

  // Atualiza a orientação sexual traduzida para português
  if (sexualOrientation) {
    sexualOrientation.textContent = translateOrientation(
      camera.sexualOrientation
    );
  }
}

/**
 * Função para converter o código do país em um ícone de bandeira.
 * Adiciona um fallback visual somente se o código do país estiver ausente ou inválido.
 * @param {string} countryCode - Código do país (ex: "US", "BR").
 * @returns {string} - HTML contendo o ícone da bandeira ou fallback.
 */
function getCountryFlag(countryCode) {
  // Valida se o código do país é uma string válida com exatamente 2 caracteres
  if (!countryCode || typeof countryCode !== "string" || countryCode.trim().length !== 2) {
    return `<span class="country-fallback">N/A</span>`;
  }

  // Retorna o HTML da bandeira com um fallback dinâmico via evento onerror
  return `
    <img 
      class="country-flag" 
      src="https://flagcdn.com/w40/${countryCode.trim().toLowerCase()}.png" 
      alt="Bandeira de ${countryCode.trim().toUpperCase()}" 
      title="País: ${countryCode.trim().toUpperCase()}" 
      onerror="this.style.display='none'; this.insertAdjacentHTML('afterend', '<span class=&quot;country-fallback&quot;>N/A</span>');">
  `;
}

/**
 * Função para traduzir a orientação sexual para português.
 * @param {string} orientation - A orientação sexual em inglês.
 * @returns {string} - A orientação sexual traduzida.
 */
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
  // Retorna a tradução correspondente ou "Não especificado" como padrão
  return translations[orientation] || "Não especificado";
}

/**
 * Função para traduzir o gênero para português.
 * @param {string} gender - O gênero em inglês.
 * @returns {string} - O gênero traduzido.
 */
function translateGender(gender) {
  const translations = {
    male: "Homem",
    female: "Mulher",
    nonbinary: "Não-binário",
    other: "Outro",
  };
  // Retorna a tradução correspondente ou "Não especificado" como padrão
  return translations[gender] || "Não especificado";
}
