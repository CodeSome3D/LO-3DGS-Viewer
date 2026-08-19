export const MediaHelper = {

    escapeHtml(str) {
        if (!str || typeof str !== "string") return "";
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },

    parseMarkdown(text) {
        if (!text || typeof text !== "string") return "";

        let html = this.escapeHtml(text);

        // Headers: ### Header, ## Header, # Header
        html = html.replace(/^### (.*$)/gim, '<h4 class="lo-md-h4">$1</h4>');
        html = html.replace(/^## (.*$)/gim, '<h3 class="lo-md-h3">$1</h3>');
        html = html.replace(/^# (.*$)/gim, '<h2 class="lo-md-h2">$1</h2>');

        // Bold: **text** or __text__
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

        // Italic: *text* or _text_
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/_(.*?)_/g, '<em>$1</em>');

        // Links: [text](url)
        html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="lo-md-link">$1 ↗</a>');

        // Inline Code: `code`
        html = html.replace(/`([^`]+)`/g, '<code class="lo-md-code">$1</code>');

        // Bullet lists: - item or * item
        html = html.replace(/^\s*[-*]\s+(.*)$/gim, '<li class="lo-md-li">$1</li>');
        html = html.replace(/(<li.*<\/li>)/gims, '<ul class="lo-md-ul">$1</ul>');

        // Line breaks (convert \n to <br>, but avoid double br after headings or list items)
        html = html.replace(/\n/g, '<br>');
        html = html.replace(/(<\/h[234]>|<ul.*<\/ul>)<br>/g, '$1');

        return html;
    },

    getYouTubeVideoId(url) {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    },

    getVimeoVideoId(url) {
        if (!url) return null;
        const regExp = /(?:vimeo)\.com.*(?:videos\/|groups\/[^\/]*\/videos\/|channels\/[^\/]*\/|video\/|)(\d+)/;
        const match = url.match(regExp);
        return match ? match[1] : null;
    },

    getMediaEmbedHTML(mediaType, mediaUrl) {
        if (!mediaType || mediaType === "none" || !mediaUrl || !mediaUrl.trim()) {
            return "";
        }

        const url = mediaUrl.trim();

        // 1. Image
        if (mediaType === "image") {
            return `
                <div class="lo-tour-media-frame lo-tour-media-image-frame">
                    <img src="${this.escapeHtml(url)}" alt="Hotspot Media" class="lo-tour-media-img" loading="lazy">
                </div>
            `;
        }

        // 2. Video
        if (mediaType === "video") {
            const ytId = this.getYouTubeVideoId(url);
            if (ytId) {
                return `
                    <div class="lo-tour-media-frame lo-tour-media-video-frame">
                        <iframe 
                            src="https://www.youtube-nocookie.com/embed/${ytId}?rel=0" 
                            title="YouTube video" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                        </iframe>
                    </div>
                `;
            }

            const vimeoId = this.getVimeoVideoId(url);
            if (vimeoId) {
                return `
                    <div class="lo-tour-media-frame lo-tour-media-video-frame">
                        <iframe 
                            src="https://player.vimeo.com/video/${vimeoId}" 
                            title="Vimeo video" 
                            frameborder="0" 
                            allow="autoplay; fullscreen; picture-in-picture" 
                            allowfullscreen>
                        </iframe>
                    </div>
                `;
            }

            // Direct MP4 / WebM / Video file
            return `
                <div class="lo-tour-media-frame lo-tour-media-video-frame">
                    <video controls src="${this.escapeHtml(url)}" class="lo-tour-media-video" preload="metadata"></video>
                </div>
            `;
        }

        // 3. Audio
        if (mediaType === "audio") {
            return `
                <div class="lo-tour-media-frame lo-tour-media-audio-frame">
                    <audio controls src="${this.escapeHtml(url)}" class="lo-tour-media-audio" preload="metadata"></audio>
                </div>
            `;
        }

        return "";
    }
};
