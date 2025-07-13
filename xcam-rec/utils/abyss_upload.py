# -*- coding: utf-8 -*-

# ---------------------------------------------------------------------------------------------
# 1. CABEÇALHO / INÍCIO
# ---------------------------------------------------------------------------------------------

# @titulo:         abyss_upload.py
# @author:         Samuel Passamani / Um Projeto do Estudio A.Sério [AllS Company]
# @info:           https://aserio.work/
# @version:        1.4.0
# @lastupdate:     2025-07-13
# @description:    Este módulo é responsável por fazer o upload de VÍDEOS para o serviço
#                  de alojamento Hydrax/Abyss.to. Ele encapsula a chamada ao comando `curl`
#                  usando a URL de upload correta e autenticada, com tratamento de erros
#                  detalhado e logging integrado.
# @modes:          - Wrapper de subprocesso para `curl`.

# ---------------------------------------------------------------------------------------------
# 2. CONFIGURAÇÕES & VARIÁVEIS GLOBAIS
# ---------------------------------------------------------------------------------------------

# Importações de bibliotecas necessárias.
import os           # Usado para verificar se o ficheiro a ser enviado existe.
import subprocess   # Biblioteca para executar comandos externos como o `curl`.
import json         # Para processar a resposta JSON da API de upload.
from typing import Optional, Dict, Any # Para anotações de tipo.

# Importa a instância do nosso logger customizado.
from utils.logger import log
# Importa a URL de upload do nosso ficheiro de configuração central.
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
        Optional[Dict[str, Any]]: Um dicionário com a resposta completa da API
                                  (ex: {'status': True, 'id': '...', 'url': '...'}),
                                  ou None em caso de falha.
    """
    # 1. Verificação Prévia: Garante que o ficheiro a ser enviado realmente existe.
    if not os.path.exists(file_path):
        log.error(f"Ficheiro de vídeo para upload não encontrado: {file_path}")
        return None

    # 2. Construção do Comando:
    # O comando `curl` é montado com o caminho do ficheiro e a URL de upload estática.
    command = [
        'curl',
        '-F', f'file=@{file_path}',
        ABYSS_UPLOAD_URL
    ]

    log.info(f"☁️  Iniciando upload do vídeo '{os.path.basename(file_path)}'...")

    try:
        # 3. Execução do Subprocesso:
        process = subprocess.run(
            command,
            check=True,
            capture_output=True,
            text=True,
            encoding='utf-8'
        )

        # 4. Processamento do Resultado:
        response_json = process.stdout.strip()
        
        # Tenta fazer o parse da resposta JSON.
        try:
            response_data = json.loads(response_json)
            # Verifica se o upload foi bem-sucedido e se a URL está presente.
            if response_data.get("status") is True and "url" in response_data:
                log.info(f"✅ Upload de vídeo concluído com sucesso. URL: {response_data['url']}")
                # Retorna o dicionário completo da resposta.
                return response_data
            else:
                log.error(f"O serviço de upload retornou um erro: {response_json}")
                return None
        except json.JSONDecodeError:
            log.error(f"Resposta inesperada (não-JSON) do serviço de upload: {response_json}")
            return None

    # 5. Tratamento de Erros:
    except FileNotFoundError:
        log.critical("Comando 'curl' não encontrado. O `curl` é necessário para o upload.")
        return None
    except subprocess.CalledProcessError as e:
        log.error("O comando `curl` falhou durante o upload do vídeo.")
        log.error(f"   [Curl Stderr]: {e.stderr.strip()}")
        return None
    except Exception as e:
        log.error(f"Ocorreu uma exceção inesperada durante o upload do vídeo: {e}")
        return None

# ---------------------------------------------------------------------------------------------
# 4. RODAPÉ / FIM DO CÓDIGO
# ---------------------------------------------------------------------------------------------

# @log de mudanças:
# 2025-07-13 (v1.4.0):
# - REFINAMENTO: A função `upload_file` foi renomeada para `upload_video` para refletir a sua nova responsabilidade.
# - MELHORIA: A função agora retorna o dicionário JSON completo da resposta da API, permitindo ao chamador
#   aceder ao 'slug' ('id') e à 'url' do vídeo.
#
# 2025-07-13 (v1.3.0):
# - CORREÇÃO CRÍTICA FINAL: A constante `ABYSS_UPLOAD_URL` foi corrigida.
# - MELHORIA: Adicionado o parsing da resposta JSON do serviço de upload.
