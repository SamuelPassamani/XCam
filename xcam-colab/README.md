# XCam_Gravador.ipynb

## Documentação Técnica

Este notebook tem como objetivo automatizar o processo de captura e arquivamento de transmissões ao vivo (streams) da plataforma XCam. Ele realiza a busca por transmissões disponíveis, grava os vídeos, faz upload para um serviço de hospedagem (Abyss/ Hydrax), e mantém um registro detalhado das gravações de cada usuário em arquivos JSON organizados por pasta.

---

## Fluxo Geral

1. **Montagem do Google Drive**
2. **Instalação do FFmpeg**
3. **Definição de Diretórios e Constantes**
4. **Funções utilitárias**
5. **Busca de Broadcasts (streams) disponíveis**
6. **Gravação de streams com FFmpeg**
7. **Upload dos arquivos gravados para Abyss/Hydrax**
8. **Gerenciamento do arquivo `rec.json` por usuário**
9. **Execução paralela e processamento paginado**
10. **Execução automática no ambiente Colab**

---

## Detalhamento das Etapas

### 1. Montagem do Google Drive

- O notebook monta o Google Drive na máquina virtual do Colab, permitindo acesso de leitura e escrita à pasta `/content/drive/MyDrive/XCam.Drive`.
- Os arquivos gravados e os registros JSON são armazenados nesta pasta para persistência além da execução do notebook.

```python
from google.colab import drive
drive.mount('/content/drive')
```

---

### 2. Instalação do FFmpeg

- FFmpeg é uma ferramenta de linha de comando essencial para captura e manipulação de streams de vídeo.
- O notebook instala ou atualiza o FFmpeg para garantir funcionalidade total na VM do Colab.

```python
!apt-get update -y
!apt-get install -y ffmpeg
```

---

### 3. Definição de Diretórios e Constantes

- **TEMP_OUTPUT_FOLDER:** Diretório temporário local para gravação dos vídeos, usado para evitar perda de dados caso ocorra erro antes do upload.
- **BASE_DRIVE_FOLDER:** Diretório base no Google Drive onde ficam as pastas de usuários e arquivos JSON.
- **ABYSS_UPLOAD_URL:** URL do serviço de upload (Hydrax/Abyss).
- **RECORD_SECONDS:** Duração padrão da gravação de cada stream (ex: 1980 segundos = 33 minutos).

---

### 4. Funções Utilitárias

- **format_seconds:** Formata um valor em segundos para string no formato `XhYmZs`.
- **log_progress:** Exibe o progresso da gravação, mostrando minutos gravados, restantes e percentual completado.

---

### 5. Busca de Broadcasts

- **get_broadcasts:** Busca transmissões disponíveis via API da XCam:
   - Primeira tentativa utiliza a API principal para obter lista de transmissões.
   - Se não encontrar a URL do stream (preview), utiliza fallback na API liveInfo para tentar obter a URL direta (.m3u8).
   - Retorna uma lista de transmissões válidas com campos `username` e `src` (URL do stream).

---

### 6. Gravação de Streams

- **gravar_stream:** 
   - Usa FFmpeg para gravar a transmissão do usuário por um tempo definido.
   - O arquivo é salvo em pasta temporária, com nome padronizado: `{username}_{data}_{horario}_{tempo}.mp4`.
   - Exibe feedback de progresso (minutos gravados/restantes).
   - Após a gravação, renomeia o arquivo para o padrão correto e o encaminha para upload.

---

### 7. Upload para Abyss/Hydrax

- **upload_to_abyss_and_update_json:** 
   - Envia o arquivo gravado para o serviço Abyss/Hydrax via POST multipart/form-data.
   - Se o upload for bem-sucedido, recebe URL e ID do vídeo hospedado.
   - Exibe informações detalhadas do upload e status.

---

### 8. Gerenciamento do rec.json por Usuário

- Para cada usuário, existe um arquivo `user/{username}/rec.json` que registra todas as gravações daquele usuário.
- **Ao criar um novo rec.json:**
   - É feita uma cópia do arquivo modelo base (`user/rec.json`), que possui apenas os campos `username`, `records`, e `videos`.
   - Os campos são zerados e inicializados corretamente.
- **Ao atualizar um rec.json existente:**
   - O notebook valida se a estrutura do arquivo está conforme o modelo base.
   - Se houver divergência ou corrupção, o arquivo é zerado e refeito.
   - Cada gravação realizada é adicionada ao campo `videos` como um novo objeto, e o contador `records` é incrementado.
   - Os campos de cada vídeo incluem: `video`, `title`, `file`, `url`, `data`, `horario`, `tempo`.

---

### 9. Execução Paralela e Processamento Paginado

- **process_page:** Busca e grava múltiplas transmissões em paralelo, utilizando a biblioteca `multiprocessing`.
- Permite processar várias páginas de transmissões em sequência, respeitando limites e pausas configuráveis.

---

### 10. Execução Automática no Colab

- O notebook detecta se está rodando no ambiente Colab e executa o processo principal automaticamente.
- Caso contrário, orienta a execução manual da função `main()`.

---

## Observações e Boas Práticas

- O notebook foi desenhado para ser robusto contra falhas na API, arquivos corrompidos e respostas inesperadas.
- Registros detalhados são exibidos a cada etapa para diagnóstico e auditoria.
- O modelo do arquivo `rec.json` é estritamente validado para evitar inconsistências nos dados.
- O uso de nomes de arquivos padronizados facilita a organização, busca e manutenção dos registros.

---

## Estrutura de Pastas

```
/content/drive/MyDrive/XCam.Drive/
  ├── user/
  │    ├── re.json          # Modelo base para rec.json
  │    ├── {username}/
  │    │      └── rec.json  # Arquivo de registros por usuário
  └── temp_recordings/      # Arquivos MP4 temporários (local)
```

---

## Dependências

- Python 3.x
- Google Colab
- ffmpeg
- Bibliotecas: `requests`, `multiprocessing`, `subprocess`, `json`, `os`, `shutil`, `datetime`, `re`, `math`, `time`

---

## Personalização

- É possível ajustar a duração da gravação (`RECORD_SECONDS`) e o número de transmissões processadas por página (`limit`).
- O modelo do arquivo `rec.json` pode ser alterado conforme necessidade, desde que mantida a validação de integridade.

---

## Segurança e Limpeza

- Os arquivos temporários locais são removidos após gravação e upload com sucesso, evitando uso excessivo de espaço em disco.
- O notebook não armazena credenciais sensíveis e não expõe URLs privadas.

---

## Conclusão

Este notebook oferece uma solução completa para automação de captura, upload e registro de transmissões da XCam, com robustez, log detalhado e facilidade de manutenção e expansão para futuras necessidades.