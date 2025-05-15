tailwind.config = {
  theme: {
    extend: {
      colors: {
        "cinza-claro": "#D3D3D3",
        azul: "#00ADEF",
        vermelho: "#F44336",
        amarelo: "#FFC107",
        roxo: "#673AB7",
        rosa: "#E91E63"
      },
      fontFamily: {
        rubik: ["Rubik", "sans-serif"]
      }
    }
  }
};

// Mobile menu toggle
document
  .getElementById("mobile-menu-button")
  .addEventListener("click", function () {
    const mobileMenu = document.getElementById("mobile-menu");
    mobileMenu.classList.toggle("hidden");
  });

// Featured artist player
document.getElementById("play-featured").addEventListener("click", function () {
  const adOverlay = document.getElementById("ad-overlay");
  adOverlay.style.display = "flex";
  startAdTimer("ad-timer", "ad-close-btn");
});

// Modal video player
document.getElementById("play-modal").addEventListener("click", function () {
  const adOverlay = document.getElementById("modal-ad-overlay");
  adOverlay.style.display = "flex";
  startAdTimer("modal-ad-timer", "modal-ad-close-btn");
});

// Ad timer function
function startAdTimer(timerId, btnId) {
  let timeLeft = 5;
  const timerElement = document.getElementById(timerId);
  const closeButton = document.getElementById(btnId);

  const timer = setInterval(function () {
    timeLeft--;
    timerElement.textContent = `Anúncio: ${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      closeButton.textContent = "Fechar Ads";
      closeButton.classList.remove("bg-gray-600", "cursor-not-allowed");
      closeButton.classList.add("bg-azul", "hover:bg-blue-600");
      closeButton.disabled = false;
    }
  }, 1000);

  closeButton.addEventListener("click", function () {
    if (!closeButton.disabled) {
      const adOverlay = this.parentElement;
      adOverlay.style.display = "none";
    }
  });
}

// Stream modal functions
const modal = document.getElementById("stream-modal");
const modalClose = document.getElementById("modal-close");

function openStreamModal(stream) {
  if (!stream) return;

  // Set stream data in modal
  document.getElementById("modal-username").textContent = stream.username;

  // Set country flag
  const countryFlag = document.getElementById("modal-country-flag");
  countryFlag.src = `https://flagcdn.com/w20/${stream.country}.png`;

  // Map country codes to names
  const countryNames = {
    af: "Afeganistão",
    al: "Albânia",
    dz: "Argélia",
    ad: "Andorra",
    ao: "Angola",
    ag: "Antígua e Barbuda",
    ar: "Argentina",
    am: "Armênia",
    au: "Austrália",
    at: "Áustria",
    az: "Azerbaijão",
    bs: "Bahamas",
    bh: "Bahrein",
    bd: "Bangladesh",
    bb: "Barbados",
    by: "Belarus",
    be: "Bélgica",
    bz: "Belize",
    bj: "Benim",
    bt: "Butão",
    bo: "Bolívia",
    ba: "Bósnia e Herzegovina",
    bw: "Botsuana",
    br: "Brasil",
    bn: "Brunei",
    bg: "Bulgária",
    bf: "Burquina Faso",
    bi: "Burundi",
    cv: "Cabo Verde",
    kh: "Camboja",
    cm: "Camarões",
    ca: "Canadá",
    cf: "República Centro-Africana",
    td: "Chade",
    cl: "Chile",
    cn: "China",
    co: "Colômbia",
    km: "Comores",
    cg: "Congo",
    cr: "Costa Rica",
    ci: "Costa do Marfim",
    hr: "Croácia",
    cu: "Cuba",
    cy: "Chipre",
    cz: "República Tcheca",
    cd: "República Democrática do Congo",
    dk: "Dinamarca",
    dj: "Djibuti",
    dm: "Dominica",
    do: "República Dominicana",
    ec: "Equador",
    eg: "Egito",
    sv: "El Salvador",
    gq: "Guiné Equatorial",
    er: "Eritreia",
    ee: "Estônia",
    et: "Etiópia",
    fj: "Fiji",
    fi: "Finlândia",
    fr: "França",
    ga: "Gabão",
    gm: "Gâmbia",
    ge: "Geórgia",
    de: "Alemanha",
    gh: "Gana",
    gr: "Grécia",
    gd: "Granada",
    gt: "Guatemala",
    gn: "Guiné",
    gw: "Guiné-Bissau",
    gy: "Guiana",
    ht: "Haiti",
    hn: "Honduras",
    hu: "Hungria",
    is: "Islândia",
    in: "Índia",
    id: "Indonésia",
    ir: "Irã",
    iq: "Iraque",
    ie: "Irlanda",
    il: "Israel",
    it: "Itália",
    jm: "Jamaica",
    jp: "Japão",
    jo: "Jordânia",
    kz: "Cazaquistão",
    ke: "Quênia",
    ki: "Kiribati",
    kw: "Kuwait",
    kg: "Quirguistão",
    la: "Laos",
    lv: "Letônia",
    lb: "Líbano",
    ls: "Lesoto",
    lr: "Libéria",
    ly: "Líbia",
    li: "Liechtenstein",
    lt: "Lituânia",
    lu: "Luxemburgo",
    mg: "Madagascar",
    mw: "Malawi",
    my: "Malásia",
    mv: "Maldivas",
    ml: "Mali",
    mt: "Malta",
    mh: "Ilhas Marshall",
    mr: "Mauritânia",
    mu: "Maurício",
    mx: "México",
    fm: "Micronésia",
    md: "Moldávia",
    mc: "Mônaco",
    mn: "Mongólia",
    me: "Montenegro",
    ma: "Marrocos",
    mz: "Moçambique",
    mm: "Mianmar",
    na: "Namíbia",
    nr: "Nauru",
    np: "Nepal",
    nl: "Países Baixos",
    nz: "Nova Zelândia",
    ni: "Nicarágua",
    ne: "Níger",
    ng: "Nigéria",
    kp: "Coreia do Norte",
    no: "Noruega",
    om: "Omã",
    pk: "Paquistão",
    pw: "Palau",
    pa: "Panamá",
    pg: "Papua-Nova Guiné",
    py: "Paraguai",
    pe: "Peru",
    ph: "Filipinas",
    pl: "Polônia",
    pt: "Portugal",
    qa: "Qatar",
    ro: "Romênia",
    ru: "Rússia",
    rw: "Ruanda",
    ws: "Samoa",
    sm: "San Marino",
    sa: "Arábia Saudita",
    sn: "Senegal",
    rs: "Sérvia",
    sc: "Seicheles",
    sl: "Serra Leoa",
    sg: "Singapura",
    sk: "Eslováquia",
    si: "Eslovênia",
    sb: "Ilhas Salomão",
    so: "Somália",
    za: "África do Sul",
    kr: "Coreia do Sul",
    ss: "Sudão do Sul",
    es: "Espanha",
    lk: "Sri Lanka",
    sd: "Sudão",
    sr: "Suriname",
    se: "Suécia",
    ch: "Suíça",
    sy: "Síria",
    tw: "Taiwan",
    tj: "Tajiquistão",
    tz: "Tanzânia",
    th: "Tailândia",
    tl: "Timor-Leste",
    tg: "Togo",
    to: "Tonga",
    tt: "Trinidad e Tobago",
    tn: "Tunísia",
    tr: "Turquia",
    tm: "Turcomenistão",
    tv: "Tuvalu",
    ug: "Uganda",
    ua: "Ucrânia",
    ae: "Emirados Árabes Unidos",
    gb: "Reino Unido",
    us: "Estados Unidos",
    uy: "Uruguai",
    uz: "Uzbequistão",
    vu: "Vanuatu",
    va: "Vaticano",
    ve: "Venezuela",
    vn: "Vietnã",
    ye: "Iémen",
    zm: "Zâmbia",
    zw: "Zimbábue"
  };

  document.getElementById("modal-country").textContent =
    countryNames[stream.country] || stream.country;
  document.getElementById(
    "modal-viewers"
  ).textContent = `${stream.viewers} espectadores`;

  // Set profile image
  const profileImg = document.getElementById("modal-profile-img");
  if (stream.profileImageURL) {
    profileImg.src = stream.profileImageURL;
  } else {
    // Default profile image if none provided
    profileImg.src = "https://site.my.eu.org/0:/logo-600.png";
  }

  // Set player thumbnail
  const playerPlaceholder = document.getElementById("modal-player-placeholder");
  if (stream.preview && stream.preview.poster) {
    playerPlaceholder.style.backgroundImage = `url('${stream.preview.poster}')`;
  } else {
    playerPlaceholder.style.backgroundImage = `url('https://via.placeholder.com/1280x720/1a1a1a/666666?text=${stream.username}')`;
  }

  // Add tags
  const tagsContainer = document.getElementById("modal-tags");
  tagsContainer.innerHTML = "";

  const tagColors = [
    "bg-azul",
    "bg-vermelho",
    "bg-amarelo",
    "bg-roxo",
    "bg-rosa",
    "bg-green-500",
    "bg-orange-500",
    "bg-purple-500"
  ];

  // Convert broadcast type to art style tag
  const artStyleTags = {
    male: "Pop Art",
    male_group: "Colagem",
    female: "Arte Digital",
    female_group: "Neon Art",
    couple: "Grafite",
    trans: "Vaporwave"
  };

  // Add broadcast type as a tag
  const broadcastTypeTag = document.createElement("span");
  broadcastTypeTag.className = `tag ${tagColors[0]} text-white hover:opacity-90`;
  broadcastTypeTag.textContent = `#${
    artStyleTags[stream.broadcastType] || "PopArt"
  }`;
  tagsContainer.appendChild(broadcastTypeTag);

  // Add stream tags
  if (stream.tags && stream.tags.length > 0) {
    stream.tags.forEach((tag, index) => {
      if (tag.name) {
        const tagElement = document.createElement("span");
        tagElement.className = `tag ${
          tagColors[(index + 1) % tagColors.length]
        } ${
          tagColors[(index + 1) % tagColors.length] === "bg-amarelo"
            ? "text-black"
            : "text-white"
        } hover:opacity-90`;
        tagElement.textContent = `#${tag.name}`;
        tagsContainer.appendChild(tagElement);
      }
    });
  } else {
    // Add some default art tags if none provided
    const defaultTags = ["Digital", "Creative", "Modern"];
    defaultTags.forEach((tag, index) => {
      const tagElement = document.createElement("span");
      tagElement.className = `tag ${
        tagColors[(index + 1) % tagColors.length]
      } ${
        tagColors[(index + 1) % tagColors.length] === "bg-amarelo"
          ? "text-black"
          : "text-white"
      } hover:opacity-90`;
      tagElement.textContent = `#${tag}`;
      tagsContainer.appendChild(tagElement);
    });
  }

  // Show modal
  modal.classList.add("active");
}

modalClose.addEventListener("click", function () {
  modal.classList.remove("active");

  // Reset ad overlay
  const adOverlay = document.getElementById("modal-ad-overlay");
  adOverlay.style.display = "none";

  // Reset ad timer
  const adTimer = document.getElementById("modal-ad-timer");
  adTimer.textContent = "Anúncio: 5s";

  // Reset close button
  const closeBtn = document.getElementById("modal-ad-close-btn");
  closeBtn.textContent = "Aguarde...";
  closeBtn.classList.remove("bg-azul", "hover:bg-blue-600");
  closeBtn.classList.add("bg-gray-600", "cursor-not-allowed");
  closeBtn.disabled = true;

  // Remove the dynamically added ad script (to clean up for the next modal display)
  const adScript = document.getElementById("dynamic-ad-script");
  if (adScript) {
    adScript.remove();
  }
});

function showAd() {
  const adOverlay = document.getElementById("modal-ad-overlay");
  adOverlay.style.display = "flex";

  // Dynamically add the ad script
  const adScript = document.createElement("script");
  adScript.id = "dynamic-ad-script";
  adScript.type = "text/javascript";
  adScript.src =
    "//www.highperformanceformat.com/f1784416e784eb3e8921b75e7a1b00c5/invoke.js";

  // Create a container for the ad
  const adContainer = document.getElementById("modal-ad-container");
  adContainer.innerHTML = ""; // Clear any previous content
  adContainer.appendChild(adScript);

  // Start the ad timer
  startAdTimer("modal-ad-timer", "modal-ad-close-btn");
}

// Call `showAd` whenever the modal is displayed
document.getElementById("play-modal").addEventListener("click", function () {
  showAd();
});

// Art style filter
document.querySelectorAll(".style-pill").forEach((pill) => {
  pill.addEventListener("click", function () {
    document
      .querySelectorAll(".style-pill")
      .forEach((p) =>
        p.classList.remove(
          "active",
          "bg-azul",
          "bg-vermelho",
          "bg-amarelo",
          "bg-roxo",
          "bg-rosa",
          "bg-green-500",
          "bg-orange-500",
          "bg-purple-500"
        )
      );
    this.classList.add("active");

    // Keep the original color when active
    if (this.textContent === "Todos") {
      this.classList.add("bg-azul");
    } else if (this.textContent === "Pop Art") {
      this.classList.add("bg-azul");
    } else if (this.textContent === "Arte Digital") {
      this.classList.add("bg-vermelho");
    } else if (this.textContent === "Colagem") {
      this.classList.add("bg-amarelo");
    } else if (this.textContent === "Grafite") {
      this.classList.add("bg-roxo");
    } else if (this.textContent === "Neon Art") {
      this.classList.add("bg-rosa");
    } else if (this.textContent === "Pixel Art") {
      this.classList.add("bg-green-500");
    } else if (this.textContent === "Retro") {
      this.classList.add("bg-orange-500");
    } else if (this.textContent === "Vaporwave") {
      this.classList.add("bg-purple-500");
    }

    // Filter streams (in a real app)
    // filterStreams(this.textContent);
  });
});

// Global variables for pagination
let currentPage = 1;
const itemsPerPage = 30;
let allBroadcasts = [];

// Load streams from JSON
async function loadStreamsFromJSON() {
  try {
    const response = await fetch("https://xcam.moviele.workers.dev/?limit=1500");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();

    // Store all broadcasts globally
    allBroadcasts = data.broadcasts.items;

    // Load the first page
    loadPaginatedBroadcasts();

    return data;
  } catch (error) {
    console.error("Error loading streams:", error);

    // Fallback to sample data if fetch fails
    allBroadcasts = [
      // Sample data here...
    ];

    // Load the first page of sample data
    loadPaginatedBroadcasts();
  }
}

// Paginate and load broadcasts
function loadPaginatedBroadcasts() {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const paginatedBroadcasts = allBroadcasts.slice(startIndex, endIndex);

  // Create stream cards for the current page
  createStreamCards({
    broadcasts: { total: allBroadcasts.length, items: paginatedBroadcasts }
  });

  // Update pagination buttons
  updatePaginationControls();
}

// Create stream cards
function createStreamCards(streams) {
  const container = document.getElementById("streams-container");
  container.innerHTML = "";

  // Update stream count
  const streamCountElement = document.getElementById("stream-count");
  if (streamCountElement) {
    streamCountElement.textContent = `${streams.broadcasts.total} transmissões`;
  }

  // Create cards for each stream
  streams.broadcasts.items.forEach((stream) => {
    // Convert broadcast type to art style
    const artStyles = {
      male: "Pop Art",
      male_group: "Colagem",
      female: "Arte Digital",
      female_group: "Neon Art",
      couple: "Grafite",
      trans: "Vaporwave"
    };

    const artStyle = artStyles[stream.broadcastType] || "Pop Art";

    // Create stream card
    const card = document.createElement("div");
    card.className = "stream-card cursor-pointer warhol-effect";
    card.onclick = () => openStreamModal(stream);

    // Create HTML for the card
    card.innerHTML = `
      <div class="stream-thumbnail">
        <span class="live-badge">
          <span class="w-2 h-2 bg-white rounded-full mr-1 pulse"></span>
          AO VIVO
        </span>
        <span class="viewers-badge">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          ${stream.viewers}
        </span>
        <img src="${
          stream.preview?.poster ||
          `https://via.placeholder.com/400x225/1a1a1a/666666?text=${stream.username}`
        }" alt="${stream.username}">
      </div>
      <div class="p-4">
        <div class="flex items-center">
          <img src="${
            stream.profileImageURL || "https://via.placeholder.com/40x40"
          }" alt="${
      stream.username
    }" class="w-8 h-8 rounded-full border-2 border-azul mr-2">
          <h3 class="font-medium">@${stream.username}</h3>
<img src="https://flagcdn.com/w20/${stream.country}.png" alt="${
      stream.country
    }" class="ml-auto country-flag">
        </div>
        <div class="mt-2">
          <span class="text-sm text-gray-300">${artStyle}</span>
        </div>
        <div class="flex flex-wrap gap-1 mt-2">
          ${
            stream.tags?.length
              ? stream.tags
                  .slice(0, 2)
                  .map(
                    (tag) =>
                      `<span class="text-xs px-2 py-1 bg-opacity-30 bg-azul rounded-full">#${tag.name}</span>`
                  )
                  .join("")
              : `<span class="text-xs px-2 py-1 bg-opacity-30 bg-azul rounded-full">#PopArt</span>`
          }
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

// Atualiza os controles de paginação
function updatePaginationControls() {
  // Obtém o contêiner onde os botões de paginação serão inseridos
  const paginationContainer = document.getElementById("pagination-controls");

  // Limpa os controles de paginação existentes antes de adicionar novos
  paginationContainer.innerHTML = "";

  // Calcula o número total de páginas com base na quantidade total de itens e no número de itens por página
  const totalPages = Math.ceil(allBroadcasts.length / itemsPerPage);

  // Exibe o botão "Primeira Página" somente se não estiver na primeira página
  if (currentPage > 1) {
    const firstPageButton = document.createElement("button");
    firstPageButton.textContent = "Primeira"; // Texto do botão
    firstPageButton.className =
      "bg-azul hover:bg-blue-600 text-white px-4 py-2 rounded-full mr-2"; // Estilo do botão
    firstPageButton.onclick = () => {
      currentPage = 1; // Define a página atual como a primeira página
      loadPaginatedBroadcasts(); // Recarrega os itens da nova página
    };
    paginationContainer.appendChild(firstPageButton); // Adiciona o botão ao contêiner
  }

  // Exibe o botão "Página Anterior" somente se não estiver na primeira página
  if (currentPage > 1) {
    const prevButton = document.createElement("button");
    prevButton.textContent = "<"; // Texto do botão
    prevButton.className =
      "bg-azul hover:bg-blue-600 text-white px-4 py-2 rounded-full mr-2"; // Estilo do botão
    prevButton.onclick = () => {
      currentPage--; // Reduz o número da página atual
      loadPaginatedBroadcasts(); // Recarrega os itens da página atual
    };
    paginationContainer.appendChild(prevButton); // Adiciona o botão ao contêiner
  }

  // Define o número máximo de botões de páginas a serem exibidos
  const maxPageButtons = 7;

  // Calcula a primeira página a ser exibida, garantindo que não seja menor que 1
  const startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));

  // Calcula a última página a ser exibida, garantindo que não exceda o total de páginas
  const endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

  // Adiciona os botões numerados para as páginas
  for (let page = startPage; page <= endPage; page++) {
    const pageButton = document.createElement("button");
    pageButton.textContent = page; // Número da página exibido no botão

    // Aplica estilos diferentes para destacar o botão da página atual
    pageButton.className = `px-4 py-2 rounded-full ${
      page === currentPage
        ? "bg-azul text-white font-bold"
        : "bg-gray-200 text-gray-800"
    }`;

    // Define a ação ao clicar no botão da página
    pageButton.onclick = () => {
      currentPage = page; // Atualiza a página atual para o número clicado
      loadPaginatedBroadcasts(); // Recarrega os itens da nova página
    };

    paginationContainer.appendChild(pageButton); // Adiciona o botão ao contêiner
  }

  // Exibe o botão "Próxima Página" somente se não estiver na última página
  if (currentPage < totalPages) {
    const nextButton = document.createElement("button");
    nextButton.textContent = ">"; // Texto do botão
    nextButton.className =
      "bg-azul hover:bg-blue-600 text-white px-4 py-2 rounded-full ml-2"; // Estilo do botão
    nextButton.onclick = () => {
      currentPage++; // Incrementa o número da página atual
      loadPaginatedBroadcasts(); // Recarrega os itens da página atual
    };
    paginationContainer.appendChild(nextButton); // Adiciona o botão ao contêiner
  }

  // Exibe o botão "Última Página" somente se não estiver na última página
  if (currentPage < totalPages) {
    const lastPageButton = document.createElement("button");
    lastPageButton.textContent = "Última"; // Texto do botão
    lastPageButton.className =
      "bg-azul hover:bg-blue-600 text-white px-4 py-2 rounded-full ml-2"; // Estilo do botão
    lastPageButton.onclick = () => {
      currentPage = totalPages; // Define a página atual como a última página
      loadPaginatedBroadcasts(); // Recarrega os itens da nova página
    };
    paginationContainer.appendChild(lastPageButton); // Adiciona o botão ao contêiner
  }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  loadStreamsFromJSON().catch((error) => {
    console.error("Error initializing app:", error);
    const container = document.getElementById("streams-container");
    container.innerHTML = `
      <div class="col-span-full text-center py-10">
        <p class="text-vermelho text-lg">Erro ao carregar transmissões. Por favor, tente novamente mais tarde.</p>
        <button class="mt-4 bg-azul hover:bg-blue-600 text-white px-4 py-2 rounded-full">Tentar Novamente</button>
      </div>
    `;
  });
});

