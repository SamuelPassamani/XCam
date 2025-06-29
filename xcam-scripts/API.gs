/**
 * =====================================================================================
 * XCam GAY API Adapter - API.gs
 * =====================================================================================
 *
 * @author      Samuel Passamani / Um Projeto do Estudio A.Sério [AllS Company]
 * @info        https://aserio.work/
 * @version     1.0.0
 * @lastupdate  2025-06-22
 *
 * @description
 * Este script Google Apps Script implementa um endpoint webapp dinâmico para o XCam,
 * permitindo múltiplos fluxos de dados via parâmetros de URL. Atende requisições para:
 * - ?user={username}: retorna dados agregados (Drive + API XCam)
 * - ?rec={username}: retorna apenas dados do Drive (rec.json)
 * - ?poster={username}: retorna apenas dados do usuário em processed.json
 * - ?autorun=log: retorna log incremental do processamento
 * - ?autorun=removeDuplicates: remove arquivos duplicados na pasta de posters
 * - Sem parâmetros: exibe dashboard HTML
 * Todas as respostas são em JSON, com tratamento amigável de erros.
 * O código é modular, seguro, expansível e documentado para fácil manutenção.
 * =====================================================================================
 */

/* ============================================================================
 * 2. CONFIGURAÇÕES & VARIÁVEIS GLOBAIS
 * ========================================================================== */

// IDs das pastas e arquivos no Google Drive utilizados pelo sistema
const ROOT_FOLDER_ID = '1R8q38lLoeS1PjASq7GhbtnJG_oo2NcoB'; // Pasta raiz dos usuários
const POSTERS_FOLDER_ID = '1p1VyLW6mtOn6RAjazl9zR0QWsrQbZBCj'; // Pasta dos posters
const PROCESSED_JSON_FILE_ID = '1ssmHrwaLqTc5H8PLgsmBzSQmAunGgsMq'; // processed.json global
const PROCESSED_RUN_FILE_ID = "1KmCE5o3_W_y9kkAHxrx4H_R2844QHfZz"; // processedRun.json (log incremental)

/* ============================================================================
 * 3. CORPO: FUNÇÕES E EXECUÇÃO PRINCIPAL
 * ========================================================================== */

/**
 * Função principal de entrada para requisições GET.
 * Direciona o fluxo conforme os parâmetros recebidos na URL.
 * @param {Object} e - Objeto de evento da requisição GET.
 * @returns {TextOutput|HtmlOutput} - Resposta JSON ou HTML.
 */
