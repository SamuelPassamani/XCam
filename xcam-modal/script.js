// xcam-modal/script.js
// Script principal do modal fullscreen informacional do XCam
// Estratégia: 
// - Player (iframe) sempre priorizado e responsivo
// - Bio SEM HTML/BBCode, truncada, sem links de redes sociais visíveis
// - Detecção e extração automática de URLs de redes sociais da bio para os ícones SVG
// - Modularidade, segurança, UX, CI/CD e internacionalização

// ======================= IMPORTAÇÃO DINÂMICA DE TRADUÇÕES ========================
let translate, getCountryName, reverseTranslate, getCountryCode;

/**
 * Carrega módulos de tradução e dispara evento para iniciar o app.
 */
(async () => {
  const translationsModule = await import(
    "https://beta.xcam.gay/translations.js"
  );
  translate = translationsModule.translate;
  getCountryName = translationsModule.getCountryName;

  const reverseModule = await import(
    "https://beta.xcam.gay/translations-reverse.js"
  );
  reverseTranslate = reverseModule.reverseTranslate;
  getCountryCode = reverseModule.getCountryCode;

  document.dispatchEvent(new Event("translationsReady"));
})();

// ========================== FUNÇÕES AUXILIARES E ESTRATÉGICAS ===========================

/**
 * Escapa texto para inserção segura em HTML (previne XSS).
 * @param {string} str - Texto a ser escapado.
 * @returns {string} Texto seguro
 */
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

/**
 * Detecta e extrai URLs de redes sociais no texto, removendo-as do texto original.
 * Retorna um objeto: { cleanText, socialUrls }
 * - socialUrls: { twitter: url, instagram: url, ... }
 * - cleanText: texto sem as URLs detectadas
 */
function extractSocialLinksFromText(text) {
  if (!text) return { cleanText: "", socialUrls: {} };

  // Expressões para principais redes sociais (pode expandir se necessário)
  const patterns = {
    twitter: /(?:https?:\/\/)?(?:www\.)?(?:twitter|x)\.com\/[A-Za-z0-9_]+/gi,
    instagram: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/[A-Za-z0-9_.]+/gi,
    tiktok: /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[A-Za-z0-9_.]+/gi,
    telegram: /(?:https?:\/\/)?(?:t\.me|telegram\.me)\/[A-Za-z0-9_]+/gi,
    facebook: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/[A-Za-z0-9_.]+/gi,
    onlyfans: /(?:https?:\/\/)?(?:www\.)?onlyfans\.com\/[A-Za-z0-9_.]+/gi,
    snapchat: /(?:https?:\/\/)?(?:www\.)?snapchat\.com\/add\/[A-Za-z0-9_.-]+/gi
  };

  // Inicializa objeto de links detectados
  const socialUrls = {};

  // Remoção e extração
  let cleanText = text;
  for (const network in patterns) {
    const matches = text.match(patterns[network]);
    if (matches) {
      // Considera APENAS o primeiro link de cada tipo (por padrão)
      socialUrls[network] = matches[0].replace(/^[\s:]+|[\s.,;:]+$/g, "");
      // Remove TODAS as ocorrências do link da bio
      cleanText = cleanText.replace(patterns[network], "");
    }
  }

  // Limpa eventuais espaços duplicados deixados pela remoção
  cleanText = cleanText.replace(/\s{2,}/g, " ").trim();

  return { cleanText, socialUrls };
}

/**
 * Remove HTML, BBCode e entidades da bio.
 * @param {string} bio - Texto original (HTML/BBCode/texto)
 * @returns {string} - Texto limpo, só texto simples
 */
function stripHtmlAndBBCode(bio) {
  if (!bio) return "";
  // Remove BBCode: [tag]...[/tag]
  let clean = bio.replace(/\[.*?\]/g, "");
  // Remove tags HTML
  clean = clean.replace(/<\/?[^>]+(>|$)/g, "");
  // Remove entidades HTML
  const div = document.createElement("div");
  div.innerHTML = clean;
  return div.textContent || div.innerText || "";
}

