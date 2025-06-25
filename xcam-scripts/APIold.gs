/**
 * ================================================================
 * XCam GAY API Adapter - API.gs
 * ================================================================
 * 
 * Descrição:
 * Este script do Google Apps Script implementa um endpoint webapp
 * dinâmico que atende múltiplos fluxos via parâmetros de URL:
 * 
 * 1. ?user={username}
 *    - Retorna dados agregados: driveData (rec.json do Drive) e apiData (XCam API).
 * 
 * 2. ?rec={username}
 *    - Retorna apenas driveData: conteúdo do rec.json do Drive, sem chamar a XCam API.
 * 
 * 3. ?poster={username}
 *    - Retorna apenas os dados do usuário em processed.json.
 * 
 * - Erros são sempre tratados de forma amigável, e a resposta é sempre JSON.
 * - Modular, fácil de manter e expandir.
 * 
 * Autor: ShemuElDi | XCam
 * Última atualização: 2025-06-22
 * ================================================================
 */

const ROOT_FOLDER_ID = '1R8q38lLoeS1PjASq7GhbtnJG_oo2NcoB';
const POSTERS_FOLDER_ID = '1p1VyLW6mtOn6RAjazl9zR0QWsrQbZBCj'; // <-- Defina aqui o ID da pasta dos posters
const PROCESSED_JSON_FILE_ID = '11etUAeC5JYPjp5abVAvQWYNj3Dw2632P';

/**
 * Função principal de entrada para requisições GET.
 * Cada parâmetro é tratado de forma independente, sem prioridade.
 * Se mais de um parâmetro for enviado, todos são processados e retornados juntos.
 * 
 * @param {Object} e - Objeto de evento da requisição, contém parâmetros de query.
 * @returns {TextOutput} - Resposta JSON conforme parâmetros recebidos.
 */
