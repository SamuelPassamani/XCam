// Software: GDI-JS
// Version: 2.3.6
// Author: Parveen Bhadoo
// Website: https://gdi.js.org

// ============================================================================
// CONFIGURAÇÃO DE AMBIENTE E AUTENTICAÇÃO
// ============================================================================

/**
 * environment:
 * Define o ambiente de execução da aplicação.
 * Pode ser 'production' (produção), 'development' (desenvolvimento) ou 'local'.
 * Esta variável pode ser utilizada para alternar comportamentos ou endpoints do sistema
 * de acordo com o ambiente em que está rodando.
 */
const environment = 'production';

// ============================================================================
// CONFIGURAÇÃO DE CONTAS DE SERVIÇO (SERVICE ACCOUNTS)
// ============================================================================

/**
 * serviceaccounts:
 * Lista de objetos de contas de serviço Google (service accounts) utilizadas para autenticação
 * e manipulação da API do Google Drive. Cada objeto deve conter as credenciais JSON de uma conta.
 * Adicione múltiplas contas para balanceamento de carga e evitar limites de uso.
 */
const serviceaccounts = [
  // Exemplo de preenchimento:
  // { "type": "service_account", "project_id": "...", ... }
];

/**
 * randomserviceaccount:
 * Seleciona aleatoriamente uma das contas de serviço cadastradas.
 * Isso permite distribuir as requisições entre várias contas, evitando bloqueios por excesso de uso.
 * NÃO ALTERE esta linha, pois é fundamental para o funcionamento do sistema.
 */
const randomserviceaccount = serviceaccounts[Math.floor(Math.random() * serviceaccounts.length)];

// ============================================================================
// CONFIGURAÇÃO DE DOMÍNIOS DE DOWNLOAD E BLOQUEIOS
// ============================================================================

/**
 * domains_for_dl:
 * Lista de domínios/endereços (por exemplo, Workers do Cloudflare) usados para download/streaming.
 * Permite balanceamento de carga entre vários servidores.
 * Exemplo: ['https://dl1.seudominio.com', 'https://dl2.seudominio.com']
 */
const domains_for_dl = [''];

/**
 * domain_for_dl:
 * Seleciona aleatoriamente um dos domínios de download disponíveis.
 * NÃO ALTERE esta linha.
 */
const domain_for_dl = domains_for_dl[Math.floor(Math.random() * domains_for_dl.length)];

/**
 * blocked_region:
 * Lista de códigos de regiões (ISO Alpha-2) bloqueadas para acesso ao sistema.
 * Usuários destes países não poderão acessar o serviço.
 * Exemplo: ['IN', 'US', 'PK']
 */
const blocked_region = [''];

/**
 * blocked_asn:
 * Lista de números ASN (sistemas autônomos de internet) bloqueados.
 * Permite bloquear provedores inteiros, útil para evitar ataques ou acessos indesejados.
 * Exemplo: [16509, 12345]
 */
const blocked_asn = [];

// ============================================================================
// CONFIGURAÇÃO DE AUTENTICAÇÃO E PERMISSÕES
// ============================================================================

/**
 * authConfig:
 * Objeto principal de configuração de autenticação, autorização e controle de acesso.
 */
const authConfig = {
  /**
   * siteName:
   * Nome do site exibido na interface de usuário.
   */
  "siteName": "XCam Drive",

  /**
   * client_id / client_secret / refresh_token:
   * Credenciais OAuth2 do Google obtidas no Google Cloud Console.
   * São utilizadas para autenticação via API do Google Drive.
   */
  "client_id": "",
  "client_secret": "",
  "refresh_token": "",

  /**
   * service_account:
   * Define se será utilizado uma conta de serviço (true) ou conta de usuário (false).
   */
  "service_account": true,

  /**
   * service_account_json:
   * Armazena a conta de serviço selecionada aleatoriamente da lista.
   * NÃO ALTERE esta linha.
   */
  "service_account_json": randomserviceaccount,

  /**
   * files_list_page_size / search_result_list_page_size:
   * Define o número máximo de itens por página na listagem de arquivos e resultados de busca.
   */
  "files_list_page_size": 100,
  "search_result_list_page_size": 100,

  /**
   * enable_cors_file_down:
   * Define se o download de arquivos terá suporte a CORS (Cross-Origin Resource Sharing).
   */
  "enable_cors_file_down": false,

  /**
   * enable_password_file_verify:
   * Suporte a arquivos .password para proteção de diretórios (ainda não funcional).
   */
  "enable_password_file_verify": false,

  /**
   * direct_link_protection:
   * Se ativado, obriga o usuário a visualizar a interface antes de baixar arquivos por link direto.
   */
  "direct_link_protection": false,

  /**
   * disable_anonymous_download:
   * Se ativado, impede downloads diretos sem sessão autenticada.
   */
  "disable_anonymous_download": false,

  /**
   * file_link_expiry:
   * Define o tempo de expiração dos links de arquivos (em dias). 0 = nunca expira.
   */
  "file_link_expiry": 0,

  /**
   * search_all_drives:
   * Permite buscar arquivos em todos os drives disponíveis na conta.
   */
  "search_all_drives": true,

  /**
   * enable_login / enable_signup / enable_social_login:
   * Ativa/desativa o sistema de login, cadastro e login via redes sociais.
   */
  "enable_login": true,
  "enable_signup": false,
  "enable_social_login": false,

  /**
   * google_client_id_for_login / google_client_secret_for_login / redirect_domain:
   * Credenciais específicas para login social via Google, e domínio de redirecionamento após login.
   */
  "google_client_id_for_login": "",
  "google_client_secret_for_login": "",
  "redirect_domain": "",

  /**
   * login_database:
   * Define o tipo de armazenamento dos usuários. Pode ser 'Local' ou 'KV' (Key-Value, externo).
   */
  "login_database": "Local",

  /**
   * login_days:
   * Quantidade de dias para manter o usuário autenticado (cookie/sessão).
   */
  "login_days": 7,

  /**
   * enable_ip_lock:
   * Se ativado, vincula o download à faixa de IP do usuário.
   */
  "enable_ip_lock": false,

  /**
   * single_session:
   * Se ativado, permite apenas uma sessão simultânea por usuário.
   */
  "single_session": false,

  /**
   * ip_changed_action:
   * Se ativado, força logout do usuário se o IP mudar durante a sessão.
   */
  "ip_changed_action": false,

  /**
   * users_list:
   * Lista de usuários locais autorizados a acessar o sistema.
   * Cada objeto possui 'username' e 'password' em texto (recomenda-se criptografar em produção).
   */
  "users_list": [
    {
      "username": "WebMaster",
      "password": "Love1991D@t@",
    }
  ],

  /**
   * roots:
   * Lista de diretórios/raiz do Google Drive que serão exibidos na interface.
   * Cada objeto representa um drive ou pasta compartilhada, podendo definir nome e proteção de links.
   */
  "roots": [
    {
      "id": "1EpBIC70TDpZ_KaO0JYLZ-0rVxzsKWI4z",
      "name": "XCam Drive SRC.0",
      "protect_file_link": false,
    },
    {
      "id": "1ba5ZJ8f43UvUI4LFnrj9BDR_u2AYgNjy",
      "name": "XCam Drive SRC.1",
      "protect_file_link": false
    },
    {
      "id": "1kqgFLPPaf4KFNDcxE7SgO7f_1up0fxqe",
      "name": "XCam Repo",
      "protect_file_link": false
    },
    {
      "id": "1Y3KkPqFZt-aEOgUqAWHzB7_dOUmgHywK",
      "name": "00-MUST-HAVE",
      "protect_file_link": false
    }
  ]
};

// ============================================================================
// Chaves e Vetores de Inicialização para Criptografia e HMAC
// ============================================================================

// ============================================================================
// Configuração de Parâmetros Criptográficos
// ============================================================================

/**
 * crypto_base_key:
 * Esta constante armazena a chave secreta utilizada nos algoritmos de criptografia simétrica,
 * como AES (Advanced Encryption Standard), com tamanho de 256 bits (32 bytes).
 * Essa chave é fundamental para garantir a confidencialidade dos dados, pois é usada tanto para
 * criptografar quanto para descriptografar as informações protegidas.
 * IMPORTANTE: Nunca utilize chaves de exemplo em ambientes de produção. Gere uma chave forte e única
 * para cada aplicação, de preferência utilizando um gerador criptograficamente seguro.
 */
const crypto_base_key = "3225f86e99e205347b4310e437253bfd";

/**
 * hmac_base_key:
 * Esta constante define a chave secreta utilizada para operações de HMAC (Hash-based Message Authentication Code),
 * também com tamanho de 256 bits (64 caracteres hexadecimais). O HMAC é um mecanismo que garante a integridade
 * e autenticidade das mensagens, verificando se os dados não foram alterados e confirmando sua origem legítima.
 * Assim como a chave de criptografia, é essencial que esta chave seja exclusiva, sigilosa e gerada de forma segura.
 */
const hmac_base_key = "4d1fbf294186b82d74fff2494c04012364200263d6a36123db0bd08d6be1423c";

/**
 * encrypt_iv:
 * O vetor de inicialização (IV - Initialization Vector) é um array de bytes utilizado em conjunto com o algoritmo de
 * criptografia simétrica (exemplo: AES em modo CBC ou CTR). O IV garante que, mesmo que a mesma mensagem seja
 * criptografada diversas vezes com a mesma chave, o resultado final será diferente a cada execução, prevenindo ataques
 * por padrões repetidos (como ataques de análise de frequência).
 * O tamanho típico para IV em AES é de 16 bytes (128 bits), como apresentado abaixo.
 * IMPORTANTE: O IV não precisa ser secreto, mas deve ser sempre único para cada operação de criptografia com a mesma chave.
 */
const encrypt_iv = new Uint8Array([
  247, 254, 106, 195, 32, 148, 131, 244,
  222, 133, 26, 182, 20, 138, 215, 81
]);

// ============================================================================
// Configurações da Interface de Usuário (UI)
// ============================================================================

