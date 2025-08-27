// =========================================================================================
// XCam API - Adaptado para Google Apps Script (index.gs)
// =========================================================================================
// @author Samuel Passamani / Estudio A.Sério [AllS Company]
// @version 3.6.0
// =========================================================================================

// 1. CONFIGURAÇÕES & VARIÁVEIS GLOBAIS
var ALLOWED_ORIGINS_PATTERNS = [
  "https://xcam.gay", "https://beta.xcam.gay", "https://player.xcam.gay",
  "https://db.xcam.gay", "https://modal.xcam.gay", "https://live.xcam.gay",
  "https://status.xcam.gay", "https://drive.xcam.gay", "https://api.xcam.gay/",
  "https://samuelpassamani.github.io", "https://xcam-app.aserio.workers.dev",
  "https://xcam-api.aserio.workers.dev", "http://127.0.0.1:5500",
  "https://web-sandbox.oaiusercontent.com", "https://persistent.oaistatic.com",
  "https://openai.com", "https://chatgpt.com",
  "https://codepen.io", "https://cdpn.io",
  "*.netlify.app", "https://playhls.com",
  "*.google.com", "*.usercontent.goog", "*.googleusercontent.com", "*.googlesyndication.com",
  "*.gstatic.com", "*.doubleclick.net",
  "*.canva.com"
];

// 2. Funções de Segurança e Utilitários
function getAllowedOrigin(origin) {
  if (!origin || ALLOWED_ORIGINS_PATTERNS.indexOf(origin) !== -1) return origin;
  for (var i = 0; i < ALLOWED_ORIGINS_PATTERNS.length; i++) {
    var pattern = ALLOWED_ORIGINS_PATTERNS[i];
    if (pattern.indexOf('*.') === 0) {
      var mainDomain = pattern.substring(2);
      var originHostname = origin.replace(/^https?:\/\//, '').split('/')[0];
      if (originHostname.endsWith('.' + mainDomain) || originHostname === mainDomain) return origin;
    }
  }
  return null;
}

function jsonToCsv(items) {
  if (!items || items.length === 0) return "";
  var headers = Object.keys(items[0]);
  var csvRows = items.map(function(item) {
    return headers.map(function(h) {
      var val = item[h];
      if (val == null) val = "";
      else if (typeof val === "string" && (val.indexOf(",") !== -1 || val.indexOf('"') !== -1)) {
        val = '"' + val.replace(/"/g, '""') + '"';
      }
      return val;
    }).join(",");
  });
  return [headers.join(",")].concat(csvRows).join("\n");
}

function errorVideoResponse() {
  return HtmlService.createHtmlOutputFromFile('error');
}

// 3. Funções de Requisição a APIs Externas
function buildCam4GraphQLBody(offset, limit, orderBy) {
  if (!orderBy) orderBy = "trending";
  return JSON.stringify({
    operationName: "getGenderPreferencePageData",
    variables: {
      input: {
        orderBy: orderBy,
        filters: [],
        gender: "male",
        cursor: { first: limit, offset: offset }
      }
    },
    query: "query getGenderPreferencePageData($input: BroadcastsInput) { broadcasts(input: $input) { total items { id username country sexualOrientation profileImageURL preview { src poster } viewers broadcastType gender tags { name slug } } } }"
  });
}

function fetchAllBroadcasts(orderBy) {
  var allItems = [];
  var offset = 0;
  var apiPageLimit = 300;
  var totalDiscovered = 0;
  var options = {
    method: "post",
    contentType: "application/json",
    headers: { "apollographql-client-name": "CAM4-client" },
    payload: buildCam4GraphQLBody(0, apiPageLimit, orderBy)
  };
  var firstResponse = UrlFetchApp.fetch("https://pt.cam4.com/graph?operation=getGenderPreferencePageData&ssr=false", options);
  var firstData = JSON.parse(firstResponse.getContentText());
  totalDiscovered = (firstData.data && firstData.data.broadcasts && firstData.data.broadcasts.total) || 0;
  var firstItems = (firstData.data && firstData.data.broadcasts && firstData.data.broadcasts.items) || [];
  if (firstItems.length > 0) allItems = allItems.concat(firstItems);
  offset += firstItems.length;
  while (offset < totalDiscovered) {
    options.payload = buildCam4GraphQLBody(offset, apiPageLimit, orderBy);
    var response = UrlFetchApp.fetch("https://pt.cam4.com/graph?operation=getGenderPreferencePageData&ssr=false", options);
    var data = JSON.parse(response.getContentText());
    var items = (data.data && data.data.broadcasts && data.data.broadcasts.items) || [];
    if (items.length === 0) break;
    allItems = allItems.concat(items);
    offset += items.length;
  }
  return allItems;
}

function findUserInGraphQL(username) {
  var limit = 300;
  var maxPages = 25;
  var offset = 0;
  var options = {
    method: "post",
    contentType: "application/json",
    headers: { "apollographql-client-name": "CAM4-client" }
  };
  for (var page = 0; page < maxPages; page++) {
    options.payload = buildCam4GraphQLBody(offset, limit);
    var response = UrlFetchApp.fetch("https://pt.cam4.com/graph?operation=getGenderPreferencePageData&ssr=false", options);
    var json = JSON.parse(response.getContentText());
    var items = (json.data && json.data.broadcasts && json.data.broadcasts.items) || [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].username === username) return items[i];
    }
    var total = (json.data && json.data.broadcasts && json.data.broadcasts.total) || 0;
    offset += limit;
    if (offset >= total || items.length === 0) break;
  }
  return null;
}

