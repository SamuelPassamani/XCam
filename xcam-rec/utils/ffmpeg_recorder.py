# -*- coding: utf-8 -*-

# ---------------------------------------------------------------------------------------------
# 1. CABEÇALHO / INÍCIO
# ---------------------------------------------------------------------------------------------

# @titulo:         ffmpeg_recorder.py
# @author:         Samuel Passamani / Um Projeto do Estudio A.Sério [AllS Company]
# @info:           https://aserio.work/
# @version:        2.1.0
# @lastupdate:     2025-07-14
# @description:    Módulo unificado para interagir com o FFmpeg. Orquestra a gravação de
#                  streams HLS, monitoriza o progresso em tempo real com uma barra de status
#                  detalhada e, ao final, captura uma miniatura (thumbnail) do vídeo gravado.
#                  Este módulo combina as funcionalidades de gravação e captura de imagem.
# @modes:          - Gravação de Stream HLS com Monitorização de Progresso.
#                  - Captura de Miniatura de Vídeo.

# ---------------------------------------------------------------------------------------------
# 2. CONFIGURAÇÕES & VARIÁVEIS GLOBAIS
# ---------------------------------------------------------------------------------------------

import os               # Usado para interações com o sistema operacional, como criar diretórios.
import re               # Módulo de expressões regulares, para analisar a saída do FFmpeg.
import subprocess       # Biblioteca principal para executar e gerenciar processos externos.
import logging          # Para registar eventos importantes de forma padronizada.
import math             # Para cálculos matemáticos (arredondamento) no progresso.
from typing import Optional # Para anotações de tipo, melhorando a clareza do código.

# Inicializa um logger específico para este módulo, permitindo um controlo granular dos logs.
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------------------------
# 3. CORPO
# ---------------------------------------------------------------------------------------------

def _format_seconds(seconds: float) -> str:
    """
    Formata um total de segundos para o formato de tempo legível HH:MM:SS.
    Função auxiliar interna para a barra de progresso.

    Args:
        seconds (float): O número total de segundos a ser formatado.

    Returns:
        str: A string de tempo formatada (ex: "01:23:45").
    """
    # Converte os segundos para inteiros para os cálculos.
    seconds = int(seconds)
    # Calcula as horas.
    h = seconds // 3600
    # Calcula os minutos restantes.
    m = (seconds % 3600) // 60
    # Calcula os segundos restantes.
    s = seconds % 60
    # Retorna a string formatada com zeros à esquerda para garantir dois dígitos.
    return f"{h:02d}:{m:02d}:{s:02d}"

def _log_progress(username: str, elapsed_seconds: float, total_seconds: int):
    """
    Exibe o progresso da gravação de cada transmissão em tempo real no console.
    Função auxiliar interna para a gravação.

    Args:
        username (str): O nome do utilizador para identificação no log.
        elapsed_seconds (float): O tempo de gravação já decorrido.
        total_seconds (int): A duração total esperada da gravação.
    """
    # Calcula a percentagem concluída, garantindo que não ultrapasse 100%.
    percent = min((elapsed_seconds / total_seconds) * 100, 100)
    # Formata o tempo decorrido para um formato legível.
    tempo_decorrido = _format_seconds(elapsed_seconds)
    # Calcula os minutos totais gravados.
    minutos_gravados = math.floor(elapsed_seconds / 60)
    # Calcula os minutos restantes, garantindo que não seja negativo.
    minutos_restantes = max(0, math.ceil((total_seconds - elapsed_seconds) / 60))
    
    # Imprime a linha de progresso formatada.
    # O `end='\r'` faz com que o cursor volte ao início da linha, permitindo que a
    # próxima impressão sobrescreva a atual, criando o efeito de atualização em tempo real.
    print(f"⏱️  [{username}] Gravados: {minutos_gravados} min | Restantes: {minutos_restantes} min | Tempo total: {tempo_decorrido} — 📊 {percent:.1f}% concluído", end='\r')

