/**
 * =========================================================================================
 * XCam API Worker - index.js
 * =========================================================================================
 * 
 * @author      Samuel Passamani / Um Projeto do Estudio A.Sério [AllS Company]
 * @info        https://aserio.work/
 * @version     1.0.0
 * @lastupdate  2025-06-29
 * 
 * @description
 *   Worker principal da XCam API para Cloudflare Workers.
 *   Fornece roteamento RESTful, proxy seguro de mídia HLS (poster seguro), geração de poster seguro (frame de vídeo HLS),
 *   integração com Google Apps Script, agregação de dados públicos multi-origem e filtragem dinâmica.
 *   Estrutura modular, segura, documentada e pronta para expansão.
 * 
 * @mode        production
 * =========================================================================================
 */

/* =========================================================================================
 * 2. CONFIGURAÇÕES & VARIÁVEIS GLOBAIS
 * =========================================================================================
 */

// Lista de domínios permitidos para CORS dinâmico
const ALLOWED_ORIGINS = [
  "https://xcam.gay", "https://beta.xcam.gay", "https://player.xcam.gay",
  "https://db.xcam.gay", "https://modal.xcam.gay", "https://live.xcam.gay",
  "https://status.xcam.gay", "https://drive.xcam.gay",
  "https://samuelpassamani.github.io", "https://xcam-app.aserio.workers.dev",
  "https://xcam-api.aserio.workers.dev", "https://script.google.com",
  "https://script.googleusercontent.com", "https://web-sandbox.oaiusercontent.com",
  "https://persistent.oaistatic.com", "https://openai.com",
  "https://ab.chatgpt.com", "https://chatgpt.com", "https://cdn.oaistatic.com",
  "https://codepen.io", "https://cdpn.io", "https://cpwebassets.codepen.io",
  "https://netlify.app", "https://xcamgay.netlify.app", "https://xcam-modal.netlify.app",
  "https://xcam-db.netlify.app", "https://xcam-drive.netlify.app",
  "https://xcam-status.netlify.app", "https://xcam-player.netlify.app",
  "https://xcam-beta.netlify.app", "https://playhls.com"
];

// =========================================================================================
// 3. CORPO: FUNÇÕES UTILITÁRIAS, HANDLERS E EXECUÇÃO PRINCIPAL
// =========================================================================================

/**
 * Função utilitária para gerar headers dinâmicos de CORS de acordo com o Origin da requisição.
 * Só permite acesso de domínios autorizados.
 */