const uiConfig = {
  // Tema visual do site. Altere entre temas disponíveis.
  // Exemplo: "darkly", "slate", entre outros.
  "theme": "darkly",

  // Versão do sistema. NÃO ALTERE manualmente.
  "version": "2.3.6",

  // Defina como 'true' se desejar usar uma imagem como logotipo.
  "logo_image": true,

  // Altura do logotipo. Só necessário se logo_image for true.
  "logo_height": "",

  // Largura do logotipo. Só necessário se logo_image for true.
  "logo_width": "100px",

  // Caminho do favicon do site.
  "favicon": "https://cdn.jsdelivr.net/npm/@googledrive/index@2.2.3/images/favicon.ico",

  // Caso logo_image seja true, insira o link da imagem do logotipo.
  // Caso contrário, este campo será utilizado como nome/texto do logotipo.
  "logo_link_name": "https://cdn.jsdelivr.net/npm/@googledrive/index@2.2.3/images/bhadoo-cloud-logo-white.svg",

  // Imagem exibida na tela de login.
  "login_image": "https://xcam.gay/src/logo.svg",

  // Define se o cabeçalho (header) é fixo na página.
  "fixed_header": true,

  // Espaçamento do cabeçalho. Use 80 para header fixo, 20 para flexível.
  "header_padding": "80",

  // Nomes dos links da barra de navegação.
  "nav_link_1": "Home",
  "nav_link_3": "Current Path",
  "nav_link_4": "Contact",

  // Define se o rodapé (footer) é fixo.
  "fixed_footer": false,

  // Esconde o rodapé completamente se true.
  "hide_footer": true,

  // Classes de estilo CSS para header e footer.
  "header_style_class": "navbar-dark bg-primary", // Exemplo: navbar-dark bg-primary
  "footer_style_class": "bg-primary",             // Exemplo: bg-primary

  // Cores personalizadas para elementos do site.
  "css_a_tag_color": "white",      // Cor dos links <a>
  "css_p_tag_color": "white",      // Cor dos parágrafos <p>
  "folder_text_color": "white",    // Cor do texto das pastas

  // Classes de estilo para componentes do Bootstrap (spinners, botões, alertas).
  "loading_spinner_class": "text-light",       // Cor do spinner de carregamento
  "search_button_class": "btn btn-danger",     // Classe do botão de busca
  "path_nav_alert_class": "alert alert-primary", // Classe do alerta de navegação de caminho
  "file_view_alert_class": "alert alert-danger", // Classe do alerta de visualização de arquivo
  "file_count_alert_class": "alert alert-secondary", // Classe do alerta de contagem de arquivos

  // Link do botão de contato no menu.
  "contact_link": "https://telegram.dog/Telegram",

  // Ano do copyright.
  "copyright_year": "2050",

  // Nome da empresa exibido no copyright.
  "company_name": "The Bay Index",

  // Link relacionado ao nome da empresa no copyright.
  "company_link": "https://telegram.dog/Telegram",

  // Mostra os créditos do sistema. Recomenda-se manter true.
  "credit": true,

  // Exibe o tamanho do arquivo na listagem.
  "display_size": true,

  // Exibe a data de modificação de arquivos e pastas.
  "display_time": false,

  // Exibe o ícone de download para arquivos e pastas.
  "display_download": true,

  // Desabilita players de áudio e vídeo caso true.
  "disable_player": false,

  // Remove os botões de download/cópia de vídeos se true.
  "disable_video_download": false,

  // Permite seleção de múltiplos arquivos para download em lote.
  "allow_selecting_files": true,

  // Exibe outro domínio para download, caso deseje proteger o domínio principal.
  "second_domain_for_dl": false,

  // Imagem exibida como poster nos vídeos.
  "poster": "https://cdn.jsdelivr.net/npm/@googledrive/index@2.2.3/images/poster.jpg",

  // Imagem exibida como poster nos áudios.
  "audioposter": "https://cdn.jsdelivr.net/npm/@googledrive/index@2.2.3/images/music.jpg",

  // Fonte CDN para os scripts JS.
  "jsdelivr_cdn_src": "https://cdn.jsdelivr.net/npm/@googledrive/index",

  // Renderiza arquivos Head.md e Readme.md caso true.
  "render_head_md": true,
  "render_readme_md": true,

  // Link da página de erro de autorização.
  "unauthorized_owner_link": "https://telegram.dog/Telegram",

  // E-mail de contato exibido na página de erro de autorização.
  "unauthorized_owner_email": "abuse@telegram.org",

  // Domínio alternativo para downloads (definido em variável domain_for_dl fora deste trecho).
  "downloaddomain": domain_for_dl,

  // Exibe botão de logout caso login esteja habilitado nas configurações de autenticação.
  "show_logout_button": authConfig.enable_login ? true : false,

  // Permite copiar arquivos. Defina como false para desabilitar.
  "allow_file_copy": false,
};

// ============================================================================
// CONFIGURAÇÃO DO PLAYER DE VÍDEO
// ============================================================================

/**
 * player_config:
 * Objeto responsável por definir qual player de vídeo será utilizado na aplicação,
 * bem como as versões das bibliotecas suportadas.
 * - "player": Define o player padrão da aplicação. Opções possíveis:
 *   - 'videojs' (padrão)
 *   - 'plyr'
 *   - 'dplayer'
 *   - 'jwplayer'
 * - "videojs_version", "plyr_io_version", "jwplayer_version": Versões das respectivas bibliotecas.
 */
const player_config = {
  "player": "videojs",           // Player padrão: videojs. Outras opções: plyr, dplayer, jwplayer.
  "videojs_version": "8.3.0",    // Versão do Video.js utilizada.
  "plyr_io_version": "3.7.8",    // Versão do Plyr.io utilizada.
  "jwplayer_version": "8.16.2"   // Versão do JWPlayer utilizada.
};

// ============================================================================
// VARIÁVEIS E CONSTANTES DE EXECUÇÃO DA APLICAÇÃO
// ============================================================================

/**
 * gds:
 * Array global de instâncias ou informações relacionadas ao Google Drive.
 * Inicializado vazio. Usado internamente pela aplicação para gerenciar múltiplos drives.
 */
var gds = [];

/**
 * drive_list:
 * Lista de IDs de todas as raízes dos Drives configurados em authConfig.
 * Utilizada para operações em lote ou iteração sobre múltiplos Drives.
 */
const drive_list = authConfig.roots.map(it => it.id);

// ============================================================================
// DEFINIÇÃO DO ARQUIVO JAVASCRIPT PRINCIPAL DA APLICAÇÃO
// ============================================================================

/**
 * app_js_file:
 * Caminho para o arquivo principal JavaScript da aplicação ("app.js").
 * O caminho é determinado conforme o ambiente definido na variável 'environment':
 * - 'production': Usa o arquivo minificado hospedado no CDN, respeitando a versão definida em uiConfig.
 * - 'development': Usa o arquivo local não minificado para facilitar debugging.
 * - 'local': Usa o arquivo hospedado localmente, normalmente via endereço 127.0.0.1, utilizado para desenvolvimento local.
 */
let app_js_file;
if (environment === 'production') {
  // Em produção, carrega a versão minificada do CDN, conforme a versão informada na configuração da UI.
  app_js_file = uiConfig.jsdelivr_cdn_src + '@' + uiConfig.version + '/src/app.min.js';
} else if (environment === 'development') {
  // Em desenvolvimento, utiliza o script local (não minificado) para facilitar testes e debugging.
  app_js_file = '/app.js';
} else if (environment === 'local') {
  // Em ambiente local, utiliza o arquivo hospedado no próprio computador do desenvolvedor.
  app_js_file = 'http://127.0.0.1:5500/src/app.js';
}

// ============================================================================
// FIM DA CONFIGURAÇÃO
// ============================================================================

/**
 * ATENÇÃO:
 * Não altere nada abaixo deste ponto caso não saiba o que está fazendo.
 * As configurações acima garantem o correto funcionamento da aplicação em diferentes ambientes,
 * além de facilitar a manutenção e atualização dos players de vídeo integrados.
 */

function html(current_drive_order = 0, model = {}) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0,maximum-scale=1.0, user-scalable=no"/>
  <title>${authConfig.siteName}</title>
  <meta name="robots" content="noindex" />
  <link rel="icon" href="${uiConfig.favicon}">
  <style>
  .navbar-brand {font-family: Cinemathic Visualation;font-size: 30px;}.footer-text {font-family: Cinemathic Visualation;font-size: 40px;}a {color:white;}p {color:white;} .logo_new {font-family: Cinemathic Visualation;font-size: 50px;color:white;} .loading {position: fixed;z-index: 999;height: 2em;width: 2em;overflow: show;margin: auto;top: 0;left: 0;bottom: 0;right: 0;}.loading:before {content: '';display: block;position: fixed;top: 0;left: 0;width: 100%;height: 100%;background: radial-gradient(rgba(20, 20, 20,.8), rgba(0, 0, 0, .8));background: -webkit-radial-gradient(rgba(20, 20, 20,.8), rgba(0, 0, 0,.8));}.loading:not(:required) {font: 0/0 a;color: transparent;text-shadow: none;background-color: transparent;border: 0;}.loading:not(:required):after {content: '';display: block;font-size: 10px;width: 1em;height: 1em;margin-top: -0.5em;-webkit-animation: spinner 150ms infinite linear;-moz-animation: spinner 150ms infinite linear;-ms-animation: spinner 150ms infinite linear;-o-animation: spinner 150ms infinite linear;animation: spinner 150ms infinite linear;border-radius: 0.5em;-webkit-box-shadow: rgba(255,255,255, 0.75) 1.5em 0 0 0, rgba(255,255,255, 0.75) 1.1em 1.1em 0 0, rgba(255,255,255, 0.75) 0 1.5em 0 0, rgba(255,255,255, 0.75) -1.1em 1.1em 0 0, rgba(255,255,255, 0.75) -1.5em 0 0 0, rgba(255,255,255, 0.75) -1.1em -1.1em 0 0, rgba(255,255,255, 0.75) 0 -1.5em 0 0, rgba(255,255,255, 0.75) 1.1em -1.1em 0 0;box-shadow: rgba(255,255,255, 0.75) 1.5em 0 0 0, rgba(255,255,255, 0.75) 1.1em 1.1em 0 0, rgba(255,255,255, 0.75) 0 1.5em 0 0, rgba(255,255,255, 0.75) -1.1em 1.1em 0 0, rgba(255,255,255, 0.75) -1.5em 0 0 0, rgba(255,255,255, 0.75) -1.1em -1.1em 0 0, rgba(255,255,255, 0.75) 0 -1.5em 0 0, rgba(255,255,255, 0.75) 1.1em -1.1em 0 0;}@-webkit-keyframes spinner {0% {-webkit-transform: rotate(0deg);-moz-transform: rotate(0deg);-ms-transform: rotate(0deg);-o-transform: rotate(0deg);transform: rotate(0deg);}100% {-webkit-transform: rotate(360deg);-moz-transform: rotate(360deg);-ms-transform: rotate(360deg);-o-transform: rotate(360deg);transform: rotate(360deg);}}@-moz-keyframes spinner {0% {-webkit-transform: rotate(0deg);-moz-transform: rotate(0deg);-ms-transform: rotate(0deg);-o-transform: rotate(0deg);transform: rotate(0deg);}100% {-webkit-transform: rotate(360deg);-moz-transform: rotate(360deg);-ms-transform: rotate(360deg);-o-transform: rotate(360deg);transform: rotate(360deg);}}@-o-keyframes spinner {0% {-webkit-transform: rotate(0deg);-moz-transform: rotate(0deg);-ms-transform: rotate(0deg);-o-transform: rotate(0deg);transform: rotate(0deg);}100% {-webkit-transform: rotate(360deg);-moz-transform: rotate(360deg);-ms-transform: rotate(360deg);-o-transform: rotate(360deg);transform: rotate(360deg);}}@keyframes spinner {0% {-webkit-transform: rotate(0deg);-moz-transform: rotate(0deg);-ms-transform: rotate(0deg);-o-transform: rotate(0deg);transform: rotate(0deg);}100% {-webkit-transform: rotate(360deg);-moz-transform: rotate(360deg);-ms-transform: rotate(360deg);-o-transform: rotate(360deg);transform: rotate(360deg);}}	  </style>
  <script>
  window.drive_names = JSON.parse('${JSON.stringify(authConfig.roots.map(it => it.name))}');
  window.MODEL = JSON.parse('${JSON.stringify(model)}');
  window.current_drive_order = ${current_drive_order};
  window.UI = JSON.parse('${JSON.stringify(uiConfig)}');
  window.player_config = JSON.parse('${JSON.stringify(player_config)}');
  </script>
  <script src="https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js"></script>
  <link href="https://cdn.jsdelivr.net/npm/bootswatch@5.0.0/dist/${uiConfig.theme}/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
  <style>a{color:${uiConfig.css_a_tag_color};}p{color:${uiConfig.css_p_tag_color};}</style>
  <script src="${app_js_file}"></script>
  <script src="https://cdn.jsdelivr.net/npm/pdfjs-dist@2.12.313/build/pdf.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/marked@5.1.1/lib/marked.umd.min.js"></script>
