// js/data.js

// Array global para armazenar todas as transmissões carregadas
let allBroadcasts = [];

/**
 * Função para buscar os dados das transmissões.
 * Primeiro tenta carregar da URL ao vivo (API do worker).
 * Se falhar, carrega do arquivo local de fallback.
 * 
 * @returns {Promise<Array>} Retorna a lista de transmissões (broadcasts).
 */
export async function fetchData() {
  // URL de fallback local para casos de erro na rede
  const fallbackUrl = './assets/data/male.json';

  // URL do endpoint live que retorna os dados atualizados
  const liveUrl = 'https://xcam.moviele.workers.dev/?limit=1500&format=json';

  try {
    // Tenta buscar dados do endpoint live
    const response = await fetch(liveUrl);
    const json = await response.json();

    // Verifica se a resposta tem a estrutura esperada
    if (json.broadcasts?.items) {
      // Atualiza o array global com os dados recebidos
      allBroadcasts = json.broadcasts.items;
    } else {
      // Se o formato da resposta for inválido, lança erro para fallback
      throw new Error('Formato inválido da resposta da API');
    }
  } catch (error) {
    // Caso haja erro na requisição ao endpoint live,
    // busca os dados do arquivo local de fallback
    const response = await fetch(fallbackUrl);
    const json = await response.json();

    // Atualiza o array global com os dados do fallback
    allBroadcasts = json.broadcasts.items;
  }

  // Retorna o array atualizado com as transmissões
  return allBroadcasts;
}

/**
 * Aplica filtros nos dados carregados.
 * 
 * Os filtros possíveis são:
 * - country: código do país (string)
 * - gender: gênero (string)
 * - orientation: orientação sexual (string)
 * - username: busca parcial no nome de usuário (string)
 * 
 * @param {Object} filters - Objeto contendo os filtros opcionais
 * @returns {Array} Lista filtrada de transmissões
 */
export function applyFilters(filters = {}) {
  return allBroadcasts.filter((broadcast) => {
    // Desestruturando filtros para facilitar leitura
    const { country, gender, orientation, username } = filters;

    // Checa se cada filtro está vazio ou se o dado corresponde ao filtro
    return (
      (!country || broadcast.country === country) &&
      (!gender || broadcast.gender === gender) &&
      (!orientation || broadcast.sexualOrientation === orientation) &&
      (!username || broadcast.username.toLowerCase().includes(username.toLowerCase()))
    );
  });
}
