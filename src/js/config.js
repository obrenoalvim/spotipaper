
export const SPOTIFY_CONFIG = {
    CLIENT_ID: import.meta.env.VITE_CLIENT_ID || '43f8be46cbcd48b5899f8e893274bd22',
    REDIRECT_URI: import.meta.env.VITE_REDIRECT_URI || window.location.origin,
    SCOPES: import.meta.env.VITE_SCOPES || 'user-read-private',
    API_BASE_URL: 'https://api.spotify.com/v1',
    AUTH_URL: 'https://accounts.spotify.com/authorize',
    TOKEN_URL: 'https://accounts.spotify.com/api/token'
};

export const CANVAS_CONFIG = {
    WIDTH: 1080,
    HEIGHT: 1920,
    MARGINS: {
        SIDE: 120,
        TOP: 120
    },
    PALETTE: {
        START_X: 120,
        START_Y: 120,
        COLOR_WIDTH: 56,
        COLOR_HEIGHT: 20,
        COLOR_GAP: 8
    },
    COVER: {
        SIZE: 840,
        BORDER_RADIUS: 8,
        Y_POSITION: 460
    },
    SPOTIFY_CODE: {
        WIDTH: 800,
        HEIGHT: 190,
        Y_OFFSET: 64
    }
};

export const FONT_CONFIG = {
    TITLE: 'bold 48px Inter, system-ui',
    SUBTITLE: '28px Inter, system-ui',
    DURATION: 'bold 24px Inter, system-ui'
};

export const COLOR_CONFIG = {
    BACKGROUND: '#000000',
    TEXT: '#ffffff',
    SPOTIFY_GREEN: '#1db954',
    SPOTIFY_GREEN_HOVER: '#1ed760'
};