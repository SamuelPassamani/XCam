export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Apenas aceita GET e rota /domains
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
    const apiKey = '282bee4eae15398c996054eeaa3e4da6';

    try {
      const apiResponse = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-API-Key': apiKey
        }
      });

      // Lida com códigos de erro
      if (!apiResponse.ok) {
        const fallback = await apiResponse.json();
        return new Response(JSON.stringify({
          code: apiResponse.status,
          message: fallback.message || 'Erro ao acessar a API da Adsterra',
          data: null
        }), {
          status: apiResponse.status,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const data = await apiResponse.json();

      // Retorna os dados conforme o schema esperado
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
        message: 'Erro interno ao buscar os dados',
        data: null
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};