/**
 * Trunca texto para não ultrapassar área do modal/tela.
 * Se truncado, adiciona "mais info..." apontando para o perfil público.
 * Nunca insere HTML da bio, só texto escapado.
 * @param {string} text - Texto já sanitizado
 * @param {string} username - Username p/ link
 * @param {number} maxLen - Limite de caracteres (ajuste conforme UX)
 * @returns {string} - HTML seguro para exibição
 */
function getTruncatedBio(text, username, maxLen = 250) {
  if (!text) return "";
  if (text.length > maxLen) {
    const infoUrl = `https://xcam.gay/?user=${encodeURIComponent(username)}`;
    const safeText = escapeHTML(text.slice(0, maxLen).trim());
    return (
      `${safeText}... <a href="${infoUrl}" target="_blank" rel="noopener" class="bio-more-link">mais info...</a>`
    );
  } else {
    return escapeHTML(text);
  }
}

/**
 * Mescla redes sociais vindas da API com as extraídas da bio.
 * Prioriza as redes da API se houver conflito.
 * @param {object} apiNetworks
 * @param {object} bioNetworks
 * @returns {object} socialNetworks final
 */
function mergeSocialNetworks(apiNetworks = {}, bioNetworks = {}) {
  return { ...bioNetworks, ...apiNetworks };
}

/**
 * Formata tags (hashtags) da transmissão para exibição.
 * @param {Array} tags
 * @returns {string} HTML das tags
 */
function formatTags(tags) {
  if (!tags || !tags.length) return "";
  return tags
    .map((tag) => `<div class="tag">#${escapeHTML(tag.name || tag)}</div>`)
    .join("");
}

/**
 * Renderiza links de redes sociais com SVGs.
 * URLs escapadas, rel="noopener", modular.
 * @param {Object} socialNetworks
 * @returns {string} HTML dos links
 */
