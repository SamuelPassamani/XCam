# -*- coding: utf-8 -*-

# ---------------------------------------------------------------------------------------------
# 1. CABEÇALHO / INÍCIO
# ---------------------------------------------------------------------------------------------

# @titulo:         config.py
# @author:         Samuel Passamani / Um Projeto do Estudio A.Sério [AllS Company]
# @info:           https://aserio.work/
# @version:        1.4.0
# @lastupdate:     2025-07-14
# @description:    Este arquivo centraliza todas as configurações de caminhos, parâmetros e
#                  variáveis de comportamento do módulo XCam Rec. Os valores definidos aqui
#                  funcionam como **padrões (defaults)** e podem ser sobrescritos por
#                  configurações manuais fornecidas pelo formulário no XCam_Rec_Launcher.ipynb.
#                  Isso garante flexibilidade na execução sem alterar o código-fonte.
# @modes:          - Configuração de Ambiente e Comportamento Padrão.

# ---------------------------------------------------------------------------------------------
# 2. CONFIGURAÇÕES & VARIÁVEIS GLOBAIS
# ---------------------------------------------------------------------------------------------

# --- Configurações Padrão de Execução ---
# Estes valores serão utilizados caso o formulário de execução manual não especifique outros.
DEFAULT_EXECUTION_SETTINGS = {
    # Intervalo padrão em segundos entre cada verificação da API por novos modelos online.
    "CHECK_INTERVAL_SECONDS": 60,

    # Duração MÁXIMA padrão, em segundos, que cada segmento de gravação deve ter.
    # O processo do FFmpeg será finalizado ao atingir este limite para criar um novo ficheiro.
    # Exemplo: 7200 segundos = 2 horas.
    "MAX_DURATION_SECONDS": 7200,

    # Duração MÍNIMA padrão, em segundos, que uma gravação deve ter para ser considerada válida.
    # Se um vídeo gravado tiver uma duração inferior a este valor, os ficheiros (.mp4 e .jpg)
    # serão automaticamente descartados para economizar espaço.
    # Exemplo: 420 segundos = 7 minutos.
    "MIN_DURATION_SECONDS": 420,
    
    # Parâmetros padrão para a requisição à API do XCam.
    "API_PARAMS": {
        "limit": 1000,      # Número máximo de resultados por página.
        "page": 1,          # Página inicial da qual começar a busca.
        "country": ""       # Filtro de país (ex: "US"). Deixar em branco para buscar em todos os países.
    }
}

# --- Configuração de Caminhos (Ambiente Google Colab) ---
# Define o caminho base onde o Google Drive está montado no ambiente Colab.
# Todos os outros caminhos de trabalho são construídos a partir desta base.
DRIVE_BASE_PATH = "/content/drive/MyDrive/Projetos/XCam/XCam Drive/XCam.Drive/src"

# Define os caminhos específicos para os arquivos temporários e logs, baseados no caminho principal.
# Diretório para armazenar gravações de vídeo temporárias antes do processamento final.
TEMP_RECORDS_PATH = f"{DRIVE_BASE_PATH}/temp/records"
# Diretório para armazenar miniaturas (posters) temporárias geradas durante a gravação.
TEMP_POSTERS_PATH = f"{DRIVE_BASE_PATH}/temp/posters"
# Diretório para armazenar os ficheiros de log da aplicação.
LOGS_PATH = f"{DRIVE_BASE_PATH}/logs"

# Define o caminho para o armazenamento persistente e final dos dados do utilizador (posters).
DRIVE_PERSISTENT_USER_PATH = "/content/drive/MyDrive/Projetos/XCam/XCam Drive/XCam.Drive/user"

# --- Configuração da API do XCam ---
# URL base da API do XCam. O endpoint específico (ex: /v1/online) será concatenado a esta URL.
API_BASE_URL = "https://api.xcam.gay"
# Chave de acesso à XCam API
API_KEY = "99090882"

# --- Configuração do Banco de Dados (Git-as-a-Database) ---
# Caminho para o diretório que armazena os arquivos de metadados (rec.json), relativo à raiz do projeto.
DB_PATH = "xcam-db/user/"

# --- Configuração da API de Upload ---
# URL de upload para o serviço de armazenamento de vídeos de terceiros (ex: Hydrax/Abyss.to).
ABYSS_UPLOAD_URL = "http://up.hydrax.net/0128263f78f0b426d617bb61c2a8ff43"

# --- Configurações de Logging ---
# Define o nível de detalhe dos logs. Opções: "DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL".
LOG_LEVEL = "INFO"

# Define o nome do ficheiro onde os logs de execução serão guardados.
LOG_FILE = "xcam_recorder.log"

# ---------------------------------------------------------------------------------------------
# 3. CORPO
# ---------------------------------------------------------------------------------------------

# Este arquivo destina-se exclusivamente a conter variáveis de configuração.
# Nenhuma função ou bloco de execução deve ser adicionado aqui para manter a clareza
# e a separação de responsabilidades do projeto.

# ---------------------------------------------------------------------------------------------
# 4. RODAPÉ / FIM DO CÓDIGO
# ---------------------------------------------------------------------------------------------

# @log de mudanças:
# 2025-07-14 (v1.4.0):
# - REFACTOR: As configurações de execução (intervalo, durações, params da API) foram agrupadas
#   num dicionário `DEFAULT_EXECUTION_SETTINGS` para reforçar a sua natureza de valores padrão.
# - DOCS: Atualizada a descrição do arquivo para clarificar que estes valores são padrões
#   e podem ser sobrescritos pelo formulário do Launcher.
#
# 2025-07-14 (v1.3.0):
# - FEATURE: Adicionada a variável `MIN_DURATION_SECONDS` para permitir o descarte de gravações muito curtas.
# - REFACTOR: A variável `duration` (implícita) foi formalizada como `MAX_DURATION_SECONDS`.
# - CORREÇÃO: Restauradas as variáveis de caminho `TEMP_RECORDS_PATH`, `TEMP_POSTERS_PATH` e `API_BASE_URL`.
#
# 2025-07-13 (v1.2.0):
# - FEATURE: Adicionada a variável `DRIVE_PERSISTENT_USER_PATH`.
#
# 2025-07-13 (v1.1.0):
# - CORREÇÃO: Adicionada a variável `API_BASE_URL`.
#
# 2025-07-13 (v1.0.0):
# - Criação inicial do arquivo `config.py`.

# @roadmap futuro:
# - Implementar um sistema para carregar configurações sensíveis (como tokens de API ou chaves de upload)
#   a partir de variáveis de ambiente ou de um ficheiro .env, para maior segurança.
# - Adicionar uma secção de "modelos prioritários" para garantir que certos streamers sejam
#   verificados com maior frequência ou tenham limites de gravação diferentes.
# - Criar uma função de inicialização que valide se os caminhos configurados existem e têm as
#   permissões corretas no início da execução.
