// ===== RENDERIZADOR DE CANVAS =====

import { CANVAS_CONFIG, FONT_CONFIG, COLOR_CONFIG } from '../config.js';
import { wrapText } from '../utils/format-utils.js';

export class CanvasRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
    }

    /**
     * Renderiza o wallpaper completo
     * @param {Object} data - Dados da música/álbum
     */
    async renderWallpaper(data) {
        const { WIDTH, HEIGHT } = CANVAS_CONFIG;

        console.log(data);

        // Limpar e resetar estado do canvas
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
        this.ctx.fillStyle = COLOR_CONFIG.BACKGROUND;
        this.ctx.fillRect(0, 0, WIDTH, HEIGHT);

        // Renderizar elementos em ordem
        this.renderBackground(data);
        this.renderVignette();
        this.renderColorPalette(data.palette);
        this.renderDuration(data.durationText);
        this.renderTitle(data.trackTitle);
        this.renderSubtitle(data.subtitleText);
        await this.renderAlbumCover(data.albumCover);
        await this.renderSpotifyCode(data.spotifyCodeImageUrl);
    }

    /**
     * Renderiza fundo com gradiente
     * @param {Object} data - Dados com cor dominante
     */
    renderBackground(data) {
        const { WIDTH, HEIGHT } = CANVAS_CONFIG;
        
        const gradient = this.ctx.createLinearGradient(0, 0, 0, HEIGHT);
        gradient.addColorStop(0, COLOR_CONFIG.BACKGROUND);
        gradient.addColorStop(1, data.dominant);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }

    /**
     * Renderiza vinheta nas bordas
     */
    renderVignette() {
        const { WIDTH, HEIGHT } = CANVAS_CONFIG;
        
        const vignetteGradient = this.ctx.createRadialGradient(
            WIDTH/2, HEIGHT/2, 0, 
            WIDTH/2, HEIGHT/2, WIDTH * 0.8
        );
        vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignetteGradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
        this.ctx.fillStyle = vignetteGradient;
        this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }

    /**
     * Renderiza paleta de cores no topo esquerdo
     * @param {Array<string>} palette - Array de cores em hex
     */
    renderColorPalette(palette) {
        const { START_X, START_Y, COLOR_WIDTH, COLOR_HEIGHT, COLOR_GAP } = CANVAS_CONFIG.PALETTE;

        palette.slice(0, 5).forEach((color, index) => {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(
                START_X + (COLOR_WIDTH + COLOR_GAP) * index, 
                START_Y, 
                COLOR_WIDTH, 
                COLOR_HEIGHT
            );
        });
    }

    /**
     * Renderiza duração no topo direito
     * @param {string} durationText - Texto da duração
     */
    renderDuration(durationText) {
        const { WIDTH } = CANVAS_CONFIG;
        const { START_Y, COLOR_HEIGHT } = CANVAS_CONFIG.PALETTE;

        this.ctx.fillStyle = COLOR_CONFIG.TEXT;
        this.ctx.font = FONT_CONFIG.DURATION;
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(durationText, WIDTH - CANVAS_CONFIG.MARGINS.SIDE, START_Y + COLOR_HEIGHT/2);
    }

    /**
     * Renderiza título da música/álbum
     * @param {string} title - Título
     */
    renderTitle(title) {
        const { WIDTH } = CANVAS_CONFIG;
        const { START_Y, COLOR_HEIGHT } = CANVAS_CONFIG.PALETTE;
        const titleY = START_Y + COLOR_HEIGHT + 60;

        this.ctx.fillStyle = COLOR_CONFIG.TEXT;
        this.ctx.font = FONT_CONFIG.TITLE;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        
        const titleText = title.toUpperCase();
        const maxTitleWidth = WIDTH - (CANVAS_CONFIG.MARGINS.SIDE * 2);
        const titleLines = wrapText(this.ctx, titleText, maxTitleWidth);
        
        titleLines.forEach((line, index) => {
            this.ctx.fillText(line, CANVAS_CONFIG.MARGINS.SIDE, titleY + (index * 55));
        });

        // Retornar Y final para posicionar subtítulo
        return titleY + (titleLines.length * 55) + 10;
    }

    /**
     * Renderiza subtítulo (artista)
     * @param {string} subtitle - Subtítulo
     */
    renderSubtitle(subtitle) {
        const { WIDTH } = CANVAS_CONFIG;
        const { START_Y, COLOR_HEIGHT } = CANVAS_CONFIG.PALETTE;
        const titleY = START_Y + COLOR_HEIGHT + 60;
        
        // Calcular posição baseada no título
        this.ctx.font = FONT_CONFIG.TITLE;
        const titleText = subtitle.toUpperCase(); // Usar subtitle temporariamente para calcular
        const maxTitleWidth = WIDTH - (CANVAS_CONFIG.MARGINS.SIDE * 2);
        const titleLines = wrapText(this.ctx, titleText, maxTitleWidth);
        const subtitleY = titleY + (titleLines.length * 55) + 10;

        this.ctx.fillStyle = COLOR_CONFIG.TEXT;
        this.ctx.font = FONT_CONFIG.SUBTITLE;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        
        const subtitleText = subtitle.toUpperCase();
        const maxSubtitleWidth = WIDTH - (CANVAS_CONFIG.MARGINS.SIDE * 2);
        const subtitleLines = wrapText(this.ctx, subtitleText, maxSubtitleWidth);
        
        subtitleLines.forEach((line, index) => {
            this.ctx.fillText(line, CANVAS_CONFIG.MARGINS.SIDE, subtitleY + (index * 32));
        });
    }

    /**
     * Renderiza capa do álbum
     * @param {string} albumCoverUrl - URL da capa
     */
    async renderAlbumCover(albumCoverUrl) {
        const { WIDTH } = CANVAS_CONFIG;
        const { SIZE, BORDER_RADIUS, Y_POSITION } = CANVAS_CONFIG.COVER;
        
        const coverX = (WIDTH - SIZE) / 2;
        
        await this.drawRoundedImage(
            albumCoverUrl, 
            coverX, 
            Y_POSITION, 
            SIZE, 
            SIZE, 
            BORDER_RADIUS
        );
    }

    /**
     * Renderiza Spotify Code
     * @param {string} spotifyCodeUrl - URL do Spotify Code
     */
    async renderSpotifyCode(spotifyCodeUrl) {
        const { WIDTH } = CANVAS_CONFIG;
        const { Y_POSITION, SIZE } = CANVAS_CONFIG.COVER;
        const { WIDTH: CODE_WIDTH, HEIGHT: CODE_HEIGHT, Y_OFFSET } = CANVAS_CONFIG.SPOTIFY_CODE;
        
        const codeY = Y_POSITION + SIZE + Y_OFFSET;
        const codeX = (WIDTH - CODE_WIDTH) / 2;
        
        // Desenhar o Spotify Code sem o fundo preto usando composição 'screen'
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        await this.drawImage(spotifyCodeUrl, codeX, codeY, CODE_WIDTH, CODE_HEIGHT);
        this.ctx.restore();
    }

    /**
     * Desenha imagem com cantos arredondados
     * @param {string} src - URL da imagem
     * @param {number} x - Posição X
     * @param {number} y - Posição Y
     * @param {number} width - Largura
     * @param {number} height - Altura
     * @param {number} radius - Raio dos cantos
     */
    async drawRoundedImage(src, x, y, width, height, radius) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.referrerPolicy = 'no-referrer';
            
            img.onload = () => {
                // Criar path com cantos arredondados
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