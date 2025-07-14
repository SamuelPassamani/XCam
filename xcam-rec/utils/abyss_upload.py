# -*- coding: utf-8 -*-

# ---------------------------------------------------------------------------------------------
# 1. CABEÇALHO / INÍCIO
# ---------------------------------------------------------------------------------------------

# @titulo:         abyss_upload.py
# @author:         Samuel Passamani / Um Projeto do Estudio A.Sério [AllS Company]
# @info:           https://aserio.work/
# @version:        1.5.0
# @lastupdate:     2025-07-14
# @description:    Este módulo é responsável por fazer o upload de VÍDEOS para o serviço
#                  de alojamento Hydrax/Abyss.to. Ele encapsula a chamada ao comando `curl`
#                  usando a URL de upload correta e autenticada, com tratamento de erros
#                  detalhado e logging integrado.
# @modes:          - Wrapper de subprocesso para `curl`.

# ---------------------------------------------------------------------------------------------
# 2. CONFIGURAÇÕES & VARIÁVEIS GLOBAIS
# ---------------------------------------------------------------------------------------------

import os
import subprocess
import json
from typing import Optional, Dict, Any

from utils.logger import log
from config import ABYSS_UPLOAD_URL

# ---------------------------------------------------------------------------------------------
# 3. CORPO
# ---------------------------------------------------------------------------------------------

def upload_video(file_path: str) -> Optional[Dict[str, Any]]:
    """
    Realiza o upload de um ficheiro de VÍDEO para o serviço de alojamento usando curl.

    Args:
        file_path (str): O caminho completo para o ficheiro de vídeo que será enviado.

    Returns:
        Optional[Dict[str, Any]]: Um dicionário normalizado com as chaves 'id' e 'url'
                                  (ex: {'id': '...', 'url': '...'}), ou None em caso de falha.
    """
    if not os.path.exists(file_path):
        log.error(f"Ficheiro de vídeo para upload não encontrado: {file_path}")
        return None

    command = ['curl', '-F', f'file=@{file_path}', ABYSS_UPLOAD_URL]

    log.info(f"☁️  Iniciando upload do vídeo '{os.path.basename(file_path)}'...")

    try:
        process = subprocess.run(
            command, check=True, capture_output=True, text=True, encoding='utf-8'
        )
        response_json = process.stdout.strip()
        
        try:
            response_data = json.loads(response_json)
            
            # CORREÇÃO: Verifica a estrutura de resposta correta da API.
            # A API retorna 'slug' e 'urlIframe' em caso de sucesso.
            if response_data.get("status") is True and "slug" in response_data:
                
                # Normaliza a resposta para o formato que o main.py espera.
                # A URL base é extraída da 'urlIframe' removendo os parâmetros de query.
                base_url = response_data.get("urlIframe", "").split('?')[0]
                
                normalized_response = {
                    "id": response_data.get("slug"),
                    "url": base_url
                }
                
                log.info(f"✅ Upload de vídeo concluído com sucesso. URL: {normalized_response['url']}")
                return normalized_response
            else:
                log.error(f"O serviço de upload retornou um erro ou uma resposta inesperada: {response_json}")
                return None
        except json.JSONDecodeError:
            log.error(f"Resposta inesperada (não-JSON) do serviço de upload: {response_json}")
            return None

    except FileNotFoundError:
        log.critical("Comando 'curl' não encontrado.")
        return None
    except subprocess.CalledProcessError as e:
        log.error(f"O comando `curl` falhou durante o upload do vídeo. Erro: {e.stderr.strip()}")
        return None
    except Exception as e:
        log.error(f"Ocorreu uma exceção inesperada durante o upload do vídeo: {e}")
        return None

# ---------------------------------------------------------------------------------------------
# 4. RODAPÉ / FIM DO CÓDIGO
# ---------------------------------------------------------------------------------------------

# @log de mudanças:
# 2025-07-14 (v1.5.0):
# - CORREÇÃO CRÍTICA: Ajustada a lógica de parsing da resposta da API de upload para
#   reconhecer as chaves 'slug' e 'urlIframe', resolvendo o erro 'NoneType' object has no attribute 'get'.
# - MELHORIA: A função agora normaliza a resposta da API para um formato consistente ('id', 'url')
#   antes de a retornar, tornando o módulo mais robusto a futuras alterações da API.
#
# 2025-07-13 (v1.4.0):
# - REFINAMENTO: A função foi renomeada para `upload_video`.
# - MELHORIA: A função agora retorna o dicionário JSON completo.
