document.addEventListener("DOMContentLoaded", function () {
  // Global variables
  let allStreams = [];
  let displayedStreams = 0;
  const streamsPerPage = 12;
  let filteredStreams = [];
  let uniqueTags = new Set();
  let uniqueTypes = new Set();
  let uniqueOrientations = new Set();
  let uniqueCountries = new Map();
  // DOM elements
  const streamsGridTop = document.getElementById("streamsGridTop");
  const streamsGridBottom = document.getElementById("streamsGridBottom");
  const loadingIndicator = document.getElementById("loadingIndicator");
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  const tagFilters = document.getElementById("tagFilters");
  const typeFilters = document.getElementById("typeFilters");
  const orientationFilters = document.getElementById("orientationFilters");
  const countryFilter = document.getElementById("countryFilter");
  const searchInput = document.getElementById("searchInput");
  const sortButton = document.getElementById("sortButton");
  const bannerWrapper = document.getElementById("bannerWrapper");
  const bannerDots = document.getElementById("bannerDots");
  const trendingStreamers = document.getElementById("trendingStreamers");
  // Modal elements
  const streamModal = document.getElementById("streamModal");
  const closeModal = document.getElementById("closeModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalCountryFlag = document.getElementById("modalCountryFlag");
  const modalCountryName = document.getElementById("modalCountryName");
  const modalViewers = document
    .getElementById("modalViewers")
    .querySelector("span");
  const modalTags = document.getElementById("modalTags");
  const modalId = document.getElementById("modalId");
  const modalType = document.getElementById("modalType");
  const modalGender = document.getElementById("modalGender");
  const modalOrientation = document.getElementById("modalOrientation");
  const modalVideo = document.getElementById("modalVideo");
  const relatedStreams = document.getElementById("relatedStreams");
  // Country names mapping
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
    bj: "Benin",
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
    cd: "República Democrática do Congo",
    cg: "República do Congo",
    cr: "Costa Rica",
    ci: "Costa do Marfim",
    hr: "Croácia",
    cu: "Cuba",
    cy: "Chipre",
    cz: "Tchéquia",
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
    qa: "Catar",
    ro: "Romênia",
    ru: "Rússia",
    rw: "Ruanda",
    kn: "São Cristóvão e Nevis",
    lc: "Santa Lúcia",
    vc: "São Vicente e Granadinas",
    ws: "Samoa",
    sm: "San Marino",
    st: "São Tomé e Príncipe",
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
    uk: "Reino Unido",
    us: "Estados Unidos",
    uy: "Uruguai",
    uz: "Uzbequistão",
    vu: "Vanuatu",
    va: "Vaticano",
    ve: "Venezuela",
    vn: "Vietnã",
    ye: "Iêmen",
    zm: "Zâmbia",
    zw: "Zimbábue"
  };
  // Broadcast type mapping
  const broadcastTypes = {
    male: "Individual",
    male_group: "Grupo",
    couple: "Casal",
    trans: "Trans"
  };
  // Orientation mapping
  const orientationTypes = {
    straight: "Heterossexual",
    gay: "Gay",
    bisexual: "Bissexual"
  };
  // Fetch streams data
  async function fetchStreams() {
    try {
      const response = await fetch("https://site.my.eu.org/0:/male.json");
      if (!response.ok) {
        throw new Error("Falha ao carregar os dados");
      }
      const data = await response.json();
      return data.broadcasts.items;
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      loadingIndicator.innerHTML = `
                        <div class="text-center text-red-500">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p>Erro ao carregar transmissões. Por favor, tente novamente mais tarde.</p>
                        </div>
                    `;
      return [];
    }
  }
  // Initialize the application
  async function init() {
    // Fetch streams data
    allStreams = await fetchStreams();
    filteredStreams = [...allStreams];
    if (allStreams.length === 0) {
      return;
    }
    // Extract unique filters
    processFilters();
    // Hide loading indicator
    loadingIndicator.style.display = "none";
    // Display streams
    displayStreams();
    // Populate banner with top streams
    populateBanner();
    // Populate trending streamers
    populateTrendingStreamers();
    // Setup event listeners
    setupEventListeners();
  }
  // Process filters from data
  function processFilters() {
    allStreams.forEach((stream) => {
      // Process tags
      if (stream.tags && stream.tags.length > 0) {
        stream.tags.forEach((tag) => uniqueTags.add(tag.name));
      }
      // Process broadcast types
      if (stream.broadcastType) {
        uniqueTypes.add(stream.broadcastType);
      }
      // Process orientations
      if (stream.sexualOrientation) {
        uniqueOrientations.add(stream.sexualOrientation);
      }
      // Process countries
      if (stream.country) {
        if (uniqueCountries.has(stream.country)) {
          uniqueCountries.set(
            stream.country,
            uniqueCountries.get(stream.country) + 1
          );
        } else {
          uniqueCountries.set(stream.country, 1);
        }
      }
    });
    // Populate tag filters
    tagFilters.innerHTML = "";
    Array.from(uniqueTags)
      .sort()
      .slice(0, 10)
      .forEach((tag) => {
        const button = document.createElement("button");
        button.className =
          "filter-pill px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-full text-sm";
        button.textContent = tag;
        button.dataset.tag = tag;
        button.addEventListener("click", () => {
          button.classList.toggle("active");
          applyFilters();
        });
        tagFilters.appendChild(button);
      });
    // Populate type filters
    typeFilters.innerHTML = "";
    Array.from(uniqueTypes).forEach((type) => {
      const button = document.createElement("button");
      button.className =
        "filter-pill px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-full text-sm";
      button.textContent = broadcastTypes[type] || type;
      button.dataset.type = type;
      button.addEventListener("click", () => {
        button.classList.toggle("active");
        applyFilters();
      });
      typeFilters.appendChild(button);
    });
    // Populate orientation filters
    orientationFilters.innerHTML = "";
    Array.from(uniqueOrientations).forEach((orientation) => {
      const button = document.createElement("button");
      button.className =
        "filter-pill px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-full text-sm";
      button.textContent = orientationTypes[orientation] || orientation;
      button.dataset.orientation = orientation;
      button.addEventListener("click", () => {
        button.classList.toggle("active");
        applyFilters();
      });
      orientationFilters.appendChild(button);
    });
    // Populate country filter
    countryFilter.innerHTML = '<option value="">Todos os países</option>';
    Array.from(uniqueCountries.entries())
      .sort((a, b) => b[1] - a[1]) // Sort by count
      .forEach(([country, count]) => {
        const option = document.createElement("option");
        option.value = country;
        option.textContent = `${countryNames[country] || country} (${count})`;
        countryFilter.appendChild(option);
      });
  }
  // Display streams in the grid
  function displayStreams() {
    // Clear existing streams if resetting
    if (displayedStreams === 0) {
      streamsGridTop.innerHTML = "";
      streamsGridBottom.innerHTML = "";
    }
    // Get the next batch of streams
    const nextStreams = filteredStreams.slice(
      displayedStreams,
      displayedStreams + streamsPerPage
    );
    // Update displayed count
    displayedStreams += nextStreams.length;
    // Create and append stream cards
    nextStreams.forEach((stream, index) => {
      const card = createStreamCard(stream);
      // First 6 streams go to top grid, rest to bottom grid
      if (displayedStreams <= 6 || (displayedStreams > 6 && index < 6)) {
        streamsGridTop.appendChild(card);
      } else {
        streamsGridBottom.appendChild(card);
      }
    });
    // Hide load more button if all streams are displayed
    if (displayedStreams >= filteredStreams.length) {
      loadMoreBtn.style.display = "none";
    } else {
      loadMoreBtn.style.display = "flex";
    }
  }
  // Create a stream card element
  function createStreamCard(stream) {
    const card = document.createElement("div");
    card.className =
      "stream-card bg-slate-800 rounded-lg overflow-hidden shadow-lg";
    card.dataset.id = stream.id;
    // Determine thumbnail source
    let thumbnailSrc = "";
    if (stream.profileImageURL) {
      thumbnailSrc = stream.profileImageURL;
    } else if (stream.preview && stream.preview.poster) {
      thumbnailSrc = stream.preview.poster;
    } else {
      // Create a colored placeholder with initials
      const colors = [
        "#3b82f6",
        "#10b981",
        "#ef4444",
        "#8b5cf6",
        "#f59e0b",
        "#ec4899"
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      thumbnailSrc = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300" fill="none"><rect width="400" height="300" fill="${randomColor.replace(
        "#",
        "%23"
      )}"/><text x="50%" y="50%" font-family="Arial" font-size="42" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${stream.username
        .substring(0, 2)
        .toUpperCase()}</text></svg>`;
    }
    // Create country flag element if country exists
    let countryElement = "";
    if (stream.country) {
      countryElement = `
                        <div class="absolute top-2 left-2 flex items-center bg-black/70 text-xs px-2 py-1 rounded-full text-white">
                            <img src="https://flagcdn.com/w20/${stream.country.toLowerCase()}.png" 
                                 alt="${
                                   countryNames[stream.country] ||
                                   stream.country
                                 }" 
                                 class="w-4 h-3 mr-1">
                            <span>${
                              countryNames[stream.country] || stream.country
                            }</span>
                        </div>
                    `;
    }
    // Create tags element if tags exist
    let tagsElement = "";
    if (stream.tags && stream.tags.length > 0) {
      const tagsList = stream.tags
        .slice(0, 3)
        .map(
          (tag) =>
            `<span class="text-xs bg-slate-700 px-2 py-1 rounded-full">#${tag.name}</span>`
        )
        .join("");
      tagsElement = `
                        <div class="mt-3 flex flex-wrap gap-1">
                            ${tagsList}
                        </div>
                    `;
    }
    card.innerHTML = `
                    <div class="relative aspect-video">
                        <img src="${thumbnailSrc}" alt="${
      stream.username
    }" class="w-full h-full object-cover">
                        ${countryElement}
                        <div class="absolute bottom-2 right-2 bg-red-600 text-xs px-2 py-1 rounded-full text-white font-semibold flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            ${stream.viewers.toLocaleString()}
                        </div>
                    </div>
                    <div class="p-4">
                        <h3 class="font-semibold text-white mb-1">@${
                          stream.username
                        }</h3>
                        <p class="text-sm text-slate-400">${
                          broadcastTypes[stream.broadcastType] ||
                          stream.broadcastType ||
                          "Transmissão"
                        }</p>
                        ${tagsElement}
                    </div>
                `;
    // Add click event to open modal
    card.addEventListener("click", () => {
      openStreamModal(stream);
    });
    return card;
  }
  // Populate banner with top streams
  function populateBanner() {
    // Get top 5 streams by viewers
    const topStreams = [...allStreams]
      .sort((a, b) => b.viewers - a.viewers)
      .slice(0, 5);
    bannerWrapper.innerHTML = "";
    bannerDots.innerHTML = "";
    topStreams.forEach((stream, index) => {
      // Create banner slide
      const slide = document.createElement("div");
      slide.className = "banner-slide min-w-full h-64 md:h-80 relative";
      // Determine thumbnail source
      let thumbnailSrc = "";
      if (stream.profileImageURL) {
        thumbnailSrc = stream.profileImageURL;
      } else if (stream.preview && stream.preview.poster) {
        thumbnailSrc = stream.preview.poster;
      } else {
        // Create a colored placeholder
        const colors = [
          "#3b82f6",
          "#10b981",
          "#ef4444",
          "#8b5cf6",
          "#f59e0b",
          "#ec4899"
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        thumbnailSrc = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 1200 600" fill="none"><rect width="1200" height="600" fill="${randomColor.replace(
          "#",
          "%23"
        )}"/><text x="50%" y="50%" font-family="Arial" font-size="72" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${
          stream.username
        }</text></svg>`;
      }
      slide.innerHTML = `
                        <div class="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10"></div>
                        <img src="${thumbnailSrc}" alt="${
        stream.username
      }" class="w-full h-full object-cover">
                        <div class="absolute bottom-0 left-0 w-full p-6 z-20">
                            <div class="flex items-center mb-2">
                                <div class="bg-red-600 text-xs px-2 py-1 rounded-full text-white font-semibold mr-2">AO VIVO</div>
                                <div class="text-sm text-white flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    ${stream.viewers.toLocaleString()}
                                </div>
                            </div>
                            <h3 class="text-xl md:text-2xl font-bold text-white">@${
                              stream.username
                            }</h3>
                            <p class="text-slate-300">${
                              broadcastTypes[stream.broadcastType] ||
                              stream.broadcastType ||
                              "Transmissão"
                            }</p>
                        </div>
                    `;
      // Add click event to open modal
      slide.addEventListener("click", () => {
        openStreamModal(stream);
      });
      bannerWrapper.appendChild(slide);
      // Create dot indicator
      const dot = document.createElement("button");
      dot.className = "h-2 w-2 rounded-full bg-white/50 hover:bg-white/80";
      dot.setAttribute("data-index", index);
      dot.addEventListener("click", () => {
        currentBannerIndex = index;
        updateBanner();
      });
      bannerDots.appendChild(dot);
    });
    // Initialize banner slider
    initBannerSlider();
  }
  // Initialize banner slider functionality
  let currentBannerIndex = 0;
  let bannerInterval;

  function initBannerSlider() {
    const totalBanners = bannerWrapper.children.length;
    if (totalBanners === 0) return;

    function updateBanner() {
      bannerWrapper.style.transform = `translateX(-${
        currentBannerIndex * 100
      }%)`;
      // Update dots
      document.querySelectorAll("#bannerDots button").forEach((dot, index) => {
        if (index === currentBannerIndex) {
          dot.classList.add("bg-white");
          dot.classList.remove("bg-white/50");
        } else {
          dot.classList.remove("bg-white");
          dot.classList.add("bg-white/50");
        }
      });
    }
    document.getElementById("nextBanner").addEventListener("click", () => {
      currentBannerIndex = (currentBannerIndex + 1) % totalBanners;
      updateBanner();
      resetBannerInterval();
    });
    document.getElementById("prevBanner").addEventListener("click", () => {
      currentBannerIndex =
        (currentBannerIndex - 1 + totalBanners) % totalBanners;
      updateBanner();
      resetBannerInterval();
    });
    // Auto rotate banner
    function startBannerInterval() {
      bannerInterval = setInterval(() => {
        currentBannerIndex = (currentBannerIndex + 1) % totalBanners;
        updateBanner();
      }, 5000);
    }

    function resetBannerInterval() {
      clearInterval(bannerInterval);
      startBannerInterval();
    }
    // Initialize banner
    updateBanner();
    startBannerInterval();
  }
  // Populate trending streamers
  function populateTrendingStreamers() {
    // Get top 5 streamers by viewers
    const topStreamers = [...allStreams]
      .sort((a, b) => b.viewers - a.viewers)
      .slice(0, 5);
    trendingStreamers.innerHTML = "";
    topStreamers.forEach((streamer) => {
      const streamerItem = document.createElement("div");
      streamerItem.className =
        "flex items-center p-2 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer";
      // Determine avatar source
      let avatarSrc = "";
      if (streamer.profileImageURL) {
        avatarSrc = `<img src="${streamer.profileImageURL}" alt="${streamer.username}" class="w-full h-full object-cover">`;
      } else {
        // Create a colored placeholder with initials
        const colors = [
          "#3b82f6",
          "#10b981",
          "#ef4444",
          "#8b5cf6",
          "#f59e0b",
          "#ec4899"
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        avatarSrc = `
                            <div class="w-full h-full rounded-full flex items-center justify-center" style="background-color: ${randomColor};">
                                <span class="text-white font-bold">${streamer.username
                                  .substring(0, 2)
                                  .toUpperCase()}</span>
                            </div>
                        `;
      }
      streamerItem.innerHTML = `
                        <div class="w-10 h-10 rounded-full overflow-hidden mr-3">
                            ${avatarSrc}
                        </div>
                        <div class="flex-1">
                            <h4 class="font-medium text-white">${
                              streamer.username
                            }</h4>
                            <p class="text-xs text-slate-400">${
                              broadcastTypes[streamer.broadcastType] ||
                              streamer.broadcastType ||
                              "Transmissão"
                            }</p>
                        </div>
                        <div class="text-xs text-slate-400 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            ${streamer.viewers.toLocaleString()}
                        </div>
                    `;
      // Add click event to open modal
      streamerItem.addEventListener("click", () => {
        openStreamModal(streamer);
      });
      trendingStreamers.appendChild(streamerItem);
    });
  }
  // Open stream modal
  function openStreamModal(stream) {
    // Set modal content
    modalTitle.textContent = "@" + stream.username;
    // Set country info
    if (stream.country) {
      modalCountryFlag.src = `https://flagcdn.com/w20/${stream.country.toLowerCase()}.png`;
      modalCountryName.textContent =
        countryNames[stream.country] || stream.country;
      document.getElementById("modalCountry").style.display = "flex";
    } else {
      document.getElementById("modalCountry").style.display = "none";
    }
    // Set viewers
    modalViewers.textContent = stream.viewers.toLocaleString();
    // Set tags
    modalTags.innerHTML = "";
    if (stream.tags && stream.tags.length > 0) {
      stream.tags.forEach((tag) => {
        const tagElement = document.createElement("span");
        tagElement.className = "px-3 py-1 bg-slate-700 rounded-full text-sm";
        tagElement.textContent = `#${tag.name}`;
        modalTags.appendChild(tagElement);
      });
    } else {
      modalTags.innerHTML = '<span class="text-slate-400">Sem tags</span>';
    }
    // Set info details
    modalId.textContent = stream.id;
    modalType.textContent =
      broadcastTypes[stream.broadcastType] ||
      stream.broadcastType ||
      "Não especificado";
    modalGender.textContent = stream.gender || "Não especificado";
    modalOrientation.textContent =
      orientationTypes[stream.sexualOrientation] ||
      stream.sexualOrientation ||
      "Não especificado";
    // Set video player
    if (stream.preview && stream.preview.poster) {
      modalVideo.innerHTML = `
        <div class="w-full h-full bg-black flex items-center justify-center relative">
            <img src="${stream.preview.poster}" alt="${stream.username}" class="w-full h-full object-contain">
            <div class="absolute inset-0 flex items-center justify-center">
                <button id="playStream" class="bg-blue-600/80 hover:bg-blue-700 text-white rounded-full p-4 transform transition-transform hover:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
            </div>
        </div>
    `;

      // Add click event to load iframe dynamically
      document.getElementById("playStream").addEventListener("click", () => {
        modalVideo.innerHTML = `
            <iframe 
                src="https://xcam.gay/cam/?id=${stream.id}" 
                class="w-full h-full" 
                frameborder="0" 
                allowfullscreen>
            </iframe>`;
      });
    } else {
      // Create a colored placeholder
      const colors = [
        "#3b82f6",
        "#10b981",
        "#ef4444",
        "#8b5cf6",
        "#f59e0b",
        "#ec4899"
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      modalVideo.innerHTML = `
        <div class="w-full h-full flex items-center justify-center" style="background-color: ${randomColor};">
            <div class="text-center">
                <div class="text-5xl font-bold mb-2">${stream.username}</div>
                <div class="text-xl">Clique para iniciar a transmissão</div>
            </div>
        </div>
    `;
    }
    // Find related streams (same tags or country)
    const relatedStreamsList = findRelatedStreams(stream);
    relatedStreams.innerHTML = "";
    if (relatedStreamsList.length > 0) {
      relatedStreamsList.forEach((relatedStream) => {
        const relatedItem = document.createElement("div");
        relatedItem.className =
          "flex items-center p-2 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer";
        // Determine thumbnail source
        let thumbnailSrc = "";
        if (relatedStream.profileImageURL) {
          thumbnailSrc = relatedStream.profileImageURL;
        } else if (relatedStream.preview && relatedStream.preview.poster) {
          thumbnailSrc = relatedStream.preview.poster;
        } else {
          // Create a colored placeholder
          const colors = [
            "#3b82f6",
            "#10b981",
            "#ef4444",
            "#8b5cf6",
            "#f59e0b",
            "#ec4899"
          ];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          thumbnailSrc = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="60" viewBox="0 0 80 60" fill="none"><rect width="80" height="60" fill="${randomColor.replace(
            "#",
            "%23"
          )}"/><text x="50%" y="50%" font-family="Arial" font-size="16" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${relatedStream.username
            .substring(0, 2)
            .toUpperCase()}</text></svg>`;
        }
        relatedItem.innerHTML = `
                            <div class="w-12 h-9 overflow-hidden mr-3">
                                <img src="${thumbnailSrc}" alt="${
          relatedStream.username
        }" class="w-full h-full object-cover">
                            </div>
                            <div class="flex-1">
                                <h4 class="font-medium text-white">@${
                                  relatedStream.username
                                }</h4>
                                <div class="flex items-center text-xs text-slate-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    ${relatedStream.viewers.toLocaleString()}
                                </div>
                            </div>
                        `;
        // Add click event to open modal for related stream
        relatedItem.addEventListener("click", () => {
          openStreamModal(relatedStream);
        });
        relatedStreams.appendChild(relatedItem);
      });
    } else {
      relatedStreams.innerHTML =
        '<p class="text-slate-400">Nenhuma transmissão relacionada encontrada</p>';
    }
    // Show modal
    streamModal.style.display = "block";
    document.body.style.overflow = "hidden"; // Prevent scrolling
  }
  // Find related streams based on tags or country
  function findRelatedStreams(stream) {
    const related = [];
    const streamId = stream.id;
    // First try to find streams with matching tags
    if (stream.tags && stream.tags.length > 0) {
      const streamTags = stream.tags.map((tag) => tag.name);
      allStreams.forEach((otherStream) => {
        if (otherStream.id === streamId) return; // Skip the current stream
        if (otherStream.tags && otherStream.tags.length > 0) {
          const otherTags = otherStream.tags.map((tag) => tag.name);
          // Check for tag overlap
          const hasCommonTag = streamTags.some((tag) =>
            otherTags.includes(tag)
          );
          if (hasCommonTag) {
            related.push(otherStream);
          }
        }
      });
    }
    // If we don't have enough related streams by tags, add some by country
    if (related.length < 3 && stream.country) {
      allStreams.forEach((otherStream) => {
        if (otherStream.id === streamId) return; // Skip the current stream
        if (related.some((s) => s.id === otherStream.id)) return; // Skip already added streams
        if (otherStream.country === stream.country) {
          related.push(otherStream);
        }
      });
    }
    // If still not enough, add some by broadcast type
    if (related.length < 3 && stream.broadcastType) {
      allStreams.forEach((otherStream) => {
        if (otherStream.id === streamId) return; // Skip the current stream
        if (related.some((s) => s.id === otherStream.id)) return; // Skip already added streams
        if (otherStream.broadcastType === stream.broadcastType) {
          related.push(otherStream);
        }
      });
    }
    // Sort by viewers and limit to 3
    return related.sort((a, b) => b.viewers - a.viewers).slice(0, 3);
  }
  // Apply filters to streams
  function applyFilters() {
    // Get active tag filters
    const activeTags = Array.from(
      document.querySelectorAll("#tagFilters .filter-pill.active")
    ).map((button) => button.dataset.tag);
    // Get active type filters
    const activeTypes = Array.from(
      document.querySelectorAll("#typeFilters .filter-pill.active")
    ).map((button) => button.dataset.type);
    // Get active orientation filters
    const activeOrientations = Array.from(
      document.querySelectorAll("#orientationFilters .filter-pill.active")
    ).map((button) => button.dataset.orientation);
    // Get country filter
    const selectedCountry = countryFilter.value;
    // Get search query
    const searchQuery = searchInput.value.toLowerCase().trim();
    // Filter streams
    filteredStreams = allStreams.filter((stream) => {
      // Filter by tags
      if (activeTags.length > 0) {
        if (!stream.tags || stream.tags.length === 0) return false;
        const streamTags = stream.tags.map((tag) => tag.name);
        const hasMatchingTag = activeTags.some((tag) =>
          streamTags.includes(tag)
        );
        if (!hasMatchingTag) return false;
      }
      // Filter by broadcast type
      if (
        activeTypes.length > 0 &&
        !activeTypes.includes(stream.broadcastType)
      ) {
        return false;
      }
      // Filter by orientation
      if (
        activeOrientations.length > 0 &&
        !activeOrientations.includes(stream.sexualOrientation)
      ) {
        return false;
      }
      // Filter by country
      if (selectedCountry && stream.country !== selectedCountry) {
        return false;
      }
      // Filter by search query
      if (searchQuery) {
        const usernameMatch = stream.username
          .toLowerCase()
          .includes(searchQuery);
        const tagMatch =
          stream.tags &&
          stream.tags.some((tag) =>
            tag.name.toLowerCase().includes(searchQuery)
          );
        if (!usernameMatch && !tagMatch) {
          return false;
        }
      }
      return true;
    });
    // Reset displayed streams and show filtered results
    displayedStreams = 0;
    displayStreams();
  }
  // Setup event listeners
  function setupEventListeners() {
    // Load more button
    loadMoreBtn.addEventListener("click", displayStreams);
    // Country filter
    countryFilter.addEventListener("change", applyFilters);
    // Search input
    searchInput.addEventListener("input", debounce(applyFilters, 300));
    // Sort button
    let sortAscending = false;
    sortButton.addEventListener("click", () => {
      sortAscending = !sortAscending;
      if (sortAscending) {
        filteredStreams.sort((a, b) => a.viewers - b.viewers);
        sortButton.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                            </svg>
                            Ordenar (Crescente)
                        `;
      } else {
        filteredStreams.sort((a, b) => b.viewers - a.viewers);
        sortButton.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                            </svg>
                            Ordenar (Decrescente)
                        `;
      }
      // Reset displayed streams and show sorted results
      displayedStreams = 0;
      displayStreams();
    });
    // Modal close button
    closeModal.addEventListener("click", () => {
      streamModal.style.display = "none";
      document.body.style.overflow = ""; // Restore scrolling
    });
    // Close modal when clicking outside
    window.addEventListener("click", (event) => {
      if (event.target === streamModal) {
        streamModal.style.display = "none";
        document.body.style.overflow = ""; // Restore scrolling
      }
    });
    // Close modal with Escape key
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && streamModal.style.display === "block") {
        streamModal.style.display = "none";
        document.body.style.overflow = ""; // Restore scrolling
      }
    });
  }
  // Debounce function for search input
  function debounce(func, delay) {
    let timeout;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), delay);
    };
  }
  // Initialize the application
  init();
});

(function () {
  function c() {
    var b = a.contentDocument || a.contentWindow.document;
    if (b) {
      var d = b.createElement("script");
      d.innerHTML =
        "window.__CF$cv$params={r:'93bdd1dad4c39882',t:'MTc0NjU5MDUyNS4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";
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