</head>
<body>
</body>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-p34f1UUtsS3wqzfto5wAAmdvj+osOnFyQFpp4Ua3gs/ZVWx6oOypYoCJhGGScy+8" crossorigin="anonymous"></script>
  </html>`;
};

const homepage = `<!DOCTYPE html>
<html>
   <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0,maximum-scale=1.0, user-scalable=no">
    <title>${authConfig.siteName}</title>
    <meta name="robots" content="noindex">
    <link rel="icon" href="${uiConfig.favicon}">
    <script>
      window.drive_names = JSON.parse('${JSON.stringify(authConfig.roots.map(it => it.name))}');
      window.UI = JSON.parse('${JSON.stringify(uiConfig)}');
    </script>
    <script src="https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/bootswatch@5.0.0/dist/${uiConfig.theme}/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
    <style>a{color:${uiConfig.css_a_tag_color};}p{color:${uiConfig.css_p_tag_color};}</style>
   </head>
   <body>
    <header>
     <div id="nav">
      <nav class="navbar navbar-expand-lg${uiConfig.fixed_header ?' fixed-top': ''} ${uiConfig.header_style_class}">
         <div class="container-fluid">
         <a class="navbar-brand" href="/">${uiConfig.logo_image ? '<img border="0" alt="'+uiConfig.company_name+'" src="'+uiConfig.logo_link_name+'" height="'+uiConfig.height+'" width="'+uiConfig.logo_width+'">' : uiConfig.logo_link_name}</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarSupportedContent">
           <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <a class="nav-link" href="/">${uiConfig.nav_link_1}</a>
            </li>
            <li class="nav-item dropdown">
               <div class="dropdown-menu" aria-labelledby="navbarDropdown"><a class="dropdown-item" href="/">&gt; ${uiConfig.nav_link_1}</a></div>
            </li>
            <li class="nav-item">
               <a class="nav-link" href="${uiConfig.contact_link}" target="_blank">${uiConfig.nav_link_4}</a>
            </li>
            ${uiConfig.show_logout_button ?'<li class="nav-item"><a class="nav-link" href="/logout">Logout</a></li>': ''}
           </ul>
           <form class="d-flex" method="get" action="/0:search">
            <input class="form-control me-2" name="q" type="search" placeholder="Search" aria-label="Search" value="" required="">
            <button class="btn btn btn-danger" onclick="if($('#search_bar_form>input').val()) $('#search_bar_form').submit();" type="submit">Search</button>
           </form>
          </div>
         </div>
      </nav>
     </div>
    </header>
    <div>
     <div id="content" style="padding-top: ${uiConfig.header_padding}px;">
      <div class="container">
         <div class="alert alert-primary d-flex align-items-center" role="alert" style="margin-bottom: 0; padding-bottom: 0rem;">
          <nav style="--bs-breadcrumb-divider: '>';" aria-label="breadcrumb">
           <ol class="breadcrumb" id="folderne">
            <li class="breadcrumb-item"><a href="/">Home</a></li>
           </ol>
          </nav>
         </div>
         <div id="list" class="list-group text-break">

         </div>
         <div class="${uiConfig.file_count_alert_class} text-center" role="alert" id="count">Total <span id="n_drives" class="number text-center"></span> drives</div>
      </div>
     </div>
     <div class="modal fade" id="SearchModel" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="SearchModelLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
         <div class="modal-content">
          <div class="modal-header">
           <h5 class="modal-title" id="SearchModelLabel"></h5>
           <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
           <span aria-hidden="true"></span>
           </button>
          </div>
          <div class="modal-body" id="modal-body-space">
          </div>
          <div class="modal-footer" id="modal-body-space-buttons">
          </div>
         </div>
      </div>
     </div>
     <br>
     <footer class="footer mt-auto py-3 text-muted ${uiConfig.footer_style_class}" style="${uiConfig.fixed_footer ?'position: fixed; ': ''}left: 0; bottom: 0; width: 100%; color: white; z-index: 9999;${uiConfig.hide_footer ? ' display:none;': ' display:block;'}"> <div class="container" style="width: auto; padding: 0 10px;"> <p class="float-end"> <a href="#">Back to top</a> </p> ${uiConfig.credit ? '<p>Redesigned with <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-heart-fill" fill="red" xmlns="http://www.w3.org/2000/svg"> <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z" /> </svg> by <a href="https://www.npmjs.com/package/@googledrive/index" target="_blank">TheFirstSpeedster</a>, based on Open Source Softwares.</p>' : ''} <p>© ${uiConfig.copyright_year} - <a href=" ${uiConfig.company_link}" target="_blank"> ${uiConfig.company_name}</a>, All Rights Reserved.</p> </div> </footer>
    </div>
   </body>
  <script src="${uiConfig.jsdelivr_cdn_src}@${uiConfig.version}/assets/homepage.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-p34f1UUtsS3wqzfto5wAAmdvj+osOnFyQFpp4Ua3gs/ZVWx6oOypYoCJhGGScy+8" crossorigin="anonymous"></script>
</html>`

const login_html = `<html>
   <head>
    <meta http-equiv="content-type" content="text/html; charset=UTF-8">
    <title>Sign in - ${authConfig.siteName}</title>
    <meta http-equiv="content-type" content="text/html; charset=UTF-8">
    <meta name="robots" content="noindex, nofollow">
    <meta name="googlebot" content="noindex, nofollow">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" href="${uiConfig.favicon}">
    <script type="text/javascript" src="//code.jquery.com/jquery-3.3.1.slim.min.js"></script>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" integrity="sha384-JcKb8q3iqJ61gNV9KGb8thSsNjpSL0n8PARn9HuZOnIxN0hoP+VmmDGMN5t9UJ0Z" crossorigin="anonymous">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN" crossorigin="anonymous">
    <style id="compiled-css" type="text/css">.login,.image{min-height:100vh}.bg-image{background-image:url('https://cdn.jsdelivr.net/gh/logingateway/images@1.0/background.jpg');background-size:cover;background-position:center center}#error-message{display:none}</style>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat&display=swap" rel="stylesheet">
    <style>
     .logo {
     font-family: 'Orbitron', sans-serif;
     color: #007bff;
     }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js" integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script>
    <script>
     $(document).ready(function(){
      $("#btn-login").click(function() {
        const formData = new URLSearchParams();
        formData.append('username', $("#email").val());
        formData.append('password', $("#password").val());
        
        fetch('/login', {
          method: 'POST',
          headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: formData.toString()
        })
          .then(res => res.json())
          .then(data => {
          if (!data.ok) {
            document.getElementById("error-message").style.display = "block";
            document.getElementById("error-message").innerHTML = "Invalid Credentials";
          } else {
            window.location.reload();
          }
          });
      });	
      const queryparams = new URLSearchParams(window.location.search);
      if (queryparams.get('error')) {
         document.getElementById("error-message").style.display = "block";
         document.getElementById("error-message").innerHTML = queryparams.get('error');
      }		  
     });
    </script>
   </head>
   <body>
    <div class="container-fluid">
     <div class="row no-gutter">
      <div class="col-md-6 d-none d-md-flex bg-image"></div>
      <div class="col-md-6 bg-light">
         <div class="login d-flex align-items-center py-5">
          <div class="container">
           <div class="row">
            <div class="col-lg-10 col-xl-7 mx-auto">
              <img src="${uiConfig.login_image}" class="img-fluid" style="width: 150px; display: block; margin-left: auto; margin-right: auto; margin-bottom: 20px;">
               <div id="error-message" class="alert alert-danger"></div>
               <form onsubmit="return false;" method="post">
                <p id="error" style="color:red;"></p>
                <div class="form-group mb-3">
                 <input id="email" type="text" placeholder="Username" autofocus="" class="form-control rounded-pill border-0 shadow-sm px-4" required>
                </div>
                <div class="form-group mb-3">
                 <input id="password" type="password" placeholder="Password" class="form-control rounded-pill border-0 shadow-sm px-4 text-primary" required>
                </div>
                <button id="btn-login" type="submit" class="btn btn-primary btn-block text-uppercase mb-2 rounded-pill shadow-sm">Login</button>
                ${authConfig.enable_signup ? `<a href="/signup" class="btn btn-outline-danger btn-block text-uppercase mb-2 rounded-pill shadow-sm">Signup</a>` : ''}
               </form>
               <hr class="solid">
               ${authConfig.enable_social_login ? `<div id="allsociallogins" style="display:block;">
              <a href="https://accounts.google.com/o/oauth2/v2/auth?client_id=`+authConfig.google_client_id_for_login+`&redirect_uri=`+authConfig.redirect_domain+`/google_callback&response_type=code&scope=email%20profile&response_mode=query" id="btn-google" class="btn btn-block btn-social btn-google"><span class="fa fa-google"></span> Sign in with Google</a>
               </div>` : ''}
            </div>
           </div>
          </div>
         </div>
         <center>
          <p>
           &copy; <script>document.write(new Date().getFullYear())</script> ${uiConfig.company_name}
          </p>
         </center>
      </div>
     </div>
    </div>
   </body>
