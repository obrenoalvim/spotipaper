// ===== RENDERIZADOR DE CANVAS =====

import { CANVAS_CONFIG, FONT_CONFIG, COLOR_CONFIG } from '../config.js';
import { wrapText } from '../utils/format-utils.js';

export class CanvasRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.settings = {};
    }

    getTextColor() {
        return (!this.settings || this.settings.textColor === 'light') ? '#ffffff' : '#000000';
    }

    /**
     * Renderiza o wallpaper completo
     * @param {Object} data - Dados da música/álbum
     * @param {Object} settings - Configurações de personalização
     */
    async renderWallpaper(data, settings = null) {
        const { WIDTH, HEIGHT } = CANVAS_CONFIG;
        this.settings = settings || {};

        // Resetar estado do canvas
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        this.ctx.clearRect(0, 0, WIDTH, HEIGHT);

        // Fundo base
        const baseBg = this.settings.bgColor || COLOR_CONFIG.BACKGROUND;
        this.ctx.fillStyle = baseBg;
        this.ctx.fillRect(0, 0, WIDTH, HEIGHT);

        // Gradiente de fundo
        this.renderBackground(data);

        // Vinheta
        this.renderVignette();

        // Paleta
        if (!this.settings || this.settings.showPalette !== false) {
            this.renderColorPalette(data.palette || []);
        }

        // Duração
        if (data.durationText && data.durationText !== '—' && data.durationText !== '0 MIN 00 S') {
            this.renderDuration(data.durationText);
        }

        // Título e subtítulo
        const titleBottomY = this.renderTitle(data.trackTitle || '');
        this.renderSubtitle(data.subtitleText || '', titleBottomY);

        // Capa
        await this.renderAlbumCover(data.albumCover);

        // Spotify Code
        await this.renderSpotifyCode(data.spotifyCodeImageUrl);
    }

    /**
     * Renderiza fundo com gradiente com base nas configurações
     */
    renderBackground(data) {
        const { WIDTH, HEIGHT } = CANVAS_CONFIG;
        const gradientStrength = typeof this.settings.gradientStrength === 'number' ? this.settings.gradientStrength : 1;
        const accent = this.settings.accentColor || data.dominant || COLOR_CONFIG.ACCENT || '#1db954';
        const direction = this.settings.gradientDirection || 'vertical'; // 'vertical' | 'horizontal'

        let grad;
        if (direction === 'horizontal') {
            grad = this.ctx.createLinearGradient(0, 0, WIDTH, 0);
        } else {
            grad = this.ctx.createLinearGradient(0, 0, 0, HEIGHT);
        }

        const baseBg = this.settings.bgColor || COLOR_CONFIG.BACKGROUND;
        grad.addColorStop(0, baseBg);

        // Misturar cor base com acento pela força do gradiente
        const mix = (c1, c2, t) => {
            const toRgb = (hex) => hex.replace('#','').match(/.{2}/g).map(n => parseInt(n,16));
            const [r1,g1,b1] = toRgb(c1);
            const [r2,g2,b2] = toRgb(c2);
            const r = Math.round(r1 + (r2 - r1) * t);
            const g = Math.round(g1 + (g2 - g1) * t);
            const b = Math.round(b1 + (b2 - b1) * t);
            return `rgb(${r}, ${g}, ${b})`;
        };
        const endColor = mix(baseBg, accent, Math.max(0, Math.min(1, gradientStrength)));
        grad.addColorStop(1, endColor);

        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }

    /**
     * Renderiza vinheta nas bordas
     */
    renderVignette() {
        if (this.settings && this.settings.vignette === false) return;
        const intensity = typeof this.settings.vignetteIntensity === 'number' ? this.settings.vignetteIntensity : 0.4; // 0..1
        const { WIDTH, HEIGHT } = CANVAS_CONFIG;
        
        const vignetteGradient = this.ctx.createRadialGradient(
            WIDTH/2, HEIGHT/2, 0,
            WIDTH/2, HEIGHT/2, WIDTH * 0.8
        );
        vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignetteGradient.addColorStop(1, `rgba(0, 0, 0, ${Math.max(0, Math.min(1, intensity))})`);
        this.ctx.fillStyle = vignetteGradient;
        this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }

    /**
     * Renderiza paleta de cores no topo esquerdo
     */
    renderColorPalette(palette) {
        const { START_X, START_Y, COLOR_WIDTH, COLOR_HEIGHT, COLOR_GAP } = CANVAS_CONFIG.PALETTE;

        (palette || []).slice(0, 5).forEach((color, index) => {
            const x = START_X + (COLOR_WIDTH + COLOR_GAP) * index;
            const y = START_Y;
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x, y, COLOR_WIDTH, COLOR_HEIGHT);
            // Traço sutil para contraste
            this.ctx.strokeStyle = 'rgba(255,255,255,0.25)';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x + 0.5, y + 0.5, COLOR_WIDTH - 1, COLOR_HEIGHT - 1);
        });
    }

    /**
     * Renderiza duração no topo direito
     */
    renderDuration(durationText) {
        const { WIDTH } = CANVAS_CONFIG;
        const { START_Y, COLOR_HEIGHT } = CANVAS_CONFIG.PALETTE;

        this.ctx.fillStyle = this.getTextColor();
        this.ctx.font = FONT_CONFIG.DURATION;
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(durationText, WIDTH - CANVAS_CONFIG.MARGINS.SIDE, START_Y + COLOR_HEIGHT/2);
    }

    /**
     * Renderiza título
     * Retorna a coordenada Y inferior do bloco do título para posicionar o subtítulo
     */
    renderTitle(title) {
        const { WIDTH } = CANVAS_CONFIG;
        const { START_Y, COLOR_HEIGHT } = CANVAS_CONFIG.PALETTE;
        const titleY = START_Y + COLOR_HEIGHT + 60;

        this.ctx.fillStyle = this.getTextColor();
        this.ctx.font = FONT_CONFIG.TITLE;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        
        const titleText = (title || '').toUpperCase();
        const maxTitleWidth = WIDTH - (CANVAS_CONFIG.MARGINS.SIDE * 2);
        const titleLines = wrapText(this.ctx, titleText, maxTitleWidth);
        
        titleLines.forEach((line, index) => {
            this.ctx.fillText(line, CANVAS_CONFIG.MARGINS.SIDE, titleY + (index * 55));
        });

        return titleY + (titleLines.length * 55) + 10;
    }

    /**
     * Renderiza subtítulo (artista)
     */
    renderSubtitle(subtitle, startY) {
        const { WIDTH } = CANVAS_CONFIG;
        const subtitleY = startY ?? (CANVAS_CONFIG.PALETTE.START_Y + CANVAS_CONFIG.PALETTE.COLOR_HEIGHT + 60);

        this.ctx.fillStyle = this.getTextColor();
        this.ctx.font = FONT_CONFIG.SUBTITLE;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        
        const subtitleText = (subtitle || '').toUpperCase();
        const maxSubtitleWidth = WIDTH - (CANVAS_CONFIG.MARGINS.SIDE * 2);
        const subtitleLines = wrapText(this.ctx, subtitleText, maxSubtitleWidth);
        
        subtitleLines.forEach((line, index) => {
            this.ctx.fillText(line, CANVAS_CONFIG.MARGINS.SIDE, subtitleY + (index * 32));
        });
    }

    /**
     * Renderiza capa do álbum
     */
    async renderAlbumCover(albumCoverUrl) {
        const { WIDTH } = CANVAS_CONFIG;
        const { SIZE, BORDER_RADIUS, Y_POSITION } = CANVAS_CONFIG.COVER;
        const coverX = (WIDTH - SIZE) / 2;
        await this.drawRoundedImage(albumCoverUrl, coverX, Y_POSITION, SIZE, SIZE, BORDER_RADIUS);
    }

    /**
     * Renderiza Spotify Code
     */
    async renderSpotifyCode(spotifyCodeUrl) {
        const { WIDTH } = CANVAS_CONFIG;
        const { Y_POSITION, SIZE } = CANVAS_CONFIG.COVER;
        const { WIDTH: CODE_WIDTH, HEIGHT: CODE_HEIGHT, Y_OFFSET } = CANVAS_CONFIG.SPOTIFY_CODE;
        
        const codeY = Y_POSITION + SIZE + Y_OFFSET;
        const codeX = (WIDTH - CODE_WIDTH) / 2;
        
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        await this.drawImage(spotifyCodeUrl, codeX, codeY, CODE_WIDTH, CODE_HEIGHT);
        this.ctx.restore();
    }

    /**
     * Desenha imagem com cantos arredondados
     */
    async drawRoundedImage(src, x, y, width, height, radius) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.referrerPolicy = 'no-referrer';
            
            img.onload = () => {
                this.ctx.beginPath();
                this.ctx.moveTo(x + radius, y);
                this.ctx.lineTo(x + width - radius, y);
                this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
                this.ctx.lineTo(x + width, y + height - radius);
                this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
                this.ctx.lineTo(x + radius, y + height);
                this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
                this.ctx.lineTo(x, y + radius);
                this.ctx.quadraticCurveTo(x, y, x + radius, y);
                this.ctx.closePath();
                
                this.ctx.save();
                this.ctx.clip();
                this.ctx.drawImage(img, x, y, width, height);
                this.ctx.restore();
                
                resolve();
            };
            
            img.onerror = () => reject(new Error('Erro ao carregar capa'));
            img.src = src;
        });
    }

    /**
     * Desenha imagem simples
     */
    async drawImage(src, x, y, width, height) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.referrerPolicy = 'no-referrer';
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                this.ctx.drawImage(img, x, y, width, height);
   raticCurveTo(x + width, y + height, x + width - radius, y + height);
                this.ctx.lineTo(x + radius, y + height);
                this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
                this.ctx.lineTo(x, y + radius);
                this.ctx.quadraticCurveTo(x, y, x + radius, y);
                this.ctx.closePath();
                
                // Clipar e desenhar
                this.ctx.save();
                this.ctx.clip();
                this.ctx.drawImage(img, x, y, width, height);
                this.ctx.restore();
                
                resolve();
            };
            
            img.onerror = () => reject(new Error('Erro ao carregar capa'));
            img.src = src;
        });
    }

    /**
     * Desenha imagem simples
     * @param {string} src - URL da imagem
     * @param {number} x - Posição X
     * @param {number} y - Posição Y
     * @param {number} width - Largura
     * @param {number} height - Altura
     */
    async drawImage(src, x, y, width, height) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.referrerPolicy = 'no-referrer';
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                this.ctx.drawImage(img, x, y, width, height);
                resolve();
            };
            
            img.onerror = () => {
                // Se falhar ao carregar Spotify Code, apenas continua
                console.warn('Não foi possível carregar Spotify Code');
                resolve();
            };
            
            img.src = src;
        });
    }
}