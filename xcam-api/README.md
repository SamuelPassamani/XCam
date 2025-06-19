# **Documentação Arquitetural e Técnica: XCam API**

## **1\. Filosofia e Visão Geral**

A **XCam API** é o sistema nervoso central do ecossistema XCam. Projetada com uma filosofia de **separação** de domínios **de dados**, ela desacopla as informações de transmissão (graphData), os dados de perfil (profileInfo), o estado da live (streamInfo) e o acervo de gravações (driveData).

Essa arquitetura orientada a serviços permite que os clientes (frontends) orquestrem a obtenção de dados de forma inteligente e performática, solicitando apenas o necessário para cada contexto de interface, o que reduz a carga e melhora a experiência do usuário.

* **URL Base:** https://api.xcam.gay/

## **2\. Modelos de Dados (Schemas de Resposta)**

Para entender a API, é fundamental conhecer as estruturas de dados que ela retorna.

#### **2.1. Objeto broadcast**

*Representa* um modelo *em transmissão ou online, retornado no array items do endpoint principal.*

| Campo | Tipo | Descrição | Exemplo |
| :---- | :---- | :---- | :---- |
| XCamId | Integer | ID interno do modelo no sistema XCam. | 8 |
| id | String | ID do modelo na plataforma de origem. | "50549085" |
| username | String | Nome de usuário do modelo. | "psvpeludo30" |
| country | String | Código do país (ISO 3166-1 alpha-2). | "br" |
| sexualOrientation | String | Orientação sexual declarada. | "gay" |
| profileImageURL | String | URL para a imagem de perfil. | (URL) |
| preview | Object | Contém URLs para o preview da transmissão. | { "src": "(URL)", "poster": "(URL)" } |
| viewers | Integer | Número atual de espectadores. | 93 |
| broadcastType | String | Categoria da transmissão (gênero). | "male" |
| gender | String | Gênero do modelo. | "male" |
| tags | Array | Lista de objetos de tags associadas. | \[ { "name": "cum", "slug": "cum" } \] |

#### **2.2. Objeto profileInfo**

*Representa os dados detalhados e relativamente estáticos de um perfil de usuário.*

| Campo | Tipo | Descrição | Exemplo |
| :---- | :---- | :---- | :---- |
| username | String | Nome de usuário. | "28andrea86" |
| userId | Integer | ID numérico do usuário. | 2157870 |
| age | Integer | Idade do usuário. | 39 |
| gender | String | Gênero. | "male" |
| countryId | String | Código do país. | "it" |
| maleBodyType | String | Tipo de corpo (enum). | "SLIM" |
| penisSize | String | Tamanho do pênis (enum). | "AVERAGE" |
| penisType | String | Tipo do pênis (enum). | "UNCUT" |
| maleRole | String | Papel sexual (enum). | "VERSATILE" |
| socialNetworks | Object | Links para redes sociais. | { "twitter": "(URL)" } |
| creationDate | Timestamp | Data de criação do perfil (ms). | 1247143839000 |

#### **2.3. Objeto streamInfo**

*Representa* os dados técnicos e voláteis da transmissão ao *vivo.*

| Campo | Tipo | Descrição | Exemplo |
| :---- | :---- | :---- | :---- |
| webRTC | Object | Detalhes para conexão via WebRTC. | { "sdpUrl": "wss://...", ... } |
| canUseCDN | Boolean | Indica se o CDN está disponível para esta stream. | true |
| edgeURL | String | URL HLS direta do servidor de borda (edge). | (URL) |
| cdnURL | String | URL HLS otimizada através da CDN global. | (URL) |

#### **2.4. Objeto driveData**

*Representa o acervo de gravações de um usuário.*

| Campo | Tipo | Descrição | Exemplo |
| :---- | :---- | :---- | :---- |
| username | String | Nome de usuário. | "28andrea86" |
| records | Integer | Número total de gravações. | 2 |
| videos | Array | Lista de objetos de vídeo. | \[ { "video": "hPunQ-oQ7", ... } \] |

## **3\. Endpoints da API: Guia Detalhado**

### **3.1. Consulta de Broadcasts: GET /**

Este endpoint retorna uma lista de transmissões (broadcasts) com base nos parâmetros de consulta fornecidos. É o endpoint ideal para popular a página principal ou de categorias.

#### **Parâmetros de Consulta**

| Parâmetro | Descrição | Regras e Valores Aceitáveis |  |
| :---- | :---- | :---- | :---- |
| limit | Define o número máximo de resultados por | página. | Inteiro positivo (e.g., 25, 50). |
| page | Define a pá de resultados agina |  |  |

