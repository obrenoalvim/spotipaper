
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

    resetCustomizationToDefaults() {
        const defaults = {
            bgColor: '#000000',
            accentColor: '#1db954',
            gradientStrength: '1',
            gradientDirection: 'vertical',
            textColor: 'light',
            vignetteIntensity: '0.4',
            showPalette: 'true'
        };

        const bgColor = document.getElementById('bgColor');
        const accentColor = document.getElementById('accentColor');
        const gradientStrength = document.getElementById('gradientStrength');
        const gradientDirection = document.getElementById('gradientDirection');
        const textColor = document.getElementById('textColor');
        const vignetteIntensity = document.getElementById('vignetteIntensity');
        const showPalette = document.getElementById('showPalette');

        if (bgColor) bgColor.value = defaults.bgColor;
        if (accentColor) accentColor.value = defaults.accentColor;
        if (gradientStrength) gradientStrength.value = defaults.gradientStrength;
        if (gradientDirection) gradientDirection.value = defaults.gradientDirection;
        if (textColor) textColor.value = defaults.textColor;
        if (vignetteIntensity) vignetteIntensity.value = defaults.vignetteIntensity;
        if (showPalette) showPalette.value = defaults.showPalette;
    }

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

        init() {
                this.auth.handleAuthCallback();

                this.setupEventListeners();

                this.simulateInitialRender();
    }

        setupEventListeners() {
                document.getElementById('authBtn').addEventListener('click', () => {
            this.auth.authenticate();
        });

                document.getElementById('generateBtn').addEventListener('click', () => {
            this.generateWallpaper(true);
        });

                document.getElementById('downloadBtn').addEventListener('click', () => {
            downloadWallpaper(this.currentTrackData);
        });

                const urlInput = document.getElementById('spotifyUrl');
        urlInput.addEventListener('input', () => {
            const value = urlInput.value.trim();
            const valid = !!parseSpotifyUrl(value);
            urlInput.classList.toggle('is-valid', valid);
            urlInput.classList.toggle('is-invalid', value.length > 0 && !valid);            urlInput.setAttribute('aria-invalid', String(!valid && value.length > 0));
        });

                urlInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !document.getElementById('generateBtn').disabled) {
                this.generateWallpaper(true);
            }
        });
                const customIds = ['bgColor','accentColor','gradientStrength','gradientDirection','textColor','vignetteIntensity','showPalette'];
        customIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => this.rerenderWithCurrentSettings());
                el.addEventListener('change', () => this.rerenderWithCurrentSettings());
            }
        });

    }
        async rerenderWithCurrentSettings() {
        if (!this.currentTrackData) return;
        const settings = this.getCustomizationSettings();
        await this.renderer.renderWallpaper(this.currentTrackData, settings);
    }
        async generateWallpaper(reset = false) {
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
            if (reset) {
                                this.resetCustomizationToDefaults();
                                await this.renderer.reset();
            }

            let trackData;

            if (this.auth.isAuthenticated()) {
                if (parsed.type === 'track') {
                    trackData = await this.api.getTrackData(parsed.id);
                } else if (parsed.type === 'album') {
                    trackData = await this.api.getAlbumData(parsed.id);
                }
            } else {
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

                        const colorData = await extractPalette(trackData.albumCover);

                        this.currentTrackData = {
                ...trackData,
                ...colorData,
                durationText: trackData.durationMs ? msToText(trackData.durationMs) : '—',
                spotifyCodeImageUrl: generateSpotifyCodeUrl(trackData.spotifyUrl)
            };

                        if (reset && this.currentTrackData?.dominant) {
                const accentEl = document.getElementById('accentColor');
                if (accentEl) accentEl.value = this.currentTrackData.dominant;
            }

                        await this.renderer.renderWallpaper(this.currentTrackData, this.getCustomizationSettings());
            
                        updateMetadata(this.currentTrackData);
            
                        document.getElementById('downloadBtn').disabled = false;

        } catch (error) {
            showError('Erro ao gerar wallpaper: ' + error.message);
        } finally {
            showLoading(false);
        }
    }

        async simulateInitialRender() {
        try {
            const exampleUrl = 'https://open.spotify.com/album/3JfSxDfmwS5OeHPwLSkrfr?si=5ppfaL38QRCkd7ZrHbT8fg';
            const input = document.getElementById('spotifyUrl');
            input.value = exampleUrl;

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


            const colorData = await extractPalette(demoData.albumCover);

            this.currentTrackData = {
                ...demoData,
                ...colorData,
                durationText: demoData.durationMs ? msToText(demoData.durationMs) : '—',
                spotifyCodeImageUrl: generateSpotifyCodeUrl(demoData.spotifyUrl)
            };

            const accentEl = document.getElementById('accentColor');
            if (accentEl && this.currentTrackData?.dominant) accentEl.value = this.currentTrackData.dominant;

            await this.renderer.renderWallpaper(this.currentTrackData, this.getCustomizationSettings());
            updateMetadata(this.currentTrackData);
            document.getElementById('downloadBtn').disabled = false;
        } catch (e) {
            console.warn('Simulação inicial falhou:', e);
        }
    }
}