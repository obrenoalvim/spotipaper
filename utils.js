// ===== UTILITÁRIOS GERAIS =====

/**
 * Gera uma string aleatória para PKCE
 * @param {number} length - Comprimento da string
 * @returns {string} String aleatória
 */
function generateRandomString(length) {
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
async function generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const base64String = btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    return base64String;
}

/**
 * Faz parse de URL do Spotify
 * @param {string} url - URL do Spotify
 * @returns {Object|null} Objeto com type e id ou null se inválida
 */
function parseSpotifyUrl(url) {
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
 * Converte milissegundos para texto formatado
 * @param {number} ms - Milissegundos
 * @returns {string} Texto formatado (ex: "3 MIN 45 S")
 */
function msToText(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes} MIN ${seconds.toString().padStart(2, '0')} S`;
}

/**
 * Extrai paleta de cores de uma imagem
 * @param {string} imgUrl - URL da imagem
 * @returns {Promise<Object>} Objeto com cor dominante e paleta
 */
async function extractPalette(imgUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
            try {
                const colorThief = new ColorThief();
                const dominantColor = colorThief.getColor(img);
                const palette = colorThief.getPalette(img, 5);
                
                const rgbToHex = (r, g, b) => `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
                
                resolve({
                    dominant: rgbToHex(...dominantColor),
                    palette: palette.map(color => rgbToHex(...color))
                });
            } catch (error) {
                reject(error);
            }
        };
        
        img.onerror = () => reject(new Error('Erro ao carregar imagem'));
        img.src = imgUrl;
    });
}

/**
 * Converte URL do Spotify (open.spotify.com) para spotify:URI
 * @param {string} input - URL do Spotify ou spotify:URI
 * @returns {string|null} spotify:URI ou null se inválido
 */
function toSpotifyUri(input) {
    if (!input) return null;
    if (input.startsWith('spotify:')) return input;
    const parsed = parseSpotifyUrl(input);
    if (!parsed) return null;
    return `spotify:${parsed.type}:${parsed.id}`;
}

/**
 * Gera URL do Spotify Code
 * @param {string} spotifyInput - URL do Spotify (open) ou spotify:URI
 * @returns {string} URL do Spotify Code
 */
function generateSpotifyCodeUrl(spotifyInput) {
    // ATENÇÃO: Verifique os termos de uso do Spotify Codes antes de usar em produção
    // Esta URL pode ser alterada pelo Spotify sem aviso prévio
    const spotifyUri = toSpotifyUri(spotifyInput);
    if (!spotifyUri) return '';
    const bgHex = '000000'; // fundo preto integra melhor no layout escuro
    const barColor = 'white';
    const size = 640; // tamanho base do asset
    const encodedUri = encodeURIComponent(spotifyUri);
    return `https://scannables.scdn.co/uri/plain/png/${bgHex}/${barColor}/${size}/${encodedUri}`;
}

/**
 * Quebra texto em múltiplas linhas baseado na largura máxima
 * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
 * @param {string} text - Texto para quebrar
 * @param {number} maxWidth - Largura máxima
 * @returns {Array<string>} Array de linhas
 */
function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
        const testLine = currentLine + words[i] + ' ';
        const testWidth = ctx.measureText(testLine).width;
        
        if (testWidth > maxWidth && currentLine !== '') {
            lines.push(currentLine.trim());
            currentLine = words[i] + ' ';
        } else {
            currentLine = testLine;
        }
    }
    
    if (currentLine.trim() !== '') {
        lines.push(currentLine.trim());
    }
    
    return lines;
}

// ===== UTILITÁRIOS DE UI =====

/**
 * Mostra/esconde indicador de loading
 * @param {boolean} show - Se deve mostrar o loading
 */
function showLoading(show) {
    const loading = document.getElementById('loading');
    const generateBtn = document.getElementById('generateBtn');
    
    if (show) {
        loading.classList.add('show');
        generateBtn.disabled = true;
    } else {
        loading.classList.remove('show');
        generateBtn.disabled = false;
    }
}

/**
 * Mostra mensagem de erro
 * @param {string} message - Mensagem de erro
 */
function showError(message) {
    const errorEl = document.getElementById('errorMessage');
    errorEl.textContent = message;
    errorEl.classList.add('show');
}

/**
 * Esconde mensagem de erro
 */
function hideError() {
    const errorEl = document.getElementById('errorMessage');
    errorEl.classList.remove('show');
}

/**
 * Atualiza os metadados na interface
 * @param {Object} data - Dados da música/álbum
 */
function updateMetadata(data) {
    document.getElementById('metaTitle').textContent = data.trackTitle;
    document.getElementById('metaArtist').textContent = data.subtitleText;
    document.getElementById('metaDuration').textContent = data.durationText;
    document.getElementById('metaColor').textContent = data.dominant;
    document.getElementById('metadata').style.display = 'block';
}

/**
 * Gera prompt para IA de imagens
 * @param {Object} data - Dados da música/álbum
 */
function generatePrompt(data) {
    const prompt = `Criar wallpaper minimalista para smartphone com as seguintes especificações:

**Dados da Música/Álbum:**
- Título: ${data.trackTitle}
- Artista: ${data.subtitleText}
- Duração: ${data.durationText}
- URL Spotify: ${data.spotifyUrl}

**Paleta de Cores:**
- Cor dominante: ${data.dominant}
- Cores da paleta: ${data.palette.join(', ')}

**Layout (1080×1920px):**
- Fundo: gradiente vertical do preto (#000000) no topo para ${data.dominant} no rodapé
- Topo esquerdo: 5 retângulos coloridos (56×20px, 8px de espaçamento) nas cores: ${data.palette.join(', ')}
- Topo direito: texto "${data.durationText}" em branco, caixa alta
- Centro-superior: título "${data.trackTitle.toUpperCase()}" em branco, fonte grande e bold
- Abaixo do título: subtítulo "${data.subtitleText.toUpperCase()}" em branco, fonte menor
- Centro: capa do álbum quadrada com cantos arredondados (24px de raio)
- Abaixo da capa: Spotify Code (código de barras do Spotify)

**URL da Capa:** ${data.albumCover}
**URL do Spotify Code:** ${data.spotifyCodeImageUrl}

**Estilo:** Layout minimalista, preciso, sem elementos extras, tipografia moderna Inter/system-ui, alto contraste, vinheta sutil nas bordas, margens laterais de 64px, espaçamentos proporcionais, resolução exata 1080×1920px.`;

    document.getElementById('promptTextarea').value = prompt;
    document.getElementById('promptSection').style.display = 'block';
}

/**
 * Faz download do wallpaper
 * @param {Object} currentTrackData - Dados da música atual
 */
function downloadWallpaper(currentTrackData) {
    if (!currentTrackData) return;
    
    const canvas = document.getElementById('canvas');
    const link = document.createElement('a');
    link.download = `spotify-wallpaper-${currentTrackData.trackTitle.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}