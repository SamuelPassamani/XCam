# -*- coding: utf-8 -*-

# ---------------------------------------------------------------------------------------------
# 1. CABEÇALHO / INÍCIO
# ---------------------------------------------------------------------------------------------

# @titulo:         logger.py
# @author:         Samuel Passamani / Um Projeto do Estudio A.Sério [AllS Company]
# @info:           https://aserio.work/
# @version:        1.0.0
# @lastupdate:     2025-07-12
# @description:    Este módulo centraliza a configuração do sistema de logging para o projeto XCam Rec.
#                  Ele cria um logger robusto, colorido e com emojis que fornece feedback visual
#                  tanto no console quanto em um arquivo de log persistente, garantindo um
#                  rastreamento de eventos claro, consistente e profissional em toda a aplicação.
# @modes:          - Console (stdout): Saída colorida e com emojis para acompanhamento em tempo real.
#                  - Arquivo (xcam_rec.log): Saída de texto puro para auditoria e análise posterior.

# ---------------------------------------------------------------------------------------------
# 2. CONFIGURAÇÕES & VARIÁVEIS GLOBAIS
# ---------------------------------------------------------------------------------------------

# Importações necessárias para o funcionamento do módulo.
import logging  # Biblioteca padrão do Python para logging.
import sys      # Usado para direcionar a saída do log para o console (stdout).

# Dicionário com códigos de escape ANSI para colorir o texto no terminal.
# Isso melhora a legibilidade, destacando visualmente os diferentes níveis de log.
COLORS = {
    "DEBUG": "\x1b[38;5;240m",  # Cinza escuro para mensagens de depuração.
    "INFO": "\x1b[38;5;250m",   # Cinza claro para informações gerais de progresso.
    "WARNING": "\x1b[33;1m",    # Amarelo brilhante para avisos.
    "ERROR": "\x1b[31;1m",      # Vermelho brilhante para erros que não interrompem a execução.
    "CRITICAL": "\x1b[31;1;4m", # Vermelho brilhante e sublinhado para erros críticos.
    "RESET": "\x1b[0m"          # Código para resetar a formatação de cor para o padrão.
}

# Dicionário que mapeia os níveis de log a emojis correspondentes.
# Adiciona um elemento visual rápido para identificar o tipo de mensagem.
EMOJIS = {
    "DEBUG": "🐛",    # Emoji de bug para depuração.
    "INFO": "ℹ️",     # Emoji de informação.
    "WARNING": "⚠️",  # Emoji de aviso.
    "ERROR": "❌",    # Emoji de 'X' para erros.
    "CRITICAL": "🔥"  # Emoji de fogo para falhas críticas.
}

# ---------------------------------------------------------------------------------------------
# 3. CORPO
# ---------------------------------------------------------------------------------------------

class ColorEmojiFormatter(logging.Formatter):
    """
    Uma classe de formatação personalizada para o logger.
    Esta classe herda de logging.Formatter para sobrescrever o método de formatação,
    permitindo a inserção de cores e emojis nas mensagens de log exibidas no console.
    """

    def __init__(self, fmt):
        """
        Construtor da classe.
        
        Args:
            fmt (str): O formato base da mensagem de log (ex: "[%(asctime)s] %(message)s").
        """
        # Chama o construtor da classe pai.
        super().__init__(fmt)
        # Armazena o formato base da mensagem.
        self.fmt = fmt

    def format(self, record):
        """
        Formata o registro de log, adicionando cor e emoji de acordo com o nível.

        Args:
            record (logging.LogRecord): O objeto de registro contendo todos os dados do log.

        Returns:
            str: A string final formatada, pronta para ser exibida.
        """
        # Obtém o código de cor correspondente ao nível do log (ex: INFO -> "\x1b[38;5;250m").
        color = COLORS.get(record.levelname, COLORS["RESET"])
        # Obtém o emoji correspondente ao nível do log (ex: INFO -> "ℹ️").
        emoji = EMOJIS.get(record.levelname, "")

        # Cria um novo formato de log que inclui a cor e o emoji.
        # Exemplo: "\x1b[38;5;250m[%(asctime)s] ℹ️  %(message)s\x1b[0m"
        log_fmt = f"{color}[%(asctime)s] {emoji}  %(message)s{COLORS['RESET']}"
        
        # Cria uma instância do Formatter padrão com o nosso novo formato dinâmico.
        formatter = logging.Formatter(log_fmt, datefmt='%Y-%m-%d %H:%M:%S')
        
        # Usa o formatter recém-criado para formatar o registro atual.
        return formatter.format(record)

