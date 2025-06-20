/**
 * ================================================================
 * XCam API Worker - xcam-api/index.js (Proxy de Mídia + Poster Seguro)
 * ================================================================
 * Autor: Samuel Passamani | Equipe XCam & Gemini
 * Última atualização: 2025-06-20
 * ================================================================
 */

// ===============================
// === Conversor JSON para CSV ===
// ===============================
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

// ========================================
// === Lista de domínios permitidos CORS ===
// ========================================
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

// ====================================
// === Headers dinâmicos para CORS  ===
// ====================================
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

// =========================================================
// === Monta corpo GraphQL para listagem de transmissões ===
// =========================================================
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

// ==================================================
// === Handler: Busca informações de perfil público ===
// ==================================================
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

// ====================================================
// === Handler: Busca informações de stream ao vivo  ===
// ====================================================
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

// =====================================================================
// === Handler: Busca e agrega todas as infos de um usuário específico ===
// =====================================================================
async function handleUserFullInfo(user, corsHeaders) {
  const limit = 300;
  let graphData = null;
  try {
    const firstRes = await fetch("https://pt.cam4.com/graph?operation=getGenderPreferencePageData&ssr=false", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "apollographql-client-name": "CAM4-client",
        "apollographql-client-version": "25.5.15-113220utc"
      },
      body: buildCam4Body(0, limit)
    });
    if (firstRes.ok) {
      const firstJson = await firstRes.json();
      const allItems = firstJson?.data?.broadcasts?.items || [];
      graphData = allItems.find(item => item.username === user) || null;
    } else {
      graphData = { error: "Erro inicial CAM4", details: firstRes.status };
    }
  } catch (err) {
    graphData = { error: "Falha na consulta GraphQL", details: err.message };
  }

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

// =====================================================================
// === Handler: Proxy Google Apps Script para rec.json do usuário    ====
// =====================================================================
async function handleRecProxy(username, corsHeaders) {
  const GAS_URL = "https://script.google.com/macros/s/AKfycbz6cucO0SvdNSbnlFrUCR9nvh4FCDzMCp138iaRyiuDDWQ9JfPvFlmeevhHUtn0soc_IQ/exec?rec=" + encodeURIComponent(username);
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

// ===============================================================
// === Handler: Proxy de Redirecionamento para Streams HLS      ===
// ===============================================================
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

// ===============================================================
// === Handler: Proxy seguro para segmento TS do HLS (poster)   ===
// ===============================================================
async function handlePosterSegmentProxy(username) {
  const streamInfo = await handleLiveInfo(username);
  if (streamInfo.error) {
    return new Response(JSON.stringify({ error: "Usuário offline ou sem stream." }), {
      status: 404,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
  const hlsUrl = streamInfo.cdnURL || streamInfo.edgeURL;
  if (!hlsUrl) {
    return new Response(JSON.stringify({ error: "URL de stream não encontrada." }), {
      status: 404,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
  const m3u8Res = await fetch(hlsUrl, { headers: { referer: `https://pt.cam4.com/${username}` } });
  if (!m3u8Res.ok) {
    return new Response(JSON.stringify({ error: "Falha ao buscar manifesto HLS." }), {
      status: 502,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
  const m3u8Text = await m3u8Res.text();
  const lines = m3u8Text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
  const firstSegment = lines.find(l => l.endsWith('.ts'));
  if (!firstSegment) {
    return new Response(JSON.stringify({ error: "Nenhum segmento .ts encontrado." }), {
      status: 404,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
  let segmentUrl = firstSegment;
  if (!/^https?:\/\//.test(segmentUrl)) {
    const base = hlsUrl.substring(0, hlsUrl.lastIndexOf('/') + 1);
    segmentUrl = base + segmentUrl;
  }
  const segRes = await fetch(segmentUrl, { headers: { referer: `https://pt.cam4.com/${username}` } });
  if (!segRes.ok) {
    return new Response(JSON.stringify({ error: "Falha ao buscar segmento de vídeo." }), {
      status: 502,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
  return new Response(segRes.body, {
    status: 200,
    headers: {
      "Content-Type": "video/MP2T",
      "Content-Disposition": "inline; filename=\"poster.ts\"",
      "Access-Control-Allow-Origin": "*"
    }
  });
}

// ===============================================================
// === Worker principal: roteamento, filtros, respostas e erros ===
// ===============================================================
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const corsHeaders = getCorsHeaders(origin);
    const pathname = url.pathname;

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      // NOVA ROTA: Poster seguro para canvas via proxy de TS
      if (pathname.match(/^\/v1\/media\/poster\/([a-zA-Z0-9_]+)\/?$/) && request.method === "GET") {
        const username = pathname.match(/^\/v1\/media\/poster\/([a-zA-Z0-9_]+)\/?$/)[1];
        return await handlePosterSegmentProxy(username);
      }

      // Proxy de Stream /stream/{username}
      const streamMatch = pathname.match(/^\/stream\/([a-zA-Z0-9_]+)\/?$/);
      if (streamMatch) {
        const username = streamMatch[1];
        const type = url.searchParams.get('type') || 'cdn';
        return await handleStreamProxy(username, type);
      }

      // Proxy para gravações /?rec={username}
      const recParam = url.searchParams.get("rec");
      if (recParam) {
        return await handleRecProxy(recParam, corsHeaders);
      }

      // Agregação completa de dados /?user={username}
      const userParam = url.searchParams.get("user");
      if (userParam) {
        return await handleUserFullInfo(userParam, corsHeaders);
      }

      // Endpoints REST legados /user/...
      if (pathname.startsWith("/user/")) {
        const parts = pathname.split("/").filter(Boolean);
        const username = parts[1];
        if (parts[2] === "liveInfo") {
          const data = await handleLiveInfo(username);
          return new Response(JSON.stringify(data, null, 2), {
            headers: { "Cache-Control": "no-store", ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        const data = await handleUserProfile(username);
        return new Response(JSON.stringify(data, null, 2), {
          headers: { "Cache-Control": "no-store", ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // Lista de transmissões públicas com filtros
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

        const sortedItems = allItems.sort((a, b) => (b.viewers || 0) - (a.viewers || 0)).map((item, index) => ({ XCamId: index + 1, ...item }));
        
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

      // Rota não mapeada
      return new Response(JSON.stringify({ error: "Endpoint não encontrado." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });

    } catch (err) {
      console.error("Erro fatal no Worker:", err);
      return new Response(JSON.stringify({ error: "Erro interno do servidor", details: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
};

/**
 * Patch: Adicionada rota /v1/media/poster/{username} para proxy seguro de segmento TS.
 * Código revisado para evitar duplicidade de export e manter ordem lógica dos handlers.
 */