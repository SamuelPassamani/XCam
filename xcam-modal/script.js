// xcam-modal/script.js
// Este script preenche dinamicamente o modal fullscreen do XCam com informações de um usuário/transmissão,
// utilizando traduções carregadas externamente de https://beta.xcam.gay/translations.js
// e tradução reversa de https://beta.xcam.gay/translations-reverse.js
// O script remove imagens e links externos da bio, seja em HTML ou BBCode.

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
 * Remove imagens e links externos (HTML e BBCode) de um HTML/texto.
 * @param {string} bio - Conteúdo da bio (pode ter HTML/BBCode).
 * @returns {string} Bio limpa, sem imagens nem links externos.
 */
function sanitizeBio(bio) {
  if (!bio) return "";
  // Remove [img]...[/img] e [url]...[/url] (BBCode)
  let sanitized = bio
    .replace(/\[img\][^\[]*\[\/img\]/gi, "")
    .replace(/\[url=[^\]]*\][^\[]*\[\/url\]/gi, "")
    .replace(/\[url\][^\[]*\[\/url\]/gi, "");
  // Remove <img ...> (HTML)
  sanitized = sanitized.replace(/<img[^>]*>/gi, "");
  // Remove <a ...>...</a> mas preserva o texto interno
  sanitized = sanitized.replace(/<a [^>]*>(.*?)<\/a>/gi, "$1");
  // Remove eventuais iframes, objects, embeds
  sanitized = sanitized.replace(/<(iframe|object|embed)[^>]*>.*?<\/\1>/gi, "");
  return sanitized;
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
 * @param {Object} socialNetworks - { twitter: url, instagram: url, tiktok: url, facebook: url, telegram: url, snapchat: url, ... }
 * @returns {string} HTML dos links com ícones.
 */
function formatSocialLinks(socialNetworks) {
  if (!socialNetworks) return "";
  const icons = {
    tiktok: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 32 32"><path d="M24.562,7.613c-1.508-.983-2.597-2.557-2.936-4.391-.073-.396-.114-.804-.114-1.221h-4.814l-.008,19.292c-.081,2.16-1.859,3.894-4.039,3.894-.677,0-1.315-.169-1.877-.465-1.288-.678-2.169-2.028-2.169-3.582,0-2.231,1.815-4.047,4.046-4.047,.417,0,.816,.069,1.194,.187v-4.914c-.391-.053-.788-.087-1.194-.087-4.886,0-8.86,3.975-8.86,8.86,0,2.998,1.498,5.65,3.783,7.254,1.439,1.01,3.19,1.606,5.078,1.606,4.886,0,8.86-3.975,8.86-8.86V11.357c1.888,1.355,4.201,2.154,6.697,2.154v-4.814c-1.345,0-2.597-.4-3.647-1.085Z"></path></svg>`,
    onlyfans: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 32 32"><path d="M10.667,5.333C4.776,5.333,0,10.109,0,16s4.776,10.667,10.667,10.667,10.667-4.776,10.667-10.667S16.558,5.333,10.667,5.333Zm0,13.867c-1.767,0-3.2-1.433-3.2-3.2s1.433-3.2,3.2-3.2,3.2,1.433,3.2,3.2c.002,1.765-1.427,3.198-3.191,3.2-.003,0-.006,0-.009,0Z" opacity=".8"></path><path d="M22.656,13.333c2.71,.78,5.909,0,5.909,0-.928,4.053-3.872,6.592-8.118,6.901-1.683,3.906-5.528,6.435-9.781,6.432l3.2-10.171c3.29-10.454,4.976-11.162,12.777-11.162h5.356c-.896,3.947-3.984,6.961-9.344,8Z"></path></svg>`,
    instagram: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 32 32"><path d="M10.202,2.098c-1.49,.07-2.507,.308-3.396,.657-.92,.359-1.7,.84-2.477,1.619-.776,.779-1.254,1.56-1.61,2.481-.345,.891-.578,1.909-.644,3.4-.066,1.49-.08,1.97-.073,5.771s.024,4.278,.096,5.772c.071,1.489,.308,2.506,.657,3.396,.359,.92,.84,1.7,1.619,2.477,.779,.776,1.559,1.253,2.483,1.61,.89,.344,1.909,.579,3.399,.644,1.49,.065,1.97,.08,5.771,.073,3.801-.007,4.279-.024,5.773-.095s2.505-.309,3.395-.657c.92-.36,1.701-.84,2.477-1.62s1.254-1.561,1.609-2.483c.345-.89,.579-1.909,.644-3.398,.065-1.494,.081-1.971,.073-5.773s-.024-4.278-.095-5.771-.308-2.507-.657-3.397c-.36-.92-.84-1.7-1.619-2.477s-1.561-1.254-2.483-1.609c-.891-.345-1.909-.58-3.399-.644s-1.97-.081-5.772-.074-4.278,.024-5.771,.096m.164,25.309c-1.365-.059-2.106-.286-2.6-.476-.654-.252-1.12-.557-1.612-1.044s-.795-.955-1.05-1.608c-.192-.494-.423-1.234-.487-2.599-.069-1.475-.084-1.918-.092-5.656s.006-4.18,.071-5.656c.058-1.364,.286-2.106,.476-2.6,.252-.655,.556-1.12,1.044-1.612s.955-.795,1.608-1.05c.493-.193,1.234-.422,2.598-.487,1.476-.07,1.919-.084,5.656-.092,3.737-.008,4.181,.006,5.658,.071,1.364,.059,2.106,.285,2.599,.476,.654,.252,1.12,.555,1.612,1.044s.795,.954,1.051,1.609c.193,.492,.422,1.232,.486,2.597,.07,1.476,.086,1.919,.093,5.656,.007,3.737-.006,4.181-.071,5.656-.06,1.365-.286,2.106-.476,2.601-.252,.654-.556,1.12-1.045,1.612s-.955,.795-1.608,1.05c-.493,.192-1.234,.422-2.597,.487-1.476,.069-1.919,.084-5.657,.092s-4.18-.007-5.656-.071M21.779,8.517c.002,.928,.755,1.679,1.683,1.677s1.679-.755,1.677-1.683c-.002-.928-.755-1.679-1.683-1.677,0,0,0,0,0,0-.928,.002-1.678,.755-1.677,1.683m-12.967,7.496c.008,3.97,3.232,7.182,7.202,7.174s7.183-3.232,7.176-7.202c-.008-3.97-3.233-7.183-7.203-7.175s-7.182,3.233-7.174,7.203m2.522-.005c-.005-2.577,2.08-4.671,4.658-4.676,2.577-.005,4.671,2.08,4.676,4.658,.005,2.577-2.08,4.671-4.658,4.676-2.577,.005-4.671-2.079-4.676-4.656h0"></path></svg>`,
    twitter: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 32 32"><path d="M18.42,14.009L27.891,3h-2.244l-8.224,9.559L10.855,3H3.28l9.932,14.455L3.28,29h2.244l8.684-10.095,6.936,10.095h7.576l-10.301-14.991h0Zm-3.074,3.573l-1.006-1.439L6.333,4.69h3.447l6.462,9.243,1.006,1.439,8.4,12.015h-3.447l-6.854-9.804h0Z"></path></svg>`,
    facebook: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 32 32"><path d="M16,2c-7.732,0-14,6.268-14,14,0,6.566,4.52,12.075,10.618,13.588v-9.31h-2.887v-4.278h2.887v-1.843c0-4.765,2.156-6.974,6.835-6.974,.887,0,2.417,.174,3.043,.348v3.878c-.33-.035-.904-.052-1.617-.052-2.296,0-3.183,.87-3.183,3.13v1.513h4.573l-.786,4.278h-3.787v9.619c6.932-.837,12.304-6.74,12.304-13.897,0-7.732-6.268-14-14-14Z"></path></svg>`,
    telegram: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 32 32"><path d="M16,2c-7.732,0-14,6.268-14,14s6.268,14,14,14,14-6.268,14-14S23.732,2,16,2Zm6.489,9.521c-.211,2.214-1.122,7.586-1.586,10.065-.196,1.049-.583,1.401-.957,1.435-.813,.075-1.43-.537-2.218-1.053-1.232-.808-1.928-1.311-3.124-2.099-1.382-.911-.486-1.412,.302-2.23,.206-.214,3.788-3.472,3.858-3.768,.009-.037,.017-.175-.065-.248-.082-.073-.203-.048-.29-.028-.124,.028-2.092,1.329-5.905,3.903-.559,.384-1.065,.571-1.518,.561-.5-.011-1.461-.283-2.176-.515-.877-.285-1.574-.436-1.513-.92,.032-.252,.379-.51,1.042-.773,4.081-1.778,6.803-2.95,8.164-3.517,3.888-1.617,4.696-1.898,5.222-1.907,.116-.002,.375,.027,.543,.163,.142,.115,.181,.27,.199,.379,.019,.109,.042,.357,.023,.551Z" fill-rule="evenodd"></path></svg>`,
    snapchat: `<svg width="16" height="16" fill="currentColor" viewBox="1.98944755 .3641436 20.02369289 22.52376706" xmlns="http://www.w3.org/2000/svg"><path d="m21.798 16.987c-2.867-.472-4.151-3.401-4.204-3.526l-.006-.011a1.07 1.07 0 0 1 -.102-.898c.192-.454.83-.656 1.251-.79.106-.033.205-.065.283-.096.763-.3.918-.613.914-.822a.662.662 0 0 0 -.5-.543l-.007-.002a.946.946 0 0 0 -.356-.069.755.755 0 0 0 -.313.063 2.54 2.54 0 0 1 -.955.266.821.821 0 0 1 -.53-.178l.032-.53.004-.065a10.102 10.102 0 0 0 -.24-4.035 5.248 5.248 0 0 0 -4.874-3.14l-.402.005a5.24 5.24 0 0 0 -4.864 3.137 10.09 10.09 0 0 0 -.242 4.031q.02.299.036.598a.848.848 0 0 1 -.584.178 2.453 2.453 0 0 1 -1.014-.268.575.575 0 0 0 -.245-.049.834.834 0 0 0 -.81.533c-.082.43.532.743.906.89.08.032.178.063.283.096.422.134 1.06.336 1.252.79a1.072 1.072 0 0 1 -.102.898l-.006.011a7.028 7.028 0 0 1 -1.069 1.663 5.215 5.215 0 0 1 -3.134 1.863.24.24 0 0 0 -.2.25.38.38 0 0 0 .03.13c.177.411 1.059.75 2.553.981.14.022.198.25.28.622.032.15.066.305.113.465a.293.293 0 0 0 .32.228 2.485 2.485 0 0 0 .424-.06 5.53 5.53 0 0 1 1.12-.127 4.954 4.954 0 0 1 .809.068 3.877 3.877 0 0 1 1.535.784 4.443 4.443 0 0 0 2.69 1.06c.033 0 .067-.001.1-.004.04.002.095.004.151.004a4.448 4.448 0 0 0 2.692-1.06 3.873 3.873 0 0 1 1.533-.784 4.973 4.973 0 0 1 .808-.068 5.593 5.593 0 0 1 1.12.119 2.391 2.391 0 0 0 .425.053h.024a.279.279 0 0 0 .295-.22 6.52 6.52 0 0 0 .114-.462c.081-.371.14-.598.28-.62 1.494-.23 2.377-.57 2.551-.978a.385.385 0 0 0 .032-.13.24.24 0 0 0 -.2-.25z"/></svg>`
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
 * Retorna o SVG universal para gênero informado.
 * Este ícone será utilizado para todos os valores de gender.
 * @returns {string} SVG universal de gender
 */
function getGenderIcon() {
  // SVG universal padronizado para todos os valores de gênero
  return `<svg fill="currentColor" width="19" height="19" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
    <path d="M219.9978,23.95557q-.00219-.56984-.05749-1.13819c-.018-.18408-.05237-.36279-.07849-.54443-.02979-.20557-.05371-.41211-.09424-.61621-.04029-.20362-.09607-.40088-.14649-.60059-.04541-.18017-.08484-.36084-.13867-.53906-.05884-.19434-.13159-.38135-.19971-.57129-.06445-.17969-.12353-.36084-.19677-.5376-.07349-.17724-.15967-.34668-.24109-.51953-.08582-.18213-.16687-.36621-.26257-.54492-.088-.16455-.18824-.32031-.2837-.48047-.10534-.17627-.2052-.355-.32031-.52685-.11572-.17334-.24475-.33545-.369-.502-.11-.14746-.21252-.29834-.3302-.4414-.23462-.28614-.4834-.55957-.74316-.82227-.01782-.01807-.03247-.03809-.05054-.05615-.01831-.01856-.03857-.0332-.05688-.05127q-.39441-.38966-.82227-.74317c-.13965-.11474-.28686-.21435-.43042-.32177-.16992-.127-.33606-.25879-.51269-.377-.16883-.11328-.34424-.21093-.51734-.31445-.16333-.09765-.32324-.20019-.49145-.29-.1731-.09277-.3512-.1709-.52759-.25439-.17871-.08448-.35462-.17383-.538-.24951-.16932-.07032-.34229-.12647-.514-.18848-.19751-.07129-.39307-.14649-.59534-.208-.16882-.05078-.34045-.08789-.51086-.13135-.20874-.05322-.41529-.11132-.62818-.15332-.19055-.03759-.383-.05957-.57507-.08789-.19544-.02881-.38831-.06494-.58679-.08447-.33252-.03271-.666-.04541-.99988-.05078C208.11853,12.0083,208.0603,12,208,12H172a12,12,0,0,0,0,24h7.0293l-15.051,15.05127A71.97526,71.97526,0,1,0,108,178.981V192H88a12,12,0,0,0,0,24h20v16a12,12,0,0,0,24,0V216h20a12,12,0,0,0,0-24H132V178.981A71.928,71.928,0,0,0,180.27783,68.69287L196,52.9707V60a12,12,0,0,0,24,0V24C220,23.98486,219.9978,23.97021,219.9978,23.95557ZM120,156a48,48,0,1,1,48-48A48.05468,48.05468,0,0,1,120,156Z"/>
  </svg>`;
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
 * @returns {Promise<{user: object, broadcast: object}>} Dados do usuário e transmissão.
 */
async function fetchUserData(username) {
  // Busca os dados do usuário e as transmissões em paralelo
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
  } catch (e) {
    // Silencia erro caso não consiga carregar transmissões (não é crítico)
  }

  // Encontra a transmissão correspondente ao usuário (se houver) no array de items
  const broadcast =
    broadcasts && broadcasts.length
      ? broadcasts.find(
          (b) =>
            b.username && b.username.toLowerCase() === username.toLowerCase()
        )
      : null;
  return { user, broadcast };
}

/**
 * Atualiza o modal com os dados do usuário e transmissão.
 * Preenche todos os campos do modal dinâmico com base nos dados recebidos.
 * Remove imagens e links externos da bio.
 * @param {object} param0 - { user, broadcast }
 */
function updateModal({ user, broadcast }) {
  // Preenche título e nome do usuário
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
  if (broadcast && typeof broadcast.viewers === "number") {
    viewersSpan.textContent = `${broadcast.viewers} espectadores`;
  } else {
    viewersSpan.textContent = "";
  }

  // Estatísticas principais: sexo (gender), orientação sexual, tipo de transmissão
  const statItems = document.querySelectorAll(".stat-item");

  // Ícone SVG Heart para Orientação Sexual (cor branca)
  const heartSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 512 512"><path d="M462.3 62.7C407 7.6 325.4-10.6 256 48.6 186.6-10.6 105 7.6 49.7 62.7-16.6 128.9-10.6 229.9 43 284.2l193.5 199.8c7.6 7.8 20.8 7.8 28.4 0L469 284.2c53.5-54.3 59.5-155.3-6.7-221.5z"/></svg>`;

  // Ícone de usuário (tipo transmissão) como SVG inline branco (cor garantida por CSS)
  const userSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 512 512">
    <g>
      <path d="M103.169,256.828c43.703,0,79.125-35.438,79.125-79.141c0-43.688-35.422-79.125-79.125-79.125
        S24.044,134,24.044,177.688C24.044,221.391,59.466,256.828,103.169,256.828z"/>
      <circle cx="302.638" cy="144.719" r="106.828"/>
      <path d="M332.638,280.234H74.153v171.438c0,12.391,10.047,22.438,22.438,22.438h236.047
        c12.375,0,22.422-10.047,22.422-22.438v-149C355.06,290.281,345.013,280.234,332.638,280.234z"/>
      <rect x="371.216" y="331.672" width="34.297" height="99.656"/>
      <path d="M506.591,293.438c-3.359-2.031-7.547-2.156-11.031-0.313l-73.234,38.547v98.547l73.234,38.547
        c3.484,1.844,7.672,1.719,11.031-0.313s5.406-5.672,5.406-9.609V303.047C511.997,299.109,509.95,295.469,506.591,293.438z"/>
      <path d="M0.856,287.156c-1.734,4.188-0.781,9.016,2.438,12.234l54.047,54.047v-73.203H11.216
        C6.685,280.234,2.591,282.969,0.856,287.156z"/>
    </g>
  </svg>`;

  // Gênero (gender) - usa SVG universal e a tradução do valor
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

  // Orientação sexual (sexPreference ou sexualOrientation) - busca preferencialmente no user, depois no broadcast
  let orientation = "";
  if (user && user.sexPreference) {
    orientation = translate("sexPreference", user.sexPreference);
  } else if (user && user.sexualOrientation) {
    orientation = translate("sexualOrientation", user.sexualOrientation);
  } else if (broadcast && broadcast.sexualOrientation) {
    orientation = translate("sexualOrientation", broadcast.sexualOrientation);
  }
  if (orientation) {
    statItems[1].innerHTML = `${heartSVG} <span>${escapeHTML(
      orientation
    )}</span>`;
  } else {
    statItems[1].innerHTML = "";
  }

  // Tipo de transmissão (broadcastType) - usa tradução correta do arquivo de traduções!
  if (broadcast && broadcast.broadcastType) {
    statItems[2].innerHTML = `${userSVG} <span>${escapeHTML(
      translate("broadcastType", broadcast.broadcastType)
    )}</span>`;
  } else {
    statItems[2].innerHTML = "";
  }

  // Tags (hashtags) da transmissão
  const tagsDiv = document.querySelector(".user-tags");
  if (broadcast && broadcast.tags && broadcast.tags.length) {
    tagsDiv.innerHTML = formatTags(broadcast.tags);
  } else {
    tagsDiv.innerHTML = "";
  }

  // Bio do usuário (HTML ou texto puro) - LIMPA imagens e links externos
  const bioDiv = document.querySelector(".info-section-content");
  if (user && user.htmlBio) {
    bioDiv.innerHTML = sanitizeBio(user.htmlBio);
  } else if (user && user.bio) {
    bioDiv.textContent = sanitizeBio(user.bio);
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

/**
 * Script de tracking/Cloudflare (mantido conforme original, caso necessário)
 * Responsável por inserir de forma oculta um iframe com script de desafio Cloudflare.
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