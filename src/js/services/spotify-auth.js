// ===== GERENCIAMENTO DE AUTENTICAÇÃO SPOTIFY =====

import { SPOTIFY_CONFIG } from '../config.js';
import { generateRandomString, generateCodeChallenge } from '../utils/crypto-utils.js';
import { showError } from '../utils/ui-utils.js';

export class SpotifyAuth {
    constructor() {
        this.accessToken = null;
        this.init();
    }

    /**
     * Inicializa a autenticação verificando token salvo
     */
    init() {
        const savedToken = sessionStorage.getItem('spotify_access_token');
        if (savedToken) {
            this.accessToken = savedToken;
            this.updateAuthStatus(true);
        }
    }

    /**
     * Inicia processo de autenticação OAuth2 com PKCE
     */
    async authenticate() {
        const codeVerifier = generateRandomString(64);
        const codeChallenge = await generateCodeChallenge(codeVerifier);

        sessionStorage.setItem('code_verifier', codeVerifier);

        if (!SPOTIFY_CONFIG.CLIENT_ID || !SPOTIFY_CONFIG.REDIRECT_URI) {
            showError('Configuração do Spotify ausente. Defina CLIENT_ID e REDIRECT_URI nas variáveis de ambiente.');
            return;
        }

        const authUrl = new URL(SPOTIFY_CONFIG.AUTH_URL);
        authUrl.searchParams.append('client_id', SPOTIFY_CONFIG.CLIENT_ID);
        authUrl.searchParams.append('response_type', 'code');
        authUrl.searchParams.append('redirect_uri', SPOTIFY_CONFIG.REDIRECT_URI);
        authUrl.searchParams.append('code_challenge_method', 'S256');
        authUrl.searchParams.append('code_challenge', codeChallenge);
        authUrl.searchParams.append('scope', SPOTIFY_CONFIG.SCOPES);

        window.location = authUrl;
    }

    /**
     * Processa callback de autenticação
     */
    async handleAuthCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
            showError('Erro na autenticação: ' + error);
            return;
        }

        if (code) {
            const codeVerifier = sessionStorage.getItem('code_verifier');
            if (!codeVerifier) {
                showError('Code verifier não encontrado');
                return;
            }

            try {
                const response = await fetch(SPOTIFY_CONFIG.TOKEN_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        client_id: SPOTIFY_CONFIG.CLIENT_ID,
                        grant_type: 'authorization_code',
                        code: code,
                        redirect_uri: SPOTIFY_CONFIG.REDIRECT_URI,
                        code_verifier: codeVerifier,
                    }),
                });

                const data = await response.json();

                if (data.access_token) {
                    this.accessToken = data.access_token;
                    sessionStorage.setItem('spotify_access_token', this.accessToken);
                    this.updateAuthStatus(true);
                    
                    // Limpar URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                } else {
                    showError('Erro ao obter token: ' + (data.error_description || data.error));
                }
            } catch (error) {
                showError('Erro na requisição de token: ' + error.message);
            }
        }
    }

    /**
     * Atualiza status de autenticação na interface
     * @param {boolean} isAuthenticated - Se está autenticado
     */
    updateAuthStatus(isAuthenticated) {
        const statusIndicator = document.getElementById('statusIndicator');
        const authStatus = document.getElementById('authStatus');
        const authBtn = document.getElementById('authBtn');
        const generateBtn = document.getElementById('generateBtn');
        const authSection = document.getElementById('authSection');

        if (!statusIndicator || !authStatus || !authBtn || !generateBtn || !authSection) {
            return;
        }

        if (isAuthenticated) {
            statusIndicator.classList.add('connected');
            authStatus.textContent = 'Conectado ao Spotify';
            authBtn.textContent = 'Reconectar';
            generateBtn.disabled = false;
            authSection.classList.add('authenticated');
            // Esconde completamente a seção de conexão quando já está autenticado
            authSection.style.display = 'none';
        } else {
            statusIndicator.classList.remove('connected');
            authStatus.textContent = 'Desconectado do Spotify';
            authBtn.textContent = 'Conectar com Spotify';
            // Não desabilitar o botão de gerar para permitir uso do oEmbed sem login
            // generateBtn.disabled = true;
            authSection.classList.remove('authenticated');
            // Garante que a seção fique visível quando não autenticado
            authSection.style.display = '';
        }
    }

    /**
     * Verifica se está autenticado
     * @returns {boolean} Se está autenticado
     */
    isAuthenticated() {
        return !!this.accessToken;
    }

    /**
     * Obtém o token de acesso
     * @returns {string|null} Token de acesso
     */
    getAccessToken() {
        return this.accessToken;
    }

    /**
     * Remove autenticação
     */
    logout() {
        this.accessToken = null;
        sessionStorage.removeItem('spotify_access_token');
        this.updateAuthStatus(false);
    }
}