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
        loading.setAttribute('aria-hidden', 'false');
        generateBtn.disabled = true;
        generateBtn.setAttribute('aria-busy', 'true');
    } else {
        loading.classList.remove('show');
        loading.setAttribute('aria-hidden', 'true');
        generateBtn.disabled = false;
        generateBtn.setAttribute('aria-busy', 'false');
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
    errorEl.textContent = '';
}

/**
 * Atualiza os metadados na interface
 * @param {Object} data - Dados da música/álbum
 */
export function updateMetadata(data) {
    document.getElementById('metaTitle').textContent = data.trackTitle;
    document.getElementById('metaArtist').textContent = data.subtitleText;
    document.getElementById('metaDuration').textContent = data.durationText || '—';
    document.getElementById('metaColor').textContent = data.dominant;
    document.getElementById('metadata').style.display = 'block';
}

/**
 * Atualiza a seção de Prompt com base nos dados atuais
 * @param {Object} data - Dados do render atual
 */
// export function updatePromptSection(data) {
//     const promptSection = document.getElementById('promptSection');
//     const textarea = document.getElementById('promptTextarea');

//     if (!data) {
//         promptSection.style.display = 'none';
//         textarea.value = '';
//         return;
//     }

//     const { trackTitle, subtitleText, palette = [], dominant } = data;
//     const paletteText = palette.join(', ');

//     const prompt = [
//         `Minimalist smartphone wallpaper (1080x1920), dark theme, subtle vertical gradient blending black to ${dominant}.`,
//         `Centered square album cover with soft rounded corners, slight vignette around edges for depth.`,
//         `Clean typography for title and artist: "${trackTitle}" — ${subtitleText}.`,
//         `Use this color palette for accents and tones: ${paletteText}.`,
//         `High contrast, crisp, no watermark, no logos, photography style: studio, modern, Spotify-inspired.`
//     ].join(' ');

//     textarea.value = prompt;
//     promptSection.style.display = 'block';
// }

/**
 * Copia conteúdo do textarea do prompt para a área de transferência
 */
export async function copyPromptToClipboard() {
    const textarea = document.getElementById('promptTextarea');
    const btn = document.getElementById('copyPromptBtn');
    try {
        await navigator.clipboard.writeText(textarea.value || '');
        const original = btn.textContent;
        btn.textContent = 'Copiado!';
        setTimeout(() => (btn.textContent = original), 1500);
    } catch (e) {
        console.warn('Falha ao copiar:', e);
    }
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