function doGet(e) {
  // Endpoint para retornar o log incremental do processedRun.json (?autorun=log)
  if (e.parameter.autorun && e.parameter.autorun === "log") {
    try {
      const file = DriveApp.getFileById(PROCESSED_RUN_FILE_ID);
      const logs = JSON.parse(file.getBlob().getDataAsString());
      return ContentService
        .createTextOutput(JSON.stringify(logs, null, 2))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService
        .createTextOutput(JSON.stringify([{ts: "", level: "Erro", msg: "processedRun.json não encontrado"}]))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // Endpoint para remoção de duplicatas na pasta de posters (?autorun=removeDuplicates)
  if (e.parameter.autorun && e.parameter.autorun === "removeDuplicates") {
    try {
      removePosterDuplicates();
      return ContentService
        .createTextOutput(JSON.stringify({ status: "ok", message: "Execução de remoção de duplicatas iniciada." }))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "error", message: "Erro ao iniciar remoção de duplicatas: " + err.message }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // Sem parâmetros relevantes: exibe dashboard HTML
  if (
    !e.parameter.poster &&
    !e.parameter.rec &&
    !e.parameter.user &&
    !e.parameter.autorun
  ) {
    return HtmlService.createHtmlOutputFromFile('dashboard')
      .setTitle('XCam Dashboard')
      .setWidth(900)
      .setHeight(700);
  }

  // Objeto de resposta agregada para múltiplos fluxos
  let response = {};

  // Executa fetchAndSaveAllPosters se autorun=run
  if (e.parameter.autorun && e.parameter.autorun === "run") {
    response.autorun = fetchAndSaveAllPosters();
  }

  // Processa ?poster={username} ou ?poster=0 (retorna processed.json inteiro)
  if (e.parameter.poster) {
    const username = String(e.parameter.poster);
    if (username === "0") {
      const processedData = readProcessedJsonFromDrive();
      response.poster = processedData || { error: "Arquivo processed.json não encontrado ou inválido." };
    } else {
      response.poster = handlePosterQueryRaw(username);
    }
  }

  // Processa ?rec={username}
  if (e.parameter.rec) {
    const username = String(e.parameter.rec);
    response.rec = handleDriveDataOnlyRaw(username);
  }

  // Processa ?user={username}
  if (e.parameter.user) {
    const username = String(e.parameter.user);
    response.user = handleAggregatedDataRaw(username);
  }

  // Se nenhum parâmetro reconhecido foi enviado, retorna erro
  if (
    !e.parameter.poster &&
    !e.parameter.rec &&
    !e.parameter.user &&
    !e.parameter.autorun
  ) {
    return respondWithError("Parâmetro obrigatório ausente: use 'poster', 'user' ou 'rec'.");
  }

  // Retorna resposta agregada (pode conter um ou mais resultados)
  return ContentService
    .createTextOutput(JSON.stringify(response, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Faz o parse seguro de um JSON, retornando fallback em caso de erro.
 * @param {string} str - String JSON a ser parseada.
 * @param {*} fallback - Valor de retorno em caso de erro.
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
 * Procura um arquivo pelo nome dentro de uma pasta.
 * Retorna File se encontrado, senão null.
 * @param {Folder} folder - Pasta do Google Drive.
 * @param {string} filename - Nome do arquivo a procurar.
 * @returns {File|null}
 */
function findFileByName(folder, filename) {
  const files = folder.getFilesByName(filename);
  return files.hasNext() ? files.next() : null;
}

/**
 * Busca o usuário no processed.json e retorna apenas seus dados (objeto JS).
 * Usado internamente para resposta agregada.
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
 * Retorna apenas o conteúdo de rec.json do Drive (objeto JS).
 * Usado internamente para resposta agregada.
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
 * Retorna driveData (rec.json do Drive) + apiData (XCam API).
 * Usado internamente para resposta agregada.
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
 */
function handleAggregatedData(username) {
  const result = handleAggregatedDataRaw(username);
  return ContentService
    .createTextOutput(JSON.stringify(result, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Lê e faz o parse do arquivo processed.json do Drive usando sempre o ID.
 * Retorna objeto JS ou null em caso de erro.
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
 * Lê o arquivo processed.json detalhado (retorna objeto com histórico) usando sempre o ID.
 */
function readProcessedInfo() {
  try {
    const file = DriveApp.getFileById(PROCESSED_JSON_FILE_ID);
    const content = file.getBlob().getDataAsString();
    const obj = JSON.parse(content);
    // Garante estrutura mínima
    return {
      lastAudit: obj.lastAudit || null,
      lastRun: obj.lastRun || null,
      lastOffset: obj.lastOffset || 0,
      lastPage: obj.lastPage || 0,
      lastUpdate: obj.lastUpdate || null,
      totalProcessed: obj.totalProcessed || 0,
      users: obj.users || {}
    };
  } catch (e) {
    Logger.log('⚠️ Erro ao ler processed.json: ' + e.message);
    return {
      lastAudit: null,
      lastRun: null,
      lastOffset: 0,
      lastPage: 0,
      lastUpdate: null,
      totalProcessed: 0,
      users: {}
    };
  }
}

/**
 * Salva o arquivo processed.json detalhado usando sempre o ID.
 */
function saveProcessedInfo(processedInfo) {
  processedInfo.lastUpdate = new Date().toISOString();
  const content = JSON.stringify(processedInfo, null, 2);
  try {
    const file = DriveApp.getFileById(PROCESSED_JSON_FILE_ID);
    file.setContent(content);
  } catch (e) {
    Logger.log('⚠️ Erro ao salvar processed.json: ' + e.message);
  }
}

/**
 * Função chamada pelo dashboard para executar o processo e logar incrementalmente.
 * Reseta o log no início e garante atualização incremental em tempo real.
 */
function dashboardFetchAndSaveAllPosters() {
  processedRunLog("🚀 Iniciando fetchAndSaveAllPosters...", true); // reseta log
  try {
    const result = fetchAndSaveAllPosters();
    processedRunLog("✅ Execução concluída!", false);
    processedRunLog("<pre>" + JSON.stringify(result, null, 2) + "</pre>", false);
    return result;
  } catch (e) {
    processedRunLog("❌ Erro: " + e.message, false);
    throw e;
  }
}

/**
 * Busca todos os usuários públicos do CAM4 (paginando) e salva o poster de cada um na raiz da pasta de posters.
 * Usa processed.json detalhado para registrar e continuar de onde parou.
 * Loga tanto no Logger quanto no processedRun.json para dashboard.
 * Todos os logs são incrementais (reset só no início da execução).
 * Ao final, se faltar menos de 30 segundos para o tempo máximo de execução, executa auditProcessedJsonFileUrl automaticamente.
 */
function fetchAndSaveAllPosters(postersFolderId, limit, maxPages, retryCount) {
  const folderId = postersFolderId || POSTERS_FOLDER_ID;
  limit = limit || 300;
  retryCount = retryCount || 0;
  const MAX_RETRIES = 1;

  const report = [];
  let offset = 0;
  let total = 0;
  let totalUsers = 0;
  let totalWithPoster = 0;
  let totalCreated = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  const MAX_TIME = typeof MAX_EXECUTION_TIME_MS !== "undefined" ? MAX_EXECUTION_TIME_MS : 270000;
  const startTime = Date.now();
  const AUDIT_MARGIN_MS = 30000; // 30 segundos

  // Função para registrar log incremental no arquivo PROCESSED_RUN_FILE_ID
  function processedRunLog(msg, reset) {
    const file = DriveApp.getFileById(PROCESSED_RUN_FILE_ID);
    let logs = [];
    if (!reset) {
      try {
        logs = JSON.parse(file.getBlob().getDataAsString());
      } catch (e) { logs = []; }
    }
    if (reset) logs = [];
    logs.push({ ts: new Date().toISOString(), msg: msg });
    const blob = Utilities.newBlob(JSON.stringify(logs, null, 2), 'application/json', 'processedRun.json');
    file.setContent(blob.getDataAsString());
  }

  // Limpa o arquivo de log no início da execução
  processedRunLog("🚀 Iniciando fetchAndSaveAllPosters...", true);

  function log(msg) {
    Logger.log(msg);
    processedRunLog(msg, false);
  }

  let auditCalled = false; // Flag para garantir que a auditoria só rode uma vez

  try {
    log(`🌐 Iniciando busca paginada de usuários no CAM4...`);
    const postersRoot = DriveApp.getFolderById(folderId);

    // Carrega todos os nomes de arquivos existentes na pasta de posters
    const existingFiles = {};
    const files = postersRoot.getFiles();
    while (files.hasNext()) {
      const file = files.next();
      existingFiles[file.getName()] = file.getLastUpdated();
    }
    log(`📂 Arquivos já existentes na pasta de posters: ${Object.keys(existingFiles).length}`);

    // Carrega processed.json detalhado usando o ID
    let processedInfo = readProcessedInfo();
    let usersInfo = processedInfo.users || {};

    // Sempre zera offset e página ao iniciar
    processedInfo.lastOffset = 0;
    processedInfo.lastPage = 0;
    offset = 0;
    let pageStart = 0;

    let processedAdded = 0;
    let processedUpdated = 0;
    let page = 0;

    // Loop até percorrer todos os usuários (offset >= total)
    while (true) {
      const elapsed = Date.now() - startTime;
      const timeLeft = MAX_TIME - elapsed;

      // Se faltar menos de 30 segundos para o tempo máximo, encerra o loop para rodar a auditoria
      if (timeLeft < AUDIT_MARGIN_MS) {
        log("⏳ Faltam menos de 30 segundos para o tempo máximo de execução. Encerrando processamento para rodar auditoria final.");
        processedInfo.lastOffset = offset;
        processedInfo.lastPage = page;
        break;
      }

      if (elapsed > MAX_TIME - 5000) {
        log("⏰ Tempo limite de execução atingido. Encerrando processamento para evitar timeout.");
        processedInfo.lastOffset = offset;
        processedInfo.lastPage = page;
        break;
      }

      log(`📄 Página ${page + 1} | Offset: ${offset} | Limit: ${limit}`);

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

      log(`🔢 ${items.length} usuários encontrados nesta página (total global: ${total}).`);
      totalUsers += items.length;

      for (let i = 0; i < items.length; i++) {
        const elapsedInner = Date.now() - startTime;
        const timeLeftInner = MAX_TIME - elapsedInner;
        if (timeLeftInner < AUDIT_MARGIN_MS) {
          log("⏳ Faltam menos de 30 segundos para o tempo máximo de execução. Encerrando processamento para rodar auditoria final.");
          processedInfo.lastOffset = offset;
          processedInfo.lastPage = page;
          break;
        }
        if (elapsedInner > MAX_TIME - 2000) {
          log("⏰ Tempo limite de execução atingido durante o processamento dos usuários. Encerrando.");
          processedInfo.lastOffset = offset;
          processedInfo.lastPage = page;
          break;
        }

        const user = items[i];
        const username = user?.username;
        const posterUrl = user?.preview?.poster;
        const fileName = `${username}.jpg`;
        const fileUrl = `https://poster.xcam.gay/${username}.jpg`;

        usersInfo[username] = {
          lastProcessed: new Date().toISOString(),
          fileName: fileName,
          fileUrl: fileUrl,
          lastStatus: "ok",
          lastError: null,
          lastRunPage: page !== undefined ? page : null,
          lastRunOffset: offset !== undefined ? offset : null,
          lastRunIndex: i !== undefined ? i : null
        };

        if (!username || !posterUrl) {
          log(`⚠️ Usuário sem username ou poster na posição ${i + offset}. Pulando...`);
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
            log(`⏭️ Poster já existe para '${username}' e foi processado há menos de 1h (${userInfo.lastProcessed}), pulando.`);
            totalSkipped++;
            report.push({ username, status: "skipped", reason: "Poster recente (<1h)" });
            shouldProcess = false;
          }
        }

        if (!shouldProcess) continue;

        log(`👤 Processando usuário: ${username}`);
        log(`🔗 Poster: ${posterUrl}`);

        try {
          log(`⬇️ Baixando imagem do poster de '${username}'...`);
          const imageResponse = UrlFetchApp.fetch(posterUrl);
          const imageBlob = imageResponse.getBlob().setName(fileName);

          if (jaExiste) {
            log(`♻️ Atualizando arquivo existente '${fileName}' para o usuário '${username}'.`);
            const oldFile = findFileByName(postersRoot, fileName);
            if (oldFile) oldFile.setTrashed(true); // Move o arquivo antigo para a lixeira antes de criar o novo
            totalUpdated++;
          } else {
            log(`🆕 Criando novo arquivo '${fileName}' para o usuário '${username}'.`);
            totalCreated++;
          }

          log(`💾 Salvando arquivo '${fileName}' na raiz da pasta de posters...`);
          const file = postersRoot.createFile(imageBlob); // Cria o novo arquivo na pasta correta

          log(`🎉 Poster salvo com sucesso: ${file.getName()}`);
          report.push({ username, status: "ok", file: file.getName() });

          usersInfo[username] = {
            lastProcessed: new Date().toISOString(),
            fileName: fileName,
            fileUrl: `https://poster.xcam.gay/${username}.jpg`,
            lastStatus: "ok",
            lastError: null,
            lastRunPage: page !== undefined ? page : null,
            lastRunOffset: offset !== undefined ? offset : null,
            lastRunIndex: i !== undefined ? i : null
          };

          if (wasNew) {
            processedAdded++;
          } else {
            processedUpdated++;
          }
        } catch (e) {
          totalErrors++;
          const errorMessage = e.message || "Erro desconhecido";
          report.push({ username, status: "error", error: errorMessage });
          usersInfo[username] = {
            lastProcessed: new Date().toISOString(),
            fileName: fileName,
            fileUrl: null,
            lastStatus: "error",
            lastError: errorMessage,
            lastRunPage: page !== undefined ? page : null,
            lastRunOffset: offset !== undefined ? offset : null,
            lastRunIndex: i !== undefined ? i : null
          };
          log(`❌ Erro ao processar usuário '${username}': ${errorMessage}`);
        }
      }

      offset += limit;
      page++;

      // Condição de parada: percorreu todos os usuários ou não há mais itens
      if (offset >= total || items.length === 0) {
        log("✅ Fim da paginação: todos os usuários processados.");
        processedInfo.lastOffset = offset;
        processedInfo.lastPage = page;
        break;
      }
    }

    // Atualiza processedInfo com os campos obrigatórios no início do objeto
    const nowIso = new Date().toISOString();
    processedInfo.lastAudit = processedInfo.lastAudit || null; // Mantém o valor anterior, não atualiza aqui
    processedInfo.lastRun = nowIso;
    processedInfo.lastOffset = offset;
    processedInfo.lastPage = page;
    processedInfo.lastUpdate = nowIso;
    processedInfo.totalProcessed = Object.keys(usersInfo).length;
    processedInfo.users = usersInfo;

    saveProcessedInfo(processedInfo);

    // Chama auditoria se ainda não foi chamada e está dentro do tempo
    const elapsedAfter = Date.now() - startTime;
    const timeLeftAfter = MAX_TIME - elapsedAfter;
    if (!auditCalled && timeLeftAfter > 0 && timeLeftAfter < AUDIT_MARGIN_MS) {
      log("🛡️ Executando auditoria final (auditProcessedJsonFileUrl) antes do tempo limite...");
      auditProcessedJsonFileUrl(folderId);
      auditCalled = true;
    }

    log(`📊 Resumo da execução:`);
    log(`👥 Total de usuários processados: ${totalUsers}`);
    log(`🖼️ Total de usuários com poster: ${totalWithPoster}`);
    log(`🆕 Arquivos criados: ${totalCreated}`);
    log(`🔄 Arquivos atualizados: ${totalUpdated}`);
    log(`⏭️ Usuários pulados (poster recente ou sem poster): ${totalSkipped}`);
    log(`❌ Erros ao salvar posters: ${totalErrors}`);
    log(`📄 processed.json - Usuários adicionados: ${processedAdded}, Usuários atualizados: ${processedUpdated}, Total no processed: ${Object.keys(usersInfo).length}`);

    log("✅ Execução concluída!");
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
    log(`❗ Erro geral ao buscar/salvar posters: ${e.message}`);
    if (totalCreated === 0 && totalUpdated === 0 && retryCount < MAX_RETRIES) {
      log("⚠️ Nenhum dado/poster processado por erro. Tentando executar novamente automaticamente...");
      return fetchAndSaveAllPosters(postersFolderId, limit, undefined, retryCount + 1);
    }
    return { error: "Erro geral ao buscar/salvar posters: " + e.message, report };
  }
}

/**
 * Audita o processed.json e garante que todos os arquivos físicos em POSTERS_FOLDER_ID/{username}.jpg
 * estejam presentes no processed.json, adicionando entradas ausentes seguindo o padrão.
 * Também corrige o campo fileUrl se necessário e atualiza os campos de controle no início do arquivo.
 * Loga todas as etapas detalhadamente no Logger do Google Apps Script.
 * @param {string} [postersFolderId] - (Opcional) ID da pasta de posters.
 * @returns {Object} - Relatório da auditoria.
 */
function auditProcessedJsonFileUrl(postersFolderId) {
  Logger.log("🔍 Iniciando auditoria do processed.json e da pasta de posters...");

  const folderId = postersFolderId || POSTERS_FOLDER_ID;
  Logger.log(`📁 Usando pasta de posters: ${folderId}`);

  const postersRoot = DriveApp.getFolderById(folderId);

  // Carrega processed.json detalhado usando o ID
  Logger.log("📄 Lendo arquivo processed.json...");
  let processedInfo = readProcessedInfo();
  let usersInfo = processedInfo.users || {};
  let updatedCount = 0;
  let addedCount = 0;

  const MAX_TIME = typeof MAX_EXECUTION_TIME_MS !== "undefined" ? MAX_EXECUTION_TIME_MS : 270000;
  const startTime = Date.now();

  const CDN_PREFIX = "https://cdn.xcam.gay/0:/src/poster/";

  // 1. Mapeia todos os arquivos físicos na pasta de posters
  Logger.log("🗂️ Mapeando arquivos físicos .jpg na pasta de posters...");
  const files = postersRoot.getFiles();
  const fileUsernames = [];
  let totalArquivosFisicos = 0;
  while (files.hasNext()) {
    if (Date.now() - startTime > MAX_TIME - 2000) {
      Logger.log("⏰ Tempo limite de execução atingido durante auditoria do processed.json. Encerrando auditoria.");
      break;
    }
    const file = files.next();
    const name = file.getName();
    if (/^([a-zA-Z0-9_\-]+)\.jpg$/.test(name)) {
      const username = name.replace(/\.jpg$/, "");
      fileUsernames.push(username);
      totalArquivosFisicos++;
      Logger.log(`   📸 Encontrado arquivo: ${name}`);
    }
  }
  Logger.log(`🔢 Total de arquivos .jpg encontrados: ${totalArquivosFisicos}`);

  // 2. Para cada arquivo físico, garante presença no processed.json
  Logger.log("🔎 Verificando presença de cada arquivo físico no processed.json...");
  fileUsernames.forEach(username => {
    const fileName = `${username}.jpg`;
    const fileUrlCorreto = `https://poster.xcam.gay/${username}.jpg`;

    if (!usersInfo[username]) {
      usersInfo[username] = {
        lastProcessed: new Date().toISOString(),
        fileName: fileName,
        fileUrl: fileUrlCorreto,
        lastStatus: "ok",
        lastError: null,
        lastRunPage: null,
        lastRunOffset: null,
        lastRunIndex: null
      };
      addedCount++;
      Logger.log(`➕ Usuário '${username}' adicionado ao processed.json.`);
    } else {
      const userObj = usersInfo[username];
      if (
        !userObj.fileUrl ||
        userObj.fileUrl !== fileUrlCorreto ||
        (typeof userObj.fileUrl === "string" && userObj.fileUrl.startsWith(CDN_PREFIX))
      ) {
        const newUserObj = {};
        Object.keys(userObj).forEach(key => {
          newUserObj[key] = userObj[key];
          if (key === "fileName") {
            newUserObj.fileUrl = fileUrlCorreto;
          }
        });
        usersInfo[username] = newUserObj;
        updatedCount++;
        Logger.log(`🔧 Corrigido fileUrl para '${username}' em processed.json.`);
      } else {
        Logger.log(`✅ Usuário '${username}' já está correto em processed.json.`);
      }
    }
  });

  // 3. Atualiza campos de controle no início do arquivo processed.json
  const nowIso = new Date().toISOString();
  Logger.log("📝 Atualizando campos de controle no início do processed.json...");
  processedInfo.lastAudit = nowIso; // Novo campo: data/hora da última auditoria
  processedInfo.lastRun = processedInfo.lastRun || null;
  processedInfo.lastOffset = processedInfo.lastOffset || 0;
  processedInfo.lastPage = processedInfo.lastPage || 0;
  processedInfo.lastUpdate = nowIso; // Atualiza também o lastUpdate
  processedInfo.totalProcessed = fileUsernames.length; // Total de arquivos físicos .jpg
  processedInfo.users = usersInfo;

  // 4. Salva processed.json usando sempre o ID
  Logger.log("💾 Salvando processed.json atualizado...");
  saveProcessedInfo(processedInfo);

  Logger.log(`🎯 Auditoria concluída!`);
  Logger.log(`📊 Resumo:`);
  Logger.log(`   ➕ Usuários adicionados: ${addedCount}`);
  Logger.log(`   🔧 Usuários atualizados: ${updatedCount}`);
  Logger.log(`   📸 Total de arquivos físicos: ${fileUsernames.length}`);
  Logger.log(`   🗃️ Total de usuários em processed.json: ${Object.keys(usersInfo).length}`);
  Logger.log(`   🕒 Última auditoria: ${processedInfo.lastAudit}`);

  return {
    totalArquivosFisicos: fileUsernames.length,
    totalUsuariosProcessed: Object.keys(usersInfo).length,
    adicionados: addedCount,
    atualizados: updatedCount,
    lastAudit: processedInfo.lastAudit,
    totalProcessed: processedInfo.totalProcessed
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
 * Função para exibir o painel do dashboard.
 */
function showDashboard() {
  var html = HtmlService.createHtmlOutputFromFile('dashboard')
    .setWidth(800)
    .setHeight(700);
  SpreadsheetApp.getUi().showModalDialog(html, 'XCam Dashboard');
}

/**
 * Salva uma mensagem no log incremental do dashboard.
 */
function dashboardLog(msg, reset) {
  const folder = DriveApp.getFolderById(POSTERS_FOLDER_ID);
  let file = findFileByName(folder, 'dashboard-log.json');
  let logs = [];
  if (!reset && file) {
    try {
      logs = JSON.parse(file.getBlob().getDataAsString());
    } catch (e) { logs = []; }
  }
  if (reset) logs = [];
  logs.push({ ts: new Date().toISOString(), msg: msg });
  const blob = Utilities.newBlob(JSON.stringify(logs, null, 2), 'application/json', 'dashboard-log.json');
  if (file) file.setTrashed(true);
  folder.createFile(blob);
}

/**
 * Retorna o log incremental para o dashboard.
 */
function dashboardGetLog() {
  const folder = DriveApp.getFolderById(POSTERS_FOLDER_ID);
  const file = findFileByName(folder, 'dashboard-log.json');
  if (!file) return [];
  try {
    return JSON.parse(file.getBlob().getDataAsString());
  } catch (e) {
    return [];
  }
}

/**
 * Função chamada pelo dashboard para executar o processo e logar incrementalmente.
 */
function dashboardFetchAndSaveAllPosters() {
  processedRunLog("🚀 Iniciando fetchAndSaveAllPosters...", true); // reseta log
  try {
    const result = fetchAndSaveAllPosters();
    processedRunLog("✅ Execução concluída!", false);
    processedRunLog("<pre>" + JSON.stringify(result, null, 2) + "</pre>", false);
    return result;
  } catch (e) {
    processedRunLog("❌ Erro: " + e.message, false);
    throw e;
  }
}

/**
 * Função temporária para exibir o conteúdo do processedRun.json.
 */
function tempShowProcessedRunLog() {
  try {
    const file = DriveApp.getFileById(PROCESSED_RUN_FILE_ID);
    const logs = JSON.parse(file.getBlob().getDataAsString());
    return ContentService
      .createTextOutput(JSON.stringify(logs, null, 2))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify([{ts: "", level: "Erro", msg: "processedRun.json não encontrado"}]))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Executa uma requisição GET para o endpoint remoto de autorun=run.
 * Retorna o resultado da requisição já convertido em objeto JS.
 */
function callRemoteAutorunRun() {
  const url = "https://script.google.com/macros/s/AKfycbyr1M8TYzdRaJpaCbFcnAFGh7JbERDX9EfgOGUCKDZDriGsxudgBLTrmxU3PP4REoOqdA/exec?autorun=run";
  try {
    const response = UrlFetchApp.fetch(url, {
      method: "get",
      muteHttpExceptions: true,
      followRedirects: true,
      validateHttpsCertificates: true
    });
    const content = response.getContentText();
    return safeParseJSON(content, { error: "Resposta inválida do endpoint remoto." });
  } catch (e) {
    return { error: "Erro ao chamar endpoint remoto: " + e.message };
  }
}

/**
 * Executa uma requisição GET para o endpoint remoto de autorun=removeDuplicates.
 * Não retorna o resultado, apenas executa a chamada.
 */
function callRemoteAutorunRemoveDuplicates() {
  const url = "https://script.google.com/macros/s/AKfycbyr1M8TYzdRaJpaCbFcnAFGh7JbERDX9EfgOGUCKDZDriGsxudgBLTrmxU3PP4REoOqdA/exec?autorun=removeDuplicates";
  try {
    UrlFetchApp.fetch(url, {
      method: "get",
      muteHttpExceptions: true,
      followRedirects: true,
      validateHttpsCertificates: true
    });
    Logger.log("✅ Chamada para remoção de duplicatas enviada com sucesso.");
  } catch (e) {
    Logger.log("❌ Erro ao chamar endpoint remoto de remoção de duplicatas: " + e.message);
  }
}

/**
 * Remove arquivos duplicados na pasta de posters, mantendo apenas o mais recente por nome.
 * Exibe logs detalhados sobre o processo, arquivos encontrados, duplicatas e exclusões.
 * Respeita o tempo máximo de execução (MAX_EXECUTION_TIME_MS) já definido no projeto.
 */
function removePosterDuplicates(postersFolderId) {
  const folderId = postersFolderId || POSTERS_FOLDER_ID;
  const postersRoot = DriveApp.getFolderById(folderId);
  const files = postersRoot.getFiles();

  const fileMap = {};
  let totalArquivos = 0;
  let totalDuplicados = 0;
  let totalRemovidos = 0;
  const detalhesRemovidos = [];

  Logger.log("🔎 Iniciando varredura de arquivos na pasta de posters para remoção de duplicatas...");

  const startTime = Date.now();
  const MAX_TIME = MAX_EXECUTION_TIME_MS; // Apenas usa o valor já definido

  // Mapeia arquivos por nome
  while (files.hasNext()) {
    if (Date.now() - startTime > MAX_TIME - 3000) {
      Logger.log("⏰ Tempo limite de execução atingido durante varredura. Encerrando.");
      break;
    }
    const file = files.next();
    const name = file.getName();
    const lastUpdated = file.getLastUpdated();
    const id = file.getId();
    if (!fileMap[name]) fileMap[name] = [];
    fileMap[name].push({ file, lastUpdated, id });
    totalArquivos++;
  }

  Logger.log(`📂 Total de arquivos encontrados: ${totalArquivos}`);

  // Processa duplicatas
  Object.keys(fileMap).forEach(name => {
    const fileList = fileMap[name];
    if (fileList.length > 1) {
      Logger.log(`⚠️ Arquivo duplicado encontrado: '${name}' (${fileList.length} cópias)`);
      totalDuplicados++;
      // Ordena por data de modificação (mais recente primeiro)
      fileList.sort((a, b) => b.lastUpdated - a.lastUpdated);
      // Mantém o mais recente, remove os outros
      for (let i = 1; i < fileList.length; i++) {
        if (Date.now() - startTime > MAX_TIME - 2000) {
          Logger.log("⏰ Tempo limite de execução atingido durante exclusão. Encerrando.");
          return;
        }
        try {
          fileList[i].file.setTrashed(true);
          Logger.log(`🗑️ Arquivo duplicado removido: '${name}' (ID: ${fileList[i].id}) | Data: ${fileList[i].lastUpdated}`);
          detalhesRemovidos.push({
            nome: name,
            removidoId: fileList[i].id,
            mantidoId: fileList[0].id,
            removidoData: fileList[i].lastUpdated,
            mantidoData: fileList[0].lastUpdated
          });
          totalRemovidos++;
        } catch (e) {
          Logger.log(`❌ Erro ao remover duplicado '${name}' (ID: ${fileList[i].id}): ${e.message}`);
        }
      }
    }
  });

  Logger.log(`✅ Processo concluído! Duplicatas encontradas: ${totalDuplicados}, arquivos removidos: ${totalRemovidos}`);
  if (totalRemovidos === 0) {
    Logger.log("Nenhum arquivo duplicado foi removido.");
  }

  return {
    totalArquivos,
    duplicatasEncontradas: totalDuplicados,
    arquivosRemovidos: totalRemovidos,
    detalhes: detalhesRemovidos
  };
}

/* ============================================================================
 * 4. RODAPÉ / FIM DO CÓDIGO
 * ========================================================================== */
/**
 * =====================================================================================
 * FIM DO SCRIPT
 * =====================================================================================
 *
 * @log de mudanças:
 * - v1.0.0 (22/06/2025): Estrutura inicial do adaptador de API XCam para Google Apps Script.
 *   - Suporte a múltiplos fluxos via parâmetros (?user, ?rec, ?poster, ?autorun).
 *   - Dashboard HTML integrado.
 *   - Log incremental e auditoria de arquivos.
 *   - Funções de manutenção e limpeza.
 *
 * @roadmap futuro:
 * - Adicionar autenticação e controle de acesso por token.
 * - Melhorar performance para grandes volumes de usuários.
 * - Implementar cache distribuído para posters.
 * - Suporte a múltiplos projetos XCam e multi-tenant.
 * - Integração com sistemas externos de analytics.
 *
 * =====================================================================================
 */