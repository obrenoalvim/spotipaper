// ===== APLICAÇÃO PRINCIPAL =====

class SpotifyWallpaperApp {
    constructor() {
        this.auth = new SpotifyAuth();
        this.api = new SpotifyAPI(this.auth);
        this.renderer = new CanvasRenderer('canvas');
        this.currentTrackData = null;
        
        this.init();
    }

    /**
     * Inicializa a aplicação
     */
    init() {
        // Verificar callback de autenticação
        this.auth.handleAuthCallback();

        // Configurar event listeners
        this.setupEventListeners();

        // Simular geração inicial com um exemplo público (sem exigir login)
        this.simulateInitialRender();
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Botão de autenticação
        document.getElementById('authBtn').addEventListener('click', () => {
            this.auth.authenticate();
        });

        // Botão de gerar wallpaper
        document.getElementById('generateBtn').addEventListener('click', () => {
            this.generateWallpaper();
        });

        // Botão de download
        document.getElementById('downloadBtn').addEventListener('click', () => {
            downloadWallpaper(this.currentTrackData);
        });

        // Enter no campo de URL
        document.getElementById('spotifyUrl').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !document.getElementById('generateBtn').disabled) {
                this.generateWallpaper();
            }
        });
    }

    /**
     * Gera wallpaper baseado na URL do Spotify
     */
    async generateWallpaper() {
        const url = document.getElementById('spotifyUrl').value.trim();
        
        if (!url) {
            showError('Por favor, insira uma URL do Spotify');
            return;
        }

        const parsed = parseSpotifyUrl(url);
        if (!parsed) {
            showError('URL do Spotify inválida');
            return;
        }

        showLoading(true);
        hideError();

        try {
            let trackData;
            
            // Obter dados baseado no tipo (track ou album)
            if (parsed.type === 'track') {
                trackData = await this.api.getTrackData(parsed.id);
            } else if (parsed.type === 'album') {
                trackData = await this.api.getAlbumData(parsed.id);
            }

            if (!trackData.albumCover) {
                throw new Error('Capa do álbum não encontrada');
            }

            // Extrair paleta de cores
            const colorData = await extractPalette(trackData.albumCover);

            // Combinar dados
            this.currentTrackData = {
                ...trackData,
                ...colorData,
                durationText: msToText(trackData.durationMs),
                spotifyCodeImageUrl: generateSpotifyCodeUrl(trackData.spotifyUrl)
            };

            // Renderizar wallpaper
            await this.renderer.renderWallpaper(this.currentTrackData);
            
            // Atualizar interface
            updateMetadata(this.currentTrackData);
            generatePrompt(this.currentTrackData);
            
            // Habilitar download
            document.getElementById('downloadBtn').disabled = false;

        } catch (error) {
            showError('Erro ao gerar wallpaper: ' + error.message);
        } finally {
            showLoading(false);
        }
    }

    /**
     * Simula uma geração de wallpaper ao carregar a página
     * Usa oEmbed do Spotify para obter metadados sem autenticação
     */
    async simulateInitialRender() {
        try {
            const exampleUrl = 'https://open.spotify.com/album/3JfSxDfmwS5OeHPwLSkrfr?si=5ppfaL38QRCkd7ZrHbT8fg';
            const input = document.getElementById('spotifyUrl');
            input.value = exampleUrl;

            // Tenta obter dados via oEmbed (não requer token)
            const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(exampleUrl)}`;
            const res = await fetch(oembedUrl);
            const data = await res.json();

            // data.thumbnail_url é 300x300 por padrão; manteremos, o extractor/palette funciona com qualquer tamanho
            // Construir um objeto de dados compatível com o renderer
            const parsed = parseSpotifyUrl(exampleUrl);
            const albumId = parsed?.id;

            const demoData = {
                type: 'album',
                id: albumId || 'unknown',
                trackTitle: data.title || 'Album',
                subtitleText: (data.author_name || 'Spotify').replace(/^by\s+/i, ''),
                durationMs: 0,
                albumCover: data.thumbnail_url,
                spotifyUrl: exampleUrl
            };

            // Extrair paleta
            const colorData = await extractPalette(demoData.albumCover);

            this.currentTrackData = {
                ...demoData,
                ...colorData,
                durationText: demoData.durationMs ? msToText(demoData.durationMs) : '—',
                spotifyCodeImageUrl: generateSpotifyCodeUrl(demoData.spotifyUrl)
            };

            await this.renderer.renderWallpaper(this.currentTrackData);
            updateMetadata(this.currentTrackData);
            generatePrompt(this.currentTrackData);
            document.getElementById('downloadBtn').disabled = false;
        } catch (e) {
            console.warn('Simulação inicial falhou:', e);
        }
    }
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar aplicação
    window.spotifyApp = new SpotifyWallpaperApp();
});