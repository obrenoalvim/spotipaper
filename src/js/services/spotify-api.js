
import { SPOTIFY_CONFIG } from '../config.js';

export class SpotifyAPI {
    constructor(auth) {
        this.auth = auth;
    }

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
                        this.auth.logout();
            throw new Error('Token expirado. Faça login novamente.');
        }

        if (!response.ok) {
            throw new Error(`Erro da API: ${response.status}`);
        }

        return response.json();
    }

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

        async getAlbumData(albumId) {
        const albumData = await this.apiCall(`/albums/${albumId}`);
        
                let totalDurationMs = 0;
        let tracks = albumData.tracks.items;
        let nextUrl = albumData.tracks.next;
        
                tracks.forEach(track => {
            totalDurationMs += track.duration_ms;
        });
        
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

        async getOEmbedData(spotifyUrl) {
        const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(spotifyUrl)}`;
        const response = await fetch(oembedUrl);
        
        if (!response.ok) {
            throw new Error('Erro ao obter dados via oEmbed');
        }
        
        return response.json();
    }
}