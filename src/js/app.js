// ===== APLICAÇÃO PRINCIPAL =====

import { SpotifyAuth } from './services/spotify-auth.js';
import { SpotifyAPI } from './services/spotify-api.js';
import { CanvasRenderer } from './services/canvas-renderer.js';
import { parseSpotifyUrl, generateSpotifyCodeUrl } from './utils/spotify-utils.js';
import { msToText } from './utils/format-utils.js';
import { extractPalette } from './utils/color-utils.js';
import { 
    showLoading, 
    showError, 
    hideError, 
    updateMetadata, 
    downloadWallpaper, 
    copyPromptToClipboard
} from './utils/ui-utils.js';

export class SpotifyWallpaperApp {
    constructor() {
        this.auth = new SpotifyAuth();
        this.api = new SpotifyAPI(this.auth);
        this.renderer = new CanvasRenderer('canvas');
        this.currentTrackData = null;
        
        this.init();
    }

    /**
     * Lê valores do painel de personalização
     */
    getCustomizationSettings() {
        return {
            bgColor: document.getElementById('bgColor')?.value || undefined,
            accentColor: document.getElementById('accentColor')?.value || undefined,
            gradientStrength: parseFloat(document.getElementById('gradientStrength')?.value || '1'),
            gradientDirection: document.getElementById('gradientDirection')?.value || 'vertical',
            textColor: document.getElementById('textColor')?.value || 'light',
            vignetteIntensity: parseFloat(document.getElementById('vignetteIntensity')?.value || '0.4'),
            vignette: true,
            showPalette: (document.getElementById('showPalette')?.value || 'true') === 'true',
        };
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

        // Validação em tempo real da URL
        const urlInput = document.getElementById('spotifyUrl');
        urlInput.addEventListener('input', () => {
            const value = urlInput.value.trim();
            const valid = !!parseSpotifyUrl(value);
            urlInput.classList.toggle('is-valid', valid);
            urlInput.classList.toggle('is-invalid', value.length > 0 && !valid);            urlInput.setAttribute('aria-invalid', String(!valid && value.length > 0));
        });

        // Enter no campo de URL
        urlInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !document.getElementById('generateBtn').disabled) {
                this.generateWallpaper();
            }        });
        // Reagir às mudanças de personalização
        const customIds = ['bgColor','accentColor','gradientStrength','gradientDirection','textColor','vignetteIntensity','showPalette'];
        customIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => this.rerenderWithCurrentSettings());
                el.addEventListener('change', () => this.rerenderWithCurrentSettings());
            }
        });

    }
    /**
     * Re-renderiza usando dados atuais + personalização
     */
    async rerenderWithCurrentSettings() {
        if (!this.currentTrackData) return;
        const settings = this.getCustomizationSettings();
        await this.renderer.renderWallpaper(this.currentTrackData, settings);
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
            
            // Tentar usar API autenticada primeiro, depois fallback para oEmbed
            if (this.auth.isAuthenticated()) {
                // Obter dados baseado no tipo (track ou album)
                if (parsed.type === 'track') {
                    trackData = await this.api.getTrackData(parsed.id);
                } else if (parsed.type === 'album') {
                    trackData = await this.api.getAlbumData(parsed.id);
                }
            } else {
                // Fallback para oEmbed (sem autenticação)
                const oembedData = await this.api.getOEmbedData(url);
                trackData = {
                    type: parsed.type,
                    id: parsed.id,
                    trackTitle: oembedData.title || 'Título Desconhecido',
                    subtitleText: (oembedData.author_name || 'Artista Desconhecido').replace(/^by\s+/i, ''),
                    durationMs: 0,
                    albumCover: oembedData.thumbnail_url,
                    spotifyUrl: url
                };
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
                durationText: trackData.durationMs ? msToText(trackData.durationMs) : '—',
                spotifyCodeImageUrl: generateSpotifyCodeUrl(trackData.spotifyUrl)
            };

            // Renderizar wallpaper
            await this.renderer.renderWallpaper(this.currentTrackData, this.getCustomizationSettings());
            
            // Atualizar interface
            updateMetadata(this.currentTrackData);
            
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
            const oembedData = await this.api.getOEmbedData(exampleUrl);
            const parsed = parseSpotifyUrl(exampleUrl);

            const demoData = {
                type: 'album',
                id: parsed?.id || 'unknown',
                trackTitle: oembedData.title || 'Album',
                subtitleText: (oembedData.author_name || 'Spotify').replace(/^by\s+/i, ''),
                durationMs: 0,
                albumCover: oembedData.thumbnail_url,
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

            await this.renderer.renderWallpaper(this.currentTrackData, this.getCustomizationSettings());
            updateMetadata(this.currentTrackData);
            document.getElementById('downloadBtn').disabled = false;
        } catch (e) {
            console.warn('Simulação inicial falhou:', e);
        }
    }
}