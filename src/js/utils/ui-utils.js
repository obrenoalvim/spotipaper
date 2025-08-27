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