</html>`

const signup_html = `<html>
   <head>
    <meta http-equiv="content-type" content="text/html; charset=UTF-8">
    <title>Sign UP - ${authConfig.siteName}</title>
    <meta http-equiv="content-type" content="text/html; charset=UTF-8">
    <meta name="robots" content="noindex, nofollow">
    <meta name="googlebot" content="noindex, nofollow">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" href="${uiConfig.favicon}">
    <script type="text/javascript" src="//code.jquery.com/jquery-3.3.1.slim.min.js"></script>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" integrity="sha384-JcKb8q3iqJ61gNV9KGb8thSsNjpSL0n8PARn9HuZOnIxN0hoP+VmmDGMN5t9UJ0Z" crossorigin="anonymous">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN" crossorigin="anonymous">
    <style id="compiled-css" type="text/css">.login,.image{min-height:100vh}.bg-image{background-image:url('https://cdn.jsdelivr.net/gh/logingateway/images@1.0/background.jpg');background-size:cover;background-position:center center}#error-message{display:none}</style>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat&display=swap" rel="stylesheet">
    <style>
     .logo {
     font-family: 'Orbitron', sans-serif;
     color: #007bff;
     }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js" integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script>
    <script>
     $(document).ready(function(){
      $("#btn-login").click(function() {
        const formData = new URLSearchParams();
        formData.append('username', $("#email").val());
        formData.append('password', $("#password").val());
        
        fetch('/signup_api', {
          method: 'POST',
          headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: formData.toString()
        })
          .then(res => res.json())
          .then(data => {
          if (!data.ok) {
            document.getElementById("error-message").style.display = "block";
            document.getElementById("error-message").innerHTML = "Failed to Create Account, Error: " + data.error;
          } else {
            document.getElementById("error-message").style.display = "block";
            document.getElementById("error-message").innerHTML = "Account Created, Please Login";
          }
          });
      });	
      const queryparams = new URLSearchParams(window.location.search);
      if (queryparams.get('error')) {
         document.getElementById("error-message").style.display = "block";
         document.getElementById("error-message").innerHTML = queryparams.get('error');
      }		  
     });
    </script>
   </head>
   <body>
    <div class="container-fluid">
     <div class="row no-gutter">
      <div class="col-md-6 d-none d-md-flex bg-image"></div>
      <div class="col-md-6 bg-light">
         <div class="login d-flex align-items-center py-5">
          <div class="container">
           <div class="row">
            <div class="col-lg-10 col-xl-7 mx-auto">
               <h3 class="logo text-center mb-3">${authConfig.siteName}</h3>
               <div id="error-message" class="alert alert-danger"></div>
               <form onsubmit="return false;" method="post">
                <p id="error" style="color:red;"></p>
                <div class="form-group mb-3">
                 <input id="email" type="text" placeholder="Username" autofocus="" class="form-control rounded-pill border-0 shadow-sm px-4" required>
                </div>
                <div class="form-group mb-3">
                 <input id="password" type="password" placeholder="Password" class="form-control rounded-pill border-0 shadow-sm px-4 text-primary" required>
                </div>
                <button id="btn-login" type="submit" class="btn btn-primary btn-block text-uppercase mb-2 rounded-pill shadow-sm">SIGNUP</button>
                <a href="/login" class="btn btn-outline-danger btn-block text-uppercase mb-2 rounded-pill shadow-sm">LOGIN</a>
               </form>
               <hr class="solid">
               ${authConfig.enable_social_login ? `<div id="allsociallogins" style="display:block;">
              <a href="https://accounts.google.com/o/oauth2/v2/auth?client_id=`+authConfig.google_client_id_for_login+`&redirect_uri=`+authConfig.redirect_domain+`/google_callback&response_type=code&scope=email%20profile&response_mode=query" id="btn-google" class="btn btn-block btn-social btn-google"><span class="fa fa-google"></span> Sign in with Google</a>
               </div>` : ''}
            </div>
           </div>
          </div>
         </div>
         <center>
          <p>
           &copy; <script>document.write(new Date().getFullYear())</script> ${uiConfig.company_name}
          </p>
         </center>
      </div>
     </div>
    </div>
   </body>
