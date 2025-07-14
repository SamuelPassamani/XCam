# -*- coding: utf-8 -*-

# ---------------------------------------------------------------------------------------------
# 1. CABEÇALHO / INÍCIO
# ---------------------------------------------------------------------------------------------

# @titulo:         logger.py
# @author:         Samuel Passamani / Um Projeto do Estudio A.Sério [AllS Company]
# @info:           https://aserio.work/
# @version:        1.2.0
# @lastupdate:     2025-07-14
# @description:    Este módulo centraliza a configuração do sistema de logging para o projeto XCam Rec.
#                  Ele cria um logger robusto, colorido e com emojis que fornece feedback visual
#                  tanto no console quanto em um arquivo de log persistente. A função de setup
#                  é parametrizável para permitir diferentes níveis de log e locais de arquivo.
# @modes:          - Console (stdout): Saída colorida e com emojis para acompanhamento em tempo real.
#                  - Arquivo (xcam_rec.log): Saída de texto puro para auditoria e análise posterior.

# ---------------------------------------------------------------------------------------------
# 2. CONFIGURAÇÕES & VARIÁVEIS GLOBAIS
# ---------------------------------------------------------------------------------------------

import logging
import sys
import os

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
    def format(self, record):
        """Formata o registro de log, adicionando cor e emoji de acordo com o nível."""
        color = COLORS.get(record.levelname, COLORS["RESET"])
        emoji = EMOJIS.get(record.levelname, "")
        # Formato customizado que inclui cor, data/hora, emoji e a mensagem.
        log_fmt = f"{color}[%(asctime)s] {emoji}  %(message)s{COLORS['RESET']}"
        formatter = logging.Formatter(log_fmt, datefmt='%Y-%m-%d %H:%M:%S')
        return formatter.format(record)

def setup_logging(log_level: str = "INFO", log_file: str = "xcam_recorder.log"):
    """
    Configura e inicializa a instância principal do logger para todo o projeto.
    
    Args:
        log_level (str, optional): O nível mínimo de log a ser capturado (ex: "INFO", "DEBUG").
                                   Padrão é "INFO".
        log_file (str, optional): O caminho completo para o arquivo de log.
                                  Padrão é "xcam_recorder.log".
    """
    # Obtém a instância raiz do logger para configurar a aplicação inteira.
    logger = logging.getLogger()
    logger.setLevel(log_level.upper())

    # Limpa quaisquer handlers existentes para evitar duplicação de logs.
    if logger.hasHandlers():
        logger.handlers.clear()

    # --- Configuração do Handler para o Console (stdout) ---
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level.upper())
    console_handler.setFormatter(ColorEmojiFormatter())
    logger.addHandler(console_handler)

    # --- Configuração do Handler para o Arquivo ---
    try:
        # Garante que o diretório de logs exista.
        log_dir = os.path.dirname(log_file)
        if log_dir:
            os.makedirs(log_dir, exist_ok=True)
        
        # Cria um handler que escreve os logs no caminho especificado.
        file_handler = logging.FileHandler(log_file, mode='a', encoding='utf-8')
        file_handler.setLevel(log_level.upper())
        # Define um formato de log sem cores para o arquivo.
        file_formatter = logging.Formatter("[%(asctime)s] [%(levelname)s] - %(message)s", datefmt='%Y-%m-%d %H:%M:%S')
        file_handler.setFormatter(file_formatter)
        logger.addHandler(file_handler)
        
    except Exception as e:
        # Se houver um erro ao criar o diretório ou o arquivo de log,
        # loga um erro crítico no console para alertar o usuário.
        logger.critical(f"🔥 Falha ao configurar o logging em arquivo no caminho '{log_file}': {e}")
        logger.critical("   Os logs serão exibidos apenas no console.")

# ---------------------------------------------------------------------------------------------
# 4. RODAPÉ / FIM DO CÓDIGO
# ---------------------------------------------------------------------------------------------

# @log de mudanças:
# 2025-07-14 (v1.2.0):
# - CORREÇÃO: A função `setup_logger` foi renomeada para `setup_logging` para corrigir o `ImportError`.
# - REFACTOR: A função `setup_logging` agora aceita os parâmetros `log_level` e `log_file`,
#   tornando-a mais modular e removendo a dependência direta do `config.py`.
# - REFACTOR: Removida a criação da instância global `log`, pois a inicialização agora é
#   responsabilidade do `main.py`.
#
# 2025-07-13 (v1.1.0):
# - REFINAMENTO: O módulo agora importa a variável `LOGS_PATH` do arquivo `config.py`.
# - MELHORIA: A função `setup_logger` agora cria o diretório de logs se ele não existir.
#
# 2025-07-12 (v1.0.0):
# - Criação inicial do módulo `logger.py`.

# @roadmap futuro:
# - Adicionar um mecanismo de rotação de arquivos de log (log rotation) para evitar que
#   o ficheiro de log cresça indefinidamente.
# - Integrar com serviços de logging em nuvem (ex: Sentry, Logtail) para monitorização centralizada.