def capture_thumbnail(video_path: str, thumbnail_path: str, timestamp: str = "00:00:07") -> bool:
    """
    Captura um único frame (thumbnail) de um arquivo de vídeo num ponto específico.

    Args:
        video_path (str): O caminho para o arquivo de vídeo de entrada.
        thumbnail_path (str): O caminho onde a imagem do thumbnail será salva.
        timestamp (str, optional): O ponto no vídeo para capturar o frame (HH:MM:SS). Padrão é "00:00:07".

    Returns:
        bool: True se o thumbnail foi criado com sucesso, False caso contrário.
    """
    # Verifica se o vídeo de origem existe antes de tentar criar o thumbnail.
    if not os.path.exists(video_path):
        logger.error(f"🖼️❌ Erro: Vídeo não encontrado em '{video_path}' para captura de thumbnail.")
        return False

    # Garante que o diretório de destino para o thumbnail exista.
    os.makedirs(os.path.dirname(thumbnail_path), exist_ok=True)

    # Constrói o comando FFmpeg para extrair um único frame de alta qualidade.
    command = [
        'ffmpeg',
        '-i', video_path,           # Arquivo de vídeo de entrada.
        '-ss', timestamp,           # Flag para "buscar" (-ss) um ponto específico no tempo.
        '-vframes', '1',            # Extrai exatamente 1 frame de vídeo.
        '-q:v', '2',                # Define a qualidade do JPEG de saída (escala de 1-31, onde 2-5 é alta qualidade).
        '-y',                       # Sobrescreve o arquivo de saída se ele já existir.
        thumbnail_path              # O caminho do arquivo de imagem de saída.
    ]

    logger.info(f"🖼️  Capturando thumbnail de '{os.path.basename(video_path)}' para '{os.path.basename(thumbnail_path)}'.")

    try:
        # Executa o comando. `check=True` lança uma exceção se o FFmpeg falhar.
        # `capture_output=True` esconde a saída do FFmpeg do console, mantendo o log limpo.
        subprocess.run(command, check=True, capture_output=True, text=True, encoding='utf-8')
        logger.info(f"🖼️✅ Thumbnail capturado com sucesso: {thumbnail_path}")
        return True
        
    except FileNotFoundError:
        logger.critical("❌ Erro Crítico: 'ffmpeg' não encontrado. Não foi possível capturar o thumbnail.")
        return False
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ FFmpeg falhou ao capturar thumbnail. Erro: {e.stderr.strip()}")
        return False
    except Exception as e:
        logger.error(f"❌ Ocorreu uma exceção inesperada durante a captura do thumbnail: {e}")
        return False

def record_stream_and_capture_thumbnail(username: str, stream_url: str, output_path: str, thumbnail_path: str, max_duration: int) -> bool:
    """
    Orquestra o processo completo: grava um stream e, se bem-sucedido, captura um thumbnail.
    """
    logger.info(f"🎥 Preparando para gravar '{username}' com duração máxima de {max_duration}s.")
    
    # Constrói o comando FFmpeg para a gravação do stream.
    command = [
        'ffmpeg',
        '-i', stream_url,
        '-t', str(max_duration),
        '-c', 'copy',
        '-bsf:a', 'aac_adtstoasc',
        '-y',
        output_path
    ]

    try:
        # Inicia o processo FFmpeg, redirecionando stderr para um pipe para ler o progresso.
        process = subprocess.Popen(command, stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True, encoding='utf-8')

        # Expressão regular para encontrar a informação de tempo na saída do FFmpeg (ex: time=00:01:23.45).
        time_pattern = re.compile(r"time=(\d{2}):(\d{2}):(\d{2})\.(\d{2})")

        # Loop para ler a saída do FFmpeg em tempo real.
        while True:
            line = process.stderr.readline()
            if not line and process.poll() is not None:
                break  # O processo terminou e não há mais saída para ler.

            match = time_pattern.search(line)
            if match:
                h, m, s, ms = map(int, match.groups())
                elapsed_seconds = h * 3600 + m * 60 + s + ms / 100
                _log_progress(username, elapsed_seconds, max_duration)

        # Espera o processo terminar e obtém o código de retorno.
        return_code = process.wait()
        print() # Adiciona uma nova linha para não sobrescrever a última linha de progresso.

        if return_code == 0:
            logger.info(f"✅ Gravação para '{username}' concluída com sucesso (código {return_code}).")
            # Após a gravação bem-sucedida, tenta capturar o thumbnail.
            capture_thumbnail(output_path, thumbnail_path)
            return True
        else:
            logger.error(f"❌ Gravação para '{username}' terminou com erro (código {return_code}).")
            return False

    except FileNotFoundError:
        logger.critical("❌ Erro Crítico: O comando 'ffmpeg' não foi encontrado. Verifique se está instalado e no PATH.")
        return False
    except Exception as e:
        logger.error(f"❌ Ocorreu uma exceção inesperada durante a gravação de '{username}': {e}")
        return False

# ---------------------------------------------------------------------------------------------
# 4. RODAPÉ / FIM DO CÓDIGO
# ---------------------------------------------------------------------------------------------

# @log de mudanças:
# 2025-07-14 (v2.1.0):
# - REFACTOR: Unificação dos dois arquivos. A função `record_stream` foi renomeada para
#   `record_stream_and_capture_thumbnail` para refletir a sua responsabilidade completa.
# - FEATURE: Reintroduzida a função `capture_thumbnail` da v1.1.0, agora com logging melhorado.
# - FEATURE: A função principal agora orquestra a captura do thumbnail após uma gravação bem-sucedida.
# - REFACTOR: Padronizado o uso do logger nativo do Python (`logging.getLogger`).
# - DOCS: Atualização completa dos comentários e da documentação para refletir a nova estrutura unificada.
#
# 2025-07-14 (v2.0.0):
# - FEATURE: Implementado o log de progresso em tempo real.
#
# 2025-07-12 (v1.1.0):
# - FEATURE: Adicionada a função `capture_thumbnail` inicial.

# @roadmap futuro:
# - Criar uma classe `Recorder` para gerir o estado do processo FFmpeg de forma mais robusta,
#   permitindo pausar ou parar a gravação de forma mais limpa.
# - Permitir a passagem de parâmetros customizados do FFmpeg (ex: `-vf` para filtros)
#   através da função de gravação.