</html>`

const not_found = `<!DOCTYPE html>
<html lang=en>
  <meta charset=utf-8>
  <meta name=viewport content="initial-scale=1, minimum-scale=1, width=device-width">
  <title>Error 404 (Not Found)!!1</title>
  <style>
  *{margin:0;padding:0}html,code{font:15px/22px arial,sans-serif}html{background:#fff;color:#222;padding:15px}body{margin:7% auto 0;max-width:390px;min-height:180px;padding:30px 0 15px}* > body{background:url(//www.google.com/images/errors/robot.png) 100% 5px no-repeat;padding-right:205px}p{margin:11px 0 22px;overflow:hidden}ins{color:#777;text-decoration:none}a img{border:0}@media screen and (max-width:772px){body{background:none;margin-top:0;max-width:none;padding-right:0}}#logo{background:url(//www.google.com/images/branding/googlelogo/1x/googlelogo_color_150x54dp.png) no-repeat;margin-left:-5px}@media only screen and (min-resolution:192dpi){#logo{background:url(//www.google.com/images/branding/googlelogo/2x/googlelogo_color_150x54dp.png) no-repeat 0% 0%/100% 100%;-moz-border-image:url(//www.google.com/images/branding/googlelogo/2x/googlelogo_color_150x54dp.png) 0}}@media only screen and (-webkit-min-device-pixel-ratio:2){#logo{background:url(//www.google.com/images/branding/googlelogo/2x/googlelogo_color_150x54dp.png) no-repeat;-webkit-background-size:100% 100%}}#logo{display:inline-block;height:54px;width:150px}
  </style>
  <a href=//www.google.com/><span id=logo aria-label=Google></span></a>
  <p><b>404.</b> <ins>That’s an error.</ins>
  <p id="status"></p>

  <script>
  document.getElementById("status").innerHTML =
"The requested URL <code>" + window.location.pathname + "</code> was not found on this server.  <ins>That’s all we know.</ins>";
  </script>`

const asn_blocked = `<html>
  <head>
  <title>Access Denied</title>
  <link href='https://fonts.googleapis.com/css?family=Lato:100' rel='stylesheet' type='text/css'>
  <style>
  body{
    margin:0;
    padding:0;
    width:100%;
    height:100%;
    color:#b0bec5;
    display:table;
    font-weight:100;
    font-family:Lato
  }
  .container{
    text-align:center;
    display:table-cell;
    vertical-align:middle
  }
  .content{
    text-align:center;
    display:inline-block
  }
  .message{
    font-size:80px;
    margin-bottom:40px
  }
  a{
    text-decoration:none;
    color:#3498db
  }

  </style>
  </head>
  <body>
  <div class="container">
  <div class="content">
  <div class="message">Access Denied</div>
  </div>
  </div>
  </body>
  </html>`

const directlink = `
  <html>
  <head>
  <title>Direct Link - Access Denied</title>
  <link href='https://fonts.googleapis.com/css?family=Lato:100' rel='stylesheet' type='text/css'>
  <style>
  body{
    margin:0;
    padding:0;
    width:100%;
    height:100%;
    color:#b0bec5;
    display:table;
    font-weight:100;
    font-family:Lato
  }
  .container{
    text-align:center;
    display:table-cell;
    vertical-align:middle
  }
  .content{
    text-align:center;
    display:inline-block
  }
  .message{
    font-size:80px;
    margin-bottom:40px
  }
  a{
    text-decoration:none;
    color:#3498db
  }

  </style>
  </head>
  <body>
  <div class="container">
  <div class="content">
  <div class="message">Access Denied</div>
  <center><a href=""><button id="goto">Click Here to Proceed!</button></a></center>
  </div>
  </div>
  </body>
  </html>
  `

const SearchFunction = {
  formatSearchKeyword: function(keyword) {
    let nothing = "";
    let space = " ";
    if (!keyword) return nothing;
    return keyword.replace(/(!=)|['"=<>/\\:]/g, nothing)
      .replace(/[,，|(){}]/g, space)
      .trim()
  }

};

const DriveFixedTerms = new(class {
  default_file_fields = 'parents,id,name,mimeType,modifiedTime,createdTime,fileExtension,size';
  gd_root_type = {
    user_drive: 0,
    share_drive: 1
  };
  folder_mime_type = 'application/vnd.google-apps.folder';
})();

// Token Generation for Service Accounts
const JSONWebToken = {
  header: {
    alg: 'RS256',
    typ: 'JWT'
  },
  importKey: async function(pemKey) {
    var pemDER = this.textUtils.base64ToArrayBuffer(pemKey.split('\n').map(s => s.trim()).filter(l => l.length && !l.startsWith('---')).join(''));
    return crypto.subtle.importKey('pkcs8', pemDER, {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256'
    }, false, ['sign']);
  },
  createSignature: async function(text, key) {
    const textBuffer = this.textUtils.stringToArrayBuffer(text);
    return crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, textBuffer)
  },
  generateGCPToken: async function(serviceAccount) {
    const iat = parseInt(Date.now() / 1000);
    var payload = {
      "iss": serviceAccount.client_email,
      "scope": "https://www.googleapis.com/auth/drive",
      "aud": "https://oauth2.googleapis.com/token",
      "exp": iat + 3600,
      "iat": iat
    };
    const encPayload = btoa(JSON.stringify(payload));
    const encHeader = btoa(JSON.stringify(this.header));
    var key = await this.importKey(serviceAccount.private_key);
    var signed = await this.createSignature(encHeader + "." + encPayload, key);
    return encHeader + "." + encPayload + "." + this.textUtils.arrayBufferToBase64(signed).replace(/\//g, '_').replace(/\+/g, '-');
  },
  textUtils: {
    base64ToArrayBuffer: function(base64) {
      var binary_string = atob(base64);
      var len = binary_string.length;
      var bytes = new Uint8Array(len);
      for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
      }
      return bytes.buffer;
    },
    stringToArrayBuffer: function(str) {
      var len = str.length;
      var bytes = new Uint8Array(len);
      for (var i = 0; i < len; i++) {
        bytes[i] = str.charCodeAt(i);
      }
      return bytes.buffer;
    },
    arrayBufferToBase64: function(buffer) {
      let binary = '';
      let bytes = new Uint8Array(buffer);
      let len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    }
  }
};

// web crypto functions
async function encryptString(string, iv) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(crypto_base_key),
    "AES-CBC",
    false,
    ["encrypt"]
  );
  const encodedId = new TextEncoder().encode(string);
  const encryptedData = await crypto.subtle.encrypt({
      name: "AES-CBC",
      iv: encrypt_iv
    },
    key,
    encodedId
  );
  const encryptedString = btoa(Array.from(new Uint8Array(encryptedData), (byte) => String.fromCharCode(byte)).join(""));
  return encryptedString;
}

async function decryptString(encryptedString) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(crypto_base_key),
    "AES-CBC",
    false,
    ["decrypt"]
  );
  const encryptedBytes = Uint8Array.from(atob(encryptedString), (char) => char.charCodeAt(0));
  const decryptedData = await crypto.subtle.decrypt({
      name: "AES-CBC",
      iv: encrypt_iv
    },
    key,
    encryptedBytes
  );
  const decryptedString = new TextDecoder().decode(decryptedData);
  return decryptedString;
}

// Web Crypto Integrity Generate API
async function genIntegrity(data, key = hmac_base_key) {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hmacKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(key), {
          name: 'HMAC',
          hash: 'SHA-256'
      },
      false,
      ['sign']
  );
  const hmacBuffer = await crypto.subtle.sign('HMAC', hmacKey, dataBuffer);

  // Convert the HMAC buffer to hexadecimal string
  const hmacArray = Array.from(new Uint8Array(hmacBuffer));
  const hmacHex = hmacArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

  return hmacHex;
}

async function checkintegrity(text1, text2) {
  return text1 === text2;
}

function login() {
  return new Response(login_html, {
    status: 401,
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }
  });
}


// start handlerequest
async function handleRequest(request, event) {
  const region = request.headers.get('cf-ipcountry');
  const asn_servers = request.cf.asn;
  const referer = request.headers.get("Referer");
  var user_ip = request.headers.get("CF-Connecting-IP");
  let url = new URL(request.url);
  let path = url.pathname;
  let hostname = url.hostname;
  if (path == '/app.js') {
    const js = await fetch('https://gitlab.com/GoogleDriveIndex/Google-Drive-Index/-/raw/dev/src/app.js', {
      method: 'GET',
    })
    const data = await js.text()
    return new Response(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Access-Control-Allow-Origin': '*', // Required for CORS support to work
        'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
      }
    });
  }
  if (path == '/logout') {
    let response = new Response("", {});
    response.headers.set('Set-Cookie', `session=; HttpOnly; Secure; SameSite=Lax;`);
    response.headers.set("Refresh", "1; url=/?error=Logged Out");
    return response;
  }
  if (path == '/findpath') {
    const params = url.searchParams;
    const id = params.get('id');
    const view = params.get('view') || 'false';
    return Response.redirect(url.protocol + hostname + '/0:findpath?id=' + id + '&view=' + view, 307);
  }
  if (authConfig.enable_login) {
    const login_database = authConfig.login_database.toLowerCase();
    //console.log("Login Enabled")
    if (path == '/download.aspx' && !authConfig.disable_anonymous_download) {
      console.log("Anonymous Download")
    } else if (path == '/google_callback') {
      // Extract the authorization code from the query parameters
      const code = url.searchParams.get('code')
      if (!code) {
        return new Response('Missing authorization code.', {
          status: 400
        });
      }

      // Use the authorization code to obtain access token and ID token		
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: authConfig.google_client_id_for_login,
          client_secret: authConfig.google_client_secret_for_login,
          redirect_uri: authConfig.redirect_domain + '/google_callback',
          grant_type: 'authorization_code',
        }),
      });

      const data = await response.json();
      console.log(JSON.stringify(data));
      if (response.ok) {
        const idToken = data.id_token;
        const decodedIdToken = await decodeJwtToken(idToken);
        const username = decodedIdToken.email;
        let kv_key
        let user_found = false;
        // Check if user email exist in the list
        if (login_database == 'kv') {
          kv_key = await ENV.get(username);
          if (kv_key == null) {
            user_found = false;
          } else {
            user_found = true;
          }
        } else if (login_database == 'mongodb') {
          // to be implemented later
        } else { // local database
          for (i = 0; i < authConfig.users_list.length; i++) {
            if (authConfig.users_list[i].username == username) {
              user_found = true;
              console.log("User Found")
              break;
            }
          }
        }
        if (!user_found) {
          if (authConfig.enable_signup && login_database == 'kv') {
            await ENV.put(username, Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
            kv_key = await ENV.get(username);
            if (kv_key == null) {
              user_found = false;
            } else {
              user_found = true;
            }
          } else {
            let response = new Response('Invalid User! Google Login', {});
            response.headers.set('Set-Cookie', `session=; HttpOnly; Secure; SameSite=Lax;`);
            response.headers.set("Refresh", "1; url=/?error=Invalid User");
            return response;
          }
        }
        const current_time = Date.now(); // this results in a timestamp of the number of milliseconds since epoch.
        const session_time = current_time + 86400000 * authConfig.login_days;
        const encryptedSession = `${await encryptString(username)}|${await encryptString(kv_key)}|${await encryptString(session_time.toString())}`;
        if (authConfig.single_session) {
          await ENV.put(username + '_session', encryptedSession);
        }
        if (authConfig.ip_changed_action && user_ip) {
          await ENV.put(username + '_ip', user_ip);
        }
        // reload page with cookie
        let response = new Response("", {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Set-Cookie': `session=${encryptedSession}; path=/; HttpOnly; Secure; SameSite=Lax`,
            'Access-Control-Allow-Origin': '*', // Required for CORS support to work
            'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
            'Refresh': '0; url=/',
          }
        });
        return response;
      } else {
        let response = new Response('Invalid Token!', {});
        response.headers.set('Set-Cookie', `session=; HttpOnly; Secure; SameSite=Lax;`);
        response.headers.set("Refresh", "1; url=/?error=Invalid Token");
        return response;
      }
    } else if (authConfig.enable_login && request.method === 'POST' && path === '/login') {
      console.log("POST Request for Login")
      const formdata = await request.formData();
      const username = formdata.get('username');
      const password = formdata.get('password');
      if (login_database == 'kv') {
        const kv_key = await ENV.get(username);
        if (kv_key == null) {
          var user_found = false;
        } else {
          if (kv_key == password) {
            var user_found = true;
          } else {
            var user_found = false;
          }
        }
      } else if (login_database == 'mongodb') {
        // to be implemented later
      } else { // local database
        for (i = 0; i < authConfig.users_list.length; i++) {
          if (authConfig.users_list[i].username == username && authConfig.users_list[i].password == password) {
            var user_found = true;
            break;
          }
        }
      }

      if (!user_found) {
        const jsonResponse = {
          ok: false,
        }
        let response = new Response(JSON.stringify(jsonResponse), {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*', // Required for CORS support to work
            'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
          }
        });
        return response;
      }
      if (user_found) {
        const current_time = Date.now(); // this results in a timestamp of the number of milliseconds since epoch.
        const session_time = current_time + 86400000 * authConfig.login_days;
        const encryptedSession = `${await encryptString(username)}|${await encryptString(password)}|${await encryptString(session_time.toString())}`;
        if (authConfig.single_session) {
          await ENV.put(username + '_session', encryptedSession);
        }
        if (authConfig.ip_changed_action && user_ip) {
          await ENV.put(username + '_ip', user_ip);
        }
        const jsonResponse = {
          ok: true,
        }
        let response = new Response(JSON.stringify(jsonResponse), {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Set-Cookie': `session=${encryptedSession}; path=/; HttpOnly; Secure; SameSite=Lax`,
            'Access-Control-Allow-Origin': '*', // Required for CORS support to work
            'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
          }
        });
        return response;
      } else {
        const jsonResponse = {
          ok: false,
        }
        let response = new Response(JSON.stringify(jsonResponse), {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*', // Required for CORS support to work
            'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
          }
        });
        return response;
      }
    } else if (path == '/signup' && authConfig.enable_signup) {
      return new Response(signup_html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Access-Control-Allow-Origin': '*', // Required for CORS support to work
          'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
        }
      });
    } else if (authConfig.enable_signup && request.method === 'POST' && path === '/signup_api') {
      if (login_database == 'kv') {
        const formdata = await request.formData();
        const username = formdata.get('username');
        const password = formdata.get('password');
        if (username == null || password == null) {
          const jsonResponse = {
            ok: true,
            error: "Username or Password is null"
          }
          let response = new Response(JSON.stringify(jsonResponse), {
            status: 200,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Set-Cookie': `session=; path=/; HttpOnly; Secure; SameSite=Lax`,
              'Access-Control-Allow-Origin': '*', // Required for CORS support to work
              'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
            }
          });
          return response;
        } else if (username.length > 8 && password.length > 8) {
          const checkKey = await ENV.get(username);
          let jsonResponse;
          if (checkKey != null) {
            jsonResponse = {
              ok: false,
              error: "User Already Exists"
            }
          } else {
            await ENV.put(username, password);
            jsonResponse = {
              ok: true,
              error: "User Created"
            }
          }
          let response = new Response(JSON.stringify(jsonResponse), {
            status: 200,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Set-Cookie': `session=; path=/; HttpOnly; Secure; SameSite=Lax`,
              'Access-Control-Allow-Origin': '*', // Required for CORS support to work
              'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
            }
          });
          return response;
        } else {
          const jsonResponse = {
            ok: false,
            error: "Username or Password length is less than 8 characters"
          }
          let response = new Response(JSON.stringify(jsonResponse), {
            status: 200,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Set-Cookie': `session=; path=/; HttpOnly; Secure; SameSite=Lax`,
              'Access-Control-Allow-Origin': '*', // Required for CORS support to work
              'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
            }
          });
          return response;
        }
      } else if (login_database == 'mongodb') {
        // to be implemented later
      } else {
        return new Response("Signup is not supported with local database", {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*', // Required for CORS support to work
            'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
          }
        });
      }
    } else if (request.method === 'GET') {
      //console.log("GET Request")
      const cookie = request.headers.get('cookie');
      if (cookie && cookie.includes('session=')) {
        const session = cookie.split('session=').pop().split(';').shift().trim();
        if (session == 'null' || session == '' || session == null) {
          return login()
        }
        const username = await decryptString(session.split('|')[0]);
        let kv_session
        if (authConfig.single_session) {
          kv_session = await ENV.get(username + '_session');
          if (kv_session != session) {
            let response = new Response('User Logged in Someplace Else!', {
              headers: {
                'Set-Cookie': `session=; HttpOnly; Secure; SameSite=Lax;`,
              }
            });
            response.headers.set("Refresh", "1; url=/?error=User Logged in Someplace Else!");
            return response;
          }
        }
        if (authConfig.ip_changed_action && user_ip) {
          const kv_ip = await ENV.get(username + '_ip');
          if (kv_ip != user_ip) {
            let response = new Response('IP Changed! Login Required', {
              headers: {
                'Set-Cookie': `session=; HttpOnly; Secure; SameSite=Lax;`,
              }
            });
            response.headers.set("Refresh", "1; url=/?error=IP Changed! Login Required");
            return response;
          }
        }
        const session_time = await decryptString(session.split('|')[2]);
        console.log("User: " + username + " | Session Time: " + session_time)
        const current_time = Date.now(); // this results in a timestamp of the number of milliseconds since epoch.
        if (Number(session_time) < current_time) {
          let response = new Response('Session Expired!', {
            headers: {
              'Set-Cookie': `session=; HttpOnly; Secure; SameSite=Lax;`,
            }
          });
          response.headers.set("Refresh", "1; url=/?error=Session Expired!");
          return response;
        }
        if (login_database == 'kv') {
          const kv_key = await ENV.get(username);
          if (kv_key == null) {
            var user_found = false;
          } else {
            if (kv_key) {
              var user_found = true;
            } else {
              var user_found = false;
            }
          }
        } else if (login_database == 'mongodb') {
          // to be implemented later
        } else { // local database
          for (i = 0; i < authConfig.users_list.length; i++) {
            if (authConfig.users_list[i].username == username) {
              var user_found = true;
              break;
            }
          }
        }
        if (user_found) {
          console.log("User Found")
        } else {
          let response = new Response('Invalid User! Something Wrong', {});
          response.headers.set('Set-Cookie', `session=; HttpOnly; Secure; SameSite=Lax;`);
          response.headers.set("Refresh", "1; url=/?error=Invalid User");
          return response;
        }
      } else {
        return login()
      }
    }
  }
  if (request.method === "POST" && path == "/copy") {
    try {
      let form = await request.formData();
      let time = form.get('time')
      if (time < Math.floor(Date.now() / 1000)) {
        return new Response('{"error":"Invalid Time"}', {
          status: 404,
          headers: {
            "content-type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "max-age=0",
          }
        });
      }
      let user_drive = form.get('root_id') || "null";
      if (user_drive == "null") {
        return new Response('{"error":"404"}', {
          status: 200,
          headers: {
            "content-type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "max-age=0",
          }
        });
      }
      let public_drive_id = await decryptString(form.get('id')) || "null";
      let user_folder_id = form.get('root_id') || "null";
      let resourcekey = form.get('resourcekey') || "null";
      let file = await copyItemById(public_drive_id, resourcekey, user_folder_id);
      return new Response(JSON.stringify(file), {
        status: 200,
        headers: {
          "content-type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "max-age=0",
        }
      });
    } catch (e) {
      return new Response(e, {
        status: 200,
        headers: {
          "content-type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "max-age=0",
        }
      });
    }
  }

  if (gds.length === 0) {
    for (let i = 0; i < authConfig.roots.length; i++) {
      const gd = new googleDrive(authConfig, i);
      await gd.init();
      gds.push(gd)
    }
    let tasks = [];
    gds.forEach(gd => {
      tasks.push(gd.initRootType());
    });
    for (let task of tasks) {
      await task;
    }
  }

  let gd;

  function redirectToIndexPage() {
    return new Response('', {
      status: 307,
      headers: {
        'Location': `${url.origin}/0:/`
      }
    });
  }

  if (region && blocked_region.includes(region.toUpperCase())) {
    return new Response(asn_blocked, {
      status: 403,
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    })
  } else if (asn_servers && blocked_asn.includes(asn_servers)) {
    return new Response(asn_blocked, {
      headers: {
        'content-type': 'text/html;charset=UTF-8'
      },
      status: 401
    });
  } else if (path == '/') {
    return new Response(homepage, {
      status: 200,
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    })
  } else if (path == '/fallback') {
    return new Response(html(0, {
      is_search_page: false,
      root_type: 1
    }), {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    });
  } else if (path == '/download.aspx') {
    console.log("Download.aspx started");
    const file = await decryptString(url.searchParams.get('file'));
    console.log(file)
    const expiry = await decryptString(url.searchParams.get('expiry'));
    let integrity_result = false;
    if (authConfig['enable_ip_lock'] && user_ip) {
      const integrity = await genIntegrity(`${file}|${expiry}|${user_ip}`);
      const mac = url.searchParams.get('mac');
      integrity_result = await checkintegrity(mac, integrity);
    } else {
      const integrity = await genIntegrity(`${file}|${expiry}`);
      const mac = url.searchParams.get('mac');
      integrity_result = await checkintegrity(mac, integrity);
    }
    if (integrity_result) {
      let range = request.headers.get('Range');
      const inline = 'true' === url.searchParams.get('inline');
      console.log(file, range)
      return download(file, range, inline);
    } else {
      return new Response('Invalid Request!', {
        status: 401,
        headers: {
          "content-type": "text/html;charset=UTF-8",
        },
      })
    }
  }

  if (authConfig['direct_link_protection']) {
    if (referer == null) {
      return new Response(directlink, {
        headers: {
          'content-type': 'text/html;charset=UTF-8'
        },
        status: 401
      });
    } else if (referer.includes(hostname)) {
      console.log("Refer Detected");
    } else {
      return new Response(directlink, {
        headers: {
          'content-type': 'text/html;charset=UTF-8'
        },
        status: 401
      });
    }
  }


  const command_reg = /^\/(?<num>\d+):(?<command>[a-zA-Z0-9]+)(\/.*)?$/g;
  const match = command_reg.exec(path);
  if (match) {
    const num = match.groups.num;
    const order = Number(num);
    if (order >= 0 && order < gds.length) {
      gd = gds[order];
    } else {
      return redirectToIndexPage()
    }
    //for (const r = gd.basicAuthResponse(request); r;) return r;
    const command = match.groups.command;
    if (command === 'search') {
      if (request.method === 'POST') {
        return handleSearch(request, gd, user_ip);
      } else {
        const params = url.searchParams;
        return new Response(html(gd.order, {
          q: params.get("q").replace(/'/g, "").replace(/"/g, "") || '',
          is_search_page: true,
          root_type: gd.root_type
        }), {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8'
          }
        });
      }
    } else if (command === 'id2path' && request.method === 'POST') {
      return handleId2Path(request, gd)
    } else if (command === 'fallback' && request.method === 'POST') {
      const formdata = await request.json();
      const id = await decryptString(formdata.id);
      const type = formdata.type;
      if (type && type == 'folder') {
        const page_token = formdata.page_token || null;
        const page_index = formdata.page_index || 0;
        const details = await gd._list_gdrive_files(id, page_token, page_index);
        for (const file of details.data.files) {
          if (file.mimeType != 'application/vnd.google-apps.folder') {
            file.link = await generateLink(file.id, user_ip);
          }
          file.driveId = await encryptString(file.driveId);
          file.id = await encryptString(file.id);
        }
        const encryptedDetails = details;
        return new Response(JSON.stringify(encryptedDetails), {});
      }
      const details = await gd.findItemById(id)
      details.link = await generateLink(details.id, user_ip);
      details.id = formdata.id;
      details.parents[0] = null;
      return new Response(JSON.stringify(details), {});
    } else if (command === 'findpath' && request.method === 'GET') {
      return findId2Path(gd, url)
    }
  }



  const common_reg = /^\/\d+:\/.*$/g;
  try {
    if (!path.match(common_reg)) {
      return redirectToIndexPage();
    }
    let split = path.split("/");
    let order = Number(split[1].slice(0, -1));
    if (order >= 0 && order < gds.length) {
      gd = gds[order];
    } else {
      return redirectToIndexPage()
    }
  } catch (e) {
    return redirectToIndexPage()
  }

  //path = path.replace(gd.url_path_prefix, '') || '/';
  if (request.method == 'POST') {
    return apiRequest(request, gd, user_ip);
  }

  let action = url.searchParams.get('a');
  if (path.slice(-1) == '/' || action != null) {
    return new Response(html(gd.order, {
      root_type: gd.root_type
    }), {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    });
  } else {
    /*if (path.split('/').pop().toLowerCase() == ".password") {
      return  new Response("", {
        status: 404
      });
    }*/
    console.log(path)
    const file = await gd.get_single_file(path.slice(3));
    console.log(file)
    let range = request.headers.get('Range');
    const inline = 'true' === url.searchParams.get('inline');
    if (gd.root.protect_file_link && enable_login) return login();
    return download(file.id, range, inline);

  }



}
// end handlerequest

function enQuery(data) {
  const ret = [];
  for (let d in data) {
    ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
  }
  return ret.join('&');
}

async function getAccessToken() {
  if (authConfig.expires == undefined || authConfig.expires < Date.now()) {
    const obj = await fetchAccessToken();
    if (obj.access_token != undefined) {
      authConfig.accessToken = obj.access_token;
      authConfig.expires = Date.now() + 3500 * 1000;
    }
  }
  return authConfig.accessToken;
}

async function fetchAccessToken() {
  console.log("fetchAccessToken");
  const url = "https://www.googleapis.com/oauth2/v4/token";
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
  };
  var post_data;
  if (authConfig.service_account && typeof authConfig.service_account_json != "undefined") {
    const jwttoken = await JSONWebToken.generateGCPToken(authConfig.service_account_json);
    post_data = {
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwttoken,
    };
  } else {
    post_data = {
      client_id: authConfig.client_id,
      client_secret: authConfig.client_secret,
      refresh_token: authConfig.refresh_token,
      grant_type: "refresh_token",
    };
  }

  let requestOption = {
    'method': 'POST',
    'headers': headers,
    'body': enQuery(post_data)
  };

  let response;
  for (let i = 0; i < 3; i++) {
    response = await fetch(url, requestOption);
    if (response.ok) {
      break;
    }
    await sleep(800 * (i + 1));
  }
  return await response.json();
}

async function copyItemById(id, resourcekey, user_folder_id, headers = {}) {
  let url = `https://www.googleapis.com/drive/v3/files/${id}/copy?fields=id,name,mimeType&supportsAllDrives=true`;
  const accessToken = await getAccessToken();
  headers["authorization"] = "Bearer " + accessToken;
  headers["Accept"] = "application/json";
  headers["Content-Type"] = "application/json";
  headers["X-Goog-Drive-Resource-Keys"] = id + "/" + resourcekey;
  let json = {
    parents: [user_folder_id]
  }
  let res
  for (let i = 0; i < 3; i++) {
    res = await fetch(url, {
      "method": "POST",
      "headers": headers,
      "body": JSON.stringify(json)
    });
    if (res.ok) {
      break;
    }
    await sleep(100 * (i + 1));
  }
  const data = await res.json();
  console.log(data);
  return data;
}

