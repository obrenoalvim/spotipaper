const ENV = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};

const CLIENT_ID = ENV.VITE_CLIENT_ID;
const REDIRECT_URI = ENV.VITE_REDIRECT_URI || window.location.origin;
const SCOPES = ENV.VITE_SCOPES;

const __SPOTIFY_CONFIG = {
    CLIENT_ID,
    REDIRECT_URI,
    SCOPES,
    API_BASE_URL: 'https://api.spotify.com/v1',
    AUTH_URL: 'https://accounts.spotify.com/authorize',
    TOKEN_URL: 'https://accounts.spotify.com/api/token'
};

const __CANVAS_CONFIG = {
    WIDTH: 1080,
    HEIGHT: 1920,
    MARGINS: {
        SIDE: 64,
        TOP: 120
    },
    PALETTE: {
        START_X: 64,
        START_Y: 120,
        COLOR_WIDTH: 56,
        COLOR_HEIGHT: 20,
        COLOR_GAP: 8
    },
    COVER: {
        SIZE: 950,
        BORDER_RADIUS: 8,
        Y_POSITION: 420
    },
    SPOTIFY_CODE: {
        WIDTH: 900,
        HEIGHT: 220,
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
