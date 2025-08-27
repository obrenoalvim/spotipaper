// ===== UTILITÁRIOS DE INTERFACE =====

/**
 * Mostra/esconde indicador de loading
 * @param {boolean} show - Se deve mostrar o loading
 */
export function showLoading(show) {
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
export function showError(message) {
    const errorEl = document.getElementById('errorMessage');
    errorEl.textContent = message;
    errorEl.classList.add('show');
}

/**
 * Esconde mensagem de erro
 */
export function hideError() {
    const errorEl = document.getElementById('errorMessage');
    errorEl.classList.remove('show');
}

/**
 * Atualiza os metadados na interface
 * @param {Object} data - Dados da música/álbum
 */
export function updateMetadata(data) {
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
export function generatePrompt(data) {
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
export function downloadWallpaper(currentTrackData) {
    if (!currentTrackData) return;
    
    const canvas = document.getElementById('canvas');
    const link = document.createElement('a');
    link.download = `spotify-wallpaper-${currentTrackData.trackTitle.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}