function fetchStreamInfo(username) {
  var apiUrl = "https://pt.cam4.com/rest/v1.0/profile/" + username + "/streamInfo";
  var response = UrlFetchApp.fetch(apiUrl, { headers: { accept: "application/json" } });
  if (response.getResponseCode() !== 200) return { error: "Erro ao buscar streamInfo para " + username + ": " + response.getResponseCode() };
  return JSON.parse(response.getContentText());
}

function fetchUserProfile(username) {
  var apiUrl = "https://pt.cam4.com/rest/v1.0/profile/" + username + "/info";
  var response = UrlFetchApp.fetch(apiUrl, { headers: { accept: "application/json" } });
  if (response.getResponseCode() !== 200) return { error: "Erro ao buscar perfil para " + username + ": " + response.getResponseCode() };
  return JSON.parse(response.getContentText());
}

function fetchPosterInfoFromGAS(username) {
  var GAS_URL = "https://script.google.com/macros/s/AKfycbyr1M8TYzdRaJpaCbFcnAFGh7JbERDX9EfgOGUCKDZDriGsxudgBLTrmxU3PP4REoOqdA/exec?poster=" + encodeURIComponent(username);
  var response = UrlFetchApp.fetch(GAS_URL, { headers: { accept: "application/json" }, followRedirects: true });
  if (response.getResponseCode() === 200 && response.getHeaders()["Content-Type"] && response.getHeaders()["Content-Type"].indexOf("application/json") !== -1) {
    return JSON.parse(response.getContentText());
  }
  return null;
}

// 4. Handlers de Proxy e Rotas
function handleRecProxy(username) {
  var GAS_URL = "https://script.google.com/macros/s/AKfycbyr1M8TYzdRaJpaCbFcnAFGh7JbERDX9EfgOGUCKDZDriGsxudgBLTrmxU3PP4REoOqdA/exec?rec=" + encodeURIComponent(username);
  var response = UrlFetchApp.fetch(GAS_URL, { followRedirects: true });
  var contentType = response.getHeaders()["Content-Type"] || "application/json";
  return ContentService.createTextOutput(response.getContentText()).setMimeType(contentType.indexOf("json") !== -1 ? ContentService.MimeType.JSON : ContentService.MimeType.TEXT);
}

function handlePosterProxy(username) {
  var GAS_URL = "https://script.google.com/macros/s/AKfycbyr1M8TYzdRaJpaCbFcnAFGh7JbERDX9EfgOGUCKDZDriGsxudgBLTrmxU3PP4REoOqdA/exec?poster=" + encodeURIComponent(username);
  var response = UrlFetchApp.fetch(GAS_URL, { followRedirects: true });
  var contentType = response.getHeaders()["Content-Type"] || "application/json";
  return ContentService.createTextOutput(response.getContentText()).setMimeType(contentType.indexOf("json") !== -1 ? ContentService.MimeType.JSON : ContentService.MimeType.TEXT);
}

function handlePosterImageProxy(pathname) {
  var username = pathname.substring('/poster/'.length).replace('.jpg', '');
  if (!username) return ContentService.createTextOutput("Nome de usuário inválido no path.").setMimeType(ContentService.MimeType.TEXT);
  var targetUrl = "https://snapshots.xcdnpro.com/thumbnails/" + username;
  var imageResponse = UrlFetchApp.fetch(targetUrl, { headers: { "Referer": "https://xcam.gay/" } });
  var contentType = imageResponse.getHeaders()["Content-Type"] || "image/jpeg";
  return ContentService.createTextOutput(imageResponse.getContentText()).setMimeType(ContentService.MimeType.JPEG);
}

