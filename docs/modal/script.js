// xcam-beta/modal/script.js
// Este script preenche dinamicamente o modal fullscreen do XCam com informações de um usuário/transmissão,
// utilizando traduções carregadas externamente de https://beta.xcam.gay/translations.js
// e tradução reversa de https://beta.xcam.gay/translations-reverse.js

// ======================= IMPORTAÇÃO DINÂMICA DE TRADUÇÕES ========================
let translate, getCountryName, reverseTranslate, getCountryCode;

/**
 * Carrega os módulos de tradução e tradução reversa de forma assíncrona.
 * Após o carregamento, dispara o evento "translationsReady" para iniciar o app.
 */
(async () => {
  // Importa o módulo de traduções (PT-BR)
  const translationsModule = await import(
    "https://beta.xcam.gay/translations.js"
  );
  translate = translationsModule.translate;
  getCountryName = translationsModule.getCountryName;

  // Importa o módulo de tradução reversa (UI -> slug/API)
  const reverseModule = await import(
    "https://beta.xcam.gay/translations-reverse.js"
  );
  reverseTranslate = reverseModule.reverseTranslate;
  getCountryCode = reverseModule.getCountryCode;

  // Dispara evento para indicar que as traduções estão prontas
  document.dispatchEvent(new Event("translationsReady"));
})();

// ========================== FUNÇÕES AUXILIARES ===========================

/**
 * Escapa texto para inserção segura em HTML (previne XSS).
 * @param {string} str - Texto a ser escapado.
 * @returns {string} Texto seguro para HTML.
 */
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

/**
 * Formata as tags da transmissão para exibição no modal.
 * Aceita array de objetos {name, slug} ou strings.
 * @param {Array} tags
 * @returns {string} HTML das tags formatadas.
 */
function formatTags(tags) {
  if (!tags || !tags.length) return "";
  return tags
    .map((tag) => `<div class="tag">#${escapeHTML(tag.name || tag)}</div>`)
    .join("");
}

/**
 * Formata links de redes sociais com ícones SVG.
 * O objeto icons armazena o SVG de cada rede social suportada.
 * @param {Object} socialNetworks - { twitter: url, instagram: url, tiktok: url, ... }
 * @returns {string} HTML dos links com ícones.
 */