function doGet(e) {
  // Objeto de resposta agregada
  let response = {};

  // Processa ?poster
  if (e.parameter.poster) {
    const username = String(e.parameter.poster);
    // NOVA REGRA: Se poster=0, retorna o processed.json inteiro
    if (username === "0") {
      const processedData = readProcessedJsonFromDrive();
      response.poster = processedData || { error: "Arquivo processed.json não encontrado ou inválido." };
    } else {
      response.poster = handlePosterQueryRaw(username);
    }
  }

  // Processa ?rec
  if (e.parameter.rec) {
    const username = String(e.parameter.rec);
    response.rec = handleDriveDataOnlyRaw(username);
  }

  // Processa ?user
  if (e.parameter.user) {
    const username = String(e.parameter.user);
    response.user = handleAggregatedDataRaw(username);
  }

  // Se nenhum parâmetro reconhecido foi enviado, retorna erro
  if (
    !e.parameter.poster &&
    !e.parameter.rec &&
    !e.parameter.user
  ) {
    return respondWithError("Parâmetro obrigatório ausente: use 'poster', 'user' ou 'rec'.");
  }

  // Retorna resposta agregada (pode conter um ou mais resultados)
  return ContentService
    .createTextOutput(JSON.stringify(response, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handler: Busca o usuário no processed.json e retorna apenas seus dados (objeto JS).
 * Usado internamente para resposta agregada.
 * 
 * @param {string} username - Nome do usuário a buscar.
 * @returns {Object} - Dados do usuário ou objeto de erro.
 */
function handlePosterQueryRaw(username) {
  try {
    const processedData = readProcessedJsonFromDrive();
    if (!processedData || !processedData.users) {
      return { error: "Arquivo processed.json não encontrado ou inválido." };
    }
    const userData = processedData.users[username];
    if (!userData) {
      return { error: `Usuário '${username}' não encontrado em processed.json.` };
    }
    const result = {};
    result[username] = userData;
    return result;
  } catch (error) {
    return { error: "Erro ao processar consulta poster: " + error.message };
  }
}

/**
 * Handler: Retorna apenas o conteúdo de rec.json do Drive (objeto JS).
 * Usado internamente para resposta agregada.
 * 
 * @param {string} username - Nome do usuário/pasta.
 * @returns {Object} - { driveData } ou objeto de erro.
 */
function handleDriveDataOnlyRaw(username) {
  try {
    const driveData = getDriveRecJson(username);
    return { driveData };
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Handler: Retorna driveData (rec.json do Drive) + apiData (XCam API).
 * Usado internamente para resposta agregada.
 * 
 * @param {string} username - Nome do usuário/pasta.
 * @returns {Object} - { user, driveData, apiData } ou objeto de erro.
 */
function handleAggregatedDataRaw(username) {
  let driveData = null;
  let apiData = null;

  try {
    driveData = getDriveRecJson(username);
  } catch (error) {
    driveData = null;
  }

  try {
    const apiUrl = `https://api.xcam.gay/?user=${encodeURIComponent(username)}`;
    const response = UrlFetchApp.fetch(apiUrl, {
      muteHttpExceptions: true,
      followRedirects: true,
      validateHttpsCertificates: true
    });
    apiData = safeParseJSON(response.getContentText(), null);
  } catch (error) {
    apiData = { error: "Falha ao consultar XCam API", details: String(error) };
  }

  return {
    user: username,
    driveData: driveData,
    apiData: apiData
  };
}

/**
 * Handler: Busca o usuário no processed.json e retorna apenas seus dados (TextOutput).
 * Mantido para compatibilidade, mas não é mais chamado diretamente pelo doGet.
 * 
 * @param {string} username - Nome do usuário a buscar.
 * @returns {TextOutput} - Resposta JSON com os dados do usuário ou erro.
 */
function handlePosterQuery(username) {
  const result = handlePosterQueryRaw(username);
  return ContentService
    .createTextOutput(JSON.stringify(result, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handler: Retorna apenas o conteúdo de rec.json do Drive (TextOutput).
 * Mantido para compatibilidade, mas não é mais chamado diretamente pelo doGet.
 * 
 * @param {string} username - Nome do usuário/pasta.
 * @returns {TextOutput} - JSON apenas com o campo driveData.
 */
function handleDriveDataOnly(username) {
  const result = handleDriveDataOnlyRaw(username);
  return ContentService
    .createTextOutput(JSON.stringify(result, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handler: Retorna driveData (rec.json do Drive) + apiData (XCam API) (TextOutput).
 * Mantido para compatibilidade, mas não é mais chamado diretamente pelo doGet.
 * 
 * @param {string} username - Nome do usuário/pasta.
 * @returns {TextOutput} - JSON com user, driveData e apiData.
 */
function handleAggregatedData(username) {
  const result = handleAggregatedDataRaw(username);
  return ContentService
    .createTextOutput(JSON.stringify(result, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Lê e faz o parse do arquivo processed.json do Drive.
 * 
 * @returns {Object|null} - Objeto JS do processed.json ou null em caso de erro.
 */
function readProcessedJsonFromDrive() {
  try {
    const file = DriveApp.getFileById(PROCESSED_JSON_FILE_ID);
    const content = file.getBlob().getDataAsString();
    return JSON.parse(content);
  } catch (e) {
    Logger.log('Erro ao ler processed.json: ' + e.message);
    return null;
  }
}

/**
 * Busca e retorna o conteúdo de rec.json no Drive (como objeto JS).
 * Se não encontrar pasta ou arquivo, retorna null.
 * 
 * @param {string} username - Nome da subpasta do usuário.
 * @returns {Object|null} - Conteúdo parseado do rec.json ou null.
 */
function getDriveRecJson(username) {
  try {
    const rootFolder = DriveApp.getFolderById(ROOT_FOLDER_ID);
    const userFolder = findSubfolderByName(rootFolder, username);
    if (userFolder) {
      const file = findFileByName(userFolder, 'rec.json');
      if (file) {
        const recContent = file.getBlob().getDataAsString();
        return safeParseJSON(recContent, null);
      }
    }
    // Se não encontrar pasta ou arquivo, retorna null
    return null;
  } catch (err) {
    // Se erro inesperado, propaga para ser tratado por quem chamou
    throw new Error("Erro ao buscar rec.json no Drive: " + err.message);
  }
}

/**
 * Procura uma subpasta pelo nome dentro de uma pasta pai.
 * 
 * @param {Folder} parentFolder - Pasta raiz.
 * @param {string} name - Nome exato da subpasta.
 * @returns {Folder|null} - Objeto Folder se encontrado, senão null.
 */
function findSubfolderByName(parentFolder, name) {
  const folders = parentFolder.getFolders();
  while (folders.hasNext()) {
    const folder = folders.next();
    if (folder.getName() === name) return folder;
  }
  return null;
}

/**
 * Procura um arquivo pelo nome dentro de uma pasta.
 * 
 * @param {Folder} folder - Pasta onde buscar.
 * @param {string} filename - Nome exato do arquivo.
 * @returns {File|null} - Objeto File se encontrado, senão null.
 */
function findFileByName(folder, filename) {
  const files = folder.getFilesByName(filename);
  return files.hasNext() ? files.next() : null;
}

/**
 * Faz o parse seguro de um JSON, retornando fallback em caso de erro.
 * 
 * @param {string} str - String JSON.
 * @param {*} fallback - Valor padrão a retornar em caso de falha.
 * @returns {*} - Objeto parseado ou fallback.
 */
function safeParseJSON(str, fallback) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
}

/**
 * Retorna resposta padronizada de erro em JSON.
 * 
 * @param {string} message - Mensagem de erro.
 * @returns {TextOutput} - Resposta JSON de erro.
 */
function respondWithError(message) {
  return ContentService
    .createTextOutput(JSON.stringify({ error: message }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Busca o poster de um usuário no CAM4 e salva no Drive como "{username}.jpg".
 * Todos os arquivos são salvos/atualizados na raiz da pasta de posters (POSTERS_FOLDER_ID).
 *
 * @param {string} username - Nome do usuário a buscar.
 * @param {string} [postersFolderId] - (Opcional) ID da pasta de posters. Usa POSTERS_FOLDER_ID se não informado.
 * @returns {Object} - Objeto com status e nome do arquivo salvo ou mensagem de erro.
 */
function fetchAndSavePoster(username, postersFolderId) {
  const folderId = postersFolderId || POSTERS_FOLDER_ID;
  try {
    Logger.log(`🔎 Procurando arquivo '${username}.jpg' na raiz da pasta de posters...`);

    // Busca poster no endpoint GraphQL do CAM4
    Logger.log(`🌐 Buscando poster do usuário '${username}' no CAM4...`);
    const url = "https://pt.cam4.com/graph?operation=getGenderPreferencePageData&ssr=false";
    const payload = {
      operationName: "getGenderPreferencePageData",
      variables: {
        input: {
          orderBy: "trending",
          filters: [],
          gender: "male",
          cursor: { first: 300, offset: 0 }
        }
      },
      query: `
        query getGenderPreferencePageData($input: BroadcastsInput) {
          broadcasts(input: $input) {
            total
            items {
              username
              preview { poster }
            }
          }
        }
      `
    };
    const options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    const response = UrlFetchApp.fetch(url, options);
    const json = safeParseJSON(response.getContentText(), {});
    const items = json?.data?.broadcasts?.items || [];
    Logger.log(`🔢 ${items.length} usuários encontrados na resposta do CAM4.`);
    const foundItem = items.find(item => item.username === username);

    if (!foundItem || !foundItem.preview || !foundItem.preview.poster) {
      Logger.log(`🚫 Poster não encontrado para o usuário: ${username}`);
      return { error: `Poster não encontrado para o usuário: ${username}` };
    }

    Logger.log(`✅ Usuário '${username}' encontrado! Poster: ${foundItem.preview.poster}`);

    const posterUrl = foundItem.preview.poster;
    const fileName = `${username}.jpg`;

    // Baixa a imagem do poster
    Logger.log(`⬇️ Baixando imagem do poster de '${username}'...`);
    const imageResponse = UrlFetchApp.fetch(posterUrl);
    const imageBlob = imageResponse.getBlob().setName(fileName);

    // Remove arquivo antigo se existir na raiz da pasta
    const postersRoot = DriveApp.getFolderById(folderId);
    const existingFile = findFileByName(postersRoot, fileName);
    if (existingFile) {
      Logger.log(`♻️ Arquivo antigo '${fileName}' encontrado na raiz. Movendo para lixeira...`);
      existingFile.setTrashed(true);
    }

    // Salva novo arquivo na raiz da pasta
    Logger.log(`💾 Salvando novo arquivo '${fileName}' na raiz da pasta de posters...`);
    const file = postersRoot.createFile(imageBlob);

    Logger.log(`🎉 Poster salvo com sucesso: ${file.getName()}`);
    return { status: "ok", file: file.getName() };
  } catch (e) {
    Logger.log(`❗ Erro ao buscar/salvar poster: ${e.message}`);
    return { error: "Erro ao buscar/salvar poster: " + e.message };
  }
}

/**
 * Lê o arquivo processed.json detalhado (retorna objeto com histórico).
 */
function readProcessedInfo(postersRoot) {
  const file = findFileByName(postersRoot, 'processed.json');
  if (!file) {
    return {
      users: {},
      lastRun: null,
      lastOffset: 0,
      lastPage: 0,
      lastUpdate: null,
      totalProcessed: 0
    };
  }
  try {
    const content = file.getBlob().getDataAsString();
    const obj = JSON.parse(content);
    // Garante estrutura mínima
    return {
      users: obj.users || {},
      lastRun: obj.lastRun || null,
      lastOffset: obj.lastOffset || 0,
      lastPage: obj.lastPage || 0,
      lastUpdate: obj.lastUpdate || null,
      totalProcessed: obj.totalProcessed || 0
    };
  } catch (e) {
    Logger.log('⚠️ Erro ao ler processed.json: ' + e.message);
    return {
      users: {},
      lastRun: null,
      lastOffset: 0,
      lastPage: 0,
      lastUpdate: null,
      totalProcessed: 0
    };
  }
}

/**
 * Salva o arquivo processed.json detalhado.
 */
function saveProcessedInfo(postersRoot, processedInfo) {
  processedInfo.lastUpdate = new Date().toISOString();
  const blob = Utilities.newBlob(JSON.stringify(processedInfo, null, 2), 'application/json', 'processed.json');
  const oldFile = findFileByName(postersRoot, 'processed.json');
  if (oldFile) oldFile.setTrashed(true);
  postersRoot.createFile(blob);
}

/**
 * Busca todos os usuários públicos do CAM4 (paginando) e salva o poster de cada um na raiz da pasta de posters.
 * Usa processed.json detalhado para registrar e continuar de onde parou.
 */
function fetchAndSaveAllPosters(postersFolderId, limit, maxPages, retryCount) {
  const folderId = postersFolderId || POSTERS_FOLDER_ID;
  limit = limit || 300;
  maxPages = maxPages || 30;
  retryCount = retryCount || 0;
  const MAX_RETRIES = 1; // Só tenta mais uma vez automaticamente

  const report = [];
  let offset = 0;
  let total = 0;
  let totalUsers = 0;
  let totalWithPoster = 0;
  let totalCreated = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  const MAX_TIME = (typeof MAX_EXECUTION_TIME_MS !== 'undefined') ? MAX_EXECUTION_TIME_MS : 270000;
  const startTime = Date.now();

  try {
    Logger.log(`🌐 Iniciando busca paginada de usuários no CAM4...`);
    const postersRoot = DriveApp.getFolderById(folderId);

    // Carrega todos os nomes de arquivos existentes na pasta de posters
    const existingFiles = {};
    const files = postersRoot.getFiles();
    while (files.hasNext()) {
      const file = files.next();
      existingFiles[file.getName()] = file.getLastUpdated();
    }
    Logger.log(`📂 Arquivos já existentes na pasta de posters: ${Object.keys(existingFiles).length}`);

    // Carrega processed.json detalhado
    let processedInfo = readProcessedInfo(postersRoot);
    let usersInfo = processedInfo.users || {};
    let lastOffset = processedInfo.lastOffset || 0;
    let lastPage = processedInfo.lastPage || 0;

    offset = lastOffset;
    let pageStart = lastPage;

    // Resetar offset/página se o offset salvo for maior que o total global
    if (offset > 0) {
      // Faz uma requisição rápida só para pegar o total global
      const url = "https://pt.cam4.com/graph?operation=getGenderPreferencePageData&ssr=false";
      const payload = {
        operationName: "getGenderPreferencePageData",
        variables: {
          input: {
            orderBy: "trending",
            filters: [],
            gender: "male",
            cursor: { first: 1, offset: 0 }
          }
        },
        query: `
          query getGenderPreferencePageData($input: BroadcastsInput) {
            broadcasts(input: $input) {
              total
            }
          }
        `
      };
      const options = {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      };
      const response = UrlFetchApp.fetch(url, options);
      const json = safeParseJSON(response.getContentText(), {});
      const totalGlobal = json?.data?.broadcasts?.total || 0;

      if (offset >= totalGlobal) {
        Logger.log(`ℹ️ Offset salvo (${offset}) maior que o total global (${totalGlobal}). Resetando offset e página.`);
        offset = 0;
        pageStart = 0;
        processedInfo.lastOffset = 0;
        processedInfo.lastPage = 0;
        saveProcessedInfo(postersRoot, processedInfo);
      }
    }

    // Dentro da função fetchAndSaveAllPosters, localize o início dos contadores:
    let processedAdded = 0;
    let processedUpdated = 0;

    for (let page = pageStart; page < maxPages; page++) {
      if (Date.now() - startTime > MAX_TIME - 5000) {
        Logger.log("⏰ Tempo limite de execução atingido. Encerrando processamento para evitar timeout.");
        processedInfo.lastOffset = offset;
        processedInfo.lastPage = page;
        break;
      }

      Logger.log(`📄 Página ${page + 1} | Offset: ${offset} | Limit: ${limit}`);

      const payload = {
        operationName: "getGenderPreferencePageData",
        variables: {
          input: {
            orderBy: "trending",
            filters: [],
            gender: "male",
            cursor: { first: limit, offset: offset }
          }
        },
        query: `
          query getGenderPreferencePageData($input: BroadcastsInput) {
            broadcasts(input: $input) {
              total
              items {
                username
                preview { poster }
              }
            }
          }
        `
      };

      const options = {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(payload),
        muteHttpExceptions: true,
        headers: {
          "apollographql-client-name": "CAM4-client",
          "apollographql-client-version": "25.5.15-113220utc"
        }
      };

      const url = "https://pt.cam4.com/graph?operation=getGenderPreferencePageData&ssr=false";
      const response = UrlFetchApp.fetch(url, options);
      const json = safeParseJSON(response.getContentText(), {});
      const broadcasts = json?.data?.broadcasts;
      const items = broadcasts?.items || [];
      total = broadcasts?.total || 0;

      Logger.log(`🔢 ${items.length} usuários encontrados nesta página (total global: ${total}).`);
      totalUsers += items.length;

      for (let i = 0; i < items.length; i++) {
        if (Date.now() - startTime > MAX_TIME - 2000) {
          Logger.log("⏰ Tempo limite de execução atingido durante o processamento dos usuários. Encerrando.");
          processedInfo.lastOffset = offset;
          processedInfo.lastPage = page;
          break;
        }

        const user = items[i];
        const username = user?.username;
        const posterUrl = user?.preview?.poster;
        const fileName = `${username}.jpg`;

        if (!username || !posterUrl) {
          Logger.log(`⚠️ Usuário sem username ou poster na posição ${i + offset}. Pulando...`);
          report.push({ username, status: "skipped", reason: "Sem username ou poster" });
          totalSkipped++;
          continue;
        }

        totalWithPoster++;

        let userInfo = usersInfo[username] || {};
        let wasNew = !usersInfo[username];

        let shouldProcess = true;
        const jaExiste = !!existingFiles[fileName];
        if (jaExiste) {
          const lastUpdate = userInfo.lastProcessed ? new Date(userInfo.lastProcessed) : null;
          const now = new Date();
          if (lastUpdate && ((now - lastUpdate) < 60 * 60 * 1000)) {
            Logger.log(`⏭️ Poster já existe para '${username}' e foi processado há menos de 1h (${userInfo.lastProcessed}), pulando.`);
            totalSkipped++;
            report.push({ username, status: "skipped", reason: "Poster recente (<1h)" });
            shouldProcess = false;
          }
        }

        if (!shouldProcess) continue;

        Logger.log(`👤 Processando usuário: ${username}`);
        Logger.log(`🔗 Poster: ${posterUrl}`);

        try {
          Logger.log(`⬇️ Baixando imagem do poster de '${username}'...`);
          const imageResponse = UrlFetchApp.fetch(posterUrl);
          const imageBlob = imageResponse.getBlob().setName(fileName);

          if (jaExiste) {
            Logger.log(`♻️ Atualizando arquivo existente '${fileName}' para o usuário '${username}'.`);
            const oldFile = findFileByName(postersRoot, fileName);
            if (oldFile) oldFile.setTrashed(true);
            totalUpdated++;
          } else {
            Logger.log(`🆕 Criando novo arquivo '${fileName}' para o usuário '${username}'.`);
            totalCreated++;
          }

          Logger.log(`💾 Salvando arquivo '${fileName}' na raiz da pasta de posters...`);
          const file = postersRoot.createFile(imageBlob);

          Logger.log(`🎉 Poster salvo com sucesso: ${file.getName()}`);
          report.push({ username, status: "ok", file: file.getName() });

          // Atualização do processed.json
          usersInfo[username] = {
            lastProcessed: new Date().toISOString(),
            fileName: fileName,
            fileUrl: `https://poster.xcam.gay/${username}.jpg`, // <-- novo campo logo após fileName
            lastStatus: "ok",
            lastError: null,
            lastRunPage: page !== undefined ? page : null,
            lastRunOffset: offset !== undefined ? offset : null,
            lastRunIndex: i !== undefined ? i : null
          };

          // >>>>> INÍCIO DO PATCH <<<<<
          if (wasNew) {
            processedAdded++;
          } else {
            processedUpdated++;
          }
          // >>>>> FIM DO PATCH <<<<<

        } catch (e) {
          Logger.log(`❗ Erro ao baixar/salvar poster de '${username}': ${e.message}`);
          report.push({ username, status: "error", error: e.message });
          totalErrors++;
          usersInfo[username] = {
            lastProcessed: new Date().toISOString(),
            fileName: fileName,
            fileUrl: `https://poster.xcam.gay/${username}.jpg`, // novo campo
            lastStatus: "error",
            lastError: e.message,
            lastRunPage: page !== undefined ? page : null,
            lastRunOffset: offset !== undefined ? offset : null,
            lastRunIndex: i !== undefined ? i : null
          };
          // Se quiser contar erros como atualização, pode adicionar aqui:
          // if (wasNew) processedAdded++; else processedUpdated++;
        }
      }

      offset += limit;
      if (offset >= total || items.length === 0) {
        Logger.log("✅ Fim da paginação: todos os usuários processados.");
        processedInfo.lastOffset = offset;
        processedInfo.lastPage = page + 1;
        break;
      }
    }

    processedInfo.users = usersInfo;
    processedInfo.lastRun = new Date().toISOString();
    processedInfo.totalProcessed = Object.keys(usersInfo).length;
    saveProcessedInfo(postersRoot, processedInfo);

    // Se não processou nenhum dado/poster e não tentou ainda, tenta novamente automaticamente
    if (totalCreated === 0 && totalUpdated === 0 && retryCount < MAX_RETRIES) {
      Logger.log("⚠️ Nenhum dado/poster processado. Tentando executar novamente automaticamente...");
      return fetchAndSaveAllPosters(postersFolderId, limit, maxPages, retryCount + 1);
    }

    // Se não processou nada, mas há arquivos na pasta, faz auditoria e atualização dos arquivos existentes
    if ((totalCreated === 0 && totalUpdated === 0) && Object.keys(existingFiles).length > 0) {
      Logger.log("🔎 Auditando e atualizando arquivos de posters já existentes na pasta...");

      const now = new Date();
      const postersRoot = DriveApp.getFolderById(folderId);
      const files = postersRoot.getFiles();
      let auditCount = 0;
      while (files.hasNext()) {
        // Respeita o tempo máximo de execução
        if (Date.now() - startTime > MAX_TIME - 2000) {
          Logger.log("⏰ Tempo limite de execução atingido durante auditoria dos arquivos existentes. Encerrando auditoria.");
          break;
        }

        const file = files.next();
        const fileName = file.getName();
        if (!fileName.endsWith('.jpg')) continue;
        const username = fileName.replace('.jpg', '');

        // Verifica se está no processed.json
        let userInfo = usersInfo[username];
        if (!userInfo) {
          Logger.log(`📝 Usuário '${username}' não estava no processed.json. Adicionando...`);
          usersInfo[username] = {
            lastProcessed: file.getLastUpdated().toISOString(),
            fileName: fileName,
            fileUrl: `https://poster.xcam.gay/${username}.jpg`,
            lastStatus: "legacy",
            lastError: null,
            lastRunPage: null,
            lastRunOffset: null,
            lastRunIndex: null
          };
          processedInfo.totalProcessed = Object.keys(usersInfo).length;
          saveProcessedInfo(postersRoot, processedInfo);
          processedAdded++;
        }

        // Atualiza poster se tem mais de 1 hora
        const lastUpdate = file.getLastUpdated();
        if ((now - lastUpdate) > 60 * 60 * 1000) {
          Logger.log(`♻️ Atualizando poster antigo para '${username}' (última atualização: ${lastUpdate.toISOString()})`);
          // Buscar poster atualizado
          const result = fetchAndSavePoster(username, folderId);
          if (result.status === "ok") {
            usersInfo[username] = {
              lastProcessed: new Date().toISOString(),
              fileName: fileName,
              fileUrl: `https://poster.xcam.gay/${username}.jpg`,
              lastStatus: "updated",
              lastError: null,
              lastRunPage: null,
              lastRunOffset: null,
              lastRunIndex: null
            };
            processedInfo.totalProcessed = Object.keys(usersInfo).length;
            saveProcessedInfo(postersRoot, processedInfo);
            processedUpdated++;
          } else {
            Logger.log(`❗ Erro ao atualizar poster de '${username}': ${result.error}`);
          }
        }
        auditCount++;
      }
      Logger.log(`✅ Auditoria e atualização dos posters existentes concluída. Total auditados: ${auditCount}`);
      saveProcessedInfo(postersRoot, processedInfo);
    }

    Logger.log(`📊 Resumo da execução:`);
    Logger.log(`👥 Total de usuários processados: ${totalUsers}`);
    Logger.log(`🖼️ Total de usuários com poster: ${totalWithPoster}`);
    Logger.log(`🆕 Arquivos criados: ${totalCreated}`);
    Logger.log(`🔄 Arquivos atualizados: ${totalUpdated}`);
    Logger.log(`⏭️ Usuários pulados (poster recente ou sem poster): ${totalSkipped}`);
    Logger.log(`❌ Erros ao salvar posters: ${totalErrors}`);
    Logger.log(`📄 processed.json - Usuários adicionados: ${processedAdded}, Usuários atualizados: ${processedUpdated}, Total no processed: ${Object.keys(usersInfo).length}`);

    return {
      resumo: {
        totalUsuarios: totalUsers,
        totalComPoster: totalWithPoster,
        arquivosCriados: totalCreated,
        arquivosAtualizados: totalUpdated,
        pulados: totalSkipped,
        erros: totalErrors
      },
      detalhes: report
    };
  } catch (e) {
    Logger.log(`❗ Erro geral ao buscar/salvar posters: ${e.message}`);
    // Se não processou nenhum dado/poster e não tentou ainda, tenta novamente automaticamente
    if (totalCreated === 0 && totalUpdated === 0 && retryCount < MAX_RETRIES) {
      Logger.log("⚠️ Nenhum dado/poster processado por erro. Tentando executar novamente automaticamente...");
      return fetchAndSaveAllPosters(postersFolderId, limit, maxPages, retryCount + 1);
    }
    return { error: "Erro geral ao buscar/salvar posters: " + e.message, report };
  }
}

/**
 * Audita o processed.json e garante que todos os usuários tenham o campo "fileUrl"
 * seguindo o padrão "https://poster.xcam.gay/${username}.jpg", sempre logo após "fileName".
 * Respeita o tempo máximo de execução (MAX_EXECUTION_TIME_MS).
 * @param {string} [postersFolderId] - (Opcional) ID da pasta de posters.
 * @returns {Object} - Relatório da auditoria.
 */
function auditProcessedJsonFileUrl(postersFolderId) {
  const folderId = postersFolderId || POSTERS_FOLDER_ID;
  const postersRoot = DriveApp.getFolderById(folderId);
  let processedInfo = readProcessedInfo(postersRoot);
  let usersInfo = processedInfo.users || {};
  let updatedCount = 0;

  // Apenas usa MAX_EXECUTION_TIME_MS, não define aqui!
  const MAX_TIME = (typeof MAX_EXECUTION_TIME_MS !== 'undefined') ? MAX_EXECUTION_TIME_MS : 270000;
  const startTime = Date.now();

  const CDN_PREFIX = "https://cdn.xcam.gay/0:/src/poster/";

  const usernames = Object.keys(usersInfo);
  for (let idx = 0; idx < usernames.length; idx++) {
    if (Date.now() - startTime > MAX_TIME - 2000) {
      Logger.log("⏰ Tempo limite de execução atingido durante auditoria do processed.json. Encerrando auditoria.");
      break;
    }
    const username = usernames[idx];
    const userObj = usersInfo[username];
    const fileUrlCorreto = `https://poster.xcam.gay/${username}.jpg`;

    // Corrige se:
    // - fileUrl ausente
    // - fileUrl diferente do padrão correto
    // - fileUrl começa com o prefixo antigo do CDN
    const precisaCorrigir =
      !userObj.fileUrl ||
      userObj.fileUrl !== fileUrlCorreto ||
      (typeof userObj.fileUrl === "string" && userObj.fileUrl.startsWith(CDN_PREFIX));

    if (precisaCorrigir) {
      // Cria novo objeto com fileUrl correto logo após fileName
      const newUserObj = {};
      Object.keys(userObj).forEach(key => {
        newUserObj[key] = userObj[key];
        if (key === "fileName") {
          newUserObj.fileUrl = fileUrlCorreto;
        }
      });
      // Só atualiza se realmente mudou
      if (JSON.stringify(userObj) !== JSON.stringify(newUserObj)) {
        usersInfo[username] = newUserObj;
        updatedCount++;
        Logger.log(`🔧 Corrigido fileUrl para '${username}' em processed.json.`);
      }
    }
  }

  if (updatedCount > 0) {
    processedInfo.users = usersInfo;
    saveProcessedInfo(postersRoot, processedInfo);
    Logger.log(`✅ Auditoria concluída: ${updatedCount} usuários atualizados/corrigidos com fileUrl em processed.json.`);
  } else {
    Logger.log("✅ Auditoria concluída: todos os usuários já possuem fileUrl correto em processed.json.");
  }

  return {
    totalUsuarios: Object.keys(usersInfo).length,
    atualizados: updatedCount
  };
}

/**
 * Função temporária para excluir todos os arquivos da pasta de posters (POSTERS_FOLDER_ID).
 * Use com cuidado! Remove todos os arquivos da raiz da pasta.
 */
function deleteAllPostersFiles(postersFolderId) {
  const folderId = postersFolderId || POSTERS_FOLDER_ID;
  const postersRoot = DriveApp.getFolderById(folderId);
  const files = postersRoot.getFiles();
  let count = 0;
  while (files.hasNext()) {
    const file = files.next();
    Logger.log(`🗑️ Excluindo arquivo: ${file.getName()}`);
    file.setTrashed(true);
    count++;
  }
  Logger.log(`✅ Total de arquivos movidos para a lixeira: ${count}`);
  return { deleted: count };
}

/**
 * Função de teste para verificar permissões de acesso ao Drive.
 */
function testePermissaoDrive() {
  var files = DriveApp.getFiles();
  while (files.hasNext()) {
    Logger.log(files.next().getName());
    break; // só para testar
  }
}

/**
 * ================================================================
 * === Fim do API.gs adaptado para XCam GAY API ================
 * ================================================================
 */