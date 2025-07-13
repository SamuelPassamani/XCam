# -*- coding: utf-8 -*-

# ---------------------------------------------------------------------------------------------
# 1. CABEÇALHO / INÍCIO
# ---------------------------------------------------------------------------------------------

# @titulo:         ffmpeg_recorder.py
# @author:         Samuel Passamani / Um Projeto do Estudio A.Sério [AllS Company]
# @info:           https://aserio.work/
# @version:        1.1.0
# @lastupdate:     2025-07-12
# @description:    Este módulo fornece uma interface de alto nível para interagir com o FFmpeg.
#                  Ele encapsula a complexidade de executar o FFmpeg como um subprocesso,
#                  oferecendo funções para gravar streams de vídeo com monitoramento de
#                  progresso e para capturar thumbnails (imagens) de alta qualidade dos vídeos.
# @modes:          - Wrapper de subprocesso para FFmpeg.

# ---------------------------------------------------------------------------------------------
# 2. CONFIGURAÇÕES & VARIÁVEIS GLOBAIS
# ---------------------------------------------------------------------------------------------

# Importações de bibliotecas necessárias.
import os           # Usado para interações com o sistema operacional, como criar diretórios.
import re           # Módulo de expressões regulares, para parsear a saída do FFmpeg.
import subprocess   # Biblioteca principal para executar e gerenciar processos externos.
from typing import Optional # Para anotações de tipo.

# Importa a instância do nosso logger customizado.
from utils.logger import log

# ---------------------------------------------------------------------------------------------
# 3. CORPO
# ---------------------------------------------------------------------------------------------

def record_stream(stream_url: str, output_path: str, duration: int, progress_interval: int = 10) -> bool:
    """
    Grava uma stream de vídeo usando FFmpeg, monitorando o progresso em tempo real.

    Args:
        stream_url (str): A URL da stream de vídeo a ser gravada (ex: .m3u8).
        output_path (str): O caminho completo onde o arquivo de vídeo será salvo.
        duration (int): A duração total da gravação em segundos.
        progress_interval (int, optional): O intervalo em segundos para logar o progresso. Padrão é 10.

    Returns:
        bool: True se a gravação foi concluída com sucesso, False caso contrário.
    """
    # Garante que o diretório de destino para o arquivo de vídeo exista.
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Constrói a lista de argumentos para o comando FFmpeg.
    command = [
        'ffmpeg', '-i', stream_url, '-t', str(duration),
        '-c', 'copy', '-bsf:a', 'aac_adtstoasc', '-y', output_path
    ]

    log.info(f"🎥 Iniciando gravação de '{stream_url}' para '{output_path}' por {duration}s.")

    try:
        # Inicia o processo FFmpeg usando subprocess.Popen.
        process = subprocess.Popen(
            command, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
            universal_newlines=True, encoding='utf-8'
        )

        last_progress_log_time = 0

        # Itera sobre a saída de erro (stderr) do FFmpeg em tempo real.
        for line in iter(process.stderr.readline, ''):
            if 'frame=' in line and 'time=' in line:
                time_match = re.search(r"time=(\d{2}:\d{2}:\d{2})", line)
                if time_match:
                    current_time_str = time_match.group(1)
                    h, m, s = map(int, current_time_str.split(':'))
                    current_seconds = h * 3600 + m * 60 + s

                    if current_seconds >= last_progress_log_time + progress_interval:
                        percent = (current_seconds / duration) * 100
                        log.info(f"   [Progresso] Gravando... {current_seconds}s de {duration}s ({percent:.1f}%)")
                        last_progress_log_time = current_seconds
        
        process.wait()
        
        if process.returncode == 0:
            log.info(f"✅ Gravação concluída com sucesso: {output_path}")
            return True
        else:
            log.error(f"FFmpeg finalizou com erro (código: {process.returncode}).")
            stderr_output = process.stderr.read()
            log.error(f"   [FFmpeg Output]: {stderr_output.strip()}")
            return False

    except FileNotFoundError:
        log.critical("Comando 'ffmpeg' não encontrado. O FFmpeg é necessário para a gravação.")
        log.critical("   Por favor, instale-o e garanta que esteja no PATH do sistema.")
        return False
    except Exception as e:
        log.error(f"Ocorreu uma exceção inesperada durante a gravação: {e}")
        return False