function formatSocialLinks(socialNetworks) {
  if (!socialNetworks) return "";
  const icons = {
    // TikTok
    tiktok: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 32 32"><path d="M24.562,7.613c-1.508-.983-2.597-2.557-2.936-4.391-.073-.396-.114-.804-.114-1.221h-4.814l-.008,19.292c-.081,2.16-1.859,3.894-4.039,3.894-.677,0-1.315-.169-1.877-.465-1.288-.678-2.169-2.028-2.169-3.582,0-2.231,1.815-4.047,4.046-4.047,.417,0,.816,.069,1.194,.187v-4.914c-.391-.053-.788-.087-1.194-.087-4.886,0-8.86,3.975-8.86,8.86,0,2.998,1.498,5.65,3.783,7.254,1.439,1.01,3.19,1.606,5.078,1.606,4.886,0,8.86-3.975,8.86-8.86V11.357c1.888,1.355,4.201,2.154,6.697,2.154v-4.814c-1.345,0-2.597-.4-3.647-1.085Z"></path></svg>`,
    // OnlyFans
    onlyfans: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 32 32"><path d="M10.667,5.333C4.776,5.333,0,10.109,0,16s4.776,10.667,10.667,10.667,10.667-4.776,10.667-10.667S16.558,5.333,10.667,5.333Zm0,13.867c-1.767,0-3.2-1.433-3.2-3.2s1.433-3.2,3.2-3.2,3.2,1.433,3.2,3.2c.002,1.765-1.427,3.198-3.191,3.2-.003,0-.006,0-.009,0Z" opacity=".8"></path><path d="M22.656,13.333c2.71,.78,5.909,0,5.909,0-.928,4.053-3.872,6.592-8.118,6.901-1.683,3.906-5.528,6.435-9.781,6.432l3.2-10.171c3.29-10.454,4.976-11.162,12.777-11.162h5.356c-.896,3.947-3.984,6.961-9.344,8Z"></path></svg>`,
    // Instagram
    instagram: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 32 32"><path d="M10.202,2.098c-1.49,.07-2.507,.308-3.396,.657-.92,.359-1.7,.84-2.477,1.619-.776,.779-1.254,1.56-1.61,2.481-.345,.891-.578,1.909-.644,3.4-.066,1.49-.08,1.97-.073,5.771s.024,4.278,.096,5.772c.071,1.489,.308,2.506,.657,3.396,.359,.92,.84,1.7,1.619,2.477,.779,.776,1.559,1.253,2.483,1.61,.89,.344,1.909,.579,3.399,.644,1.49,.065,1.97,.08,5.771,.073,3.801-.007,4.279-.024,5.773-.095s2.505-.309,3.395-.657c.92-.36,1.701-.84,2.477-1.62s1.254-1.561,1.609-2.483c.345-.89,.579-1.909,.644-3.398,.065-1.494,.081-1.971,.073-5.773s-.024-4.278-.095-5.771-.308-2.507-.657-3.397c-.36-.92-.84-1.7-1.619-2.477s-1.561-1.254-2.483-1.609c-.891-.345-1.909-.58-3.399-.644s-1.97-.081-5.772-.074-4.278,.024-5.771,.096m.164,25.309c-1.365-.059-2.106-.286-2.6-.476-.654-.252-1.12-.557-1.612-1.044s-.795-.955-1.05-1.608c-.192-.494-.423-1.234-.487-2.599-.069-1.475-.084-1.918-.092-5.656s.006-4.18,.071-5.656c.058-1.364,.286-2.106,.476-2.6,.252-.655,.556-1.12,1.044-1.612s.955-.795,1.608-1.05c.493-.193,1.234-.422,2.598-.487,1.476-.07,1.919-.084,5.656-.092,3.737-.008,4.181,.006,5.658,.071,1.364,.059,2.106,.285,2.599,.476,.654,.252,1.12,.555,1.612,1.044s.795,.954,1.051,1.609c.193,.492,.422,1.232,.486,2.597,.07,1.476,.086,1.919,.093,5.656,.007,3.737-.006,4.181-.071,5.656-.06,1.365-.286,2.106-.476,2.601-.252,.654-.556,1.12-1.045,1.612s-.955,.795-1.608,1.05c-.493,.192-1.234,.422-2.597,.487-1.476,.069-1.919,.084-5.657,.092s-4.18-.007-5.656-.071M21.779,8.517c.002,.928,.755,1.679,1.683,1.677s1.679-.755,1.677-1.683c-.002-.928-.755-1.679-1.683-1.677,0,0,0,0,0,0-.928,.002-1.678,.755-1.677,1.683m-12.967,7.496c.008,3.97,3.232,7.182,7.202,7.174s7.183-3.232,7.176-7.202c-.008-3.97-3.233-7.183-7.203-7.175s-7.182,3.233-7.174,7.203m2.522-.005c-.005-2.577,2.08-4.671,4.658-4.676,2.577-.005,4.671,2.08,4.676,4.658,.005,2.577-2.08,4.671-4.658,4.676-2.577,.005-4.671-2.079-4.676-4.656h0"></path></svg>`,
    // X-Twitter
    twitter: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 32 32"><path d="M18.42,14.009L27.891,3h-2.244l-8.224,9.559L10.855,3H3.28l9.932,14.455L3.28,29h2.244l8.684-10.095,6.936,10.095h7.576l-10.301-14.991h0Zm-3.074,3.573l-1.006-1.439L6.333,4.69h3.447l6.462,9.243,1.006,1.439,8.4,12.015h-3.447l-6.854-9.804h0Z"></path></svg>`
  };
  return Object.entries(socialNetworks)
    .map(([name, url]) => {
      let icon = icons[name.toLowerCase()] || "";
      let label = name.charAt(0).toUpperCase() + name.slice(1);
      return `<a href="${escapeHTML(
        url
      )}" class="social-link" title="${escapeHTML(
        label
      )}" target="_blank" rel="noopener">${icon}</a>`;
    })
    .join("");
}

