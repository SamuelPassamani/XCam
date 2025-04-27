// Script para manipular a página Tags com paginação

document.addEventListener("DOMContentLoaded", async () => {
  const tagsGrid = document.querySelector(".tags-grid");
  const paginationContainer = document.createElement("div");
  paginationContainer.classList.add("pagination-container");
  document.body.appendChild(paginationContainer);

  const urlParams = new URLSearchParams(window.location.search);
  const selectedTag = urlParams.get("id"); // Obtém o parâmetro 'id' da URL

  // URLs dos arquivos JSON
  const TAGS_JSON_URL = "https://site.my.eu.org/1:/tags.json";
  const USERS_JSON_URL = "https://site.my.eu.org/1:/male.json";

  // Variáveis para controle da paginação
  const LIMIT = 30;
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

  // Função para exibir uma mensagem de erro
  function displayError(message) {
    tagsGrid.innerHTML = `<p class="error-message">${message}</p>`;
  }

  // Função para renderizar os cards de tags
  function renderTagCards(tags) {
    tagsGrid.innerHTML = ""; // Limpa o conteúdo atual da grade
    tags.forEach((tag) => {
      const tagCard = document.createElement("div");
      tagCard.classList.add("tags-card");

      // Adiciona imagem, nome da tag e o número de broadcasts
      tagCard.innerHTML = `
        <img src="${tag.image}" alt="${tag.name}" class="tags-card-image">
        <div class="tags-card-content">
          <h3 class="tags-card-title">#${tag.name}</h3>
          <p class="tags-card-broadcasts">${tag.broadcasts} broadcasts</p>
        </div>
      `;

      // Ao clicar na tag, atualiza a URL e recarrega a grade
      tagCard.addEventListener("click", () => {
        const newUrl = `${window.location.pathname}?id=${tag.name}`;
        window.history.pushState({}, "", newUrl);
        updateGrid(tag.name);
      });

      tagsGrid.appendChild(tagCard);
    });
  }

  // Função para atualizar a grade com usuários/broadcasts relacionados a uma tag
  async function updateGrid(tagName) {
    const usersData = await fetchData(USERS_JSON_URL);

    if (!usersData) {
      displayError("Erro ao carregar os usuários.");
      return;
    }

    // Filtra os usuários/broadcasts que estão usando a tag
    const filteredUsers = usersData.filter((user) =>
      user.tags.includes(tagName)
    );

    // Atualiza o total de páginas
    totalPages = Math.ceil(filteredUsers.length / LIMIT);

    // Renderiza os dados da página atual
    const startIndex = (currentPage - 1) * LIMIT;
    const endIndex = startIndex + LIMIT;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    renderTagCards(
      paginatedUsers.map((user) => ({
        name: tagName,
        image: user.profileImageURL,
        broadcasts: user.broadcastCount,
      }))
    );

    // Atualiza a paginação
    renderPagination();
  }

  // Função para renderizar os botões de paginação
  function renderPagination() {
    paginationContainer.innerHTML = ""; // Limpa os botões antigos

    if (totalPages <= 1) return; // Sem paginação necessária se houver apenas uma página

    for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement("button");
      pageButton.classList.add("pagination-button");
      if (i === currentPage) pageButton.classList.add("active");
      pageButton.textContent = i;

      // Evento para mudar de página ao clicar
      pageButton.addEventListener("click", () => {
        currentPage = i;
        updateGrid(selectedTag);
      });

      paginationContainer.appendChild(pageButton);
    }
  }

  // Inicializa a página
  async function init() {
    const tagsData = await fetchData(TAGS_JSON_URL);

    if (!tagsData) {
      displayError("Erro ao carregar as tags.");
      return;
    }

    if (selectedTag) {
      // Se uma tag foi selecionada, atualiza a grade com os usuários da tag
      updateGrid(selectedTag);
    } else {
      // Caso contrário, exibe todas as tags disponíveis
      renderTagCards(
        tagsData.map((tag) => ({
          name: tag.name,
          image: tag.previewImage || "https://via.placeholder.com/150",
          broadcasts: tag.broadcastCount || 0,
        }))
      );
    }
  }

  init();
});
