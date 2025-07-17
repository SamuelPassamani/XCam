/**
 * =========================================================================================
 * XCam API Worker - index.js
 * =========================================================================================
 *
 * @author      Samuel Passamani / Um Projeto do Estudio A.Sério [AllS Company]
 * @info        https://aserio.work/
 * @version     3.1.0
 * @lastupdate  2025-07-17
 *
 * @description
 * Worker principal da XCam API. Versão final que restaura 100% da funcionalidade
 * do script original, incluindo todas as rotas de proxy, endpoints legados e lógicas
 * de agregação, dentro de uma arquitetura refatorada, segura e organizada.
 *
 * @modes       production
 * =========================================================================================
 */

/* =========================================================================================
 * 2. CONFIGURAÇÕES & VARIÁVEIS GLOBAIS
 * =========================================================================================
 */

const ALLOWED_ORIGINS_PATTERNS = [
  "https://xcam.gay", "https://beta.xcam.gay", "https://player.xcam.gay",
  "https://db.xcam.gay", "https://modal.xcam.gay", "https://live.xcam.gay",
  "https://status.xcam.gay", "https://drive.xcam.gay",
  "https://samuelpassamani.github.io", "https://xcam-app.aserio.workers.dev",
  "https://xcam-api.aserio.workers.dev",
  "https://web-sandbox.oaiusercontent.com", "https://persistent.oaistatic.com",
  "https://openai.com", "https://chatgpt.com",
  "https://codepen.io", "https://cdpn.io",
  "*.netlify.app", "https://playhls.com",
  "*.google.com", "*.usercontent.goog", "*.googleusercontent.com", "*.googlesyndication.com",
  "*.gstatic.com", "*.doubleclick.net"
];

/* =========================================================================================
 * 3. CORPO
 * =========================================================================================
 */

// --- Bloco de Funções de Segurança e Utilitários ---

function getAllowedOrigin(origin) {
  if (!origin || ALLOWED_ORIGINS_PATTERNS.includes(origin)) return origin;
  for (const pattern of ALLOWED_ORIGINS_PATTERNS) {
    if (pattern.startsWith('*.')) {
      const mainDomain = pattern.substring(2);
      const originHostname = new URL(origin).hostname;
      if (originHostname.endsWith(`.${mainDomain}`) || originHostname === mainDomain) return origin;
    }
  }
  return null;
}

function handleOptions(request) {
  const origin = request.headers.get('Origin');
  const allowedOrigin = getAllowedOrigin(origin);
  if (allowedOrigin) {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Vary': 'Origin'
      }
    });
  }
  return new Response(null, { status: 403, headers: { 'Allow': 'GET, POST, OPTIONS' } });
}

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

// --- Bloco de Funções de Requisição a APIs Externas ---

function buildCam4GraphQLBody(offset, limit) {
  return JSON.stringify({
    operationName: "getGenderPreferencePageData",
    variables: { input: { orderBy: "trending", filters: [], gender: "male", cursor: { first: limit, offset } } },
    query: `query getGenderPreferencePageData($input: BroadcastsInput) { broadcasts(input: $input) { total items { id username country sexualOrientation profileImageURL preview { src poster } viewers broadcastType gender tags { name slug } } } }`
  });
}

async function findUserInGraphQL(username) {
  const limit = 300;
  const maxPages = 25;
  let offset = 0;
  for (let page = 0; page < maxPages; page++) {
    const response = await fetch("https://pt.cam4.com/graph?operation=getGenderPreferencePageData&ssr=false", {
      method: "POST",
      headers: { "Content-Type": "application/json", "apollographql-client-name": "CAM4-client" },
      body: buildCam4GraphQLBody(offset, limit)
    });
    if (!response.ok) break;
    const json = await response.json();
    const items = json?.data?.broadcasts?.items || [];
    const foundItem = items.find(item => item.username === username);
    if (foundItem) return foundItem;
    const total = json?.data?.broadcasts?.total || 0;
    offset += limit;
    if (offset >= total || items.length === 0) break;
  }
  return null;
}

async function fetchStreamInfo(username) {
  const apiUrl = `https://pt.cam4.com/rest/v1.0/profile/${username}/streamInfo`;
  const response = await fetch(apiUrl, { headers: { accept: "application/json" } });
  if (!response.ok) return { error: `Erro ao buscar streamInfo para ${username}: ${response.status}` };
  return response.json();
}

async function fetchUserProfile(username) {
  const apiUrl = `https://pt.cam4.com/rest/v1.0/profile/${username}/info`;
  const response = await fetch(apiUrl, { headers: { accept: "application/json" } });
  if (!response.ok) return { error: `Erro ao buscar perfil para ${username}: ${response.status}` };
  return response.json();
}

