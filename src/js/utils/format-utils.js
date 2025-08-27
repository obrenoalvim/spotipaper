// ===== UTILITÁRIOS DE FORMATAÇÃO =====

/**
 * Converte milissegundos para texto formatado
 * @param {number} ms - Milissegundos
 * @returns {string} Texto formatado (ex: "3 MIN 45 S")
 */
export function msToText(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes} MIN ${seconds.toString().padStart(2, '0')} S`;
}

/**
 * Quebra texto em múltiplas linhas baseado na largura máxima
 * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
 * @param {string} text - Texto para quebrar
 * @param {number} maxWidth - Largura máxima
 * @returns {Array<string>} Array de linhas
 */
export function wrapText(ctx, text, maxWidth) {
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