// Simulate chat messages
function simulateChat() {
  const chatContainer = document.getElementById("chat-container");
  const messages = [
    {
      name: "ArtEnthusiast",
      color: "text-green-500",
      message: "Adoro esse estilo de arte!"
    },
    {
      name: "ColorLover",
      color: "text-blue-400",
      message: "Que cores vibrantes você está usando!"
    },
    {
      name: "DesignFan",
      color: "text-yellow-500",
      message: "Qual técnica você está usando para essas linhas?"
    },
    {
      name: "GalleryOwner",
      color: "text-purple-400",
      message: "Gostaria de expor seu trabalho na minha galeria!"
    },
    {
      name: "ArtStudent",
      color: "text-pink-400",
      message: "Isso me inspira tanto para meus próprios projetos!"
    }
  ];

  setInterval(() => {
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    const messageElement = document.createElement("div");
    messageElement.className = "chat-message";
    messageElement.innerHTML = `
                    <span class="font-semibold ${randomMessage.color}">${randomMessage.name}:</span>
                    <span class="text-gray-300">${randomMessage.message}</span>
                `;
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Keep chat at a reasonable size
    if (chatContainer.children.length > 20) {
      chatContainer.removeChild(chatContainer.children[0]);
    }
  }, 5000);
}

simulateChat();

(function () {
  function c() {
    var b = a.contentDocument || a.contentWindow.document;
    if (b) {
      var d = b.createElement("script");
      d.innerHTML =
        "window.__CF$cv$params={r:'93a40eaca1adcb49',t:'MTc0NjMyMDM4Ni4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";
      b.getElementsByTagName("head")[0].appendChild(d);
    }
  }
  if (document.body) {
    var a = document.createElement("iframe");
    a.height = 1;
    a.width = 1;
    a.style.position = "absolute";
    a.style.top = 0;
    a.style.left = 0;
    a.style.border = "none";
    a.style.visibility = "hidden";
    document.body.appendChild(a);
    if ("loading" !== document.readyState) c();
    else if (window.addEventListener)
      document.addEventListener("DOMContentLoaded", c);
    else {
      var e = document.onreadystatechange || function () {};
      document.onreadystatechange = function (b) {
        e(b);
        "loading" !== document.readyState &&
          ((document.onreadystatechange = e), c());
      };
    }
  }
})();
