# -*- coding: utf-8 -*-

import subprocess
import os
import logging

logger = logging.getLogger(__name__)

def get_video_width(video_path):
    import json
    import subprocess
    command = [
        "ffprobe", "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=width",
        "-of", "json",
        video_path
    ]
    try:
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        width = json.loads(result.stdout)["streams"][0]["width"]
        return int(width)
    except Exception as e:
        logger.error(f"❌ Não foi possível obter a largura do vídeo: {e}")
        return None

def add_watermark(input_video, output_video, watermark_image, max_width=180, margin=20, relative_scale=0.22):
    logger.info(
        f"🔧 Iniciando adição de marca d'água: input='{input_video}', output='{output_video}', watermark='{watermark_image}', max_width={max_width}, margin={margin}, relative_scale={relative_scale}"
    )

    if not os.path.exists(input_video):
        logger.error(f"Arquivo de vídeo não encontrado: {input_video}")
        return False

    if not os.path.exists(watermark_image):
        logger.error(f"Arquivo da marca d'água não encontrado: {watermark_image}")
        return False

    ext = os.path.splitext(watermark_image)[-1].lower()
    if ext == ".svg":
        try:
            import cairosvg
            png_temp = watermark_image + ".png"
            logger.info(f"Convertendo SVG '{watermark_image}' para PNG temporário '{png_temp}'.")
            cairosvg.svg2png(url=watermark_image, write_to=png_temp)
            watermark_to_use = png_temp
        except ImportError:
            logger.error("A biblioteca cairosvg é necessária para SVG. Instale com 'pip install cairosvg'.")
            return False
        except Exception as e:
            logger.error(f"Erro ao converter SVG para PNG: {e}")
            return False
    else:
        watermark_to_use = watermark_image

    # --- Obtém largura real do vídeo para cálculo proporcional ---
    video_width = get_video_width(input_video)
    if not video_width:
        logger.error("❌ Não foi possível determinar a largura do vídeo.")
        return False
    target_logo_width = int(min(video_width * relative_scale, max_width))

    # Filtro: redimensiona a logo para target_logo_width px de largura
    filter_complex = (
        f"[1:v]scale={target_logo_width}:-1[wm];[0:v][wm]overlay=W-w-{margin}:{margin}"
    )

    command = [
        "ffmpeg",
        "-i", input_video,
        "-i", watermark_to_use,
        "-filter_complex", filter_complex,
        "-codec:a", "copy",
        "-y",
        output_video
    ]

    logger.info(f"Executando comando FFmpeg para marca d'água: {' '.join(command)}")

    try:
        result = subprocess.run(command, check=True, capture_output=True, text=True)
        logger.info(f"Saída completa do FFmpeg:\n{result.stdout}\n{result.stderr}")
        if ext == ".svg" and os.path.exists(watermark_to_use):
            os.remove(watermark_to_use)
            logger.info(f"PNG temporário removido: {watermark_to_use}")
        if not os.path.exists(output_video):
            logger.error(f"Arquivo de saída NÃO foi criado: {output_video}")
            return False
        logger.info(f"Marca d'água inserida com sucesso em '{output_video}'.")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Falha ao adicionar marca d'água: {e}")
        logger.error(f"STDOUT:\n{e.stdout}\nSTDERR:\n{e.stderr}")
        if ext == ".svg" and os.path.exists(watermark_to_use):
            os.remove(watermark_to_use)
            logger.info(f"PNG temporário removido: {watermark_to_use}")
        return False
    except Exception as e:
        logger.error(f"Erro inesperado ao rodar FFmpeg: {e}")
        if ext == ".svg" and os.path.exists(watermark_to_use):
            os.remove(watermark_to_use)
            logger.info(f"PNG temporário removido: {watermark_to_use}")
        return False
