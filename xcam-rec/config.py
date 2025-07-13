# -*- coding: utf-8 -*-

# ---------------------------------------------------------------------------------------------
# 1. CABEÇALHO / INÍCIO
# ---------------------------------------------------------------------------------------------

# @titulo:         config.py
# @author:         Samuel Passamani / Um Projeto do Estudio A.Sério [AllS Company]
# @info:           https://aserio.work/
# @version:        1.2.0
# @lastupdate:     2025-07-13
# @description:    Este arquivo centraliza todas as configurações de caminhos e variáveis
#                  do projeto XCam Rec. Ao isolar as configurações aqui, facilitamos a
#                  adaptação do projeto para diferentes ambientes (Colab, Servidor Local, etc.)
#                  sem a necessidade de alterar o código-fonte dos módulos principais.
# @modes:          - Configuração de Ambiente.

# ---------------------------------------------------------------------------------------------
# 2. CONFIGURAÇÕES & VARIÁVEIS GLOBAIS
# ---------------------------------------------------------------------------------------------

# --- Configuração de Caminhos para o Google Colab ---
# Define o caminho base onde o Google Drive está montado.
DRIVE_BASE_PATH = "/content/drive/MyDrive/XCam.Drive/src"

# Define os caminhos específicos para os arquivos temporários e logs, baseados no caminho principal.
TEMP_RECORDS_PATH = f"{DRIVE_BASE_PATH}/temp/records"
TEMP_POSTERS_PATH = f"{DRIVE_BASE_PATH}/temp/posters"
LOGS_PATH = f"{DRIVE_BASE_PATH}/logs"

# Define o caminho para o armazenamento persistente de dados de utilizador (posters).
DRIVE_PERSISTENT_USER_PATH = "/content/drive/MyDrive/XCam.Drive/user"


# --- Configuração da API do XCam ---
# URL base da API do XCam.
API_BASE_URL = "https://api.xcam.gay"


# --- Configuração do Banco de Dados (Git-as-a-Database) ---
# Caminho para o diretório que armazena os arquivos rec.json, relativo à raiz do projeto.
DB_PATH = "xcam-db/user/"


# --- Configuração da API de Upload ---
# URL de upload para o serviço Hydrax/Abyss.to.
ABYSS_UPLOAD_URL = "http://up.hydrax.net/0128263f78f0b426d617bb61c2a8ff43"

# ---------------------------------------------------------------------------------------------
# 3. CORPO
# ---------------------------------------------------------------------------------------------

# Este arquivo destina-se apenas a conter variáveis de configuração.
# Nenhuma função ou bloco de execução é necessário aqui.

# ---------------------------------------------------------------------------------------------
# 4. RODAPÉ / FIM DO CÓDIGO
# ---------------------------------------------------------------------------------------------

# @log de mudanças:
# 2025-07-13 (v1.2.0):
# - FEATURE: Adicionada a variável `DRIVE_PERSISTENT_USER_PATH` para o armazenamento final dos posters,
#   alinhando o config com a nova lógica do `main.py`.
#
# 2025-07-13 (v1.1.0):
# - CORREÇÃO: Adicionada a variável `API_BASE_URL` que estava em falta.
#
# 2025-07-13 (v1.0.0):
# - Criação inicial do arquivo `config.py`.

# @roadmap futuro:
# - Adicionar mais configurações, como chaves de API ou tokens, para serem carregadas a partir
#   de variáveis de ambiente para maior segurança.
# - Criar uma função ou classe que valide se os caminhos configurados existem e têm as permissões corretas.
