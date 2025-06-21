/**
 * ===================================================================================
 * Módulo: Gerador de Poster Dinâmico - XCam Frontend
 * ===================================================================================
 *
 * @file utils/posterGenerator.js
 * @author Samuel Passamani & Gemini
 * @version 1.0.0
 * @last_update 2025-06-20
 *
 * @description
 * Este módulo fornece uma função utilitária para gerar dinamicamente uma miniatura (poster)
 * a partir do primeiro frame de uma transmissão de vídeo. Ele resolve o problema de segurança
 * "Tainted Canvas" ao consumir o endpoint de proxy de conteúdo da XCam API
 * (`/v1/media/poster/{username}`).
 *
 * A função é assíncrona e retorna uma Promise, permitindo que a aplicação continue
 * a ser executada enquanto o poster é gerado em segundo plano.
 *
 * @usage
 * 1. Importe a função `generatePoster` no seu script principal (ex: `broadcasts.js`).
 * 2. Ao renderizar um card de transmissão, chame `generatePoster(username)`.
 * 3. Use a Data URL (base64) resolvida pela Promise para atualizar o atributo 'poster'
 * do seu player de vídeo (ex: JW Player).
 *
 * ===================================================================================
 */

/**
 * Gera um poster para um determinado usuário buscando o primeiro frame de seu stream
 * através do endpoint de proxy de conteúdo da XCam API.
 * * @param {string} username - O nome de usuário para o qual gerar o poster.
 * @returns {Promise<string>} Uma Promise que resolve com a Data URL (base64) da imagem do poster em formato JPEG,
 * ou rejeita com um Erro se a geração falhar.
 */
function generatePoster(username) {
  // Retorna uma Promise para lidar com a natureza assíncrona da operação.
  return new Promise((resolve, reject) => {

    // --- Validação de Entrada ---
    if (!username || typeof username !== 'string') {
      // Rejeita a promise imediatamente se o username for inválido.
      return reject(new Error('Nome de usuário inválido ou não fornecido.'));
    }

    // --- Criação de Elementos Temporários ---
    // Estes elementos serão usados em memória e no DOM temporariamente, sem serem visíveis ao usuário.
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // --- Configuração do Elemento de Vídeo ---
    // Estas configurações são cruciais para o funcionamento em todos os navegadores.
    video.style.display = 'none';    // Oculta o vídeo da view.
    video.muted = true;              // Necessário para autoplay em muitos navegadores.
    video.crossOrigin = 'anonymous'; // Informa ao navegador para esperar cabeçalhos CORS. Essencial!
    video.preload = 'auto';          // Sugere ao navegador para começar a carregar o vídeo o mais rápido possível.
    
    // Define um timeout para evitar que a promessa fique pendurada indefinidamente.
    const timeoutId = setTimeout(() => {
        cleanup(); // Limpa os recursos.
        reject(new Error(`Timeout: A geração do poster para '${username}' demorou mais de 15 segundos.`));
    }, 15000); // 15 segundos de timeout.

    // --- Definição dos Handlers de Evento ---

    /**
     * Handler para o evento 'loadeddata'. Disparado quando o vídeo tem dados suficientes
     * para renderizar o primeiro frame.
     */
    const onLoadedData = () => {
      // Garante que as dimensões do canvas sejam as mesmas do vídeo para evitar distorções.
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Desenha o frame atual do vídeo (o primeiro) no canvas.
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Extrai a imagem do canvas como uma Data URL em formato JPEG com qualidade de 80%.
      // Esta chamada agora é segura e não dará erro de "Tainted Canvas".
      const posterDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      
      cleanup(); // Limpa os recursos.
      resolve(posterDataUrl); // Sucesso! Resolve a promise com a imagem gerada.
    };

    /**
     * Handler para o evento 'error'. Disparado se houver um problema ao carregar o vídeo.
     * @param {Event} e - O objeto do evento de erro.
     */
    const onError = (e) => {
      console.error(`Erro ao carregar o vídeo para gerar o poster para ${username}:`, e);
      cleanup(); // Limpa os recursos.
      reject(new Error(`Falha ao carregar o segmento de vídeo para o usuário ${username}.`));
    };

    /**
     * Função de limpeza para remover ouvintes de evento e elementos do DOM.
     * Previne memory leaks.
     */
    const cleanup = () => {
        clearTimeout(timeoutId); // Cancela o timeout.
        video.removeEventListener('loadeddata', onLoadedData);
        video.removeEventListener('error', onError);
        // Pausa o vídeo e limpa o src para parar o download e liberar recursos da rede.
        video.pause();
        video.src = ''; 
        video.remove();
        canvas.remove();
    };

    // --- Vinculação de Eventos e Execução ---

    video.addEventListener('loadeddata', onLoadedData);
    video.addEventListener('error', onError);

    // Define a fonte do vídeo para o nosso endpoint de proxy de conteúdo.
    // Esta é a parte mais importante da solução.
    video.src = `https://api.xcam.gay/v1/media/poster/${username}`;

    // Adiciona o vídeo ao corpo do documento. É necessário para que o navegador inicie o carregamento.
    document.body.appendChild(video);

    // Tenta iniciar a reprodução. O método play() retorna uma promise.
    video.play().catch(playError => {
      // O play() pode ser rejeitado por políticas de autoplay do navegador.
      // Isso não é necessariamente um erro fatal, pois o 'loadeddata' pode já ter sido disparado.
      // O erro real de carregamento é tratado pelo ouvinte de evento 'error'.
      // Apenas registamos este erro para fins de depuração.
      // console.warn(`Aviso de autoplay para ${username}:`, playError.message);
    });
  });
}

/**
 * ===================================================================================
 * === Fim do Módulo: Gerador de Poster Dinâmico ===
 * ===================================================================================
 *
 * @integration_example
 *
 * // No seu arquivo principal (ex: broadcasts.js)
 *
 * // 1. Supondo que você tenha uma função que renderiza um card de transmissão
 * function renderBroadcastCard(broadcast) {
 * const username = broadcast.username;
 * const playerContainerId = `player-${username}`;
 * * // ... código para criar o container do player ...
 *
 * const playerInstance = jwplayer(playerContainerId).setup({
 * file: `https://api.xcam.gay/stream/${username}`, // Proxy de REDIRECIONAMENTO para o stream
 * image: '/path/to/placeholder.jpg', // Um poster genérico ou de carregamento
 * // ... outras configurações do player
 * });
 *
 * // 2. Chame a função para gerar o poster e atualizar o player quando estiver pronto
 * generatePoster(username)
 * .then(posterUrl => {
 * console.log(`Poster para ${username} gerado com sucesso.`);
 * // Atualiza a configuração do player com a nova imagem de poster
 * playerInstance.setup({
 * ...playerInstance.getConfig(), // Mantém as configs existentes
 * image: posterUrl
 * });
 * })
 * .catch(error => {
 * console.error(`Não foi possível gerar o poster para ${username}:`, error);
 * // O player continuará com a imagem placeholder em caso de erro.
 * });
 * }
 *
 * ===================================================================================
 */
