// Script para manipular a página Tags com paginação

document.addEventListener("DOMContentLoaded", async () => {
  // Seleção de elementos DOM
  const tagsGrid = document.querySelector(".tags-grid");
  const paginationContainer = document.createElement("div");
  paginationContainer.classList.add("pagination-container");
  document.body.appendChild(paginationContainer);

  // Obtém o parâmetro 'id' da URL
  const urlParams = new URLSearchParams(window.location.search);
  const selectedTag = urlParams.get("id");

  // URLs dos arquivos JSON
  const TAGS_JSON_URL = "https://site.my.eu.org/0:/tags.json";
  const USERS_JSON_URL = "https://site.my.eu.org/0:/male.json";

  // Variáveis de controle de paginação
  const LIMIT = 30; // Limite de itens por página
  let currentPage = 1;
  let totalPages = 1;

  // Função para buscar dados de um endpoint JSON
  async function fetchData(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erro ao buscar dados de ${url}`);
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  // Função para exibir mensagens de erro na grade
  function displayError(message) {
    tagsGrid.innerHTML = `<p class="error-message">${message}</p>`;
  }

  // Função para renderizar os cartões de tags
  function renderTagCards(tags) {
    tagsGrid.innerHTML = ""; // Limpa a grade existente

    if (!tags || tags.length === 0) {
      displayError("Nenhuma tag encontrada.");
      return;
    }

    tags.forEach((tag) => {
      const tagCard = document.createElement("div");
      tagCard.classList.add("tags-card");

      // Adiciona o conteúdo do cartão
      tagCard.innerHTML = `
        <img src="${tag.image}" alt="${tag.name}" class="tags-card-image">
        <div class="tags-card-content">
          <h3 class="tags-card-title">#${tag.name}</h3>
          <p class="tags-card-broadcasts">${tag.broadcasts} broadcasts</p>
        </div>
      `;

      // Evento de clique para redirecionar e atualizar a grade
      tagCard.addEventListener("click", () => {
        const newUrl = `${window.location.pathname}?id=${tag.name}`;
        window.history.pushState({}, "", newUrl);
        updateGrid(tag.name);
      });

      tagsGrid.appendChild(tagCard);
    });
  }

  // Função para renderizar os botões de paginação
  function renderPagination() {
    paginationContainer.innerHTML = ""; // Limpa os botões antigos

    if (totalPages <= 1) return; // Sem paginação necessária para uma única página

    for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement("button");
      pageButton.classList.add("pagination-button");
      if (i === currentPage) pageButton.classList.add("active");
      pageButton.textContent = i;

      // Evento para alterar a página ao clicar
      pageButton.addEventListener("click", () => {
        currentPage = i;
        updateGrid(selectedTag);
      });

      paginationContainer.appendChild(pageButton);
    }
  }

  // Função para atualizar a grade com usuários/broadcasts relacionados à tag selecionada
  async function updateGrid(tagName) {
    const usersData = await fetchData(USERS_JSON_URL);

    if (!usersData) {
      displayError("Erro ao carregar os usuários.");
      return;
    }

    // Filtra os usuários que utilizam a tag selecionada
    const filteredUsers = usersData.filter((user) =>
      user.tags.includes(tagName)
    );

    if (!filteredUsers || filteredUsers.length === 0) {
      displayError("Nenhum usuário encontrado para esta tag.");
      return;
    }

    // Calcula o total de páginas
    totalPages = Math.ceil(filteredUsers.length / LIMIT);

    // Determina os itens da página atual
    const startIndex = (currentPage - 1) * LIMIT;
    const endIndex = startIndex + LIMIT;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // Renderiza os cartões de usuários da página atual
    renderTagCards(
      paginatedUsers.map((user) => ({
        name: tagName,
        image: user.profileImageURL || "https://via.placeholder.com/150",
        broadcasts: user.broadcastCount || 0,
      }))
    );

    // Atualiza os botões de paginação
    renderPagination();
  }

  // Função para inicializar a página
  async function init() {
    const tagsData = await fetchData(TAGS_JSON_URL);

    if (!tagsData || !tagsData.tags) {
      displayError("Erro ao carregar as tags.");
      return;
    }

    if (selectedTag) {
      // Se uma tag foi selecionada, atualiza a grade com os usuários da tag
      updateGrid(selectedTag);
    } else {
      // Exibe todas as tags disponíveis
      const tags = Object.keys(tagsData.tags).map((tagName) => ({
        name: tagName,
        image: "https://via.placeholder.com/150", // Substitua se houver imagens específicas
        broadcasts: tagsData.tags[tagName].length, // Número de usuários associados à tag
      }));

      renderTagCards(tags);
    }
  }

  init();
});
