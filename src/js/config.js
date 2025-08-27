// ===== CONFIGURAÇÕES DA APLICAÇÃO =====

// IMPORTANTE: Configure estas variáveis com seus dados do Spotify Developer Dashboard
export const SPOTIFY_CONFIG = {
    CLIENT_ID: import.meta.env.VITE_CLIENT_ID || '43f8be46cbcd48b5899f8e893274bd22',
    REDIRECT_URI: import.meta.env.VITE_REDIRECT_URI || window.location.origin,
    SCOPES: import.meta.env.VITE_SCOPES || 'user-read-private',
    API_BASE_URL: 'https://api.spotify.com/v1',
    AUTH_URL: 'https://accounts.spotify.com/authorize',
    TOKEN_URL: 'https://accounts.spotify.com/api/token'
};

// Configurações do Canvas (1080x1920 - formato mobile)
export const CANVAS_CONFIG = {
    WIDTH: 1080,
    HEIGHT: 1920,
    MARGINS: {
        SIDE: 120,  // Margens laterais
        TOP: 120   // Margem superior
    },
    PALETTE: {
        START_X: 120,      // Posição X inicial da paleta
        START_Y: 120,     // Posição Y inicial da paleta
        COLOR_WIDTH: 56,  // Largura de cada cor
        COLOR_HEIGHT: 20, // Altura de cada cor
        COLOR_GAP: 8      // Espaçamento entre cores
    },
    COVER: {
        SIZE: 840,           // Tamanho da capa (quadrada)
        BORDER_RADIUS: 8,   // Raio dos cantos arredondados
        Y_POSITION: 460      // Posição Y da capa (centro vertical ≈ 620px)
    },
    SPOTIFY_CODE: {
        WIDTH: 800,    // Largura do Spotify Code
        HEIGHT: 190,   // Altura do Spotify Code
        Y_OFFSET: 64   // Offset abaixo da capa
    }
};

// Configurações de Tipografia
export const FONT_CONFIG = {
    TITLE: 'bold 48px Inter, system-ui',      // Fonte do título
    SUBTITLE: '28px Inter, system-ui',        // Fonte do subtítulo
    DURATION: 'bold 24px Inter, system-ui'   // Fonte da duração
};

// Configurações de Cores
export const COLOR_CONFIG = {
    BACKGROUND: '#000000',     // Cor de fundo (preto)
    TEXT: '#ffffff',           // Cor do texto (branco)
    SPOTIFY_GREEN: '#1db954',  // Verde do Spotify
    SPOTIFY_GREEN_HOVER: '#1ed760'  // Verde do Spotify (hover)
};