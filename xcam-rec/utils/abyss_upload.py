# -*- coding: utf-8 -*-

# ---------------------------------------------------------------------------------------------
# 1. CABEÇALHO / INÍCIO
# ---------------------------------------------------------------------------------------------

# @titulo:         abyss_upload.py
# @author:         Samuel Passamani / Um Projeto do Estudio A.Sério [AllS Company]
# @info:           https://aserio.work/
# @version:        1.7.0
# @lastupdate:     2025-07-14
# @description:    Este módulo é responsável por fazer o upload de VÍDEOS para o serviço
#                  de alojamento Hydrax/Abyss.to. A lógica de upload foi refatorada para
#                  utilizar a biblioteca `requests` do Python, eliminando a dependência
#                  externa do comando `curl` e tornando o módulo mais robusto e integrado.
# @modes:          - Upload de Ficheiros via HTTP POST.

# ---------------------------------------------------------------------------------------------
# 2. CONFIGURAÇÕES & VARIÁVEIS GLOBAIS
# ---------------------------------------------------------------------------------------------

# --- Importações de Bibliotecas Padrão ---
import os                           # Usado para interações com o sistema de arquivos, como verificar se um ficheiro existe.
import requests                     # Biblioteca principal para realizar requisições HTTP em Python.
import json                         # Para analisar a resposta JSON do serviço de upload.
import logging                      # Biblioteca padrão para logging.
from typing import Optional, Dict, Any # Tipos para anotações, melhorando a clareza do código.

# --- Importações de Módulos do Projeto ---
from config import ABYSS_UPLOAD_URL # Importa a URL de upload do nosso arquivo de configuração central.

# --- Variáveis Globais ---
# Inicializa um logger específico para este módulo.
logger = logging.getLogger(__name__)

# Define um timeout mais longo para uploads, pois ficheiros grandes podem demorar. (Valor em segundos)
UPLOAD_TIMEOUT = 300

# ---------------------------------------------------------------------------------------------
# 3. CORPO
# ---------------------------------------------------------------------------------------------

def upload_video(file_path: str) -> Optional[Dict[str, Any]]:
    """
    Realiza o upload de um ficheiro de VÍDEO para o serviço de alojamento usando a biblioteca `requests`.

    Args:
        file_path (str): O caminho completo para o ficheiro de vídeo que será enviado.

    Returns:
        Optional[Dict[str, Any]]: Um dicionário normalizado com 'id' e 'url', ou None em caso de falha.
    """
    # Validação inicial para garantir que o ficheiro a ser enviado realmente existe.
    if not os.path.exists(file_path):
        logger.error(f"❌ Ficheiro de vídeo para upload não encontrado: {file_path}")
        return None

    # Obtém o nome do ficheiro a partir do caminho completo.
    file_name = os.path.basename(file_path)
    logger.info(f"☁️  Preparando para fazer o upload de '{file_name}'...")

    try:
        # Utiliza um bloco `with` para garantir que o ficheiro seja fechado automaticamente.
        # O ficheiro é aberto em modo de leitura binária ('rb'), que é essencial para uploads.
        with open(file_path, 'rb') as f:
            # Constrói o payload para a requisição multipart/form-data.
            # O formato é um dicionário onde a chave 'file' corresponde ao nome do campo no formulário.
            # O valor é uma tupla contendo (nome_do_ficheiro, objeto_do_ficheiro, tipo_mime).
            files = {'file': (file_name, f, 'video/mp4')}
            
            # Realiza a requisição POST para a URL de upload com os ficheiros e um timeout adequado.
            response = requests.post(ABYSS_UPLOAD_URL, files=files, timeout=UPLOAD_TIMEOUT)
            
            # Levanta uma exceção para códigos de erro HTTP (4xx ou 5xx).
            response.raise_for_status()

        # Analisa a resposta JSON do servidor.
        response_data = response.json()
        
        # Verifica se a resposta da API indica sucesso e contém os dados esperados ('slug').
        if response_data.get("status") is True and "slug" in response_data:
            # Normaliza a resposta para o formato que o resto da nossa aplicação espera.
            base_url = response_data.get("urlIframe", "").split('?')[0]
            
            normalized_response = {
                "id": response_data.get("slug"),
                "url": base_url
            }
            
            logger.info(f"✅ Upload de '{file_name}' concluído com sucesso. ID do vídeo: {normalized_response['id']}")
            return normalized_response
        else:
            # Se o status não for 'true' ou faltarem chaves, a API retornou um erro lógico.
            logger.error(f"❌ O serviço de upload retornou um erro ou uma resposta inesperada: {response.text}")
            return None

    except requests.exceptions.RequestException as e:
        # Captura todos os erros relacionados com a biblioteca requests (ex: timeout, falha de conexão).
        logger.error(f"❌ Erro de rede ou HTTP durante o upload de '{file_name}': {e}")
        return None
    except json.JSONDecodeError:
        # Captura erros que ocorrem se a resposta do servidor não for um JSON válido.
        logger.error(f"❌ Resposta inesperada (não-JSON) do serviço de upload para '{file_name}': {response.text}")
        return None
    except Exception as e:
        # Captura qualquer outra exceção inesperada para evitar que o programa quebre.
        logger.error(f"❌ Ocorreu uma exceção inesperada durante o upload de '{file_name}': {e}", exc_info=True)
        return None

# ---------------------------------------------------------------------------------------------
# 4. RODAPÉ / FIM DO CÓDIGO
# ---------------------------------------------------------------------------------------------

# @log de mudanças:
# 2025-07-14 (v1.7.0):
# - REFACTOR CRÍTICO: O método de upload foi completamente reescrito para usar a biblioteca `requests`
#   em vez de um subprocesso `curl`, eliminando dependências externas e melhorando o tratamento de erros.
# - DOCS: Atualização completa dos comentários para refletir a nova implementação Python-native.
#
# 2025-07-14 (v1.6.0):
# - CORREÇÃO: Padronizado o uso do logger com `logging.getLogger(__name__)`.
#
# 2025-07-14 (v1.5.0):
# - CORREÇÃO CRÍTICA: Ajustada a lógica de parsing da resposta da API de upload.

# @roadmap futuro:
# - Implementar uma lógica de "retry" com backoff exponencial para o upload, tornando-o mais
#   resiliente a falhas de rede intermitentes.
# - Investigar o uso de bibliotecas como `tqdm` para exibir uma barra de progresso do upload
#   no console, monitorizando o stream de dados da requisição.