def capture_thumbnail(video_path: str, thumbnail_path: str, timestamp: str = "00:00:05") -> Optional[str]:
    """
    Captura um único frame (thumbnail) de um arquivo de vídeo em um ponto específico.

    Args:
        video_path (str): O caminho para o arquivo de vídeo de entrada.
        thumbnail_path (str): O caminho onde a imagem do thumbnail será salva (ex: /path/to/thumb.jpg).
        timestamp (str, optional): O ponto no vídeo para capturar o frame (formato HH:MM:SS). Padrão é "00:00:05".

    Returns:
        Optional[str]: O caminho para o thumbnail criado em caso de sucesso, ou None em caso de falha.
    """
    # Verifica se o arquivo de vídeo de entrada realmente existe antes de prosseguir.
    if not os.path.exists(video_path):
        log.error(f"Arquivo de vídeo não encontrado para captura de thumbnail: {video_path}")
        return None

    # Garante que o diretório de destino para o thumbnail exista.
    os.makedirs(os.path.dirname(thumbnail_path), exist_ok=True)

    # Constrói o comando FFmpeg para extrair um frame.
    command = [
        'ffmpeg',
        '-i', video_path,           # Arquivo de vídeo de entrada.
        '-ss', timestamp,           # Flag para "buscar" (-ss) um ponto específico no tempo.
        '-vframes', '1',            # Extrai exatamente 1 frame de vídeo.
        '-q:v', '2',                # Define a qualidade do JPEG de saída (escala de 1-31, onde 2-5 é alta qualidade).
        '-y',                       # Sobrescreve o arquivo de saída se ele já existir.
        thumbnail_path              # O caminho do arquivo de imagem de saída.
    ]

    log.info(f"🖼️  Capturando thumbnail de '{video_path}' para '{thumbnail_path}'.")

    try:
        # Executa o comando. Usamos `subprocess.run` aqui porque não precisamos monitorar a saída em tempo real.
        # `check=True` fará com que uma exceção `CalledProcessError` seja levantada se o FFmpeg falhar.
        # `capture_output=True` esconde a saída do FFmpeg do console, mantendo o log limpo.
        subprocess.run(
            command,
            check=True,
            capture_output=True
        )
        log.info(f"✅ Thumbnail capturado com sucesso: {thumbnail_path}")
        # Retorna o caminho do thumbnail se o comando foi bem-sucedido.
        return thumbnail_path
        
    except FileNotFoundError:
        # Este erro ocorre se o executável 'ffmpeg' não for encontrado.
        log.critical("Comando 'ffmpeg' não encontrado. Não foi possível capturar o thumbnail.")
        return None
    except subprocess.CalledProcessError as e:
        # Este erro ocorre se o FFmpeg retornar um código de erro (ex: vídeo corrompido, timestamp inválido).
        log.error(f"FFmpeg finalizou com erro ao tentar capturar o thumbnail.")
        # Loga a saída de erro do FFmpeg para ajudar na depuração.
        log.error(f"   [FFmpeg Output]: {e.stderr.decode('utf-8').strip()}")
        return None
    except Exception as e:
        # Captura quaisquer outros erros inesperados.
        log.error(f"Ocorreu uma exceção inesperada durante a captura do thumbnail: {e}")
        return None

# ---------------------------------------------------------------------------------------------
# 4. RODAPÉ / FIM DO CÓDIGO
# ---------------------------------------------------------------------------------------------

# @log de mudanças:
# 2025-07-12 (v1.1.0):
# - FEATURE: Adicionada a função `capture_thumbnail` para extrair uma imagem de um vídeo.
# - MELHORIA: A documentação e os comentários foram atualizados para refletir a nova funcionalidade.
#
# 2025-07-12 (v1.0.0):
# - Criação inicial do módulo `ffmpeg_recorder.py`.
# - Implementação da função `record_stream` como um wrapper para o FFmpeg.
# - Adicionado o uso de `subprocess.Popen` para execução e monitoramento em tempo real.
# - Implementada a lógica de parsing da saída do FFmpeg para exibir o progresso da gravação.
# - Adicionado tratamento de erros para FFmpeg não encontrado e falhas durante a execução.
# - Integração com o módulo de logging customizado.

# @roadmap futuro:
# - Adicionar uma função para verificar a validade de uma stream URL antes de iniciar a gravação.
# - Permitir a passagem de parâmetros customizados do FFmpeg através das funções.
# - Implementar uma classe `Recorder` se a complexidade aumentar, para gerenciar o estado da gravação.
# - Permitir a personalização do timestamp e da resolução do thumbnail.
