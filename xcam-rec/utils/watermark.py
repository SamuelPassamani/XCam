# -*- coding: utf-8 -*-

import subprocess
import os
import logging

logger = logging.getLogger(__name__)

def add_watermark(input_video, output_video, watermark_image, max_width=180, margin=20):
    """
    Adiciona uma marca d'água no canto superior direito do vídeo.
    Args:
        input_video (str): Caminho do vídeo de entrada.
        output_video (str): Caminho do vídeo de saída (com marca d'água).
        watermark_image (str): Caminho do arquivo de imagem/SVG da marca d'água.
        max_width (int): Largura máxima da marca d'água em pixels.
        margin (int): Margem em pixels do canto superior/direito.
    Returns:
        bool: True se sucesso, False caso contrário.
    """
    logger.info(
        f"🔧 Iniciando adição de marca d'água: input={input_video}, output={output_video}, watermark={watermark_image}, max_width={max_width}, margin={margin}"
    )

    if not os.path.exists(input_video):
        logger.error(f"Arquivo de vídeo não encontrado: {input_video}")
        return False

    if not os.path.exists(watermark_image):
        logger.error(f"Arquivo da marca d'água não encontrado: {watermark_image}")
        return False

    # Detecta extensão da marca d'água
    ext = os.path.splitext(watermark_image)[-1].lower()

    # Se SVG, converte para PNG temporário
    if ext == ".svg":
        try:
            import cairosvg
            png_temp = watermark_image + ".png"
            cairosvg.svg2png(url=watermark_image, write_to=png_temp, output_width=max_width)
            watermark_to_use = png_temp
        except ImportError:
            logger.error("A biblioteca cairosvg é necessária para SVG. Instale com 'pip install cairosvg'.")
            return False
        except Exception as e:
            logger.error(f"Erro ao converter SVG para PNG: {e}")
            return False
    else:
        watermark_to_use = watermark_image

    # Comando FFmpeg
    command = [
        "ffmpeg",
        "-i", input_video,
        "-i", watermark_to_use,
        "-filter_complex",
        f"[1:v]scale={max_width}:-1[wm];[0:v][wm]overlay=W-w-{margin}:{margin}",
        "-codec:a", "copy",
        "-y",
        output_video
    ]

    logger.info(f"Executando comando FFmpeg: {' '.join(command)}")

    try:
        result = subprocess.run(command, check=True, capture_output=True, text=True)
        logger.info(f"Marca d'água inserida com sucesso em {output_video}")
        # Remove PNG temporário se criado
        if ext == ".svg" and os.path.exists(watermark_to_use):
            os.remove(watermark_to_use)
        # Confirma se arquivo foi criado
        if not os.path.exists(output_video):
            logger.error(f"Arquivo de saída não foi criado: {output_video}")
            return False
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Falha ao adicionar marca d'água: {e}\nSTDERR: {e.stderr}")
        if ext == ".svg" and os.path.exists(watermark_to_use):
            os.remove(watermark_to_use)
        return False
    except Exception as e:
        logger.error(f"Erro inesperado ao rodar FFmpeg: {e}")
        if ext == ".svg" and os.path.exists(watermark_to_use):
            os.remove(watermark_to_use)
        return False
