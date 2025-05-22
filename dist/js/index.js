// === Utilitário: Converte JSON para CSV ===
function jsonToCsv(items) {
  if (!items.length) return "";
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

// === Lista de domínios permitidos para CORS ===
const ALLOWED_ORIGINS = [
  "https://xcam.gay",
  "https://beta.xcam.gay",
  "https://bbv2d1tfzkqqn3jm.canva-hosted-embed.com",
  "https://bbv5cdqch9awmt8y.canva-hosted-embed.com"
];

// === Retorna headers CORS dinâmicos ===
function getCorsHeaders(origin) {
  const isAllowed = ALLOWED_ORIGINS.includes(origin);
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "null",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}

// === Monta o corpo da requisição GraphQL para transmissões ===
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

// === Busca info básica do perfil ===
async function fetchUserInfo(username) {
  const apiUrl = `https://pt.cam4.com/rest/v1.0/profile/${username}/info`;
  const response = await fetch(apiUrl, {
    headers: {
      accept: "application/json",
      "accept-language": "pt-BR,pt;q=0.9,en;q=0.8",
      referer: `https://pt.cam4.com/${username}`
    }
  });
  if (!response.ok) throw new Error(`Erro CAM4 (info): ${response.status}`);
  return await response.json();
}

// === Busca streamInfo ===
async function fetchStreamInfo(username) {
  const apiUrl = `https://pt.cam4.com/rest/v1.0/profile/${username}/streamInfo`;
  const response = await fetch(apiUrl, {
    headers: {
      accept: "application/json",
      "accept-language": "pt-BR,pt;q=0.9,en;q=0.8",
      referer: `https://pt.cam4.com/${username}`
    }
  });
  if (!response.ok) throw new Error(`Erro CAM4 (streamInfo): ${response.status}`);
  return await response.json();
}

// === Handler principal da rota /user/<username> com suporte a filtros ===
async function handleUserWithFilters(username, sections, corsHeaders) {
  try {
    const result = {};

    if (sections.includes("info") || sections.includes("all")) {
      result.info = await fetchUserInfo(username);
    }

    if (sections.includes("streamInfo") || sections.includes("all")) {
      result.streamInfo = await fetchStreamInfo(username);
    }

    return new Response(JSON.stringify(result, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      error: "Erro ao buscar dados do usuário",
      details: err.message
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

// === Função principal do Worker ===
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const corsHeaders = getCorsHeaders(origin);
    const pathname = url.pathname;

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // === /user/<username>/liveInfo ===
    if (pathname.startsWith("/user/") && pathname.endsWith("/liveInfo")) {
      const username = pathname.split("/")[2];
      try {
        const data = await fetchStreamInfo(username);
        return new Response(JSON.stringify(data, null, 2), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    // === /user/<username>?section=info,streamInfo ===
    if (pathname.startsWith("/user/")) {
      const username = pathname.split("/")[2];
      const sectionsParam = url.searchParams.get("section") || "all";
      const sections = sectionsParam.split(",").map(s => s.trim().toLowerCase());
      return await handleUserWithFilters(username, sections, corsHeaders);
    }

    // === Rota principal ("/"): Listagem de transmissões ===
    const cache = caches.default;
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return new Response(cachedResponse.body, {
        ...cachedResponse,
        headers: {
          ...Object.fromEntries(cachedResponse.headers),
          ...corsHeaders
        }
      });
    }

    try {
      const format = url.searchParams.get("format") || "json";
      const pageParam = url.searchParams.get("page") || "1";
      const pageNumber = parseInt(pageParam, 10) || 1;
      const limitParam = url.searchParams.get("limit");
      const pageSize = limitParam ? parseInt(limitParam, 10) || 30 : 30;

      const limit = 300;
      const firstResponse = await fetch("https://pt.cam4.com/graph?operation=getGenderPreferencePageData&ssr=false", {
        method: "POST",
        headers: {
          "accept": "*/*",
          "content-type": "application/json",
          "apollographql-client-name": "CAM4-client",
          "apollographql-client-version": "25.5.15-113220utc"
        },
        body: buildCam4Body(0, limit)
      });

      if (!firstResponse.ok) throw new Error(`Erro inicial CAM4: ${firstResponse.status}`);
      const firstJson = await firstResponse.json();
      const total = firstJson?.data?.broadcasts?.total || 0;
      const firstItems = firstJson?.data?.broadcasts?.items || [];

      const fetchTasks = [];
      for (let offset = limit; offset < total; offset += limit) {
        fetchTasks.push(fetch("https://pt.cam4.com/graph?operation=getGenderPreferencePageData&ssr=false", {
          method: "POST",
          headers: {
            "accept": "*/*",
            "content-type": "application/json",
            "apollographql-client-name": "CAM4-client",
            "apollographql-client-version": "25.5.15-113220utc"
          },
          body: buildCam4Body(offset, limit)
        }).then(res => res.json()));
      }

      const results = await Promise.all(fetchTasks);
      const allItems = results.flatMap(json => json?.data?.broadcasts?.items || []).concat(firstItems);

      const sortedItems = allItems
        .sort((a, b) => (b.viewers || 0) - (a.viewers || 0))
        .map((item, index) => ({ XCamId: index + 1, ...item }));

      const pagedItems = sortedItems.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
      const totalPages = Math.ceil(total / pageSize);

      let finalResponse;
      if (format.toLowerCase() === "csv") {
        const csv = jsonToCsv(pagedItems);
        finalResponse = new Response(csv, {
          headers: {
            ...corsHeaders,
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="broadcasts_page${pageNumber}.csv"`
          }
        });
      } else {
        finalResponse = new Response(JSON.stringify({
          broadcasts: {
            total,
            page: pageNumber,
            totalPages,
            items: pagedItems
          }
        }, null, 2), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      ctx.waitUntil(cache.put(request, finalResponse.clone()));
      return finalResponse;

    } catch (err) {
      return new Response(JSON.stringify({ error: "Erro ao obter os dados", details: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
};
// === Fim do código ===