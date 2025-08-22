/**
 * =========================================================================================
 * XCam API Worker - index.js
 * =========================================================================================
 *
 * @author      Samuel Passamani / Um Projeto do Estudio A.Sério [AllS Company]
 * @info        https://aserio.work/
 * @version     3.6.0
 * @lastupdate  2025-07-30
 *
 * @description
 * Worker principal da XCam API. Esta versão implementa a busca completa de broadcasts
 * para permitir a filtragem de dados com totais corretos, adiciona suporte a
 * múltiplos valores em filtros (country, tags, gender, etc.) e uma nova rota de
 * proxy para imagens de poster.
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
  "https://status.xcam.gay", "https://drive.xcam.gay", "https://api.xcam.gay/",
  "https://samuelpassamani.github.io", "https://xcam-app.aserio.workers.dev",
  "https://xcam-api.aserio.workers.dev", "http://127.0.0.1:5500",
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

// Função para resposta de erro com vídeo em tela cheia
function errorVideoResponse() {
  const html = `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
      <meta charset="UTF-8">
      <title>Acesso Negado</title>
      <style>
        html, body {
          height: 100%;
          width: 100%;
          margin: 0;
          padding: 0;
          background: #000;
          overflow: hidden;
        }
        body {
          width: 100vw;
          height: 100vh;
          overflow: hidden;
        }
        video {
          position: fixed;
          top: 0; left: 0;
          width: 100vw;
          height: 100vh;
          object-fit: cover;
          background: #000;
          border: none;
          margin: 0;
          padding: 0;
          z-index: 9999;
          aspect-ratio: 16/9;
        }
      </style>
    </head>
    <body>
      <video src="https://i.imgur.com/fwRPZmQ.mp4" autoplay loop muted playsinline></video>
    </body>
    </html>
  `;
  return new Response(html, {
    status: 403,
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}

// --- Bloco de Funções de Requisição a APIs Externas ---

function buildCam4GraphQLBody(offset, limit) {
  return JSON.stringify({
    operationName: "getGenderPreferencePageData",
    variables: { input: { orderBy: "trending", filters: [], gender: "male", cursor: { first: limit, offset } } },
    query: `query getGenderPreferencePageData($input: BroadcastsInput) { broadcasts(input: $input) { total items { id username country sexualOrientation profileImageURL preview { src poster } viewers broadcastType gender tags { name slug } } } }`
  });
}

/**
 * Busca TODOS os broadcasts disponíveis na API do Cam4, descobrindo o total
 * na primeira chamada e continuando a buscar em páginas até atingir esse total.
 * @returns {Promise<Array>} - Uma promessa que resolve para um array com todos os broadcasts.
 */
