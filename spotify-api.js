// ===== GERENCIAMENTO DE AUTENTICAÇÃO SPOTIFY =====

class SpotifyAuth {
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

        if (isAuthenticated) {
            statusIndicator.classList.add('connected');
            authStatus.textContent = 'Conectado ao Spotify';
            authBtn.textContent = 'Reconectar';
            generateBtn.disabled = false;
            authSection.classList.add('authenticated');
        } else {
            statusIndicator.classList.remove('connected');
            authStatus.textContent = 'Desconectado do Spotify';
            authBtn.textContent = 'Conectar com Spotify';
            // Não desabilitar o botão de gerar para permitir uso do oEmbed sem login
            // generateBtn.disabled = true;
            authSection.classList.remove('authenticated');
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

// ===== API SPOTIFY =====

class SpotifyAPI {
    constructor(auth) {
        this.auth = auth;
    }

    /**
     * Faz chamada para API do Spotify
     * @param {string} endpoint - Endpoint da API
     * @returns {Promise<Object>} Resposta da API
     */
    async apiCall(endpoint) {
        if (!this.auth.isAuthenticated()) {
            throw new Error('Token de acesso não disponível');
        }

        const response = await fetch(`${SPOTIFY_CONFIG.API_BASE_URL}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${this.auth.getAccessToken()}`,
            },
        });

        if (response.status === 401) {
            // Token expirado
            this.auth.logout();
            throw new Error('Token expirado. Faça login novamente.');
        }

        if (!response.ok) {
            throw new Error(`Erro da API: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Obtém dados de uma música
     * @param {string} trackId - ID da música
     * @returns {Promise<Object>} Dados da música
     */
    async getTrackData(trackId) {
        const data = await this.apiCall(`/tracks/${trackId}`);
        
        return {            type: 'track',
            id: data.id,            type: 'track',
            id: data.id,
            trackTitle: data.name,
            subtitleText: data.artists.map(artist => artist.name).join(', '),
            durationMs: data.duration_ms,
            albumCover: data.album.images[0]?.url,
            spotifyUrl: data.external_urls.spotify
        };
    }

    /**
     * Obtém dados de um álbum
     * @param {string} albumId - ID do álbum
     * @returns {Promise<Object>} Dados do álbum
     */
    async getAlbumData(albumId) {
        const albumData = await this.apiCall(`/albums/${albumId}`);
        
        // Obter todas as faixas do álbum (com paginação se necessário)
        let totalDurationMs = 0;
        let tracks = albumData.tracks.items;
        let nextUrl = albumData.tracks.next;
        
        // Somar duração das faixas da primeira página
        tracks.forEach(track => {
            totalDurationMs += track.duration_ms;
        });
        
        // Paginar se necessário
        while (nextUrl) {
            const response = await fetch(nextUrl, {
                headers: {
                    'Authorization': `Bearer ${this.auth.getAccessToken()}`,
                },
            });
            const pageData = await response.json();
            
            pageData.items.forEach(track => {
                totalDurationMs += track.duration_ms;
            });
            
            nextUrl = pageData.next;
        }            
        // type: 'album',
            // id: albumData.id,        
        return {
            trackTitle: albumData.name,
            subtitleText: albumData.artists.map(artist => artist.name).join(', '),
            durationMs: totalDurationMs,
            albumCover: albumData.images[0]?.url,
            spotifyUrl: albumData.external_urls.spotify
        };
    }
}