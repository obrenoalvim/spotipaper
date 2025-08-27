# Gerador de Wallpaper Spotify

Aplicação web que gera wallpapers 1080×1920 a partir de músicas e álbuns do Spotify. O app extrai a paleta de cores da capa, cria um layout minimalista e permite baixar em PNG. Funciona mesmo sem login (via oEmbed), com dados mais completos quando autenticado.

## Funcionalidades

- Autenticação OAuth2 com PKCE (client-side) para acesso à Spotify Web API
- Geração via fallback oEmbed quando não autenticado (sem duração total, metadados básicos)
- Extração de cores com ColorThief (cor dominante + paleta de 5 cores)
- Renderização em Canvas (1080×1920) com: gradiente, paleta, duração, título, artista, capa arredondada e Spotify Code
- Interface responsiva e opção de download em PNG

## Requisitos

- Node.js 18+ (Vite 5)
- Conta no Spotify Developer (para usar autenticação e dados completos)

## Como executar

1) Instale dependências
- bash
  npm install

2) Configure variáveis de ambiente (raiz do projeto)
Crie um arquivo .env com as chaves a seguir. Ajuste o REDIRECT_URI conforme seu ambiente (desenvolvimento e produção) e inclua os mesmos valores na aba Redirect URIs do app no Spotify Developer Dashboard.
- env
  VITE_CLIENT_ID=SEU_CLIENT_ID_DO_SPOTIFY
  VITE_REDIRECT_URI=http://localhost:5173
  VITE_SCOPES=user-read-private

3) Ambiente de desenvolvimento
- bash
  npm run dev

4) Build de produção e preview
- bash
  npm run build
  npm run preview

Após subir em produção, lembre-se de atualizar o VITE_REDIRECT_URI e o Redirect URI no dashboard da Spotify.

## Como usar

- Opcional: clique em “Conectar com Spotify” para autenticar e obter metadados completos (ex.: duração)
- Cole a URL de uma música ou de um álbum do Spotify, por exemplo:
  - https://open.spotify.com/track/...
  - https://open.spotify.com/album/...
- Clique em “Gerar Wallpaper” e aguarde a extração da paleta e a renderização
- Clique em “Baixar PNG” para salvar o resultado

Sem login, a aplicação usa oEmbed do Spotify para obter metadados básicos (sem duração). Com login, usa a Web API para obter dados completos (músicas e álbuns, incluindo soma de duração das faixas de um álbum).

## Estrutura do projeto

- Raiz
  - index.html — HTML de entrada (Vite)
  - package.json — scripts e dependências
  - vercel.json — configuração de deploy (opcional)
  - .env — variáveis locais (não commitar)
  - dist/ — artefatos de build
- src/
  - main.js — bootstrap do app
  - styles/main.css — estilos da interface
  - js/config.js — constantes (canvas, fontes, cores) e SPOTIFY_CONFIG
  - js/app.js — classe principal SpotifyWallpaperApp
  - js/services/
    - spotify-auth.js — fluxo OAuth2 PKCE (login, token)
    - spotify-api.js — chamadas à Spotify Web API e oEmbed
    - canvas-renderer.js — desenho no Canvas (layout do wallpaper)
  - js/utils/
    - color-utils.js — extração de paleta via ColorThief
    - format-utils.js — formatação (tempo, quebra de texto)
    - spotify-utils.js — parse de URLs e Spotify Codes
    - crypto-utils.js — utilitários PKCE (SHA-256, challenge)
    - ui-utils.js — loading, erro, metadados, download

Observação: a pasta dist/ contém a versão empacotada pelo Vite; não edite arquivos nela manualmente.

## Detalhes técnicos relevantes

- Autenticação
  - PKCE (sem client secret) com code_verifier/code_challenge
  - Token guardado em sessionStorage; expiração derruba sessão e exige novo login
- Fallback oEmbed
  - Sem necessidade de token; retorna thumbnail da capa e título/autor
- Canvas e ColorThief
  - As imagens são carregadas com crossOrigin='anonymous' e referrerPolicy='no-referrer'
  - A extração de cores e o export PNG dependem de CORS correto nas imagens de capa
- Spotify Codes
  - O código é renderizado via URL pública scannables.scdn.co; verifique termos de uso do Spotify Codes antes de usar em produção

## Limitações e troubleshooting

- CORS em capas: se a imagem não permitir CORS, a extração de cores e/ou o download do canvas podem falhar. Tente outra faixa/álbum ou hospede/roteie imagens com cabeçalhos adequados.
- Redirect URI: precisa ser idêntico ao configurado no Spotify Dashboard (inclusive protocolo/porta). Em dev, use http://localhost:5173.
- Token expirado: ao receber 401, a app faz logout e pede novo login.
- oEmbed: fornece metadados limitados; duração pode aparecer como “—”.

## Personalização rápida

- Dimensões/layout: src/js/config.js (CANVAS_CONFIG)
- Cores e fontes: src/js/config.js (COLOR_CONFIG, FONT_CONFIG)
- Lógica de desenho: src/js/services/canvas-renderer.js

## Dependências principais

- Vite 5 (bundler e dev server)
- ColorThief (extração de paleta)
- Spotify Web API e oEmbed

## Contribuição

- Abra issues/PRs descrevendo claramente a mudança
- Mantenha o padrão de código e a separação por camadas (services/utils)
- Atualize este README quando alterar comportamento de build/execução

## Avisos

- Respeite termos e políticas do Spotify (Web API e Spotify Codes)
- Não commitar .env e credenciais
- Teste em navegadores modernos (Canvas, Web Crypto, ES Modules)