async function fetchPosterInfoFromGAS(username) {
  const GAS_URL = `https://script.google.com/macros/s/AKfycbyr1M8TYzdRaJpaCbFcnAFGh7JbERDX9EfgOGUCKDZDriGsxudgBLTrmxU3PP4REoOqdA/exec?poster=${encodeURIComponent(username)}`;
  try {
    const response = await fetch(GAS_URL, { redirect: 'follow', headers: { 'accept': 'application/json' } });
    if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
      return response.json();
    }
    return null;
  } catch (error) {
    console.error(`Falha ao buscar poster via GAS para ${username}:`, error);
    return null;
  }
}

// --- Bloco de Handlers de Rota e Proxy ---

async function handleRecProxy(username) {
  const GAS_URL = "https://script.google.com/macros/s/AKfycbyr1M8TYzdRaJpaCbFcnAFGh7JbERDX9EfgOGUCKDZDriGsxudgBLTrmxU3PP4REoOqdA/exec?rec=" + encodeURIComponent(username);
  const response = await fetch(GAS_URL, { redirect: 'follow' });
  const newResponse = new Response(response.body, response);
  newResponse.headers.set('Content-Type', response.headers.get('content-type') || 'application/json');
  return newResponse;
}

async function handlePosterProxy(username) {
    const GAS_URL = "https://script.google.com/macros/s/AKfycbyr1M8TYzdRaJpaCbFcnAFGh7JbERDX9EfgOGUCKDZDriGsxudgBLTrmxU3PP4REoOqdA/exec?poster=" + encodeURIComponent(username);
    const response = await fetch(GAS_URL, { redirect: 'follow' });
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Content-Type', response.headers.get('content-type') || 'application/json');
    return newResponse;
}

async function handleStreamRedirect(username) {
  const streamInfo = await fetchStreamInfo(username);
  const targetUrl = streamInfo.cdnURL || streamInfo.edgeURL;
  if (targetUrl) return Response.redirect(targetUrl, 302);
  return new Response(JSON.stringify({ error: `Nenhuma URL de stream encontrada para ${username}.` }), { status: 404 });
}

async function handleHlsProxy(request, url) {
    const targetUrl = url.searchParams.get("url");
    if (!targetUrl) return new Response("Parâmetro 'url' é obrigatório.", { status: 400 });

    const referer = url.searchParams.get("referer") || "https://pt.cam4.com/";
    const proxyRequest = new Request(targetUrl, {
        headers: { ...Object.fromEntries(request.headers), "Referer": referer },
        method: request.method,
        body: request.body,
        redirect: 'follow'
    });

    const response = await fetch(proxyRequest);
    const newResponse = new Response(response.body, response);
    newResponse.headers.set("Access-Control-Allow-Origin", "*"); // CORS aberto para este proxy específico
    return newResponse;
}

async function handleUserFullInfo(username) {
    const [profile, liveInfo] = await Promise.all([
        fetchUserProfile(username),
        fetchStreamInfo(username)
    ]);
    return new Response(JSON.stringify({ profile, liveInfo }, null, 2), {
        headers: { 'Content-Type': 'application/json' }
    });
}

