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
    if not os.path.exists(input_video) or not os.path.exists(watermark_image):
        logger.error("Arquivo de vídeo ou marca d'água não encontrado.")
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
    else:
        watermark_to_use = watermark_image

    # Comando FFmpeg
    # - Redimensiona a marca d'água para a largura máxima e mantém proporção
    # - Posiciona no canto superior direito com margin
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

    try:
        subprocess.run(command, check=True, capture_output=True)
        logger.info(f"Marca d'água inserida com sucesso em {output_video}")
        # Remove PNG temporário se criado
        if ext == ".svg" and os.path.exists(watermark_to_use):
            os.remove(watermark_to_use)
        return True
    except Exception as e:
        logger.error(f"Falha ao adicionar marca d'água: {e}")
        return False