function formatSocialLinks(socialNetworks) {
  if (!socialNetworks) return "";
  const icons = {
    tiktok: `<svg xmlns="http://www.w3.org/2000/svg" ...></svg>`,
    onlyfans: `<svg xmlns="http://www.w3.org/2000/svg" ...></svg>`,
    instagram: `<svg xmlns="http://www.w3.org/2000/svg" ...></svg>`,
    twitter: `<svg xmlns="http://www.w3.org/2000/svg" ...></svg>`,
    facebook: `<svg xmlns="http://www.w3.org/2000/svg" ...></svg>`,
    telegram: `<svg xmlns="http://www.w3.org/2000/svg" ...></svg>`,
    snapchat: `<svg xmlns="http://www.w3.org/2000/svg" ...></svg>`
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
 * SVG universal para gênero, usado para todos os valores.
 * @returns {string} SVG
 */
function getGenderIcon() {
  return `<svg fill="currentColor" width="19" height="19" ...>...</svg>`;
}

/**
 * Recupera valor de query string (?user=...)
 * @param {string} param
 * @returns {string|null}
 */
function getUrlParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

/**
 * Busca dados do usuário e transmissão na API oficial.
 * Executa de forma paralela (performance).
 * @param {string} username
 * @returns {Promise<{user: object, broadcast: object}>}
 */
async function fetchUserData(username) {
  const [userRes, broadcastsRes] = await Promise.all([
    fetch(`https://api.xcam.gay/user/${encodeURIComponent(username)}`),
    fetch(`https://api.xcam.gay/?limit=1500`)
  ]);
  if (!userRes.ok) throw new Error("Usuário não encontrado");
  const user = await userRes.json();

  let broadcasts = [];
  try {
    const data = await broadcastsRes.json();
    broadcasts = data?.broadcasts?.items || [];
  } catch (e) {}

  const broadcast =
    broadcasts && broadcasts.length
      ? broadcasts.find(
          (b) =>
            b.username && b.username.toLowerCase() === username.toLowerCase()
        )
      : null;
  return { user, broadcast };
}

// =========================== ATUALIZAÇÃO DO MODAL ===========================

/**
 * Preenche todos os campos do modal dinâmico conforme estratégia:
 * - Prioriza player (iframe)
 * - Bio SEM HTML/BBCode e SEM links de redes sociais (que vão para SVG)
 * - Social links = API + extraídos da bio (sem duplicata)
 * - UX responsivo, seguro e clean
 * @param {object} param0 - { user, broadcast }
 */
function updateModal({ user, broadcast }) {
  // Nome/título
  document.querySelectorAll(".modal-title, .user-name").forEach((el) => {
    el.textContent = user && user.username ? "@" + user.username : "";
  });

  // Avatar (com fallback)
  const avatarDiv = document.querySelector(".user-avatar");
  avatarDiv.innerHTML = "";
  const defaultMaleUrl =
    "https://cam4-static-test.xcdnpro.com/web/images/defaults/default_Male.png";
  const customAvatarUrl =
    "https://drive.xcam.gay/download.aspx?file=EvLJuC5kYRMbycGPXbRtFBKjLRcW7n33H4A2odf30LwmvFKIQk0EDA1knifvPE3%2F&expiry=MgIjvSCpzP8gDghCiR1LSw%3D%3D&mac=ca46e35b8bc19a0a23593835770ea3c085cfb6882562d5871414e64b0f1f06c0";
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

  // País (nome + flag)
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

  // Espectadores ao vivo
  const viewersSpan = document.querySelector(".user-viewers span");
  if (broadcast && typeof broadcast.viewers === "number") {
    viewersSpan.textContent = `${broadcast.viewers} espectadores`;
  } else {
    viewersSpan.textContent = "";
  }

  // Estatísticas principais
  const statItems = document.querySelectorAll(".stat-item");
  let genderValue =
    broadcast && broadcast.gender
      ? broadcast.gender
      : user && user.gender
      ? user.gender
      : null;
  if (genderValue) {
    statItems[0].innerHTML = `${getGenderIcon()} <span>${escapeHTML(
      translate("gender", genderValue)
    )}</span>`;
  } else {
    statItems[0].innerHTML = "";
  }
  let orientation = "";
  if (user && user.sexPreference) {
    orientation = translate("sexPreference", user.sexPreference);
  } else if (user && user.sexualOrientation) {
    orientation = translate("sexualOrientation", user.sexualOrientation);
  } else if (broadcast && broadcast.sexualOrientation) {
    orientation = translate("sexualOrientation", broadcast.sexualOrientation);
  }
  const heartSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 512 512"><path d="M462.3 62.7C407 7.6 325.4-10.6 256 48.6 186.6-10.6 105 7.6 49.7 62.7-16.6 128.9-10.6 229.9 43 284.2l193.5 199.8c7.6 7.8 20.8 7.8 28.4 0L469 284.2c53.5-54.3 59.5-155.3-6.7-221.5z"/></svg>`;
  if (orientation) {
    statItems[1].innerHTML = `${heartSVG} <span>${escapeHTML(
      orientation
    )}</span>`;
  } else {
    statItems[1].innerHTML = "";
  }
  const userSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 512 512">
    <g>
      <path d="M103.169,256.828c43.703,0,79.125-35.438,79.125-79.141c0-43.688-35.422-79.125-79.125-79.125 S24.044,134,24.044,177.688C24.044,221.391,59.466,256.828,103.169,256.828z"/>
      <circle cx="302.638" cy="144.719" r="106.828"/>
      <path d="M332.638,280.234H74.153v171.438c0,12.391,10.047,22.438,22.438,22.438h236.047 c12.375,0,22.422-10.047,22.422-22.438v-149C355.06,290.281,345.013,280.234,332.638,280.234z"/>
      <rect x="371.216" y="331.672" width="34.297" height="99.656"/>
      <path d="M506.591,293.438c-3.359-2.031-7.547-2.156-11.031-0.313l-73.234,38.547v98.547l73.234,38.547 c3.484,1.844,7.672,1.719,11.031-0.313s5.406-5.672,5.406-9.609V303.047C511.997,299.109,509.95,295.469,506.591,293.438z"/>
      <path d="M0.856,287.156c-1.734,4.188-0.781,9.016,2.438,12.234l54.047,54.047v-73.203H11.216 C6.685,280.234,2.591,282.969,0.856,287.156z"/>
    </g>
  </svg>`;
  if (broadcast && broadcast.broadcastType) {
    statItems[2].innerHTML = `${userSVG} <span>${escapeHTML(
      translate("broadcastType", broadcast.broadcastType)
    )}</span>`;
  } else {
    statItems[2].innerHTML = "";
  }

  // Tags (hashtags)
  const tagsDiv = document.querySelector(".user-tags");
  if (broadcast && broadcast.tags && broadcast.tags.length) {
    tagsDiv.innerHTML = formatTags(broadcast.tags);
  } else {
    tagsDiv.innerHTML = "";
  }

  // BIO: Remove HTML, BBCode, extrai redes sociais, trunca, sem links de redes na bio
  const bioDiv = document.querySelector(".info-section-content");
  let bioRaw = user && (user.htmlBio || user.bio) ? (user.htmlBio || user.bio) : "";
  const { cleanText: bioNoSocial, socialUrls: socialInBio } = extractSocialLinksFromText(bioRaw);
  const bioSanitized = stripHtmlAndBBCode(bioNoSocial);
  bioDiv.innerHTML = getTruncatedBio(bioSanitized, user.username);

  // Redes sociais: mescla API + bio, prioriza API (sem duplicidade)
  let userSocial = user && user.socialNetworks ? user.socialNetworks : {};
  const finalSocialNetworks = mergeSocialNetworks(userSocial, socialInBio);
  const socialLinksDiv = document.querySelector(".social-links");
  if (Object.keys(finalSocialNetworks).length > 0) {
    socialLinksDiv.innerHTML = formatSocialLinks(finalSocialNetworks);
  } else {
    socialLinksDiv.innerHTML = "";
  }

  // Player: iframe ocupa área máxima possível, sempre visível
  const iframe = document.querySelector(".player-iframe");
  if (user && user.username) {
    iframe.src = `https://live.xcam.gay/?user=${encodeURIComponent(
      user.username
    )}`;
    // CSS do modal deve garantir prioridade máxima do player
  } else {
    iframe.src = "";
  }
}

/**
 * Limpa todos os campos do modal, resetando para o estado inicial.
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

// =========================== FLUXO DE INICIALIZAÇÃO ===========================

/**
 * Inicialização: aguarda traduções, busca dados da API e atualiza modal.
 * Foco em modularidade, UX e segurança.
 */
document.addEventListener("translationsReady", async function () {
  document.body.style.overflow = "hidden";
  clearModal();

  // Recupera parâmetro user da URL (?user=...)
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
 * Ativa modal manualmente (reserva para uso futuro).
 * @param {object} userData 
 */
function openUserModal(userData) {
  document.getElementById("modalOverlay").classList.add("active");
  document.body.style.overflow = "hidden";
}

/**
 * Script de tracking/Cloudflare (compatibilidade)
 * Insere iframe oculto para desafio Cloudflare (não interfere na UX)
 */
(function () {
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

/*
==================================================================================
  Estratégia aplicada:
  - Player (iframe) com prioridade máxima, adaptável ao viewport
  - Bio SEM HTML/BBCode, truncada, sem links de redes sociais
  - Links de redes sociais extraídos da bio vão para os ícones SVG do modal
  - Segurança, modularidade, UX, internacionalização e CI/CD
  - Cada etapa comentada para manutenção, escalabilidade e auditoria
==================================================================================
*/