function handleGifProxy(pathname) {
  var username = pathname.substring('/gif/'.length).replace('.gif', '');
  if (!username) return ContentService.createTextOutput("Nome de usuário inválido no path.").setMimeType(ContentService.MimeType.TEXT);
  var targetUrl = "https://cdn.xcam.gay/10:/XCam/Conte%C3%BAdo%20Social/XCam%20Social%20M%C3%ADdias/XCam%20GIFs/" + username + ".gif";
  var gifResponse = UrlFetchApp.fetch(targetUrl, { headers: { "Referer": "https://xcam.gay/" } });
  var contentType = gifResponse.getHeaders()["Content-Type"] || "image/gif";
  return ContentService.createTextOutput(gifResponse.getContentText()).setMimeType(ContentService.MimeType.GIF);
}

function handleProfileImageProxy(pathname) {
  var username = pathname.substring('/profile/'.length).replace('.jpg', '');
  if (!username) return ContentService.createTextOutput("Nome de usuário inválido no path.").setMimeType(ContentService.MimeType.TEXT);
  var profile = fetchUserProfile(username);
  var url = profile.profileImageUrl || profile.profileImageURL;
  if (!url) return ContentService.createTextOutput("Imagem de perfil não encontrada.").setMimeType(ContentService.MimeType.TEXT);
  var imgResponse = UrlFetchApp.fetch(url);
  var contentType = imgResponse.getHeaders()["Content-Type"] || "image/jpeg";
  return ContentService.createTextOutput(imgResponse.getContentText()).setMimeType(ContentService.MimeType.JPEG);
}

function handleAvatarImageProxy(pathname) {
  var username = pathname.substring('/avatar/'.length).replace('.jpg', '');
  if (!username) return ContentService.createTextOutput("Nome de usuário inválido no path.").setMimeType(ContentService.MimeType.TEXT);
  var profile = fetchUserProfile(username);
  var url = profile.avatarUrl;
  if (!url) return ContentService.createTextOutput("Avatar não encontrado.").setMimeType(ContentService.MimeType.TEXT);
  var imgResponse = UrlFetchApp.fetch(url);
  var contentType = imgResponse.getHeaders()["Content-Type"] || "image/jpeg";
  return ContentService.createTextOutput(imgResponse.getContentText()).setMimeType(ContentService.MimeType.JPEG);
}

function handleBannerImageProxy(pathname) {
  var username = pathname.substring('/banner/'.length).replace('.jpg', '');
  if (!username) return ContentService.createTextOutput("Nome de usuário inválido no path.").setMimeType(ContentService.MimeType.TEXT);
  var profile = fetchUserProfile(username);
  var url = profile.bannerUrl;
  if (!url) return ContentService.createTextOutput("Banner não encontrado.").setMimeType(ContentService.MimeType.TEXT);
  var imgResponse = UrlFetchApp.fetch(url);
  var contentType = imgResponse.getHeaders()["Content-Type"] || "image/jpeg";
  return ContentService.createTextOutput(imgResponse.getContentText()).setMimeType(ContentService.MimeType.JPEG);
}

function handleStreamRedirect(username) {
  var streamInfo = fetchStreamInfo(username);
  var targetUrl = streamInfo.cdnURL || streamInfo.edgeURL;
  if (targetUrl) {
    return HtmlService.createHtmlOutput('<meta http-equiv="refresh" content="0; url=' + targetUrl + '" />');
  }
  return ContentService.createTextOutput(JSON.stringify({ error: "Nenhuma URL de stream encontrada para " + username + "." })).setMimeType(ContentService.MimeType.JSON);
}

function handleHlsProxy(e) {
  var targetUrl = e.parameter.url;
  if (!targetUrl) return ContentService.createTextOutput("Parâmetro 'url' é obrigatório.").setMimeType(ContentService.MimeType.TEXT);
  var referer = e.parameter.referer || "https://pt.cam4.com/";
  var options = {
    headers: { "Referer": referer },
    followRedirects: true
  };
  var response = UrlFetchApp.fetch(targetUrl, options);
  return ContentService.createTextOutput(response.getContentText()).setMimeType(ContentService.MimeType.TEXT);
}

function handleUserFullInfo(username) {
  var profile = fetchUserProfile(username);
  var liveInfo = fetchStreamInfo(username);
  return ContentService.createTextOutput(JSON.stringify({ profile: profile, liveInfo: liveInfo }, null, 2)).setMimeType(ContentService.MimeType.JSON);
}