/**
 * Retorna o SVG apropriado para o gênero informado.
 * Masculino: símbolo masculino (SVG com classe especial e tamanho maior),
 * Feminino: símbolo feminino (SVG com classe especial e tamanho maior),
 * Outros: símbolo transgênero (SVG com classe especial e tamanho maior).
 *
 * @param {string} genderString - Gênero em inglês ou português
 * @returns {string} SVG do ícone de gênero com classe e tamanho ajustados
 */
function getGenderIcon(genderString) {
  // SVGs com classe "gender-icon" para permitir ajuste de tamanho no CSS
  const genderIcons = {
    male: `<svg class="gender-icon" xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="currentColor" viewBox="0 0 320 512"><path d="M304 32h-79c-13.3 0-24 10.7-24 24s10.7 24 24 24h33.4l-73.2 73.2c-21.9-13.7-47.6-21.7-75.2-21.7C48.5 131.5 0 180 0 240.5S48.5 349.5 108.9 349.5 217.8 301 217.8 240.5c0-27.6-8-53.3-21.7-75.2l73.2-73.2V112c0 13.3 10.7 24 24 24s24-10.7 24-24V32zm-195.1 304c-44.2 0-80-35.8-80-80s35.8-80 80-80 80 35.8 80 80-35.8 80-80 80z"/></svg>`,
    female: `<svg class="gender-icon" xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="currentColor" viewBox="0 0 320 512"><path d="M288 176c0-79.5-64.5-144-144-144S0 96.5 0 176c0 70.7 51.3 129 119.1 142.2V368H88a16 16 0 0 0 0 32h31.1v48a16 16 0 0 0 32 0v-48H184a16 16 0 0 0 0-32h-31.1v-49.8C236.7 305 288 246.7 288 176zm-144 112c-61.9 0-112-50.1-112-112s50.1-112 112-112 112 50.1 112 112-50.1 112-112 112z"/></svg>`,
    other: `<svg class="gender-icon" xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="currentColor" viewBox="0 0 384 512"><path d="M120 80a56 56 0 1 1 112 0 56 56 0 1 1 -112 0zM192 160c-44.2 0-80 35.8-80 80 0 39.7 29.2 72.7 67.3 79.1C172.5 334.9 160 355.6 160 380v4c0 13.3 10.7 24 24 24s24-10.7 24-24v-4c0-24.4-12.5-45.1-19.3-60.9C242.8 312.7 272 279.7 272 240c0-44.2-35.8-80-80-80z"/></svg>`
  };
  if (!genderString) return genderIcons.other;
  const g = genderString.trim().toLowerCase();
  if (g === "male" || g === "masculino") return genderIcons.male;
  if (g === "female" || g === "feminino") return genderIcons.female;
  return genderIcons.other;
}

/**
 * Recupera um parâmetro da querystring da URL.
 * @param {string} param - Nome do parâmetro.
 * @returns {string|null} Valor do parâmetro ou null se não encontrado.
 */
function getUrlParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

/**
 * Busca os dados do usuário e transmissão na API.
 * @param {string} username - Nome do usuário para busca.
 * @returns {Promise<{user: object, room: object}>} Dados do usuário e da sala/transmissão.
 */
async function fetchUserData(username) {
  // Busca os dados do usuário e as transmissões em paralelo
  const [userRes, roomsRes] = await Promise.all([
    fetch(`https://api.xcam.gay/user/${encodeURIComponent(username)}`),
    fetch(`https://api.xcam.gay/?limit=1500`)
  ]);
  if (!userRes.ok) throw new Error("Usuário não encontrado");
  const user = await userRes.json();

  let rooms = [];
  try {
    const data = await roomsRes.json();
    rooms = data?.broadcasts?.items || [];
  } catch (e) {
    // Silencia erro caso não consiga carregar transmissões (não é crítico)
  }

  // Encontra a transmissão correspondente ao usuário (se houver)
  const room =
    rooms && rooms.length
      ? rooms.find(
          (r) =>
            r.username && r.username.toLowerCase() === username.toLowerCase()
        )
      : null;
  return { user, room };
}

/**
 * Atualiza o modal com os dados do usuário e transmissão.
 * Preenche todos os campos do modal dinâmico com base nos dados recebidos.
 * @param {object} param0 - { user, room }
 */
