/**
 * ================================================================
 * XCam GAY API Adapter - API.gs
 * ================================================================
 * 
 * Descrição:
 * Este script do Google Apps Script implementa um endpoint webapp
 * dinâmico que atende dois fluxos distintos via parâmetros de URL:
 * 
 * 1. ?user={username}
 *    - Retorna dados agregados: driveData (rec.json do Drive) e apiData (XCam API).
 * 
 * 2. ?rec={username}
 *    - Retorna apenas driveData: conteúdo do rec.json do Drive, sem chamar a XCam API.
 * 
 * - Erros são sempre tratados de forma amigável, e a resposta é sempre JSON.
 * - Modular, fácil de manter e expandir.
 * 
 * Autor: ShemuElDi | XCam
 * Última atualização: 2025-06-11
 * ================================================================
 */

const ROOT_FOLDER_ID = '1R8q38lLoeS1PjASq7GhbtnJG_oo2NcoB';

/**
 * Função principal de entrada para requisições GET.
 * Roteia entre os modos "user" (dados agregados) e "rec" (apenas driveData).
 * 
 * @param {Object} e - Objeto de evento da requisição, contém parâmetros de query.
 * @returns {TextOutput} - Resposta JSON conforme parâmetro recebido.
 */
function doGet(e) {
  // Checa o parâmetro "rec" (prioridade sobre "user")
  if (e.parameter.rec) {
    const username = String(e.parameter.rec);
    return handleDriveDataOnly(username);
  }

  // Checa o parâmetro "user"
  if (e.parameter.user) {
    const username = String(e.parameter.user);
    return handleAggregatedData(username);
  }

  // Se nenhum parâmetro requerido estiver presente, retorna erro
  return respondWithError("Parâmetro obrigatório ausente: use 'user' ou 'rec'.");
}

/**
 * Handler: Retorna apenas o conteúdo de rec.json do Drive.
 * Não chama APIs externas, resposta contém só { driveData }.
 * 
 * @param {string} username - Nome do usuário/pasta.
 * @returns {TextOutput} - JSON apenas com o campo driveData.
 */
function handleDriveDataOnly(username) {
  try {
    const driveData = getDriveRecJson(username);
    return ContentService
      .createTextOutput(JSON.stringify({ driveData }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return respondWithError(error.message);
  }
}

/**
 * Handler: Retorna driveData (rec.json do Drive) + apiData (XCam API).
 * 
 * @param {string} username - Nome do usuário/pasta.
 * @returns {TextOutput} - JSON com user, driveData e apiData.
 */
function handleAggregatedData(username) {
  let driveData = null;
  let apiData = null;

  try {
    // Busca rec.json no Google Drive
    driveData = getDriveRecJson(username);
  } catch (error) {
    // Se falhar, driveData fica null, segue fluxo normalmente
    driveData = null;
  }

  try {
    // Busca dados agregados da XCam API externa
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

  // Monta resposta agregada
  const mergedData = {
    user: username,
    driveData: driveData,
    apiData: apiData
  };

  return ContentService
    .createTextOutput(JSON.stringify(mergedData, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
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
 * ================================================================
 * === Fim do API.gs adaptado para XCam GAY API ================
 * ================================================================
 */