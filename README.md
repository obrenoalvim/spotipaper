# Gerador de Wallpaper Spotify

Uma aplicação web que gera wallpapers personalizados baseados em músicas e álbuns do Spotify, extraindo paletas de cores das capas dos álbuns.

## 📁 Estrutura do Projeto

```
spotify-wallpaper-generator/
├── index.html              # Arquivo HTML principal
├── styles.css              # Estilos CSS
├── config.js               # Configurações da aplicação
├── utils.js                # Funções utilitárias
├── spotify-api.js          # Gerenciamento da API do Spotify
├── canvas-renderer.js      # Renderização do canvas
├── app.js                  # Aplicação principal
└── README.md              # Documentação
```

## 🗂️ Descrição dos Arquivos

### `index.html`
- Estrutura HTML principal da aplicação
- Interface do usuário com painéis esquerdo e direito
- Referências para todos os arquivos CSS e JavaScript

### `styles.css`
- Todos os estilos CSS da aplicação
- Design responsivo com tema escuro
- Animações e transições
- Estilos para componentes específicos (botões, inputs, loading, etc.)

### `config.js`
- Configurações centralizadas da aplicação
- Configurações do Spotify (Client ID, URLs, etc.)
- Configurações do canvas (dimensões, posições, etc.)
- Configurações de fontes e cores

### `utils.js`
- Funções utilitárias reutilizáveis
- Utilitários PKCE para autenticação OAuth2
- Funções de manipulação de URL e texto
- Extração de paleta de cores
- Funções de interface (loading, erros, metadados)

### `spotify-api.js`
- Classes para gerenciamento da autenticação Spotify
- `SpotifyAuth`: Gerencia OAuth2 com PKCE
- `SpotifyAPI`: Faz chamadas para a API do Spotify
- Métodos para obter dados de músicas e álbuns

### `canvas-renderer.js`
- Classe `CanvasRenderer` para renderização do wallpaper
- Métodos para desenhar cada elemento do wallpaper
- Renderização de gradientes, texto, imagens
- Suporte a imagens com cantos arredondados

### `app.js`
- Classe principal `SpotifyWallpaperApp`
- Orquestra todas as funcionalidades
- Gerencia event listeners
- Coordena o fluxo de geração de wallpapers

## 🚀 Como Usar

1. **Configuração do Spotify**:
   - Edite o arquivo `config.js`
   - Substitua `CLIENT_ID` pelo seu Client ID do Spotify
   - Ajuste `REDIRECT_URI` conforme necessário

2. **Executar a aplicação**:
   - Abra `index.html` em um servidor web local
   - Conecte-se com sua conta Spotify
   - Cole uma URL de música ou álbum do Spotify
   - Clique em "Gerar Wallpaper"
   - Baixe o resultado em PNG

## 🛠️ Funcionalidades

- **Autenticação OAuth2**: Integração segura com Spotify usando PKCE
- **Extração de Cores**: Paleta automática das capas dos álbuns
- **Renderização Canvas**: Wallpaper 1080×1920px com design minimalista
- **Suporte a Músicas e Álbuns**: Funciona com ambos os tipos de conteúdo
- **Interface Responsiva**: Design adaptável para diferentes telas
- **Geração de Prompt**: Prompt para IA de imagens baseado nos dados

## 🎨 Elementos do Wallpaper

- Fundo com gradiente vertical (preto → cor dominante)
- Paleta de 5 cores no topo esquerdo
- Duração no topo direito
- Título da música/álbum (centralizado, grande)
- Nome do artista (abaixo do título)
- Capa do álbum (centro, cantos arredondados)
- Spotify Code (abaixo da capa)
- Vinheta sutil nas bordas

## 📋 Dependências

- **ColorThief**: Extração de paleta de cores (via CDN)
- **Spotify Web API**: Dados de músicas e álbuns
- **Canvas API**: Renderização do wallpaper

## 🔧 Personalização

### Modificar Cores
Edite as constantes em `config.js`:
```javascript
const COLOR_CONFIG = {
    BACKGROUND: '#000000',
    TEXT: '#ffffff',
    SPOTIFY_GREEN: '#1db954'
};
```

### Ajustar Layout
Modifique as configurações do canvas em `config.js`:
```javascript
const CANVAS_CONFIG = {
    WIDTH: 1080,
    HEIGHT: 1920,
    MARGINS: { SIDE: 64, TOP: 120 }
};
```

### Personalizar Fontes
Altere as configurações de fonte em `config.js`:
```javascript
const FONT_CONFIG = {
    TITLE: 'bold 48px Inter, system-ui',
    SUBTITLE: '28px Inter, system-ui'
};
```

## 🔒 Segurança

- Utiliza OAuth2 com PKCE (sem client secret)
- Tokens armazenados apenas no sessionStorage
- Todas as requisições são feitas client-side
- Não há armazenamento permanente de dados sensíveis

## 📱 Compatibilidade

- Navegadores modernos com suporte a:
  - Canvas API
  - Fetch API
  - Web Crypto API (para PKCE)
  - ES6+ (classes, async/await, etc.)

## 🤝 Contribuição

Para contribuir com o projeto:

1. Mantenha a separação de responsabilidades entre arquivos
2. Documente novas funções e classes
3. Siga as convenções de nomenclatura existentes
4. Teste em diferentes navegadores
5. Atualize este README se necessário

## ⚠️ Avisos Importantes

- **Spotify Codes**: A URL dos códigos pode ser alterada pelo Spotify sem aviso
- **Rate Limiting**: Respeite os limites da API do Spotify
- **Termos de Uso**: Verifique os termos do Spotify antes de usar em produção
- **CORS**: Algumas funcionalidades podem requerer servidor web local