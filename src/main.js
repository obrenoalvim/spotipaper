import './styles/main.css';
import { SpotifyWallpaperApp } from './js/app.js';

// Inicializar aplicação quando DOM estiver carregado
window.addEventListener('DOMContentLoaded', () => {
    window.spotifyApp = new SpotifyWallpaperApp();
});