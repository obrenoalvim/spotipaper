

export function parseSpotifyUrl(url) {
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


export function toSpotifyUri(input) {
    if (!input) return null;
    if (input.startsWith('spotify:')) return input;
    const parsed = parseSpotifyUrl(input);
    if (!parsed) return null;
    return `spotify:${parsed.type}:${parsed.id}`;
}


export function generateSpotifyCodeUrl(spotifyInput) {
    const spotifyUri = toSpotifyUri(spotifyInput);
    if (!spotifyUri) return '';
    const bgHex = '000000';
    const barColor = 'white';
    const size = 640;
    const encodedUri = encodeURIComponent(spotifyUri);
    return `https://scannables.scdn.co/uri/plain/png/${bgHex}/${barColor}/${size}/${encodedUri}`;
}