function updateModal({ user, room }) {
  // Título e nome do usuário
  document.querySelectorAll(".modal-title, .user-name").forEach((el) => {
    if (user && user.username) el.textContent = "@" + user.username;
    else el.textContent = "";
  });

  // Avatar do usuário (usa avatarUrl ou profileImageUrl, com fallback padrão)
  const avatarDiv = document.querySelector(".user-avatar");
  avatarDiv.innerHTML = "";

  const defaultMaleUrl =
    "https://cam4-static-test.xcdnpro.com/web/images/defaults/default_Male.png";
  const customAvatarUrl =
    "https://drive.xcam.gay/download.aspx?file=EvLJuC5kYRMbycGPXbRtFBKjLRcW7n33H4A2odf30LwmvFKIQk0EDA1knifvPE3%2F&expiry=MgIjvSCpzP8gDghCiR1LSw%3D%3D&mac=ca46e35b8bc19a0a23593835770ea3c085cfb6882562d5871414e64b0f1f06c0";

  // Seleciona o melhor avatar disponível
  let avatarUrl = null;
  if (user && user.avatarUrl) avatarUrl = user.avatarUrl;
  else if (user && user.profileImageUrl) avatarUrl = user.profileImageUrl;
  if (avatarUrl === defaultMaleUrl) avatarUrl = customAvatarUrl;

  if (avatarUrl) {
    avatarDiv.innerHTML = `<img src="${escapeHTML(
      avatarUrl
    )}" alt="${escapeHTML(user.username)}" loading="lazy">`;
  } else if (user && user.username) {
    avatarDiv.textContent = user.username[0].toUpperCase();
  }

  // País do usuário (nome e flag)
  const countrySpan = document.querySelector(".country-name");
  if (user && user.countryId) {
    countrySpan.textContent =
      getCountryName(user.countryId) || user.countryId.toUpperCase();
  } else {
    countrySpan.textContent = "";
  }

  const flagImg = document.querySelector(".country-flag");
  if (user && user.countryId) {
    flagImg.src = `https://flagcdn.com/w20/${user.countryId.toLowerCase()}.png`;
    flagImg.style.display = "";
  } else {
    flagImg.src = "";
    flagImg.style.display = "none";
  }

  // Exibe número de espectadores ao vivo
  const viewersSpan = document.querySelector(".user-viewers span");
  if (room && typeof room.viewers === "number") {
    viewersSpan.textContent = `${room.viewers} espectadores`;
  } else {
    viewersSpan.textContent = "";
  }

  // Estatísticas principais: sexo (gender), orientação sexual, tipo de transmissão
  const statItems = document.querySelectorAll(".stat-item");
  // Ícone SVG Heart para Orientação Sexual
  const heartSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 512 512"><path d="M462.3 62.7C407 7.6 325.4-10.6 256 48.6 186.6-10.6 105 7.6 49.7 62.7-16.6 128.9-10.6 229.9 43 284.2l193.5 199.8c7.6 7.8 20.8 7.8 28.4 0L469 284.2c53.5-54.3 59.5-155.3-6.7-221.5z"/></svg>`;
  // Ícone de usuário (tipo transmissão)
  const userSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 640 512"><path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm112 32h-16.7c-22.2 10.2-46.9 16-73.3 16s-51.1-5.8-73.3-16H160C71.6 288 0 359.6 0 448c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64c0-88.4-71.6-160-160-160z"/></svg>`;

  // Gênero (gender) - usa ícone apropriado
  if (user && user.gender) {
    statItems[0].innerHTML = `${getGenderIcon(user.gender)} <span>${escapeHTML(
      translate("gender", user.gender)
    )}</span>`;
  } else {
    statItems[0].innerHTML = "";
  }

  // Orientação sexual (sexPreference ou sexualOrientation)
  let orientation = "";
  if (user && user.sexPreference) {
    orientation = translate("sexPreference", user.sexPreference);
  } else if (user && user.sexualOrientation) {
    orientation = translate("sexualOrientation", user.sexualOrientation);
  }
  if (orientation) {
    statItems[1].innerHTML = `${heartSVG} <span>${escapeHTML(
      orientation
    )}</span>`;
  } else {
    statItems[1].innerHTML = "";
  }

  // Tipo de transmissão (sempre ícone de usuário)
  if (room && room.broadcastType) {
    statItems[2].innerHTML = `${userSVG} <span>${escapeHTML(
      room.broadcastType.charAt(0).toUpperCase() + room.broadcastType.slice(1)
    )}</span>`;
  } else {
    statItems[2].innerHTML = "";
  }

  // Tags (hashtags) da transmissão
  const tagsDiv = document.querySelector(".user-tags");
  if (room && room.tags && room.tags.length) {
    tagsDiv.innerHTML = formatTags(room.tags);
  } else {
    tagsDiv.innerHTML = "";
  }

  // Bio do usuário (HTML ou texto puro)
  const bioDiv = document.querySelector(".info-section-content");
  if (user && user.htmlBio) {
    bioDiv.innerHTML = user.htmlBio;
  } else if (user && user.bio) {
    bioDiv.textContent = user.bio;
  } else {
    bioDiv.textContent = "";
  }

  // Redes sociais (links dinâmicos com SVGs)
  const socialLinksDiv = document.querySelector(".social-links");
  if (user && user.socialNetworks && Object.keys(user.socialNetworks).length) {
    socialLinksDiv.innerHTML = formatSocialLinks(user.socialNetworks);
  } else {
    socialLinksDiv.innerHTML = "";
  }

  // Player (iframe do vídeo ao vivo)
  const iframe = document.querySelector(".player-iframe");
  if (user && user.username) {
    iframe.src = `https://live.xcam.gay/?user=${encodeURIComponent(
      user.username
    )}`;
  } else {
    iframe.src = "";
  }
}

/**
 * Limpa todos os campos do modal, resetando para o estado inicial.
 * Remove dados do usuário, avatar, tags, estatísticas, bio, redes e iframe.
 */
function clearModal() {
  document
    .querySelectorAll(".modal-title, .user-name")
    .forEach((el) => (el.textContent = ""));
  const avatarDiv = document.querySelector(".user-avatar");
  avatarDiv.textContent = "";
  avatarDiv.innerHTML = "";
  document.querySelector(".country-name").textContent = "";
  const flagImg = document.querySelector(".country-flag");
  flagImg.src = "";
  flagImg.style.display = "none";
  document.querySelector(".user-viewers span").textContent = "";
  document.querySelectorAll(".stat-item").forEach((el) => (el.innerHTML = ""));
  document.querySelector(".user-tags").innerHTML = "";
  document.querySelector(".info-section-content").textContent = "";
  document.querySelector(".social-links").innerHTML = "";
  document.querySelector(".player-iframe").src = "";
}

// ===================== FLUXO DE INICIALIZAÇÃO =====================

/**
 * Aguarda o carregamento das traduções antes de inicializar o modal.
 * Busca os dados do usuário informado na URL (?user=nome) e preenche o modal.
 */
document.addEventListener("translationsReady", async function () {
  document.body.style.overflow = "hidden";
  clearModal();

  // Recupera o parâmetro user da URL (?user=...)
  const username = getUrlParam("user");
  if (!username) return;

  try {
    const data = await fetchUserData(username);
    updateModal(data);
  } catch (e) {
    clearModal();
  }
});

// ===================== FUNÇÕES OPCIONAIS E TRACKING =====================

/**
 * Ativa o modal manualmente (reserva para uso futuro).
 * @param {object} userData Dados do usuário para abrir o modal manualmente.
 */
function openUserModal(userData) {
  document.getElementById("modalOverlay").classList.add("active");
  document.body.style.overflow = "hidden";
}

// Código de tracking/Cloudflare (mantido conforme original, caso necessário)
(function () {
  // Função para inserir script de tracking do Cloudflare
  function c() {
    var b = a.contentDocument || a.contentWindow.document;
    if (b) {
      var d = b.createElement("script");
      d.innerHTML =
        "window.__CF$cv$params={r:'94687675a6ecec3a',t:'MTc0ODM3OTg0Ni4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.head.appendChild(a);";
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