def setup_logger():
    """
    Configura e inicializa a instância principal do logger para todo o projeto.
    Esta função é o coração do módulo, criando um logger com dupla saída:
    uma para o console (colorida) e outra para um arquivo (texto puro).

    Returns:
        logging.Logger: A instância do logger configurada e pronta para uso.
    """
    # Obtém (ou cria) uma instância do logger com o nome "XCamRec".
    # Usar um nome específico evita conflitos com loggers de outras bibliotecas.
    logger = logging.getLogger("XCamRec")
    
    # Define o nível mínimo de severidade que o logger irá processar.
    # Mensagens com nível inferior a INFO (como DEBUG) serão ignoradas.
    logger.setLevel(logging.INFO)

    # Verifica se o logger já possui handlers configurados para evitar duplicação
    # de logs caso esta função seja chamada acidentalmente mais de uma vez.
    if logger.hasHandlers():
        logger.handlers.clear()

    # --- Configuração do Handler para o Console (stdout) ---
    # Cria um handler que direciona os logs para a saída padrão do sistema (o terminal).
    console_handler = logging.StreamHandler(sys.stdout)
    # Define o nível mínimo para este handler específico.
    console_handler.setLevel(logging.INFO)
    # Associa nosso formatador personalizado (com cores e emojis) a este handler.
    console_handler.setFormatter(ColorEmojiFormatter(fmt="[%(asctime)s] %(message)s"))
    # Adiciona o handler configurado ao logger.
    logger.addHandler(console_handler)

    # --- Configuração do Handler para o Arquivo ---
    # Cria um handler que escreve os logs em um arquivo.
    # O modo 'a' (append) garante que os logs de novas execuções sejam adicionados ao final do arquivo.
    file_handler = logging.FileHandler("xcam_rec.log", mode='a', encoding='utf-8')
    # Define o nível mínimo para este handler.
    file_handler.setLevel(logging.INFO)
    # Usa um formatador padrão, sem cores, para o arquivo de log, garantindo um texto limpo.
    file_handler.setFormatter(logging.Formatter("[%(asctime)s] [%(levelname)s] - %(message)s", datefmt='%Y-%m-%d %H:%M:%S'))
    # Adiciona o handler de arquivo ao logger.
    logger.addHandler(file_handler)

    # Retorna a instância do logger completamente configurada.
    return logger

# Cria a instância única e global do logger que será importada por outros módulos do projeto.
# Esta é a variável que outros arquivos usarão (ex: from utils.logger import log).
log = setup_logger()

# ---------------------------------------------------------------------------------------------
# 4. RODAPÉ / FIM DO CÓDIGO
# ---------------------------------------------------------------------------------------------

# @log de mudanças:
# 2025-07-12 (v1.0.0):
# - Criação inicial do módulo `logger.py`.
# - Implementação de sistema de logging profissional baseado na biblioteca `logging`.
# - Adição de formatação com cores e emojis para a saída do console.
# - Configuração de dupla saída: console (para tempo real) e arquivo (para persistência).
# - Estruturação do arquivo seguindo o padrão de fatoração do projeto XCam.

# @roadmap futuro:
# - Adicionar a possibilidade de configurar o nível do log via argumentos de linha de comando (ex: --verbose para DEBUG).
# - Integrar com serviços de logging em nuvem (ex: Sentry, Logtail) para monitoramento centralizado.
# - Implementar um mecanismo de rotação de arquivos de log (log rotation) para evitar que o `xcam_rec.log` cresça indefinidamente.
# - Enriquecer os logs com mais contexto, como nome do processo ou ID da thread em execuções paralelas.
