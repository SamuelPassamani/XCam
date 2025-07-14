# -*- coding: utf-8 -*-

# ---------------------------------------------------------------------------------------------
# 1. CABEÇALHO / INÍCIO
# ---------------------------------------------------------------------------------------------

# @titulo:         abyss_upload.py
# @author:         Samuel Passamani / Um Projeto do Estudio A.Sério [AllS Company]
# @info:           https://aserio.work/
# @version:        1.6.0
# @lastupdate:     2025-07-14
# @description:    Este módulo é responsável por fazer o upload de VÍDEOS para o serviço
#                  de alojamento Hydrax/Abyss.to. Ele encapsula a chamada ao comando `curl`
#                  usando a URL de upload correta e autenticada, com tratamento de erros
#                  detalhado e logging modular.
# @modes:          - Wrapper de subprocesso para `curl`.

# ---------------------------------------------------------------------------------------------
# 2. CONFIGURAÇÕES & VARIÁVEIS GLOBAIS
# ---------------------------------------------------------------------------------------------

# --- Importações de Bibliotecas Padrão ---
import os                           # Usado para interações com o sistema de arquivos, como verificar se um ficheiro existe.
import subprocess                   # Biblioteca principal para executar e gerenciar processos externos como o `curl`.
import json                         # Para analisar a resposta JSON do serviço de upload.
import logging                      # Biblioteca padrão para logging, usada para obter uma instância do logger.
from typing import Optional, Dict, Any # Tipos para anotações, melhorando a clareza do código.

# --- Importações de Módulos do Projeto ---
from config import ABYSS_UPLOAD_URL # Importa a URL de upload do nosso arquivo de configuração central.

# --- Variáveis Globais ---
# Inicializa um logger específico para este módulo. O nome do logger será 'utils.abyss_upload'.
logger = logging.getLogger(__name__)

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
    # Validação inicial para garantir que o ficheiro a ser enviado realmente existe.
    if not os.path.exists(file_path):
        logger.error(f"❌ Ficheiro de vídeo para upload não encontrado: {file_path}")
        return None

    # Constrói o comando `curl` para o upload.
    # -F 'file=@<caminho_do_ficheiro>' é a forma padrão do curl para enviar um formulário multipart/form-data.
    command = ['curl', '-F', f'file=@{file_path}', ABYSS_UPLOAD_URL]

    logger.info(f"☁️  Iniciando upload do vídeo '{os.path.basename(file_path)}'...")

    try:
        # Executa o comando e captura a saída. `check=True` lançará uma exceção se curl retornar um erro.
        process = subprocess.run(
            command, check=True, capture_output=True, text=True, encoding='utf-8'
        )
        # A resposta da API vem no stdout do processo.
        response_json = process.stdout.strip()
        
        try:
            # Tenta analisar a resposta como JSON.
            response_data = json.loads(response_json)
            
            # Verifica se a resposta da API indica sucesso e contém os dados esperados ('slug').
            if response_data.get("status") is True and "slug" in response_data:
                
                # Normaliza a resposta para o formato que o resto da nossa aplicação espera.
                base_url = response_data.get("urlIframe", "").split('?')[0]
                
                normalized_response = {
                    "id": response_data.get("slug"),
                    "url": base_url
                }
                
                logger.info(f"✅ Upload de vídeo concluído com sucesso. URL: {normalized_response['url']}")
                return normalized_response
            else:
                # Se o status não for 'true' ou faltarem chaves, a API retornou um erro lógico.
                logger.error(f"❌ O serviço de upload retornou um erro ou uma resposta inesperada: {response_json}")
                return None
        except json.JSONDecodeError:
            # Se a resposta não for um JSON válido, algo está errado com o serviço de upload.
            logger.error(f"❌ Resposta inesperada (não-JSON) do serviço de upload: {response_json}")
            return None

    except FileNotFoundError:
        # Este erro ocorre se o comando `curl` não estiver instalado no sistema.
        logger.critical("❌ Erro Crítico: Comando 'curl' não encontrado. Verifique se está instalado e no PATH.")
        return None
    except subprocess.CalledProcessError as e:
        # Este erro ocorre se o `curl` retornar um código de saída diferente de zero (ex: falha de rede).
        logger.error(f"❌ O comando `curl` falhou durante o upload do vídeo. Erro: {e.stderr.strip()}")
        return None
    except Exception as e:
        # Captura qualquer outra exceção inesperada para evitar que o programa quebre.
        logger.error(f"❌ Ocorreu uma exceção inesperada durante o upload do vídeo: {e}", exc_info=True)
        return None

# ---------------------------------------------------------------------------------------------
# 4. RODAPÉ / FIM DO CÓDIGO
# ---------------------------------------------------------------------------------------------

# @log de mudanças:
# 2025-07-14 (v1.6.0):
# - CORREÇÃO: Removida a importação `from utils.logger import log`.
# - REFACTOR: Adotado o padrão `import logging; logger = logging.getLogger(__name__)` para
#   obter uma instância de logger modular, resolvendo o `ImportError`.
# - DOCS: Atualização completa dos comentários e da estrutura do arquivo para o padrão XCam.
#
# 2025-07-14 (v1.5.0):
# - CORREÇÃO CRÍTICA: Ajustada a lógica de parsing da resposta da API de upload.
# - MELHORIA: A função agora normaliza a resposta da API para um formato consistente.

# @roadmap futuro:
# - Implementar uma lógica de "retry" com backoff exponencial para o upload, tornando-o mais
#   resiliente a falhas de rede intermitentes.
# - Adicionar uma barra de progresso para o upload de ficheiros grandes, se o `curl` permitir
#   essa funcionalidade de forma fácil de capturar.
# - Considerar a substituição do `curl` pela biblioteca `requests` para fazer o upload,
#   eliminando a dependência de um comando externo.