async function fetchAllBroadcasts() {
    const allItems = [];
    let offset = 0;
    const apiPageLimit = 300; // Limite máximo de itens por chamada da API do Cam4
    let totalDiscovered = 0;

    // Faz a primeira chamada para descobrir o total
    const firstResponse = await fetch("https://pt.cam4.com/graph?operation=getGenderPreferencePageData&ssr=false", {
        method: "POST",
        headers: { "Content-Type": "application/json", "apollographql-client-name": "CAM4-client" },
        body: buildCam4GraphQLBody(0, apiPageLimit)
    });

    if (!firstResponse.ok) {
        console.error("Falha ao realizar a primeira busca na API do Cam4.");
        return []; // Retorna vazio se a primeira chamada falhar
    }

    const firstData = await firstResponse.json();
    totalDiscovered = firstData.data?.broadcasts?.total || 0;
    const firstItems = firstData.data?.broadcasts?.items || [];
    
    if (firstItems.length > 0) {
        allItems.push(...firstItems);
    }

    // Se o total descoberto for maior que o que já buscamos, continua buscando o restante
    offset += firstItems.length;
    while (offset < totalDiscovered) {
        const response = await fetch("https://pt.cam4.com/graph?operation=getGenderPreferencePageData&ssr=false", {
            method: "POST",
            headers: { "Content-Type": "application/json", "apollographql-client-name": "CAM4-client" },
            body: buildCam4GraphQLBody(offset, apiPageLimit)
        });

        if (!response.ok) {
            console.error(`Falha ao buscar broadcasts com offset ${offset}.`);
            break; // Interrompe se uma chamada intermediária falhar
        }

        const data = await response.json();
        const items = data.data?.broadcasts?.items || [];

        if (items.length === 0) {
            break; // Para se a API retornar uma página vazia inesperadamente
        }

        allItems.push(...items);
        offset += items.length;
    }

    return allItems;
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

async function handlePosterImageProxy(pathname) {
    const username = pathname.substring('/poster/'.length).replace('.jpg', '');
    if (!username) {
        return new Response("Nome de usuário inválido no path.", { status: 400 });
    }
    const targetUrl = `https://snapshots.xcdnpro.com/thumbnails/${username}`;
    const imageResponse = await fetch(targetUrl, { headers: { "Referer": "https://xcam.gay/" } });
    const newResponse = new Response(imageResponse.body, imageResponse);
    newResponse.headers.set('Content-Type', imageResponse.headers.get('content-type') || 'image/jpeg');
    newResponse.headers.set('Cache-Control', 'public, max-age=3600');
    return newResponse;
}

async function handleGifProxy(pathname) {
    const username = pathname.substring('/gif/'.length).replace('.gif', '');
    if (!username) {
        return new Response("Nome de usuário inválido no path.", { status: 400 });
    }
    const targetUrl = `https://cdn.xcam.gay/10:/XCam/Conte%C3%BAdo%20Social/XCam%20Social%20M%C3%ADdias/XCam%20GIFs/${username}.gif`;
    const gifResponse = await fetch(targetUrl, { headers: { "Referer": "https://xcam.gay/" } });
    const newResponse = new Response(gifResponse.body, gifResponse);
    newResponse.headers.set('Content-Type', gifResponse.headers.get('content-type') || 'image/gif');
    newResponse.headers.set('Cache-Control', 'public, max-age=3600');
    return newResponse;
}

async function handleProfileImageProxy(pathname) {
    const username = pathname.substring('/profile/'.length).replace('.jpg', '');
    if (!username) {
        return new Response("Nome de usuário inválido no path.", { status: 400 });
    }
    const profile = await fetchUserProfile(username);
    const url = profile.profileImageUrl || profile.profileImageURL;
    if (!url) {
        return new Response("Imagem de perfil não encontrada.", { status: 404 });
    }
    const imgResponse = await fetch(url);
    const newResponse = new Response(imgResponse.body, imgResponse);
    newResponse.headers.set('Content-Type', imgResponse.headers.get('content-type') || 'image/jpeg');
    newResponse.headers.set('Cache-Control', 'public, max-age=3600');
    return newResponse;
}

async function handleAvatarImageProxy(pathname) {
    const username = pathname.substring('/avatar/'.length).replace('.jpg', '');
    if (!username) {
        return new Response("Nome de usuário inválido no path.", { status: 400 });
    }
    const profile = await fetchUserProfile(username);
    const url = profile.avatarUrl;
    if (!url) {
        return new Response("Avatar não encontrado.", { status: 404 });
    }
    const imgResponse = await fetch(url);
    const newResponse = new Response(imgResponse.body, imgResponse);
    newResponse.headers.set('Content-Type', imgResponse.headers.get('content-type') || 'image/jpeg');
    newResponse.headers.set('Cache-Control', 'public, max-age=3600');
    return newResponse;
}

async function handleBannerImageProxy(pathname) {
    const username = pathname.substring('/banner/'.length).replace('.jpg', '');
    if (!username) {
        return new Response("Nome de usuário inválido no path.", { status: 400 });
    }
    const profile = await fetchUserProfile(username);
    const url = profile.bannerUrl;
    if (!url) {
        return new Response("Banner não encontrado.", { status: 404 });
    }
    const imgResponse = await fetch(url);
    const newResponse = new Response(imgResponse.body, imgResponse);
    newResponse.headers.set('Content-Type', imgResponse.headers.get('content-type') || 'image/jpeg');
    newResponse.headers.set('Cache-Control', 'public, max-age=3600');
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
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const allowedOrigin = getAllowedOrigin(origin);
    const { pathname } = url;

    // EXCEÇÃO: Libera acesso público para poster, gif, profile, avatar e banner imagens
    if (
      !(
        (pathname.startsWith('/poster/') && pathname.endsWith('.jpg')) ||
        (pathname.startsWith('/gif/') && pathname.endsWith('.gif')) ||
        (pathname.startsWith('/profile/') && pathname.endsWith('.jpg')) ||
        (pathname.startsWith('/avatar/') && pathname.endsWith('.jpg')) ||
        (pathname.startsWith('/banner/') && pathname.endsWith('.jpg'))
      )
    ) {
      // Se não for origin permitido, exige key válida
      if (!allowedOrigin) {
        const keyParam = url.searchParams.get('key');
        if (!keyParam || !env || !env.key || keyParam !== env.key) {
          return errorVideoResponse();
        }
      }
    }

    const { searchParams } = url;
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
      // Rota 3: Proxy de imagem para poster (/poster/{username}.jpg)
      else if (pathname.startsWith('/poster/') && pathname.endsWith('.jpg')) {
        response = await handlePosterImageProxy(pathname);
      }
      // Rota 3b: Proxy de GIF (/gif/{username}.gif)
      else if (pathname.startsWith('/gif/') && pathname.endsWith('.gif')) {
        response = await handleGifProxy(pathname);
      }
      // Rota 3c: Proxy de imagem de perfil (/profile/{username}.jpg)
      else if (pathname.startsWith('/profile/') && pathname.endsWith('.jpg')) {
        response = await handleProfileImageProxy(pathname);
      }
      // Rota 3d: Proxy de avatar (/avatar/{username}.jpg)
      else if (pathname.startsWith('/avatar/') && pathname.endsWith('.jpg')) {
        response = await handleAvatarImageProxy(pathname);
      }
      // Rota 3e: Proxy de banner (/banner/{username}.jpg)
      else if (pathname.startsWith('/banner/') && pathname.endsWith('.jpg')) {
        response = await handleBannerImageProxy(pathname);
      }
      // Rota 4: Redirecionamento de Stream (/stream/{username}[.m3u8 | /index.m3u8])
      else if (pathname.startsWith('/stream/')) {
        // Permite acesso se key estiver presente na URL ou no header
        const keyParam = url.searchParams.get('key') || request.headers.get('key');
        if (!keyParam || !env || !env.key || keyParam !== env.key) {
          return errorVideoResponse();
        }
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
      // Rota 5: Proxy HLS (/hls-proxy?url=...)
      else if (pathname === '/hls-proxy') {
        response = await handleHlsProxy(request, url);
      }
      // Rota 6: Dados agregados de usuário (?user={username})
      else if (searchParams.has('user')) {
        response = await handleUserFullInfo(searchParams.get('user'));
      }
      // Rota 7: Dados de um streamer específico (?stream={username})
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
      // Rota 8: Endpoints REST legados (/user/{username}/...)
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
      // Rota 9: Proxy para lista de tags (?list=tags)
      else if (searchParams.get('list') === 'tags') {
        // Proxy para a URL do GAS
        const GAS_LIST_TAGS_URL = "https://script.google.com/macros/s/AKfycbwpth8ujr2oAy9vVdS3KUnkppgtPmUCGeIviAPAMUSAlFNrp5sd2rfEHm3xhaUkVXQ/exec?list=tags";
        const gasResponse = await fetch(GAS_LIST_TAGS_URL, { headers: { accept: "application/json" } });
        const body = await gasResponse.text();
        response = new Response(body, {
          status: gasResponse.status,
          headers: {
            'Content-Type': gasResponse.headers.get('content-type') || 'application/json'
          }
        });
      }
      // Rota 10: Listagem principal de transmissões (/)
      else if (pathname === '/') {
        // Parâmetros de paginação, formato e filtro
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "30", 10);
        const format = searchParams.get("format") || "json";
        const country = searchParams.get("country");
        const tags = searchParams.get("tags");
        const gender = searchParams.get("gender");
        const orientation = searchParams.get("orientation");
        const broadcastType = searchParams.get("broadcastType");
        
        // 1. Busca TODOS os broadcasts disponíveis.
        const allItems = await fetchAllBroadcasts();
        
        // 2. Aplica filtros em cadeia sobre o conjunto de dados completo.
        let filteredItems = allItems;

        if (country) {
            const countries = country.split(',').map(c => c.trim().toLowerCase());
            filteredItems = filteredItems.filter(item => item.country && countries.includes(item.country.toLowerCase()));
        }

        if (tags) {
            const requiredTags = tags.split(',').map(t => t.trim().toLowerCase());
            filteredItems = filteredItems.filter(item => 
                item.tags && item.tags.some(tag => requiredTags.includes(tag.slug.toLowerCase()))
            );
        }
        
        if (gender) {
            const genders = gender.split(',').map(g => g.trim().toLowerCase());
            filteredItems = filteredItems.filter(item => item.gender && genders.includes(item.gender.toLowerCase()));
        }

        if (orientation) {
            const orientations = orientation.split(',').map(o => o.trim().toLowerCase());
            filteredItems = filteredItems.filter(item => item.sexualOrientation && orientations.includes(item.sexualOrientation.toLowerCase()));
        }

        if (broadcastType) {
            const broadcastTypes = broadcastType.split(',').map(b => b.trim().toLowerCase());
            filteredItems = filteredItems.filter(item => item.broadcastType && broadcastTypes.includes(item.broadcastType.toLowerCase()));
        }

        // 3. Calcula os totais e a paginação COM BASE NA LISTA FILTRADA.
        const total = filteredItems.length;
        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;

        // 4. Pega a fatia de itens para a página solicitada.
        const itemsForPage = filteredItems.slice(offset, offset + limit).map((item, index) => ({
            XCamId: offset + index + 1,
            ...item
        }));

        const responseData = {
            broadcasts: {
                total,
                page,
                totalPages,
                items: itemsForPage
            }
        };
        
        if (format.toLowerCase() === "csv") {
            response = new Response(jsonToCsv(filteredItems), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="broadcasts_filtered.csv"` }});
        } else {
            response = new Response(JSON.stringify(responseData, null, 2), { headers: { 'Content-Type': 'application/json' } });
        }
      }
      // Rota 10: Proxy para lista de tags (?list=tags)
      else if (searchParams.get('list') === 'tags') {
        // Proxy para a URL do GAS
        const GAS_LIST_TAGS_URL = "https://script.google.com/macros/s/AKfycbwpth8ujr2oAy9vVdS3KUnkppgtPmUCGeIviAPAMUSAlFNrp5sd2rfEHm3xhaUkVXQ/exec?list=tags";
        const gasResponse = await fetch(GAS_LIST_TAGS_URL, { headers: { accept: "application/json" } });
        const body = await gasResponse.text();
        response = new Response(body, {
          status: gasResponse.status,
          headers: {
            'Content-Type': gasResponse.headers.get('content-type') || 'application/json'
          }
        });
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
 * - v3.6.0 (2025-07-30):
 * - NOVOS FILTROS: Adicionado suporte para os parâmetros `gender`, `orientation`,
 * e `broadcastType` na rota principal, todos com suporte a múltiplos valores.
 * - v3.5.0 (2025-07-30):
 * - NOVO PROXY DE IMAGEM: Adicionada a rota `/poster/{username}.jpg` para servir
 * imagens de thumbnail diretamente, mantendo o proxy legado `?poster=`.
 * - v3.4.0 (2025-07-30):
 * - FILTRO DE TAGS: Adicionado suporte para o parâmetro `tags` na rota principal.
 * Aceita múltiplos valores separados por vírgula (ex: `?tags=cum,ass`).
 * - v3.3.0 (2025-07-30):
 * - FILTRO COM MÚLTIPLOS VALORES: A rota principal agora aceita múltiplos valores
 * separados por vírgula no parâmetro `country` (ex: `?country=br,us`).
 * - v3.2.0 (2025-07-30):
 * - BUSCA COMPLETA E FILTRO: Implementada a função `fetchAllBroadcasts` para buscar
 * todos os resultados da API externa, com cálculo correto de `total`.
 * - v3.1.0 (2025-07-17):
 * - ROTA DE STREAM MELHORADA: A rota `/stream/{username}` foi otimizada.
 * - v3.0.0 (2025-07-17):
 * - RESTAURAÇÃO COMPLETA: Reintegração de 100% das rotas e lógicas legadas.
 * - v2.1.0 (2025-07-17):
 * - REFATORAÇÃO INICIAL: Código reestruturado em blocos.
 *
 * @roadmap futuro:
 * - CACHE AVANÇADO: Implementar cache (KV Storage) para a função `fetchAllBroadcasts`
 * para reduzir drasticamente o número de chamadas à API externa. (Prioridade Alta)
 * - FILTROS MÚLTIPLOS (AVANÇADO): Permitir combinações lógicas mais complexas
 * nos filtros (ex: tags=c2c&country=br,us ou tags=c2c|big-dick).
 * - VALIDAÇÃO DE SCHEMA: Adicionar validação (ex: Zod) para os parâmetros de URL.
 * - MONITORAMENTO E LOGS: Integrar um serviço de logging (ex: Logflare).
 *
 * =========================================================================================
 */