function getCorsHeaders(origin) {
  const headers = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
  if (ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

/**
 * Converte um array de objetos em CSV para exportação.
 * Retorna string vazia se array for vazio.
 */
function jsonToCsv(items) {
  if (!items || items.length === 0) return "";
  const headers = Object.keys(items[0]);
  const csvRows = items.map(item =>
    headers.map(h => {
      let val = item[h];
      if (val == null) val = "";
      else if (typeof val === "string" && (val.includes(",") || val.includes('"'))) {
        val = `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(",")
  );
  return [headers.join(","), ...csvRows].join("\n");
}

/**
 * Monta o payload para consulta GraphQL de transmissões públicas do Cam4.
 */
function buildCam4Body(offset, limit) {
  return JSON.stringify({
    operationName: "getGenderPreferencePageData",
    variables: {
      input: {
        orderBy: "trending",
        filters: [],
        gender: "male",
        cursor: { first: limit, offset }
      }
    },
    query: `
      query getGenderPreferencePageData($input: BroadcastsInput) {
        broadcasts(input: $input) {
          total
          items {
            id
            username
            country
            sexualOrientation
            profileImageURL
            preview { src poster }
            viewers
            broadcastType
            gender
            tags { name slug }
          }
        }
      }
    `
  });
}

/**
 * Busca por um usuário na listagem do GraphQL, paginando até encontrá-lo ou esgotar o total.
 * Garante que 'graphData' nunca é null para usuários realmente online na plataforma.
 */
async function findUserGraphData(username, limit = 300, maxPages = 25) {
  let offset = 0;
  for (let page = 0; page < maxPages; page++) {
    const res = await fetch("https://pt.cam4.com/graph?operation=getGenderPreferencePageData&ssr=false", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "apollographql-client-name": "CAM4-client",
        "apollographql-client-version": "25.5.15-113220utc"
      },
      body: buildCam4Body(offset, limit)
    });
    if (!res.ok) break;
    const json = await res.json();
    const items = json?.data?.broadcasts?.items || [];
    const foundItem = items.find(item => item.username === username);
    if (foundItem) return foundItem;
    const total = json?.data?.broadcasts?.total || 0;
    offset += limit;
    if (offset >= total || items.length === 0) break;
  }
  return null;
}

/**
 * Busca informações públicas de perfil do usuário via REST CAM4.
 */
async function handleUserProfile(username) {
  const apiUrl = `https://pt.cam4.com/rest/v1.0/profile/${username}/info`;
  try {
    const response = await fetch(apiUrl, {
      headers: {
        accept: "application/json, text/plain, */*",
        referer: `https://pt.cam4.com/${username}`
      }
    });
    if (!response.ok) throw new Error(`Erro CAM4 Profile: ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error(`Falha ao buscar perfil para ${username}:`, err.message);
    return { error: "Falha ao buscar perfil", details: err.message };
  }
}

/**
 * Busca informações da transmissão ao vivo do usuário via REST CAM4.
 * Usado em endpoints REST legados como /user/{username}/liveInfo.
 */
async function handleLiveInfo(username) {
  const apiUrl = `https://pt.cam4.com/rest/v1.0/profile/${username}/streamInfo`;
  try {
    const response = await fetch(apiUrl, {
      headers: {
        accept: "application/json, text/plain, */*",
        referer: `https://pt.cam4.com/${username}`
      }
    });
    if (!response.ok) throw new Error(`Erro CAM4 StreamInfo: ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error(`Falha ao buscar streamInfo para ${username}:`, err.message);
    return { error: "Falha ao buscar streamInfo", details: err.message };
  }
}

/**
 * Busca dados GraphQL, liveInfo e profileInfo do usuário e retorna tudo junto.
 * Usado para ?user={username}
 */
async function handleUserFullInfo(user, corsHeaders) {
  const limit = 300;
  const graphData = await findUserGraphData(user, limit, 25);
  const [streamInfo, profileInfo] = await Promise.all([
    handleLiveInfo(user),
    handleUserProfile(user)
  ]);
  return new Response(JSON.stringify({
    user,
    graphData,
    streamInfo,
    profileInfo
  }, null, 2), {
    headers: { "Cache-Control": "no-store", ...corsHeaders, "Content-Type": "application/json" }
  });
}

/**
 * Encaminha requisição para um Google Apps Script que retorna gravações do usuário.
 */
async function handleRecProxy(username, corsHeaders) {
  const GAS_URL = "https://script.google.com/macros/s/AKfycbyr1M8TYzdRaJpaCbFcnAFGh7JbERDX9EfgOGUCKDZDriGsxudgBLTrmxU3PP4REoOqdA/exec?rec=" + encodeURIComponent(username);
  try {
    const response = await fetch(GAS_URL, {
      redirect: 'follow',
      headers: { 'accept': 'application/json' }
    });
    const contentType = response.headers.get('content-type') || 'text/plain';
    const body = await response.text();
    return new Response(body, {
      status: response.status,
      headers: { ...corsHeaders, "Content-Type": contentType, "Cache-Control": "no-store" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Falha ao consultar rec.json via GAS", details: String(err) }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

/**
 * Faz requisição ao GAS com ?poster={username} e retorna o JSON.
 */
async function handlePosterProxy(username, corsHeaders) {
  const GAS_URL = "https://script.google.com/macros/s/AKfycbyr1M8TYzdRaJpaCbFcnAFGh7JbERDX9EfgOGUCKDZDriGsxudgBLTrmxU3PP4REoOqdA/exec?poster=" + encodeURIComponent(username);
  try {
    const response = await fetch(GAS_URL, {
      redirect: 'follow',
      headers: { 'accept': 'application/json' }
    });
    const contentType = response.headers.get('content-type') || 'text/plain';
    const body = await response.text();
    return new Response(body, {
      status: response.status,
      headers: { ...corsHeaders, "Content-Type": contentType, "Cache-Control": "no-store" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Falha ao consultar poster via GAS", details: String(err) }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

/**
 * Proxy de redirecionamento seguro (302) para o HLS do usuário, preservando Referer.
 * Usado para players que não precisam acessar o conteúdo do vídeo via JavaScript.
 */
async function handleStreamProxy(username, type) {
  if (!username) {
    return new Response('Nome de usuário não especificado.', { status: 400 });
  }
  const streamInfo = await handleLiveInfo(username);
  if (streamInfo.error) {
    return new Response(JSON.stringify(streamInfo), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  let targetUrl;
  if (type === 'cdn' && streamInfo.cdnURL) {
    targetUrl = streamInfo.cdnURL;
  } else if (type === 'edge' && streamInfo.edgeURL) {
    targetUrl = streamInfo.edgeURL;
  } else {
    targetUrl = streamInfo.cdnURL || streamInfo.edgeURL;
  }
  if (!targetUrl) {
    return new Response(`Nenhuma URL de stream encontrada para o usuário ${username}.`, { status: 404 });
  }
  return Response.redirect(targetUrl, 302);
}

/**
 * Busca o primeiro segmento de mídia em um manifesto HLS, seguindo sub-playlists recursivamente.
 */
async function findFirstMediaSegment(m3u8Url, username, maxDepth = 8) {
  if (maxDepth < 0) return null;
  const res = await fetch(m3u8Url, { headers: { referer: `https://pt.cam4.com/${username}` } });
  if (!res.ok) return null;
  const text = await res.text();
  const lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));

  // Procura segmento de mídia comum (ts, aac, m4s, mp4)
  const seg = lines.find(l => /\.(ts|aac|m4s|mp4)(\?|$)/i.test(l));
  if (seg) {
    if (/^https?:\/\//.test(seg)) return seg;
    return new URL(seg, m3u8Url).href;
  }

  // Procura todas as sub-playlists .m3u8
  const subplaylists = lines.filter(l => l.endsWith('.m3u8'));
  for (const subplaylist of subplaylists) {
    const nextUrl = /^https?:\/\//.test(subplaylist) ? subplaylist : new URL(subplaylist, m3u8Url).href;
    const found = await findFirstMediaSegment(nextUrl, username, maxDepth - 1);
    if (found) return found;
  }

  return null;
}

// Cache simples em memória para streamInfo (usado para poster seguro)
const XCamApiCache = {};
function cacheGet(key) {
  const entry = XCamApiCache[key];
  if (entry && entry.expires > Date.now()) {
    return entry.value;
  }
  return null;
}
function cacheSet(key, value, ttlMs = 10000) {
  XCamApiCache[key] = {
    value,
    expires: Date.now() + ttlMs
  };
}

/**
 * Busca streamInfo pela própria XCam API (com cache).
 */
async function fetchStreamInfoFromXCam(username, ttlMs = 10000) {
  const cacheKey = `streaminfo:${username}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;
  const apiUrl = `https://api.xcam.gay/?stream=${encodeURIComponent(username)}`;
  try {
    const res = await fetch(apiUrl, { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`Erro XCamAPI stream: ${res.status}`);
    const data = await res.json();
    if (data && typeof data === "object" && "streamInfo" in data) {
      cacheSet(cacheKey, data.streamInfo, ttlMs);
      return data.streamInfo;
    }
    throw new Error("Formato inesperado da resposta da XCam API");
  } catch (err) {
    return { error: "Falha ao buscar streamInfo XCam", details: err.message };
  }
}

/**
 * Busca o manifesto HLS do usuário usando a própria XCam API (?stream=), encontra o primeiro segmento de mídia suportado,
 * faz proxy com CORS universal para uso como poster em <canvas>.
 */
async function handlePosterSegmentProxy(username) {
  // Busca streamInfo pela própria XCam API (com cache)
  const streamInfo = await fetchStreamInfoFromXCam(username, 10000);
  if (!streamInfo || streamInfo.error) {
    return new Response(JSON.stringify({ error: "Usuário offline ou sem stream." }), {
      status: 404,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }

  // Coleta possíveis URLs de HLS (edge e cdn)
  const hlsUrls = [];
  if (streamInfo.edgeURL) hlsUrls.push({ url: streamInfo.edgeURL, type: "edge" });
  if (streamInfo.cdnURL) hlsUrls.push({ url: streamInfo.cdnURL, type: "cdn" });

  if (hlsUrls.length === 0) {
    return new Response(JSON.stringify({ error: "Nenhum URL de stream encontrada." }), {
      status: 404,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }

  let foundSegment = null;
  let segmentUrl, lastError;

  // Tenta cada HLS até encontrar um segmento válido
  for (const { url: hlsUrl, type } of hlsUrls) {
    try {
      segmentUrl = await findFirstMediaSegment(hlsUrl, username, 8);
      if (segmentUrl) {
        foundSegment = { segmentUrl, hlsUrl, type };
        break;
      }
    } catch (err) {
      lastError = err;
    }
  }

  if (!foundSegment) {
    return new Response(JSON.stringify({ error: "Nenhum segmento de mídia encontrado no manifesto HLS." }), {
      status: 404,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }

  // Busca e retransmite o segmento com CORS universal
  const segRes = await fetch(foundSegment.segmentUrl, {
    headers: { referer: `https://pt.cam4.com/${username}` }
  });
  if (!segRes.ok) {
    return new Response(JSON.stringify({ error: "Falha ao buscar segmento de mídia." }), {
      status: 502,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }

  // Detecta tipo mime pelo final do arquivo
  let mime = "video/MP2T";
  if (foundSegment.segmentUrl.endsWith('.aac')) mime = "audio/aac";
  if (foundSegment.segmentUrl.endsWith('.m4s')) mime = "video/iso.segment";
  if (foundSegment.segmentUrl.endsWith('.mp4')) mime = "video/mp4";
  return new Response(segRes.body, {
    status: 200,
    headers: {
      "Content-Type": mime,
      "Content-Disposition": "inline; filename=\"poster" + foundSegment.segmentUrl.slice(-8) + "\"",
      "Access-Control-Allow-Origin": "*"
    }
  });
}

/**
 * Proxy reverso universal para HLS (playlist/fragmento).
 * Endpoint: /hls-proxy?url={URL_ENCODED}
 * Permite proxy de qualquer arquivo HLS (.m3u8, .ts, etc) com CORS universal.
 */
async function handleHlsProxy(request, url) {
  const targetUrl = url.searchParams.get("url");
  if (!/^https?:\/\/.+/.test(targetUrl)) {
    return new Response(JSON.stringify({ error: "URL inválida para proxy HLS." }), {
      status: 400,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" }
    });
  }
  try {
    const proxied = await fetch(targetUrl, {
      headers: { referer: "https://pt.cam4.com/" }
    });
    // Copia todos os headers relevantes, mas sobrescreve CORS
    const headers = new Headers(proxied.headers);
    headers.set("Access-Control-Allow-Origin", "*");
    // Remove headers que podem causar problemas
    headers.delete("content-security-policy");
    headers.delete("x-frame-options");
    return new Response(proxied.body, {
      status: proxied.status,
      headers
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Falha ao fazer proxy HLS", details: String(err) }), {
      status: 502,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" }
    });
  }
}

/**
 * Função principal do Worker: roteia requisições, executa filtros, trata erros.
 * Ordem de prioridade das rotas:
 * 1. Poster seguro (proxy mídia HLS)
 * 2. Proxy de stream (redirecionamento)
 * 3. Proxy gravações via GAS
 * 4. Proxy para poster via GAS
 * 5. Proxy reverso universal para HLS
 * 6. Listagem pública de transmissões (?stream=0)
 * 7. Dados resumidos de stream (?stream={username})
 * 8. Dados agregados do usuário (?user=)
 * 9. Endpoints REST legados
 * 10. Listagem pública de transmissões (com filtros avançados)
 * 11. Fallback 404
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const corsHeaders = getCorsHeaders(origin);
    const pathname = url.pathname;

    // Pré-tratamento CORS para OPTIONS
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      // 1. Poster seguro (proxy para segmento de mídia HLS)
      if (pathname.match(/^\/v1\/media\/poster\/([a-zA-Z0-9_]+)\/?$/) && request.method === "GET") {
        const username = pathname.match(/^\/v1\/media\/poster\/([a-zA-Z0-9_]+)\/?$/)[1];
        return await handlePosterSegmentProxy(username);
      }

      // 2. Proxy de stream (redirecionamento 302)
      const streamMatch = pathname.match(/^\/stream\/([a-zA-Z0-9_]+)\/?$/);
      if (streamMatch) {
        const username = streamMatch[1];
        const type = url.searchParams.get('type') || 'cdn';
        return await handleStreamProxy(username, type);
      }

      // 3. Proxy gravações via GAS
      const recParam = url.searchParams.get("rec");
      if (recParam) {
        return await handleRecProxy(recParam, corsHeaders);
      }

      // 4. Proxy para poster via GAS
      const posterParam = url.searchParams.get("poster");
      if (posterParam) {
        return await handlePosterProxy(posterParam, corsHeaders);
      }

      // 5. Proxy reverso universal para HLS (playlist/fragmento)
      if (pathname === "/hls-proxy" && url.searchParams.has("url")) {
        return await handleHlsProxy(request, url);
      }

      // 6. Listagem de transmissões com stream=0 e limit
      if (url.searchParams.get("stream") === "0") {
        const cacheKey = new Request(request.url, request);
        const cache = caches.default;
        let response = await cache.match(cacheKey);

        if (!response) {
          const limitParam = url.searchParams.get("limit");
          let limit = parseInt(limitParam, 10);
          const MAX_SAFE = 25; // Limite máximo seguro para evitar sobrecarga
          if (!limitParam || isNaN(limit) || limit < 1) {
            response = new Response(JSON.stringify({ error: "Parâmetro 'limit' obrigatório e deve ser um número maior que 0." }), {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
            return response;
          }
          if (limit > MAX_SAFE) limit = MAX_SAFE;
          const fetchLimit = Math.min(limit, 100); 

          const firstRes = await fetch("https://pt.cam4.com/graph?operation=getGenderPreferencePageData&ssr=false", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "apollographql-client-name": "CAM4-client",
              "apollographql-client-version": "25.5.15-113220utc"
            },
            body: buildCam4Body(0, fetchLimit)
          });

          if (!firstRes.ok) {
            response = new Response(JSON.stringify({ error: "Erro ao buscar transmissões públicas." }), {
              status: 502,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
            return response;
          }

          const firstJson = await firstRes.json();
          const items = firstJson?.data?.broadcasts?.items?.slice(0, fetchLimit) || [];

          // Para cada usuário, busca graphData e streamInfo
          const results = await Promise.all(items.map(async (item) => {
            const username = item.username;
            const [graphData, streamInfo] = await Promise.all([
              findUserGraphData(username, 300, 25), 
              handleLiveInfo(username)
            ]);
            return { username, graphData, streamInfo };
          }));

          response = new Response(JSON.stringify({ total: results.length, items: results }, null, 2), {
            headers: { "Cache-Control": "public, max-age=90", ...corsHeaders, "Content-Type": "application/json" } 
          });

          // Armazena no cache por 30 segundos
          await cache.put(cacheKey, response.clone());
        }
        return response;
      }

      // 7. Dados resumidos de stream (?stream={username})
      const streamParam = url.searchParams.get("stream");
      if (streamParam) {
        const user = streamParam;
        const limit = 300;
        // Busca paginada para garantir consistência!
        const graphData = await findUserGraphData(user, limit, 25); 
        const streamInfo = await handleLiveInfo(user);

        return new Response(JSON.stringify({
          user,
          graphData,
          streamInfo
        }, null, 2), {
          headers: { "Cache-Control": "no-store", ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // 8. Dados agregados do usuário (?user=)
      const userParam = url.searchParams.get("user");
      if (userParam) {
        return await handleUserFullInfo(userParam, corsHeaders);
      }

      // 9. Endpoints REST legados (/user/{username}/...)
      if (pathname.startsWith("/user/")) {
        const parts = pathname.split("/").filter(Boolean);
        const username = parts[1];
        const endpoint = (parts[2] || "").toLowerCase();

        if (endpoint === "liveinfo") {
          // Sempre retorna streamInfo
          const data = await handleLiveInfo(username);
          return new Response(JSON.stringify(data, null, 2), {
            headers: { "Cache-Control": "no-store", ...corsHeaders, "Content-Type": "application/json" }
          });
        } else if (endpoint === "info") {
          // Retorna profile info
          const data = await handleUserProfile(username);
          return new Response(JSON.stringify(data, null, 2), {
            headers: { "Cache-Control": "no-store", ...corsHeaders, "Content-Type": "application/json" }
          });
        } else if (!endpoint) {
          // Se não houver endpoint (apenas /user/{username}), tenta liveInfo primeiro
          const liveInfo = await handleLiveInfo(username);
          // Se liveInfo não retornar dados válidos (ex: usuário offline), retorna profile
          if (liveInfo && !liveInfo.error && (liveInfo.cdnURL || liveInfo.edgeURL)) {
            return new Response(JSON.stringify(liveInfo, null, 2), {
              headers: { "Cache-Control": "no-store", ...corsHeaders, "Content-Type": "application/json" }
            });
          } else {
            const profile = await handleUserProfile(username);
            return new Response(JSON.stringify(profile, null, 2), {
              headers: { "Cache-Control": "no-store", ...corsHeaders, "Content-Type": "application/json" }
            });
          }
        } else {
          // Se não for liveinfo nem info, retorna erro explícito
          return new Response(JSON.stringify({ error: "Endpoint não suportado em /user/" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
      }

      // 10. Listagem pública de transmissões (com filtros avançados)
      if (pathname === '/') {
        const format = url.searchParams.get("format") || "json";
        const pageNumber = parseInt(url.searchParams.get("page") || "1", 10) || 1;
        const pageSize = parseInt(url.searchParams.get("limit") || "30", 10);
        const genderFilter = url.searchParams.get("gender");
        const countryFilter = url.searchParams.get("country");
        const orientationFilter = url.searchParams.get("orientation");
        const tagsFilter = url.searchParams.get("tags")?.split(",").map(t => t.trim().toLowerCase()) || [];

        const limit = 300;
        const firstRes = await fetch("https://pt.cam4.com/graph?operation=getGenderPreferencePageData&ssr=false", {
          method: "POST",
          headers: { "content-type": "application/json", "apollographql-client-name": "CAM4-client", "apollographql-client-version": "25.5.15-113220utc" },
          body: buildCam4Body(0, limit)
        });

        if (!firstRes.ok) throw new Error(`Erro inicial CAM4: ${firstRes.status}`);
        const firstJson = await firstRes.json();
        const total = firstJson?.data?.broadcasts?.total || 0;
        const firstItems = firstJson?.data?.broadcasts?.items || [];

        // Busca lotes extras para paginação/local
        const fetchTasks = [];
        for (let offset = limit; offset < total && offset < 5000; offset += limit) {
          fetchTasks.push(fetch("https://pt.cam4.com/graph?operation=getGenderPreferencePageData&ssr=false", {
            method: "POST",
            headers: { "content-type": "application/json", "apollographql-client-name": "CAM4-client", "apollographql-client-version": "25.5.15-113220utc" },
            body: buildCam4Body(offset, limit)
          }).then(r => r.ok ? r.json() : Promise.resolve({ data: { broadcasts: { items: [] } } })));
        }

        const results = await Promise.all(fetchTasks);
        let allItems = results.flatMap(r => r?.data?.broadcasts?.items || []).concat(firstItems);

        // Ordena por viewers e adiciona XCamId incremental
        const sortedItems = allItems.sort((a, b) => (b.viewers || 0) - (a.viewers || 0)).map((item, index) => ({ XCamId: index + 1, ...item }));

        // Filtros avançados
        let filteredItems = sortedItems;
        if (genderFilter) filteredItems = filteredItems.filter(b => b.gender === genderFilter);
        if (countryFilter) filteredItems = filteredItems.filter(b => b.country?.toLowerCase() === countryFilter.toLowerCase());
        if (orientationFilter) filteredItems = filteredItems.filter(b => b.sexualOrientation?.toLowerCase() === orientationFilter.toLowerCase());
        if (tagsFilter.length > 0) filteredItems = filteredItems.filter(b => b.tags && b.tags.some(tag => tagsFilter.includes(tag.slug?.toLowerCase())));

        const totalFiltered = filteredItems.length;
        const totalPages = Math.ceil(totalFiltered / pageSize);
        const pagedItems = filteredItems.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

        const responseData = { broadcasts: { total: totalFiltered, page: pageNumber, totalPages, items: pagedItems } };

        if (format.toLowerCase() === "csv") {
          return new Response(jsonToCsv(pagedItems), {
            headers: { ...corsHeaders, "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="broadcasts_page${pageNumber}.csv"` }
          });
        }

        return new Response(JSON.stringify(responseData, null, 2), {
          headers: { "Cache-Control": "no-store", ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // 11. Fallback: Endpoint não encontrado
      return new Response(JSON.stringify({ error: "Endpoint não encontrado." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });

    } catch (err) {
      // Tratamento de erro global
      console.error("Erro fatal no Worker:", err);
      return new Response(JSON.stringify({ error: "Erro interno do servidor", details: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
};

/* =========================================================================================
 * 4. RODAPÉ / FIM DO CÓDIGO
 * =========================================================================================
 * 
 * @log de mudanças:
 * - 2025-06-29: Refatoração completa do arquivo seguindo padrão XCam/Estudio A.Sério.
 * - 2025-06-29: Adicionado proxy reverso universal para HLS (/hls-proxy).
 * - 2025-06-20: Modularização e comentários detalhados.
 * 
 * @roadmap futuro:
 * - Adicionar autenticação JWT para rotas privadas.
 * - Implementar cache distribuído para dados de transmissões.
 * - Suporte a WebSocket para notificações em tempo real.
 * - Integração com outros provedores de streaming.
 * 
 * =========================================================================================
 * Fim do arquivo: xcam-api/index.js
 * 
 * Observações e recomendações:
 * - Este Worker serve como gateway seguro XCam, centralizando lógica de proxy,
 *   agregação de dados externos, roteamento RESTful, cache, e aplicando boas práticas
 *   de arquitetura serverless, facilitando manutenções e futuras extensões.
 * - Funções, filtros e lógica de segurança estão comentados e organizados por bloco.
 * - Para dúvidas, consulte a documentação Gemini/XCam ou contate o autor.
 * =========================================================================================
 */