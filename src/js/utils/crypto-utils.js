// ===== UTILITÁRIOS CRIPTOGRÁFICOS PARA PKCE =====

/**
 * Gera uma string aleatória para PKCE
 * @param {number} length - Comprimento da string
 * @returns {string} String aleatória
 */
export function generateRandomString(length) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let text = '';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

/**
 * Gera code challenge para PKCE
 * @param {string} codeVerifier - Code verifier
 * @returns {Promise<string>} Code challenge
 */
export async function generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const base64String = btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    return base64String;
}