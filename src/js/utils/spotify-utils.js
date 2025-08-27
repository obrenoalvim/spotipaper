// ===== UTILITÁRIOS ESPECÍFICOS DO SPOTIFY =====

/**
 * Faz parse de URL do Spotify
 * @param {string} url - URL do Spotify
 * @returns {Object|null} Objeto com type e id ou null se inválida
 */
export function parseSpotifyUrl(url) {
    const regex = /open\.spotify\.com\/(track|album)\/([a-zA-Z0-9]+)/;
    const match = url.match(regex);
    
    if (match) {
        return {
            type: match[1],
            id: match[2]
        };
    }
    return null;
}

/**
 * Converte URL do Spotify (open.spotify.com) para spotify:URI
 * @param {string} input - URL do Spotify ou spotify:URI
 * @returns {string|null} spotify:URI ou null se inválido
 */
export function toSpotifyUri(input) {
    if (!input) return null;
    if (input.startsWith('spotify:')) return input;
    const parsed = parseSpotifyUrl(input);
    if (!parsed) return null;
    return `spotify:${parsed.type}:${parsed.id}`;
}

/**
 * Gera URL do Spotify Code
 * ATENÇÃO: Verifique os termos de uso do Spotify Codes antes de usar em produção
 * Esta URL pode ser alterada pelo Spotify sem aviso prévio
 * @param {string} spotifyInput - URL do Spotify (open) ou spotify:URI
 * @returns {string} URL do Spotify Code
 */
export function generateSpotifyCodeUrl(spotifyInput) {
    const spotifyUri = toSpotifyUri(spotifyInput);
    if (!spotifyUri) return '';
    
    const bgHex = '000000'; // fundo preto integra melhor no layout escuro
    const barColor = 'white';
    const size = 640; // tamanho base do asset
    const encodedUri = encodeURIComponent(spotifyUri);
    
    return `https://scannables.scdn.co/uri/plain/png/${bgHex}/${barColor}/${size}/${encodedUri}`;
}