async function sleep(ms) {
  return new Promise(function(resolve, reject) {
    let i = 0;
    setTimeout(function() {
      console.log('sleep' + ms);
      i++;
      if (i >= 2) reject(new Error('i>=2'));
      else resolve(i);
    }, ms);
  })
}
async function generateLink(file_id, user_ip, iv) {
  const encrypted_id = await encryptString(file_id, iv);
  const expiry = Date.now() + 1000 * 60 * 60 * 24 * authConfig.file_link_expiry;
  const encrypted_expiry = await encryptString(expiry.toString(), iv);
  let url
  if (authConfig['enable_ip_lock'] && user_ip) {
    const encrypted_ip = await encryptString(user_ip, iv);
    const integrity = await genIntegrity(`${file_id}|${expiry}|${user_ip}`);
    url = `/download.aspx?file=${encodeURIComponent(encrypted_id)}&expiry=${encodeURIComponent(encrypted_expiry)}&ip=${encodeURIComponent(encrypted_ip)}&mac=${encodeURIComponent(integrity)}`;
  } else {
    const integrity = await genIntegrity(`${file_id}|${expiry}`);
    url = `/download.aspx?file=${encodeURIComponent(encrypted_id)}&expiry=${encodeURIComponent(encrypted_expiry)}&mac=${encodeURIComponent(integrity)}`;
  }
  return url;
}

