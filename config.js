// Ambiente seguro para scripts clássicos (sem import.meta)
const ENV = (typeof window !== 'undefined' && window.__ENV__) ? window.__ENV__ : {};

// Preencha manualmente se não estiver usando bundler/ENV
const CLIENT_ID = ENV.VITE_CLIENT_ID;
console.log(CLIENT_ID)
const REDIRECT_URI = ENV.VITE_REDIRECT_URI || window.location.origin;
const SCOPES = ENV.VITE_SCOPES || 'user-read-private';

const __SPOTIFY_CONFIG = {
    CLIENT_ID: '43f8be46cbcd48b5899f8e893274bd22',
    REDIRECT_URI: 'http://localhost:5173',
    SCOPES: SCOPES,
    API_BASE_URL: 'https://api.spotify.com/v1',
    AUTH_URL: 'https://accounts.spotify.com/authorize',
    TOKEN_URL: 'https://accounts.spotify.com/api/token'
};

const __CANVAS_CONFIG = {
    WIDTH: 1080,
    HEIGHT: 1920,
    MARGINS: {
        SIDE: 130,
        TOP: 120
    },
    PALETTE: {
        START_X: 130,
        START_Y: 120,
        COLOR_WIDTH: 56,
        COLOR_HEIGHT: 20,
        COLOR_GAP: 8
    },
    COVER: {
        SIZE: 820,
        BORDER_RADIUS: 8,
        Y_POSITION: 420
    },
    SPOTIFY_CODE: {
        WIDTH: 800,
        HEIGHT: 200,
        Y_OFFSET: 64
    }
};

const __FONT_CONFIG = {
    TITLE: 'bold 48px Inter, system-ui',
    SUBTITLE: '28px Inter, system-ui',
    DURATION: 'bold 24px Inter, system-ui'
};

const __COLOR_CONFIG = {
    BACKGROUND: '#000000',
    TEXT: '#ffffff',
    SPOTIFY_GREEN: '#1db954',
    SPOTIFY_GREEN_HOVER: '#1ed760'
};

window.SPOTIFY_CONFIG = __SPOTIFY_CONFIG;
window.CANVAS_CONFIG = __CANVAS_CONFIG;
window.FONT_CONFIG = __FONT_CONFIG;
window.COLOR_CONFIG = __COLOR_CONFIG;

try {
    window.eval(`
        var SPOTIFY_CONFIG = window.SPOTIFY_CONFIG;
        var CANVAS_CONFIG = window.CANVAS_CONFIG;
        var FONT_CONFIG = window.FONT_CONFIG;
        var COLOR_CONFIG = window.COLOR_CONFIG;
    `);
} catch (e) {
    // fallback silencioso
}
