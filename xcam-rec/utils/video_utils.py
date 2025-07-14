# -*- coding: utf-8 -*-

# ---------------------------------------------------------------------------------------------
# 1. CABEÇALHO / INÍCIO
# ---------------------------------------------------------------------------------------------

# @titulo:         video_utils.py
# @author:         Samuel Passamani / Um Projeto do Estudio A.Sério [AllS Company]
# @info:           https://aserio.work/
# @version:        1.2.0
# @lastupdate:     2025-07-14
# @description:    Módulo utilitário para operações de pós-processamento de vídeo.
#                  Contém funções para extrair metadados de ficheiros de vídeo (como a duração)
#                  e para gerir os ficheiros gravados com base nas regras de negócio
#                  definidas nas configurações (ex: duração mínima).
# @modes:          - Extração de Metadados de Vídeo.
#                  - Validação e Gestão de Ficheiros Gravados.

# ---------------------------------------------------------------------------------------------
# 2. CONFIGURAÇÕES & VARIÁVEIS GLOBAIS
# ---------------------------------------------------------------------------------------------

import subprocess  # Necessário para executar comandos externos como o ffprobe.
import json        # Para analisar a saída JSON do ffprobe.
import logging     # Para registar o progresso e os erros de forma consistente.
import os          # Usado para verificar a existência e remover ficheiros.

# Inicializa um logger específico para este módulo, permitindo um controlo granular dos logs.
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------------------------
# 3. CORPO
# ---------------------------------------------------------------------------------------------

def get_video_duration(file_path):
    """
    Obtém a duração de um ficheiro de vídeo em segundos usando o ffprobe.

    Args:
        file_path (str): O caminho completo para o ficheiro de vídeo (ex: ".../video.mp4").

    Returns:
        float: A duração do vídeo em segundos. Retorna 0.0 se ocorrer um erro.
    """
    # Constrói o comando ffprobe para obter os metadados do vídeo em formato JSON.
    command = [
        "ffprobe",
        "-v", "quiet",
        "-print_format", "json",
        "-show_format",
        "-show_streams",
        file_path
    ]

    try:
        # Executa o comando ffprobe e captura a sua saída.
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        video_info = json.loads(result.stdout)

        # Extrai a duração do campo 'format'.
        if 'format' in video_info and 'duration' in video_info['format']:
            duration = float(video_info['format']['duration'])
            logger.debug(f"🔍 Duração verificada para '{file_path}': {duration:.2f} segundos.")
            return duration
        else:
            logger.warning(f"⚠️ Não foi possível encontrar a informação de duração na saída do ffprobe para '{file_path}'.")
            return 0.0

    except FileNotFoundError:
        logger.error("❌ Erro Crítico: O comando 'ffprobe' não foi encontrado. Verifique se o FFmpeg está instalado e no PATH do sistema.")
        return 0.0
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ Erro ao executar o ffprobe para o ficheiro '{file_path}': {e.stderr}")
        return 0.0
    except (json.JSONDecodeError, KeyError, ValueError) as e:
        logger.error(f"❌ Erro ao analisar a saída do ffprobe para '{file_path}': {e}")
        return 0.0

def manage_recorded_file(video_path, thumbnail_path, min_duration):
    """
    Verifica a duração de uma gravação e a descarta se for inferior ao mínimo necessário.

    Args:
        video_path (str): O caminho completo para o ficheiro de vídeo (.mp4) gravado.
        thumbnail_path (str): O caminho completo para a miniatura (.jpg) associada.
        min_duration (int): A duração mínima em segundos que a gravação deve ter para ser mantida.

    Returns:
        bool: Retorna True se o ficheiro foi mantido, e False se foi descartado ou se ocorreu um erro.
    """
    logger.info(f"🔎 A validar o ficheiro gravado: {os.path.basename(video_path)}")

    actual_duration = get_video_duration(video_path)

    if 0 < actual_duration < min_duration:
        logger.warning(f"🗑️ Gravação para '{os.path.basename(video_path)}' tem apenas {actual_duration:.2f}s (mínimo exigido: {min_duration}s). A descartar ficheiros.")
        
        try:
            if os.path.exists(video_path):
                os.remove(video_path)
                logger.info(f"🗑️ Ficheiro de vídeo '{os.path.basename(video_path)}' descartado com sucesso.")
            
            if os.path.exists(thumbnail_path):
                os.remove(thumbnail_path)
                logger.info(f"🗑️ Ficheiro de miniatura '{os.path.basename(thumbnail_path)}' descartado com sucesso.")
            
            return False
            
        except OSError as e:
            logger.error(f"❌ Erro de sistema ao tentar apagar os ficheiros para '{video_path}': {e}")
            return False
    
    elif actual_duration == 0:
        logger.error(f"❗️ Não foi possível determinar a duração de '{video_path}'. O ficheiro pode estar corrompido. A manter por precaução.")
        return False

    logger.info(f"✅ Gravação '{os.path.basename(video_path)}' validada e mantida com {actual_duration:.2f}s.")
    return True

# ---------------------------------------------------------------------------------------------
# 4. RODAPÉ / FIM DO CÓDIGO
# ---------------------------------------------------------------------------------------------

# @log de mudanças:
# 2025-07-14 (v1.2.0):
# - FEATURE: Adicionados emojis a todas as saídas de log para melhorar a legibilidade e o apelo visual.
#
# 2025-07-14 (v1.1.0):
# - FEATURE: Adicionada a função de alto nível `manage_recorded_file` que encapsula a lógica de validação.
# - REFACTOR: Melhorado o tratamento de exceções e o logging na função `get_video_duration`.
#
# 2025-07-14 (v1.0.0):
# - Criação inicial do arquivo `video_utils.py`.

# @roadmap futuro:
# - Adicionar uma função para extrair outros metadados do vídeo, como resolução, codec ou bitrate.
# - Implementar uma função de verificação de integridade do ficheiro (ex: `ffprobe -v error`).