async function apiRequest(request, gd, user_ip) {
  let url = new URL(request.url);
  let path = url.pathname;
  path = path.replace(gd.url_path_prefix, '') || '/';
  console.log("handling apirequest: " + path);
  let option = {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }

  if (path.slice(-1) == '/') {
    let requestData = await request.json();
    let list_result = await gd.request_list_of_files(
      path,
      requestData.page_token || null,
      Number(requestData.page_index) || 0
    );

    if (authConfig['enable_password_file_verify']) {
      let password = await gd.password(path);
      // console.log("dir password", password);
      if (password && password.replace("\n", "") !== form.get('password')) {
        let html = `Y29kZWlzcHJvdGVjdGVk=0Xfi4icvJnclBCZy92dzNXYwJCI6ISZnF2czVWbiwSMwQDI6ISZk92YisHI6IicvJnclJyeYmFzZTY0aXNleGNsdWRlZA==`;
        return new Response(html, option);
      }
    }

    list_result.data.files = await Promise.all(list_result.data.files.map(async (file) => {
      const {
        driveId,
        id,
        mimeType,
        ...fileWithoutId
      } = file;

      const encryptedId = await encryptString(id);
      const encryptedDriveId = await encryptString(driveId);

      let link = null;
      if (mimeType !== 'application/vnd.google-apps.folder') {
        link = await generateLink(id, user_ip);
      }

      return {
        ...fileWithoutId,
        id: encryptedId,
        driveId: encryptedDriveId,
        mimeType: mimeType,
        link: link,
      };
    }));


    const encryptedFiles = list_result;
	const data = JSON.stringify(encryptedFiles)
    return new Response(data, {
		status: 200,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Content-Type': 'application/json;charset=UTF-8'

		}
	});
  } else {
    let file_json = await gd.get_single_file(path);
    const {
      driveId,
      id,
      ...fileWithoutId
    } = file_json;

    const encryptedId = await encryptString(id);
    const encryptedDriveId = await encryptString(driveId);
    const link = await generateLink(id, user_ip);
    const encryptedFile = {
      ...fileWithoutId,
      id: encryptedId,
      driveId: encryptedDriveId,
      link: link,
    };

    const encryptedFiles = encryptedFile;

	const data = JSON.stringify(encryptedFiles)
    return new Response(data, {
		status: 200,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Content-Type': 'application/json;charset=UTF-8'

		}
	});
  }
}

// deal with search
async function handleSearch(request, gd, user_ip = '') {
  const option = {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  };
  const requestData = await request.json();
  const q = requestData.q || '';
  const pageToken = requestData.page_token || null;
  const pageIndex = Number(requestData.page_index) || 0;
  if (q == '') return new Response(JSON.stringify({
    "nextPageToken": null,
    "curPageIndex": 0,
    "data": {
      "files": []
    }
  }), option);
  const searchResult = await gd.searchFilesinDrive(q, pageToken, pageIndex);
  searchResult.data.files = await Promise.all(searchResult.data.files.map(async (file) => {
    const {
      driveId,
      id,
      ...fileWithoutId
    } = file;

    const encryptedId = await encryptString(id);
    const encryptedDriveId = await encryptString(driveId);
    const link = await generateLink(id, user_ip);
    return {
      ...fileWithoutId,
      id: encryptedId,
      driveId: encryptedDriveId,
      link: link,
    };
  }));
  return new Response(JSON.stringify(searchResult), option);
}

async function handleId2Path(request, gd) {
  let url = new URL(request.url);
  const option = {
    status: 200,
    headers: {
      "content-type": "application/json",
      "Access-Control-Allow-Origin": authConfig.cors_domain,
      "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
    }
  };
  try {
    const data = await request.json();
    const id = await decryptString(data.id);
    let [path, prefix] = await gd.findPathById(id);
    let jsonpath = '{"path": "/' + prefix + ':' + path + '"}'
    console.log(jsonpath)
    return new Response(jsonpath || '', option);
  } catch (error) {
    console.log(error)
    return new Response('{"message":"Request Failed or Path Not Found","error":"' + error + '"}', {
      status: 500,
      headers: {
        "content-type": "application/json",
        "Access-Control-Allow-Origin": authConfig.cors_domain,
        "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
      }
    });
  }
}

async function findId2Path(gd, url) {
	try {
		let [path, prefix] = await gd.findPathById(url.searchParams.get('id'));
		console.log(path, prefix)
		if (!path) {
			return new Response("Invalid URL");
		} else if (url.searchParams.get('view') && url.searchParams.get('view') == 'true') {
			//return new Response("https://" + url.hostname + "/" + prefix + ":" + path + "?a=view" || '');
			return Response.redirect("https://" + url.hostname + "/" + prefix + ":" + path + "?a=view" || '', 302);
		} else {
			//return new Response("https://" + url.hostname + "/" + prefix + ":" + path + "?a=view" || '');
			return Response.redirect("https://" + url.hostname + "/" + prefix + ":" + path || '', 302);
		}
	} catch (error) {
		const encrypted_id = await encryptString(url.searchParams.get('id'), encrypt_iv)
		return Response.redirect("https://" + url.hostname + "/fallback?id=" + encrypted_id || '', 302);
	}
}

/*async function findItemById(gd, id) {
  console.log(id)
  const is_user_drive = this.root_type === DriveFixedTerms.gd_root_type.user_drive;
  let url = `https://www.googleapis.com/drive/v3/files/${id}?fields=${DriveFixedTerms.default_file_fields}${is_user_drive ? '' : '&supportsAllDrives=true'}`;
  let requestOption = await gd.requestOptions();
  let res = await fetch(url, requestOption);
  return await res.json();
}*/

// start of class googleDrive
class googleDrive {
  constructor(authConfig, order) {
    this.order = order;
    this.root = authConfig.roots[order];
    this.root.protect_file_link = this.root.protect_file_link || false;
    this.url_path_prefix = `/${order}:`;
    this.authConfig = authConfig;
    this.paths = [];
    this.files = [];
    this.passwords = [];
    this.paths["/"] = this.root['id'];
  }
  async init() {
    await getAccessToken();
    if (authConfig.user_drive_real_root_id) return;
    const root_obj = await (gds[0] || this).findItemById('root');
    if (root_obj && root_obj.id) {
      authConfig.user_drive_real_root_id = root_obj.id
    }
  }

  async initRootType() {
    const root_id = this.root['id'];
    const types = DriveFixedTerms.gd_root_type;
    if (root_id === 'root' || root_id === authConfig.user_drive_real_root_id) {
      this.root_type = types.user_drive;
    } else {
      this.root_type = types.share_drive;
    }
  }


  async get_single_file(path) {
    if (typeof this.files[path] == 'undefined') {
      this.files[path] = await this.get_single_file_api(path);
    }
    return this.files[path];
  }

