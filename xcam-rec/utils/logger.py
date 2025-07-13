# -*- coding: utf-8 -*-

# ---------------------------------------------------------------------------------------------
# 1. CABEÇALHO / INÍCIO
# ---------------------------------------------------------------------------------------------

# @titulo:         logger.py
# @author:         Samuel Passamani / Um Projeto do Estudio A.Sério [AllS Company]
# @info:           https://aserio.work/
# @version:        1.1.0
# @lastupdate:     2025-07-13
# @description:    Este módulo centraliza a configuração do sistema de logging para o projeto XCam Rec.
#                  Ele cria um logger robusto, colorido e com emojis que fornece feedback visual
#                  tanto no console quanto em um arquivo de log persistente, cujo caminho é
#                  definido no arquivo de configuração central (config.py).
# @modes:          - Console (stdout): Saída colorida e com emojis para acompanhamento em tempo real.
#                  - Arquivo (xcam_rec.log): Saída de texto puro para auditoria e análise posterior.

# ---------------------------------------------------------------------------------------------
# 2. CONFIGURAÇÕES & VARIÁVEIS GLOBAIS
# ---------------------------------------------------------------------------------------------

# Importações necessárias para o funcionamento do módulo.
import logging  # Biblioteca padrão do Python para logging.
import sys      # Usado para direcionar a saída do log para o console (stdout).
import os       # Usado para manipulação de caminhos e criação de diretórios.

# Importa as configurações de caminho do nosso arquivo central.
from config import LOGS_PATH

# Dicionário com códigos de escape ANSI para colorir o texto no terminal.
COLORS = {
    "DEBUG": "\x1b[38;5;240m",
    "INFO": "\x1b[38;5;250m",
    "WARNING": "\x1b[33;1m",
    "ERROR": "\x1b[31;1m",
    "CRITICAL": "\x1b[31;1;4m",
    "RESET": "\x1b[0m"
}

# Dicionário que mapeia os níveis de log a emojis correspondentes.
EMOJIS = {
    "DEBUG": "🐛",
    "INFO": "ℹ️",
    "WARNING": "⚠️",
    "ERROR": "❌",
    "CRITICAL": "🔥"
}

# ---------------------------------------------------------------------------------------------
# 3. CORPO
# ---------------------------------------------------------------------------------------------

class ColorEmojiFormatter(logging.Formatter):
    """
    Uma classe de formatação personalizada para o logger.
    Permite a inserção de cores e emojis nas mensagens de log exibidas no console.
    """
    def __init__(self, fmt):
        super().__init__(fmt)
        self.fmt = fmt

    def format(self, record):
        """Formata o registro de log, adicionando cor e emoji de acordo com o nível."""
        color = COLORS.get(record.levelname, COLORS["RESET"])
        emoji = EMOJIS.get(record.levelname, "")
        log_fmt = f"{color}[%(asctime)s] {emoji}  %(message)s{COLORS['RESET']}"
        formatter = logging.Formatter(log_fmt, datefmt='%Y-%m-%d %H:%M:%S')
        return formatter.format(record)

def setup_logger():
    """
    Configura e inicializa a instância principal do logger para todo o projeto.
    A localização do arquivo de log é lida do arquivo `config.py`.
    """
    # Obtém (ou cria) uma instância do logger com o nome "XCamRec".
    logger = logging.getLogger("XCamRec")
    logger.setLevel(logging.INFO)

    # Evita adicionar múltiplos handlers se a função for chamada mais de uma vez.
    if logger.hasHandlers():
        logger.handlers.clear()

    # --- Configuração do Handler para o Console (stdout) ---
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(ColorEmojiFormatter(fmt="[%(asctime)s] %(message)s"))
    logger.addHandler(console_handler)

    # --- Configuração do Handler para o Arquivo ---
    try:
        # Garante que o diretório de logs, definido em config.py, exista.
        os.makedirs(LOGS_PATH, exist_ok=True)
        
        # Constrói o caminho completo para o arquivo de log.
        log_file_path = os.path.join(LOGS_PATH, "xcam_rec.log")
        
        # Cria um handler que escreve os logs no caminho especificado.
        file_handler = logging.FileHandler(log_file_path, mode='a', encoding='utf-8')
        file_handler.setLevel(logging.INFO)
        file_handler.setFormatter(logging.Formatter("[%(asctime)s] [%(levelname)s] - %(message)s", datefmt='%Y-%m-%d %H:%M:%S'))
        logger.addHandler(file_handler)
        
    except Exception as e:
        # Se houver um erro ao criar o diretório ou o arquivo de log (ex: permissão negada),
        # loga um erro crítico no console para alertar o usuário.
        logger.critical(f"🔥 Falha ao configurar o logging em arquivo no caminho '{LOGS_PATH}': {e}")
        logger.critical("   Os logs serão exibidos apenas no console.")

    return logger

# Cria a instância única e global do logger que será importada por outros módulos.
log = setup_logger()

# ---------------------------------------------------------------------------------------------
# 4. RODAPÉ / FIM DO CÓDIGO
# ---------------------------------------------------------------------------------------------

# @log de mudanças:
# 2025-07-13 (v1.1.0):
# - REFINAMENTO: O módulo agora importa a variável `LOGS_PATH` do arquivo `config.py`.
# - MELHORIA: A função `setup_logger` agora cria o diretório de logs se ele não existir.
# - ROBUSTEZ: Adicionado tratamento de erro caso a criação do diretório ou arquivo de log falhe.
#
# 2025-07-12 (v1.0.0):
# - Criação inicial do módulo `logger.py`.
# - Implementação de sistema de logging profissional com cores e emojis.
# - Configuração de dupla saída: console e arquivo.

# @roadmap futuro:
# - Adicionar a possibilidade de configurar o nível do log via argumentos de linha de comando.
# - Integrar com serviços de logging em nuvem (ex: Sentry, Logtail).
# - Implementar um mecanismo de rotação de arquivos de log (log rotation).
