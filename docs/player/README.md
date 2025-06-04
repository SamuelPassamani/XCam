<div align="center">
  <img src="https://drive.xcam.gay/0:/logo2.svg" width="120" alt="XCam Logo"/>
  <h1>XCam Player</h1>
  <p>Player leve, modular, responsivo e personalizável para exibição de transmissões ao vivo via JW Player</p>

  <p align="center">
    <a href="https://xcam.gay/cam">xcam.gay/cam</a> •
    <a href="https://beta.xcam.gay">Versão Beta</a> •
    <a href="https://api.xcam.gay">API</a> •
    <a href="mailto:contato@xcam.gay">contato@xcam.gay</a>
  </p>

  <p align="center">
    <img src="https://api.netlify.com/api/v1/badges/ded26182-8393-4141-ab43-7ba4c85cc568/deploy-status" alt="XCam Web App">
    <img src="https://api.netlify.com/api/v1/badges/a275d640-eef5-44cd-bebd-dd4301f59428/deploy-status" alt="XCam Beta">
    <img src="https://api.netlify.com/api/v1/badges/b3bf1a04-7e16-40b3-8972-676895751821/deploy-status" alt="XCam API">
    <img src="https://api.netlify.com/api/v1/badges/03b67a1e-db8a-493b-bfc7-d6f494ce2396/deploy-status" alt="XCam Drive">
    <img src="https://api.netlify.com/api/v1/badges/1672f90b-0206-4302-988e-de804cc49dc0/deploy-status" alt="XCam Status">
  </p>
</div>

---

## 📦 Sobre

O **XCam Player** é um componente autônomo e leve desenvolvido para reproduzir transmissões ao vivo hospedadas na plataforma XCam. Ele é renderizado dinamicamente com base nos parâmetros da URL `?user` ou `?id` e utiliza JW Player para exibir o conteúdo de forma segura, performática e personalizável.

---

## 🔧 Funcionalidades

- 🧠 Decodificação e montagem automática do player via parâmetros da URL
- ✅ Integração direta com `https://api.xcam.gay/?limit=1500&format=json`
- 🔒 Fallback local com `error.mp4` se o vídeo estiver indisponível
- 🖼️ Exibição de imagem de carregamento em tela cheia antes da renderização
- 🧩 Modularidade para customizações futuras (download, logo, skin)
- 📱 Responsivo para mobile e desktop
- 🧪 Sistema de contagem regressiva para anúncios
- 🎯 Tratamento avançado de erros por código (`JWPlayer error codes`)

---

## 📁 Estrutura da pasta `xcam/dist/cam`

```
cam/
├── index.html              # HTML principal com estrutura do player + modal de publicidade
├── script.js               # Script principal com lógica de player, fallback e pré-carregamento
├── style.css               # Estilo base e responsivo do player
├── ads/
│   ├── 300x250.html        # Anúncio para desktop
│   └── 320x50.html         # Anúncio para mobile
├── assets/
│   ├── loading.gif         # Imagem exibida durante o carregamento
│   └── error.mp4           # Fallback local em caso de erro no vídeo
```

---

## 🚀 Como usar

1. **Via `id`**

```
https://xcam.gay/cam/?id=54013666
```

2. **Via `user`**

```
https://xcam.gay/cam/?user=SuckubDevil
```

> Ambos acionam uma busca interna na API `https://api.xcam.gay` para obter os dados da câmera.

---

## 🧠 Lógica de execução (resumo)

1. A imagem `loading.gif` é exibida em tela cheia enquanto o player é montado.
2. Os parâmetros `id` e `user` são extraídos da URL.
3. A API pública do XCam é consultada para obter os dados da transmissão.
4. Se o vídeo estiver disponível, o JW Player é configurado dinamicamente com título, tags, thumbnail e fonte HLS.
5. Em caso de erro (por falha de rede, vídeo indisponível ou código de erro do JW), o fallback `error.mp4` é exibido com uma mensagem personalizada e contagem para retry.

---

## 🧪 Exemplo de estrutura do player

```js
jwplayer("player").setup({
  file: "https://stream-hls.m3u8",
  image: "https://drive.xcam.gay/0:/logo2.png",
  title: "@username",
  description: "#tags",
  controls: true,
  logo: {
    file: "https://drive.xcam.gay/0:/logo2.png",
    link: "https://xcam.gay"
  }
});
```

---

## ⚠️ Tratamento de erros

A função `handlePlayerError()` escuta o evento `jwplayer().on('error')` e trata erros com base nos códigos de retorno:

* `232001`: Erro de conexão com o servidor
* `232011`: Problemas de rede ou navegador
* `232600`: Arquivo corrompido ou não encontrado
* ...e vários outros códigos tratados (ver script.js)

> Todos resultam na exibição do `error.mp4` após uma contagem regressiva de 5s com mensagem contextual.

---

## 📥 Download direto do vídeo

Adicionamos um botão de download customizado no player para que o usuário possa salvar o stream atual, respeitando permissões do navegador.

---

## 🧩 Tecnologias Utilizadas

| Tecnologia   | Descrição                                        |
| ------------ | ------------------------------------------------ |
| HTML5 + CSS3 | Estrutura do player e responsividade             |
| JavaScript   | Lógica de extração de parâmetros, player e erros |
| JW Player    | Motor principal de exibição dos vídeos HLS       |
| XCam API     | Fonte de dados atualizada em tempo real          |
| Netlify      | Deploy, CDN, roteamento e otimização de entrega  |

---

## 👤 Desenvolvedor

**Samuel (idealizador do projeto XCam)**  
📧 [contato@xcam.gay](mailto:contato@xcam.gay)  
🌐 [https://xcam.gay](https://xcam.gay)

Sou um profissional multidisciplinar com paixão por simplicidade, eficiência e clareza. Desenvolvo soluções escaláveis com atenção à arquitetura limpa, modularidade e performance. No XCam, aplico meus conhecimentos em programação, ciência de dados, arquitetura de software e experiência do usuário para construir uma plataforma robusta, elegante e funcional.