  async get_single_file_api(path) {
    let arr = path.split('/');
    let name = arr.pop();
    name = decodeURIComponent(name).replace(/\'/g, "\\'");
    let dir = arr.join('/') + '/';
    console.log("try " + name, dir);
    let parent = await this.findPathId(dir);
    console.log("try " + parent)
    let url = 'https://www.googleapis.com/drive/v3/files';
    let params = {
      'includeItemsFromAllDrives': true,
      'supportsAllDrives': true
    };
    params.q = `'${parent}' in parents and name = '${name}' and trashed = false and mimeType != 'application/vnd.google-apps.shortcut'`;
    params.fields = "files(id, name, mimeType, size ,createdTime, modifiedTime, iconLink, thumbnailLink, driveId, fileExtension)";
    url += '?' + enQuery(params);
    let requestOption = await this.requestOptions();
    let response;
    for (let i = 0; i < 3; i++) {
      response = await fetch(url, requestOption);
      if (response.ok) {
        break;
      }
      await sleep(800 * (i + 1));
    }
    let obj = await response.json();
    // console.log(obj);
    return obj.files[0];
  }

  async request_list_of_files(path, page_token = null, page_index = 0) {
    if (this.path_children_cache == undefined) {
      // { <path> :[ {nextPageToken:'',data:{}}, {nextPageToken:'',data:{}} ...], ...}
      this.path_children_cache = {};
    }

    if (this.path_children_cache[path] &&
      this.path_children_cache[path][page_index] &&
      this.path_children_cache[path][page_index].data
    ) {
      let child_obj = this.path_children_cache[path][page_index];
      return {
        nextPageToken: child_obj.nextPageToken || null,
        curPageIndex: page_index,
        data: child_obj.data
      };
    }

    let id = await this.findPathId(path);
    let result = await this._list_gdrive_files(id, page_token, page_index);
    let data = result.data;
    if (result.nextPageToken && data.files) {
      if (!Array.isArray(this.path_children_cache[path])) {
        this.path_children_cache[path] = []
      }
      this.path_children_cache[path][Number(result.curPageIndex)] = {
        nextPageToken: result.nextPageToken,
        data: data
      };
    }

    return result
  }

  // listing files usign google drive api
  async _list_gdrive_files(parent, page_token = null, page_index = 0) {

    if (parent == undefined) {
      return null;
    }
    let obj;
    let params = {
      'includeItemsFromAllDrives': true,
      'supportsAllDrives': true
    };
    params.q = `'${parent}' in parents and trashed = false AND name !='.password' and mimeType != 'application/vnd.google-apps.shortcut' and mimeType != 'application/vnd.google-apps.document' and mimeType != 'application/vnd.google-apps.spreadsheet' and mimeType != 'application/vnd.google-apps.form' and mimeType != 'application/vnd.google-apps.site'`;
    params.orderBy = 'folder, name, modifiedTime desc';
    params.fields = "nextPageToken, files(id, name, mimeType, size, modifiedTime, driveId, kind, fileExtension)";
    params.pageSize = this.authConfig.files_list_page_size;

    if (page_token) {
      params.pageToken = page_token;
    }
    let url = 'https://www.googleapis.com/drive/v3/files';
    url += '?' + enQuery(params);
    let requestOption = await this.requestOptions();
    let response;
    for (let i = 0; i < 3; i++) {
      response = await fetch(url, requestOption);
      if (response.ok) {
        break;
      }
      await sleep(800 * (i + 1));
    }
    obj = await response.json();

    return {
      nextPageToken: obj.nextPageToken || null,
      curPageIndex: page_index,
      data: obj
    };
  }

  async password(path) {
    if (this.passwords[path] !== undefined) {
      return this.passwords[path];
    }

    let file = await this.get_single_file(path + '.password');
    if (file == undefined) {
      this.passwords[path] = null;
    } else {
      let url = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
      let requestOption = await this.requestOptions();
      let response = await this.fetch200(url, requestOption);
      this.passwords[path] = await response.text();
    }

    return this.passwords[path];
  }

  async searchFilesinDrive(origin_keyword, page_token = null, page_index = 0) {
    const types = DriveFixedTerms.gd_root_type;
    const is_user_drive = this.root_type === types.user_drive;
    const is_share_drive = this.root_type === types.share_drive;
    const empty_result = {
      nextPageToken: null,
      curPageIndex: page_index,
      data: null
    };

    if (!is_user_drive && !is_share_drive) {
      return empty_result;
    }
    let keyword = SearchFunction.formatSearchKeyword(origin_keyword);
    if (!keyword) {
      return empty_result;
    }
    let words = keyword.split(/\s+/);
    let name_search_str = `name contains '${words.join("' AND name contains '")}'`;
    let params = {};
    if (is_user_drive) {
      if (authConfig.search_all_drives) {
        params.corpora = 'allDrives';
        params.includeItemsFromAllDrives = true;
        params.supportsAllDrives = true;
      } else {
        params.corpora = 'user';
      }
    }
    if (is_share_drive) {
      if (authConfig.search_all_drives) {
        params.corpora = 'allDrives';
      } else {
        params.corpora = 'drive';
        params.driveId = this.root.id;
      }
      params.includeItemsFromAllDrives = true;
      params.supportsAllDrives = true;
    }
    if (page_token) {
      params.pageToken = page_token;
    }
    params.q = `trashed = false AND mimeType != 'application/vnd.google-apps.shortcut' and mimeType != 'application/vnd.google-apps.document' and mimeType != 'application/vnd.google-apps.spreadsheet' and mimeType != 'application/vnd.google-apps.form' and mimeType != 'application/vnd.google-apps.site' AND name !='.password' AND (${name_search_str})`;
    params.fields = "nextPageToken, files(id, driveId, name, mimeType, size , modifiedTime)";
    params.pageSize = this.authConfig.search_result_list_page_size;
    params.orderBy = 'folder, name, modifiedTime desc';

    let url = 'https://www.googleapis.com/drive/v3/files';
    url += '?' + enQuery(params);
    let requestOption = await this.requestOptions();
    let response;
    for (let i = 0; i < 3; i++) {
      response = await fetch(url, requestOption);
      if (response.ok) {
        break;
      }
      await sleep(800 * (i + 1));
    }
    let res_obj = await response.json();

    return {
      nextPageToken: res_obj.nextPageToken || null,
      curPageIndex: page_index,
      data: res_obj
    };
  }

  async findParentFilesRecursion(child_id, drive_index_no, contain_myself = true) {
    const gd = this;
    const gd_root_id = gd.root.id;
    const user_drive_real_root_id = authConfig.user_drive_real_root_id;
    const is_user_drive = gd.root_type === DriveFixedTerms.gd_root_type.user_drive;
    const target_top_id = is_user_drive ? user_drive_real_root_id : gd_root_id;
    const fields = DriveFixedTerms.default_file_fields;
    const parent_files = [];
    let meet_top = false;
    async function addItsFirstParent(file_obj) {
      if (!file_obj) return;
      if (!file_obj.parents) return null;
      if (file_obj.parents.length < 1) return;
      let p_ids = file_obj.parents;
      if (p_ids && p_ids.length > 0) {
        const first_p_id = p_ids[0];
        console.log(first_p_id)
        if (drive_list.includes(first_p_id)) {
          meet_top = true;
          drive_index_no = drive_list.indexOf(first_p_id);
          return drive_index_no;
        }
        const p_file_obj = await gd.findItemById(first_p_id);
        if (p_file_obj && p_file_obj.id) {
          parent_files.push(p_file_obj);
          await addItsFirstParent(p_file_obj);
        }
      }
      return drive_index_no;
    }

    const child_obj = await gd.findItemById(child_id);
    if (contain_myself) {
      parent_files.push(child_obj);
    }
    const drive_id = await addItsFirstParent(child_obj);
    console.log("parents -- " + JSON.stringify(parent_files))
    return meet_top ? [parent_files, drive_index_no] : null;
  }

  async findPathById(child_id) {
    let p_files
    let drive_index_no = 0;
    try {
      [p_files, drive_index_no] = await this.findParentFilesRecursion(child_id);
    } catch (error) {
      return null;
    }

    if (!p_files || p_files.length < 1) return '';

    let cache = [];
    // Cache the path and id of each level found
    p_files.forEach((value, idx) => {
      const is_folder = idx === 0 ? (p_files[idx].mimeType === DriveFixedTerms.folder_mime_type) : true;
      let path = '/' + p_files.slice(idx).map(it => encodeURIComponent(it.name)).reverse().join('/');
      if (is_folder) path += '/';
      cache.push({
        id: p_files[idx].id,
        path: path
      })
    });
    return [cache[0].path, drive_index_no];
  }

  async findItemById(id) {
    const is_user_drive = this.root_type === DriveFixedTerms.gd_root_type.user_drive;
    let url = `https://www.googleapis.com/drive/v3/files/${id}?fields=${DriveFixedTerms.default_file_fields}${is_user_drive ? '' : '&supportsAllDrives=true'}`;
    let requestOption = await this.requestOptions();
    let res = await fetch(url, requestOption);
    return await res.json()
  }

  async findPathId(path) {
    let c_path = '/';
    let c_id = this.paths[c_path];

    let arr = path.trim('/').split('/');
    for (let name of arr) {
      c_path += name + '/';

      if (typeof this.paths[c_path] == 'undefined') {
        let id = await this._findDirId(c_id, name);
        this.paths[c_path] = id;
      }

      c_id = this.paths[c_path];
      if (c_id == undefined || c_id == null) {
        break;
      }
    }
    console.log('findPathId: ', path, c_id)
    return this.paths[path];
  }

  async _findDirId(parent, name) {
    name = decodeURIComponent(name).replace(/\'/g, "\\'");
    if (parent == undefined) {
      return null;
    }

    let url = 'https://www.googleapis.com/drive/v3/files';
    let params = {
      'includeItemsFromAllDrives': true,
      'supportsAllDrives': true
    };
    params.q = `'${parent}' in parents and mimeType = 'application/vnd.google-apps.folder' and name = '${name}'  and trashed = false`;
    params.fields = "nextPageToken, files(id, name, mimeType)";
    url += '?' + enQuery(params);
    let requestOption = await this.requestOptions();
    let response;
    for (let i = 0; i < 3; i++) {
      response = await fetch(url, requestOption);
      if (response.ok) {
        break;
      }
      await sleep(800 * (i + 1));
    }
    let obj = await response.json();
    if (obj.files[0] == undefined) {
      return null;
    }
    return obj.files[0].id;
  }

  /*async getAccessToken() {
    console.log("accessToken");
    if (this.authConfig.expires == undefined || this.authConfig.expires < Date.now()) {
      const obj = await fetchAccessToken();
      if (obj.access_token != undefined) {
        this.authConfig.accessToken = obj.access_token;
        this.authConfig.expires = Date.now() + 3500 * 1000;
      }
    }
    return this.authConfig.accessToken;
  }*/

  /*async fetchAccessToken() {
    console.log("fetchAccessToken");
    const url = "https://www.googleapis.com/oauth2/v4/token";
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };
    var post_data;
    if (this.authConfig.service_account && typeof this.authConfig.service_account_json != "undefined") {
      const jwttoken = await JSONWebToken.generateGCPToken(this.authConfig.service_account_json);
      post_data = {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwttoken,
      };
    } else {
      post_data = {
        client_id: this.authConfig.client_id,
        client_secret: this.authConfig.client_secret,
        refresh_token: this.authConfig.refresh_token,
        grant_type: "refresh_token",
      };
    }

    let requestOption = {
      'method': 'POST',
      'headers': headers,
      'body': enQuery(post_data)
    };

    let response;
    for (let i = 0; i < 3; i++) {
      response = await fetch(url, requestOption);
      if (response.ok) {
        break;
      }
      await sleep(800 * (i + 1));
    }
    return await response.json();
  }*/

  async fetch200(url, requestOption) {
    let response;
    for (let i = 0; i < 3; i++) {
      response = await fetch(url, requestOption);
      if (response.ok) {
        break;
      }
      await sleep(800 * (i + 1));
    }
    return response;
  }

  async requestOptions(headers = {}, method = 'GET') {
    const Token = await getAccessToken();
    headers['authorization'] = 'Bearer ' + Token;
    return {
      'method': method,
      'headers': headers
    };
  }


  /*sleep(ms) {
    return new Promise(function(resolve, reject) {
      let i = 0;
      setTimeout(function() {
        console.log('sleep' + ms);
        i++;
        if (i >= 2) reject(new Error('i>=2'));
        else resolve(i);
      }, ms);
    })
  }*/
}
// end of class googleDrive
const drive = new googleDrive(authConfig, 0);
async function download(id, range = '', inline) {
  let url = `https://www.googleapis.com/drive/v3/files/${id}?alt=media`;
  const requestOption = await drive.requestOptions();
  requestOption.headers['Range'] = range;
  let file = await drive.findItemById(id);
  if (!file.name) {
    return new Response(`{"error":"Unable to Find this File, Try Again."}`, {
      status: 500,
      headers: {
        "content-type": "application/json",
        "Access-Control-Allow-Origin": authConfig.cors_domain,
        "Cache-Control": "max-age=3600",
      }
    });
  }
  let res;
  for (let i = 0; i < 3; i++) {
    res = await fetch(url, requestOption);
    if (res.ok) {
      break;
    }
    sleep(800 * (i + 1));
    console.log(res);
  }
  const second_domain_for_dl = `${uiConfig.second_domain_for_dl}`
  if (second_domain_for_dl == 'true') {
    const res = await fetch(`${uiConfig.jsdelivr_cdn_src}@${uiConfig.version}/assets/disable_download.html`);
    return new Response(await res.text(), {
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    })
  } else if (res.ok) {
    const {
      headers
    } = res = new Response(res.body, res)
    headers.set("Content-Disposition", `attachment; filename="${file.name}"`);
    headers.set("Content-Length", file.size);
    authConfig.enable_cors_file_down && headers.append('Access-Control-Allow-Origin', '*');
    inline === true && headers.set('Content-Disposition', 'inline');
    return res;
  } else if (res.status == 404) {
    return new Response(not_found, {
      status: 404,
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    })
  } else if (res.status == 403) {
    const details = await res.text()
    return new Response(details, {
      status: 403,
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    })
  } else {
    const details = await res.text()
    /*const res = await fetch(`${uiConfig.jsdelivr_cdn_src}@${uiConfig.version}/assets/download_error.html`);
    return new Response(await res.text(), {
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    })*/
    return new Response(details, {})
  }
}


String.prototype.trim = function(char) {
  if (char) {
    return this.replace(new RegExp('^\\' + char + '+|\\' + char + '+$', 'g'), '');
  }
  return this.replace(/^\s+|\s+$/g, '');
};


function decodeJwtToken(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request, event).catch(
    (err) => new Response("Report this page when asked at the time of support... ==> " + err.stack, { status: 500 })
  )
  );
});