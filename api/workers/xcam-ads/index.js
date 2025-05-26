export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method !== 'GET' || url.pathname !== '/domains') {
      return new Response(JSON.stringify({
        code: 405,
        message: 'Not allowed',
        data: null
      }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiUrl = 'https://api3.adsterratools.com/publisher/domains.json';
    const apiKey = env.ADSTERRA_API_KEY; // <- agora usando o segredo

    try {
      const apiResponse = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-API-Key': apiKey
        }
      });

      if (!apiResponse.ok) {
        const fallback = await apiResponse.json();
        return new Response(JSON.stringify({
          code: apiResponse.status,
          message: fallback.message || 'Erro na API da Adsterra',
          data: null
        }), {
          status: apiResponse.status,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const data = await apiResponse.json();

      return new Response(JSON.stringify({
        items: data.items || [],
        itemCount: data.itemCount || 0
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      return new Response(JSON.stringify({
        code: 500,
        message: 'Erro interno ao buscar dados',
        data: null
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};