// --- Ponto de Entrada e Roteador Principal ---

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }

    const url = new URL(request.url);
    const { pathname, searchParams } = url;
    let response;

    try {
      // Rota 1: Proxy para gravações (?rec={username})
      if (searchParams.has('rec')) {
        response = await handleRecProxy(searchParams.get('rec'));
      }
      // Rota 2: Proxy para poster via GAS (?poster={username})
      else if (searchParams.has('poster')) {
        response = await handlePosterProxy(searchParams.get('poster'));
      }
      // Rota 3: Redirecionamento de Stream (/stream/{username}[.m3u8 | /index.m3u8])
      else if (pathname.startsWith('/stream/')) {
        // Extrai a parte do path após '/stream/'
        let usernamePart = pathname.substring('/stream/'.length);

        // Remove sufixos opcionais para isolar o nome de usuário
        if (usernamePart.endsWith('/index.m3u8')) {
          usernamePart = usernamePart.slice(0, -'/index.m3u8'.length);
        } else if (usernamePart.endsWith('.m3u8')) {
          usernamePart = usernamePart.slice(0, -'.m3u8'.length);
        }
        
        // Remove a barra final, se houver
        if (usernamePart.endsWith('/')) {
            usernamePart = usernamePart.slice(0, -1);
        }

        const username = usernamePart;

        // Verifica se o nome de usuário não está vazio após a limpeza
        if (username) {
          response = await handleStreamRedirect(username);
        } else {
          response = new Response(JSON.stringify({ error: "Nome de usuário não especificado na rota." }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
      // Rota 4: Proxy HLS (/hls-proxy?url=...)
      else if (pathname === '/hls-proxy') {
        response = await handleHlsProxy(request, url);
      }
      // Rota 5: Dados agregados de usuário (?user={username})
      else if (searchParams.has('user')) {
        response = await handleUserFullInfo(searchParams.get('user'));
      }
      // Rota 6: Dados de um streamer específico (?stream={username})
      else if (searchParams.has('stream')) {
        const username = searchParams.get('stream');
        const [graphData, streamInfo, posterInfo] = await Promise.all([
          findUserInGraphQL(username),
          fetchStreamInfo(username),
          fetchPosterInfoFromGAS(username)
        ]);
        response = new Response(JSON.stringify({ user: username, graphData, streamInfo, posterInfo }, null, 2), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      // Rota 7: Endpoints REST legados (/user/{username}/...)
      else if (pathname.startsWith('/user/')) {
        const parts = pathname.split('/').filter(Boolean);
        const username = parts[1];
        const endpoint = (parts[2] || "").toLowerCase();
        let data;
        if (endpoint === "liveinfo") data = await fetchStreamInfo(username);
        else if (endpoint === "info") data = await fetchUserProfile(username);
        else {
            const liveInfo = await fetchStreamInfo(username);
            data = (liveInfo && (liveInfo.cdnURL || liveInfo.edgeURL)) ? liveInfo : await fetchUserProfile(username);
        }
        response = new Response(JSON.stringify(data, null, 2), { headers: { 'Content-Type': 'application/json' }});
      }
      // Rota 8: Listagem principal de transmissões (/)
      else if (pathname === '/') {
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "30", 10);
        const format = searchParams.get("format") || "json";
        const offset = (page - 1) * limit;

        const cam4Response = await fetch("https://pt.cam4.com/graph?operation=getGenderPreferencePageData&ssr=false", {
          method: "POST",
          headers: { "Content-Type": "application/json", "apollographql-client-name": "CAM4-client" },
          body: buildCam4GraphQLBody(offset, limit)
        });

        if (!cam4Response.ok) throw new Error("Falha ao comunicar com a API do Cam4");

        const cam4Data = await cam4Response.json();
        const items = (cam4Data.data?.broadcasts?.items || []).map((item, index) => ({ XCamId: offset + index + 1, ...item }));
        const total = cam4Data.data?.broadcasts?.total || 0;
        const totalPages = Math.ceil(total / limit);
        const responseData = { broadcasts: { total, page, totalPages, items } };

        if (format.toLowerCase() === "csv") {
            response = new Response(jsonToCsv(items), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="broadcasts_p${page}.csv"` }});
        } else {
            response = new Response(JSON.stringify(responseData, null, 2), { headers: { 'Content-Type': 'application/json' } });
        }
      }
      // Rota de Fallback
      else {
        response = new Response(JSON.stringify({ error: "Endpoint não encontrado." }), { status: 404, headers: { 'Content-Type': 'application/json' } });
      }

      // Aplica cabeçalhos CORS na resposta final
      const finalResponse = new Response(response.body, response);
      const origin = request.headers.get('Origin');
      const allowedOrigin = getAllowedOrigin(origin);
      if (allowedOrigin) {
        finalResponse.headers.set('Access-Control-Allow-Origin', allowedOrigin);
        finalResponse.headers.set('Vary', 'Origin');
      }
      return finalResponse;

    } catch (err) {
      console.error("Erro fatal no Worker:", err);
      return new Response(JSON.stringify({ error: "Erro interno do servidor", details: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  }
};

/* =========================================================================================
 * 4. RODAPÉ / FIM DO CÓDIGO
 * =========================================================================================
 *
 * @log de mudanças:
 * - v3.1.0 (2025-07-17):
 * - ROTA DE STREAM MELHORADA: A rota `/stream/{username}` agora aceita os sufixos
 * `.m3u8` e `/index.m3u8` para maior compatibilidade com players de vídeo.
 * - v3.0.0 (2025-07-17):
 * - RESTAURAÇÃO COMPLETA: Reintegração de 100% das rotas e lógicas do arquivo
 * original (proxies, CSV, endpoints legados) na nova estrutura organizada.
 * Este passo corrige o erro de remoção indevida de funcionalidades.
 * - v2.1.0 (2025-07-17):
 * - REFATORAÇÃO INICIAL: Código reestruturado em blocos, com CORS melhorado,
 * roteador simplificado e comentários detalhados.
 *
 * @roadmap futuro:
 * - CACHE AVANÇADO: Implementar cache usando KV Storage para respostas de GraphQL.
 * - VALIDAÇÃO DE SCHEMA: Adicionar validação (ex: Zod) para as respostas das APIs.
 * - MONITORAMENTO E LOGS: Integrar um serviço de logging (ex: Logflare).
 *
 * =========================================================================================
 */
