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
  "https://bbv5cdqch9awmt8y.canva-hosted-embed.com",
  "https://script.google.com"
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
            preview {
              src
              poster
            }
            viewers
            broadcastType
            gender
            tags {
              name
              slug
            }
          }
        }
      }
    `
  });
}

// === Handler: Perfil de usuário estático (/info) ===
async function handleUserProfile(username, corsHeaders) {
  const apiUrl = `https://pt.cam4.com/rest/v1.0/profile/${username}/info`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "pt-BR,pt;q=0.9,en;q=0.8",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        referer: `https://pt.cam4.com/${username}`
      }
    });

    if (!response.ok) throw new Error(`Erro CAM4: ${response.status}`);
    const data = await response.json();

    return new Response(JSON.stringify(data, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Falha ao buscar perfil", details: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

// === Handler: Dados ao vivo (/streamInfo) ===
async function handleLiveInfo(username, corsHeaders) {
  const apiUrl = `https://pt.cam4.com/rest/v1.0/profile/${username}/streamInfo`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "pt-BR,pt;q=0.9,en;q=0.8",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        referer: `https://pt.cam4.com/${username}`
      }
    });

    if (!response.ok) throw new Error(`Erro CAM4: ${response.status}`);
    const data = await response.json();

    return new Response(JSON.stringify(data, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Falha ao buscar streamInfo", details: err.message }), {
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

    // Pré-voo CORS
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // === Rota /user/<username>/liveInfo ===
    if (pathname.startsWith("/user/") && pathname.endsWith("/liveInfo")) {
      const parts = pathname.split("/").filter(Boolean);
      const username = parts[1];
      return await handleLiveInfo(username, corsHeaders);
    }

    // === Rota /user/<username> ===
    if (pathname.startsWith("/user/")) {
      const username = pathname.split("/")[2];
      return await handleUserProfile(username, corsHeaders);
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
          "apollographql-client-version": "25.5.15-113220utc",
          "sec-fetch-mode": "cors"
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
            "apollographql-client-version": "25.5.15-113220utc",
            "sec-fetch-mode": "cors"
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
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
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