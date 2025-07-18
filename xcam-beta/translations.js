/**
 * =========================================================================================
 * XCam App - translations.js
 * =========================================================================================
 *
 * @author      Samuel Passamani / Um Projeto do Estudio A.Sério [AllS Company]
 * @info        https://aserio.work/
 * @version     2.0.0
 * @lastupdate  2025-07-17
 *
 * @description
 * Módulo central de internacionalização (i18n) para a aplicação XCam.
 * Este arquivo contém todos os objetos de tradução para diferentes campos da UI
 * (gênero, orientação, etc.) e uma lista completa de nomes de países.
 * Exporta funções utilitárias para facilitar a tradução em toda a aplicação.
 *
 * @mode        production
 * =========================================================================================
 */

/* =========================================================================================
 * 2. CONFIGURAÇÕES & VARIÁVEIS GLOBAIS
 * =========================================================================================
 */

/**
 * @const {object} TRANSLATIONS
 * @description
 * Objeto principal que armazena os mapeamentos de tradução para diversos
 * campos de dados utilizados na interface da aplicação. Cada chave de primeiro
 * nível representa uma categoria (ex: 'gender'), e suas chaves internas
 * representam os valores da API, com os valores sendo a tradução em português.
 */
export const TRANSLATIONS = {
  gender: {
    male: "Masculino",
    female: "Feminino",
    trans: "Transgênero",
    unknown: "Não informado"
  },
  sexPreference: {
    bisexual: "Bissexual",
    straight: "Heterossexual",
    gay: "Gay",
    lesbian: "Lésbica",
    unknown: "Não informado"
  },
  ethnicity: {
    black: "Negro",
    white: "Branco",
    asian: "Asiático",
    latino: "Latino",
    mixed: "Mestiço",
    other: "Outro",
    unknown: "Não informado"
  },
  maritalStatus: {
    single: "Solteiro",
    married: "Casado",
    separated: "Separado",
    divorced: "Divorciado",
    widowed: "Viúvo",
    unknown: "Não informado"
  },
  maleBodyType: {
    AVERAGE: "Médio",
    SLIM: "Magro",
    ATHLETIC: "Atlético",
    MUSCULAR: "Musculoso",
    CHUBBY: "Gordinho",
    unknown: "Não informado"
  },
  penisSize: {
    SMALL: "Pequeno",
    MEDIUM: "Médio",
    BIG: "Grande",
    unknown: "Não informado"
  },
  penisType: {
    UNCUT: "Não Circuncidado",
    CUT: "Circuncidado",
    unknown: "Não informado"
  },
  maleType: {
    TWINK: "Magro",
    BEAR: "Ursão",
    DADDY: "Maduro",
    JOCK: "Esportista",
    OTTER: "Peludo",
    unknown: "Não informado"
  },
  maleRole: {
    TOP: "Ativo",
    BOTTOM: "Passivo",
    VERSATILE: "Versátil",
    unknown: "Não informado"
  },
  bodyHair: {
    none: "Sem pelos",
    average: "Poucos pelos",
    hairy: "Peludo",
    unknown: "Não informado"
  },
  heightUnit: {
    metric: "cm",
    imperial: "polegadas"
  },
  mainLanguage: {
    es: "Espanhol",
    en: "Inglês",
    pt: "Português",
    fr: "Francês",
    de: "Alemão",
    it: "Italiano",
    unknown: "Não informado"
  },
  smoke: {
    yes: "Sim",
    no: "Não",
    occasionally: "Ocasionalmente",
    unknown: "Não informado"
  },
  drink: {
    yes: "Sim",
    no: "Não",
    occasionally: "Ocasionalmente",
    unknown: "Não informado"
  },
  broadcastType: {
    male: "Individual",
    male_group: "Grupo",
    male_female_group: "Grupo Misto",
    unknown: "Não informado"
  }
};

/**
 * @const {object} COUNTRY_NAMES
 * @description
 * Mapeamento de códigos de país de duas letras (ISO 3166-1 alpha-2) para
 * seus nomes completos em português.
 */