// 5. Ponto de Entrada - doGet
function doGet(e) {
  var path = e && e.pathInfo ? e.pathInfo : '/';
  var params = e.parameter || {};
  var origin = e.headers && e.headers.Origin ? e.headers.Origin : null;
  var allowedOrigin = getAllowedOrigin(origin);
  var envKey = params.key || null;
  var response;

  // Exceção: libera acesso público para poster, gif, profile, avatar e banner imagens
  if (!(
    (path.indexOf('/poster/') === 0 && path.endsWith('.jpg')) ||
    (path.indexOf('/gif/') === 0 && path.endsWith('.gif')) ||
    (path.indexOf('/profile/') === 0 && path.endsWith('.jpg')) ||
    (path.indexOf('/avatar/') === 0 && path.endsWith('.jpg')) ||
    (path.indexOf('/banner/') === 0 && path.endsWith('.jpg'))
  )) {
    if (!allowedOrigin) {
      if (!envKey) {
        return errorVideoResponse();
      }
    }
  }

  try {
    // Rota 1: Proxy para gravações (?rec={username})
    if (params.rec) {
      response = handleRecProxy(params.rec);
    }
    // Rota 2: Proxy para poster via GAS (?poster={username})
    else if (params.poster) {
      response = handlePosterProxy(params.poster);
    }
    // Rota 3: Proxy de imagem para poster (/poster/{username}.jpg)
    else if (path.indexOf('/poster/') === 0 && path.endsWith('.jpg')) {
      response = handlePosterImageProxy(path);
    }
    // Rota 3b: Proxy de GIF (/gif/{username}.gif)
    else if (path.indexOf('/gif/') === 0 && path.endsWith('.gif')) {
      response = handleGifProxy(path);
    }
    // Rota 3c: Proxy de imagem de perfil (/profile/{username}.jpg)
    else if (path.indexOf('/profile/') === 0 && path.endsWith('.jpg')) {
      response = handleProfileImageProxy(path);
    }
    // Rota 3d: Proxy de avatar (/avatar/{username}.jpg)
    else if (path.indexOf('/avatar/') === 0 && path.endsWith('.jpg')) {
      response = handleAvatarImageProxy(path);
    }
    // Rota 3e: Proxy de banner (/banner/{username}.jpg)
    else if (path.indexOf('/banner/') === 0 && path.endsWith('.jpg')) {
      response = handleBannerImageProxy(path);
    }
    // Rota 4: Redirecionamento de Stream (/stream/{username}[.m3u8 | /index.m3u8])
    else if (path.indexOf('/stream/') === 0) {
      var usernamePart = path.substring('/stream/'.length);
      if (usernamePart.endsWith('/index.m3u8')) {
        usernamePart = usernamePart.slice(0, -'/index.m3u8'.length);
      } else if (usernamePart.endsWith('.m3u8')) {
        usernamePart = usernamePart.slice(0, -'.m3u8'.length);
      }
      if (usernamePart.endsWith('/')) {
        usernamePart = usernamePart.slice(0, -1);
      }
      var username = usernamePart;
      if (username) {
        response = handleStreamRedirect(username);
      } else {
        response = ContentService.createTextOutput(JSON.stringify({ error: "Nome de usuário não especificado na rota." })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    // Rota 5: Proxy HLS (/hls-proxy?url=...)
    else if (path === '/hls-proxy') {
      response = handleHlsProxy(e);
    }
    // Rota 6: Dados agregados de usuário (?user={username})
    else if (params.user) {
      response = handleUserFullInfo(params.user);
    }
    // Rota 7: Dados de um streamer específico (?stream={username})
    else if (params.stream) {
      var graphData = findUserInGraphQL(params.stream);
      var streamInfo = fetchStreamInfo(params.stream);
      var posterInfo = fetchPosterInfoFromGAS(params.stream);
      response = ContentService.createTextOutput(JSON.stringify({ user: params.stream, graphData: graphData, streamInfo: streamInfo, posterInfo: posterInfo }, null, 2)).setMimeType(ContentService.MimeType.JSON);
    }
    // Rota 8: Endpoints REST legados (/user/{username}/...)
    else if (path.indexOf('/user/') === 0) {
      var parts = path.split('/').filter(function(x) { return x; });
      var username = parts[1];
      var endpoint = (parts[2] || "").toLowerCase();
      var data;
      if (endpoint === "liveinfo") data = fetchStreamInfo(username);
      else if (endpoint === "info") data = fetchUserProfile(username);
      else {
        var liveInfo = fetchStreamInfo(username);
        data = (liveInfo && (liveInfo.cdnURL || liveInfo.edgeURL)) ? liveInfo : fetchUserProfile(username);
      }
      response = ContentService.createTextOutput(JSON.stringify(data, null, 2)).setMimeType(ContentService.MimeType.JSON);
    }
    // Rota 9: Proxy para lista de tags (?list=tags)
    else if (params.list === 'tags') {
      var GAS_LIST_TAGS_URL = "https://script.google.com/macros/s/AKfycbwpth8ujr2oAy9vVdS3KUnkppgtPmUCGeIviAPAMUSAlFNrp5sd2rfEHm3xhaUkVXQ/exec?list=tags";
      var gasResponse = UrlFetchApp.fetch(GAS_LIST_TAGS_URL, { headers: { accept: "application/json" } });
      var body = gasResponse.getContentText();
      response = ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JSON);
    }
    // Rota 10: Listagem principal de transmissões (/)
    else if (path === '/') {
      var page = parseInt(params.page || "1", 10);
      var limit = parseInt(params.limit || "30", 10);
      var format = params.format || "json";
      var country = params.country;
      var tags = params.tags;
      var gender = params.gender;
      var orientation = params.orientation;
      var broadcastType = params.broadcastType;
      var orderBy = "trending";
      if (params.order) {
        switch (params.order) {
          case "mostViewers": orderBy = "mostViewers"; break;
          case "leastViewers": orderBy = "leastViewers"; break;
          case "youngest": orderBy = "youngest"; break;
          case "oldest": orderBy = "oldest"; break;
          case "recent": orderBy = "recent"; break;
          case "trending": orderBy = "trending"; break;
          default: orderBy = "trending";
        }
      }
      var allItems = fetchAllBroadcasts(orderBy);
      var filteredItems = allItems;
      if (country) {
        var countries = country.split(',').map(function(c) { return c.trim().toLowerCase(); });
        filteredItems = filteredItems.filter(function(item) { return item.country && countries.indexOf(item.country.toLowerCase()) !== -1; });
      }
      if (tags) {
        var requiredTags = tags.split(',').map(function(t) { return t.trim().toLowerCase(); });
        filteredItems = filteredItems.filter(function(item) {
          return item.tags && item.tags.some(function(tag) { return requiredTags.indexOf(tag.slug.toLowerCase()) !== -1; });
        });
      }
      if (gender) {
        var genders = gender.split(',').map(function(g) { return g.trim().toLowerCase(); });
        filteredItems = filteredItems.filter(function(item) { return item.gender && genders.indexOf(item.gender.toLowerCase()) !== -1; });
      }
      if (orientation) {
        var orientations = orientation.split(',').map(function(o) { return o.trim().toLowerCase(); });
        filteredItems = filteredItems.filter(function(item) { return item.sexualOrientation && orientations.indexOf(item.sexualOrientation.toLowerCase()) !== -1; });
      }
      if (broadcastType) {
        var broadcastTypes = broadcastType.split(',').map(function(b) { return b.trim().toLowerCase(); });
        filteredItems = filteredItems.filter(function(item) { return item.broadcastType && broadcastTypes.indexOf(item.broadcastType.toLowerCase()) !== -1; });
      }
      var total = filteredItems.length;
      var totalPages = Math.ceil(total / limit);
      var offset = (page - 1) * limit;
      var itemsForPage = filteredItems.slice(offset, offset + limit).map(function(item, index) {
        var obj = { XCamId: offset + index + 1 };
        for (var k in item) obj[k] = item[k];
        return obj;
      });
      var responseData = {
        broadcasts: {
          total: total,
          page: page,
          totalPages: totalPages,
          items: itemsForPage
        }
      };
      if (format.toLowerCase() === "csv") {
        response = ContentService.createTextOutput(jsonToCsv(filteredItems)).setMimeType(ContentService.MimeType.CSV);
      } else {
        response = ContentService.createTextOutput(JSON.stringify(responseData, null, 2)).setMimeType(ContentService.MimeType.JSON);
      }
    }
    // Fallback
    else {
      response = ContentService.createTextOutput(JSON.stringify({ error: "Endpoint não encontrado." })).setMimeType(ContentService.MimeType.JSON);
    }
    return response;
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: "Erro interno do servidor", details: err.message })).setMimeType(ContentService.MimeType.JSON);
  }
}

// =========================================================================================
// FIM DO CÓDIGO
// =========================================================================================
