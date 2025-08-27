// ===== API SPOTIFY =====

import { SPOTIFY_CONFIG } from '../config.js';

export class SpotifyAPI {
    constructor(auth) {
        this.auth = auth;
    }

    /**
     * Faz chamada para API do Spotify
     * @param {string} endpoint - Endpoint da API
     * @returns {Promise<Object>} Resposta da API
     */
    async apiCall(endpoint) {
        if (!this.auth.isAuthenticated()) {
            throw new Error('Token de acesso não disponível');
        }

        const response = await fetch(`${SPOTIFY_CONFIG.API_BASE_URL}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${this.auth.getAccessToken()}`,
            },
        });

        if (response.status === 401) {
            // Token expirado
            this.auth.logout();
            throw new Error('Token expirado. Faça login novamente.');
        }

        if (!response.ok) {
            throw new Error(`Erro da API: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Obtém dados de uma música
     * @param {string} trackId - ID da música
     * @returns {Promise<Object>} Dados da música
     */
    async getTrackData(trackId) {
        const data = await this.apiCall(`/tracks/${trackId}`);

        console.log('data', data)
        
        return {
            type: 'track',
            id: data.id,
            trackTitle: data.name,
            subtitleText: data.artists.map(artist => artist.name).join(', '),
            durationMs: data.duration_ms,
            albumCover: data.album.images[0]?.url,
            spotifyUrl: data.external_urls.spotify
        };
    }

    /**
     * Obtém dados de um álbum
     * @param {string} albumId - ID do álbum
     * @returns {Promise<Object>} Dados do álbum
     */
    async getAlbumData(albumId) {
        const albumData = await this.apiCall(`/albums/${albumId}`);
        
        // Obter todas as faixas do álbum (com paginação se necessário)
        let totalDurationMs = 0;
        let tracks = albumData.tracks.items;
        let nextUrl = albumData.tracks.next;
        
        // Somar duração das faixas da primeira página
        tracks.forEach(track => {
            totalDurationMs += track.duration_ms;
        });
        
        // Paginar se necessário
        while (nextUrl) {
            const response = await fetch(nextUrl, {
                headers: {
                    'Authorization': `Bearer ${this.auth.getAccessToken()}`,
                },
            });
            const pageData = await response.json();
            
            pageData.items.forEach(track => {
                totalDurationMs += track.duration_ms;
            });
            
            nextUrl = pageData.next;
        }

        return {
            type: 'album',
            id: albumData.id,
            trackTitle: albumData.name,
            subtitleText: albumData.artists.map(artist => artist.name).join(', '),
            durationMs: totalDurationMs,
            albumCover: albumData.images[0]?.url,
            spotifyUrl: albumData.external_urls.spotify
        };
    }

    /**
     * Obtém dados via oEmbed (não requer autenticação)
     * @param {string} spotifyUrl - URL do Spotify
     * @returns {Promise<Object>} Dados básicos da música/álbum
     */
    async getOEmbedData(spotifyUrl) {
        const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(spotifyUrl)}`;
        const response = await fetch(oembedUrl);
        
        if (!response.ok) {
            throw new Error('Erro ao obter dados via oEmbed');
        }
        
        return response.json();
    }
}