export const COUNTRY_NAMES = {
  ae: "Emirados Árabes Unidos", af: "Afeganistão", al: "Albânia", am: "Armênia",
  ao: "Angola", ar: "Argentina", as: "Samoa Americana", at: "Áustria",
  au: "Austrália", az: "Azerbaijão", ba: "Bósnia e Herzegovina", bb: "Barbados",
  bd: "Bangladesh", be: "Bélgica", bf: "Burquina Faso", bg: "Bulgária",
  bh: "Bahrein", bi: "Burundi", bj: "Benin", bm: "Bermudas",
  bn: "Brunei", bo: "Bolívia", br: "Brasil", bs: "Bahamas",
  bt: "Butão", bw: "Botsuana", by: "Belarus", bz: "Belize",
  ca: "Canadá", cd: "República Democrática do Congo", cf: "República Centro-Africana",
  cg: "Congo", ch: "Suíça", cl: "Chile", cm: "Camarões",
  cn: "China", co: "Colômbia", cr: "Costa Rica", cu: "Cuba",
  cv: "Cabo Verde", cw: "Curaçao", cy: "Chipre", cz: "República Tcheca",
  de: "Alemanha", dj: "Djibuti", dk: "Dinamarca", dm: "Dominica",
  do: "República Dominicana", dz: "Argélia", ec: "Equador", ee: "Estônia",
  eg: "Egito", en: "Inglaterra", es: "Espanha", et: "Etiópia",
  fi: "Finlândia", fj: "Fiji", fm: "Micronésia", fr: "França",
  ga: "Gabão", gb: "Reino Unido", gd: "Granada", ge: "Geórgia",
  gh: "Gana", gm: "Gâmbia", gn: "Guiné", gq: "Guiné Equatorial",
  gr: "Grécia", gt: "Guatemala", gw: "Guiné-Bissau", gy: "Guiana",
  hk: "Hong Kong", hn: "Honduras", hr: "Croácia", ht: "Haiti",
  hu: "Hungria", id: "Indonésia", ie: "Irlanda", il: "Israel",
  in: "Índia", iq: "Iraque", ir: "Irã", is: "Islândia",
  it: "Itália", jm: "Jamaica", jo: "Jordânia", jp: "Japão",
  ke: "Quênia", kg: "Quirguistão", kh: "Camboja", ki: "Kiribati",
  km: "Comores", kp: "Coreia do Norte", kr: "Coreia do Sul", kw: "Kuwait",
  kz: "Cazaquistão", la: "Laos", lb: "Líbano", lk: "Sri Lanka",
  lr: "Libéria", ls: "Lesoto", lt: "Lituânia", lu: "Luxemburgo",
  lv: "Letônia", ly: "Líbia", ma: "Marrocos", mc: "Mônaco",
  md: "Moldávia", me: "Montenegro", mg: "Madagascar", mh: "Ilhas Marshall",
  mk: "Macedônia do Norte", ml: "Mali", mm: "Mianmar", mn: "Mongólia",
  mo: "Macau", mr: "Mauritânia", mt: "Malta", mu: "Maurício",
  mv: "Maldivas", mw: "Malawi", mx: "México", my: "Malásia",
  mz: "Moçambique", na: "Namíbia", nc: "Nova Caledônia", ne: "Níger",
  nf: "Ilhas Norfolk", ng: "Nigéria", ni: "Nicarágua", nl: "Holanda",
  no: "Noruega", np: "Nepal", nr: "Nauru", nz: "Nova Zelândia",
  om: "Omã", pa: "Panamá", pe: "Peru", ph: "Filipinas",
  pk: "Paquistão", pl: "Polônia", pt: "Portugal", pw: "Palau",
  py: "Paraguai", qa: "Catar", ro: "Romênia", rs: "Sérvia",
  ru: "Rússia", rw: "Ruanda", sa: "Arábia Saudita", sb: "Ilhas Salomão",
  sc: "Escócia", sd: "Sudão", se: "Suécia", sg: "Singapura",
  si: "Eslovênia", sk: "Eslováquia", sl: "Serra Leoa", sm: "San Marino",
  sn: "Senegal", so: "Somália", sr: "Suriname", sv: "El Salvador",
  sy: "Síria", sz: "Essuatíni", td: "Chade", tg: "Togo",
  th: "Tailândia", tj: "Tajiquistão", tn: "Tunísia", to: "Tonga",
  tr: "Turquia", tt: "Trinidad e Tobago", tv: "Tuvalu", tz: "Tanzânia",
  ua: "Ucrânia", ug: "Uganda", us: "Estados Unidos", uy: "Uruguai",
  uz: "Uzbequistão", va: "Vaticano", vc: "São Vicente e Granadinas",
  ve: "Venezuela", vn: "Vietnã", vu: "Vanuatu", wf: "Wallis e Futuna",
  ws: "Samoa", ye: "Iêmen", za: "África do Sul", zm: "Zâmbia",
  zw: "Zimbábue"
};

/* =========================================================================================
 * 3. CORPO
 * =========================================================================================
 */

/**
 * Traduz um valor de um campo específico usando o objeto TRANSLATIONS.
 * @param {string} field - A categoria da tradução (ex: "gender", "sexPreference").
 * @param {string} value - O valor a ser traduzido (ex: "male", "bisexual").
 * @returns {string} A string traduzida. Se não encontrar, retorna "Não informado".
 */
export const translate = (field, value) =>
  TRANSLATIONS[field]?.[value] || "Não informado";

/**
 * Obtém o nome completo de um país a partir do seu código de duas letras.
 * @param {string} countryCode - O código do país (ex: "br", "us").
 * @returns {string} O nome do país traduzido. Se não encontrar, retorna o código em maiúsculas.
 */
export const getCountryName = (countryCode) =>
  COUNTRY_NAMES[countryCode] || countryCode.toUpperCase();

/* =========================================================================================
 * 4. RODAPÉ / FIM DO CÓDIGO
 * =========================================================================================
 *
 * @log de mudanças:
 * - v2.0.0 (2025-07-17):
 * - REFATORAÇÃO COMPLETA: O arquivo foi reestruturado para seguir o padrão de
 * organização do projeto XCam (Cabeçalho, Configs, Corpo, Rodapé).
 * - DOCUMENTAÇÃO: Adicionados comentários detalhados (JSDoc) para todas as
 * constantes e funções, explicando seus propósitos e parâmetros.
 * - CONVENÇÃO DE NOMES: Renomeado `translations` para `TRANSLATIONS` e
 * `countryNames` para `COUNTRY_NAMES` para seguir a convenção de constantes.
 *
 * @roadmap futuro:
 * - CARREGAMENTO DINÂMICO: Considerar carregar traduções de forma dinâmica
 * (lazy-loading) por idioma, caso a aplicação se torne multilíngue.
 * - INTEGRAÇÃO COM I18N: No futuro, este arquivo pode ser a base para a
 * integração com uma biblioteca de internacionalização mais robusta, como i18next.
 *
 * =========================================================================================
 */
