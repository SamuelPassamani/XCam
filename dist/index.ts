// index.ts - Cloudflare Worker para API do XCam com JSON/CSV, CORS e segurança tipada

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// Utilitário para converter JSON para CSV
function jsonToCsv(items: any[]): string {
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
__name(jsonToCsv, "jsonToCsv");

// Cabeçalhos CORS para todas as respostas
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
  "Access-Control-Allow-Headers": "*"
};

// Trata requisição OPTIONS (CORS preflight)
async function handleOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

// Tipagem esperada da resposta da API Cam4
type BroadcastItem = {
  id: string;
  username: string;
  country: string;
  sexualOrientation: string;
  profileImageURL: string;
  preview: { src?: string; poster?: string };
  viewers: number;
  broadcastType: string;
  gender: string;
  tags: { name: string; slug: string }[];
};

type BroadcastResponse = {
  data?: {
    broadcasts?: {
      total?: number;
      items?: BroadcastItem[];
    };
  };
};

// Handler principal do Worker
const index_default = {
  async fetch(request: Request): Promise<Response> {
    if (request.method === "OPTIONS") {
      return handleOptions();
    }

    try {
      const url = new URL(request.url);
      const format = url.searchParams.get("format") || "json";
      const pageParam = url.searchParams.get("page") || "1";
      const pageNumber = parseInt(pageParam, 10) || 1;
      const limitParam = url.searchParams.get("limit");
      const pageSize = limitParam ? parseInt(limitParam, 10) || 30 : 30;

      const limit = 300;
      let offset = 0;
      let total = 0;
      let allItems: BroadcastItem[] = [];

      // Busca paginada na API do Cam4 (GraphQL)
      do {
        const response = await fetch("https://pt.cam4.com/graph?operation=getGenderPreferencePageData&ssr=false", {
          method: "POST",
          headers: {
            "accept": "*/*",
            "accept-language": "pt-BR,pt;q=0.9,en;q=0.8",
            "apollographql-client-name": "CAM4-client",
            "apollographql-client-version": "25.5.15-113220utc",
            "content-type": "application/json",
            "priority": "u=1, i",
            "sec-ch-ua": '"Chromium";v="136", "Microsoft Edge";v="136", "Not.A/Brand";v="99"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sec-gpc": "1",
            "Referer": `https://pt.cam4.com/male?page=${Math.floor(offset / limit) + 1}`
          },
          body: JSON.stringify({
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
          })
        });

        const json = await response.json() as BroadcastResponse;
        const pageItems = json.data?.broadcasts?.items || [];
        total = json.data?.broadcasts?.total || 0;
        allItems = allItems.concat(pageItems);
        offset += limit;

      } while (offset < total);

      // Ordena por espectadores e adiciona índice XCamId
      const sortedItems = allItems
        .sort((a, b) => (b.viewers || 0) - (a.viewers || 0))
        .map((item, index) => ({
          XCamId: index + 1,
          ...item
        }));

      const pagedItems = sortedItems.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
      const totalPages = Math.ceil(total / pageSize);

      // Resposta CSV
      if (format.toLowerCase() === "csv") {
        const csv = jsonToCsv(pagedItems);
        return new Response(csv, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="broadcasts_page${pageNumber}.csv"`,
            ...corsHeaders
          }
        });
      }

      // Resposta JSON
      return new Response(JSON.stringify({
        broadcasts: {
          total,
          page: pageNumber,
          totalPages,
          items: pagedItems
        }
      }, null, 2), {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });

    } catch (err: any) {
      return new Response(JSON.stringify({
        error: "Erro ao obter os dados",
        details: err?.message || String(err)
      }, null, 2), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }
  }
};

export {
  index_default as default
};
