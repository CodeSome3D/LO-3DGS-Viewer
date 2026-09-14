import { QRCodeGenerator } from "./QRCodeGenerator.js";

export class EmbedManager {

    constructor(lo) {
        this.lo = lo;
        this.options = {
            width: "100%",
            height: "600px",
            aspectRatio: "16/9",
            responsive: true,
            autospin: false,
            autoplay: false,
            noui: false,
            theme: "dark"
        };
    }

    getProjectSlug() {
        const urlParams = new URLSearchParams(window.location.search);
        let projectSlug = urlParams.get("project");
        if (!projectSlug && this.lo.projectcard.name) {
            projectSlug = this.lo.projectcard.name.replace(/[^a-zA-Z0-9_\-]/g, "_");
        }
        return projectSlug || "project";
    }

    getDirectViewerUrl() {
        const base = window.location.origin + window.location.pathname;
        const params = new URLSearchParams();
        params.set("mode", "viewer");
        params.set("project", this.getProjectSlug());

        if (this.options.autospin) {
            params.set("autospin", "true");
        }
        if (this.options.autoplay) {
            params.set("autoplay", "true");
        }
        if (this.options.noui) {
            params.set("noui", "true");
        }
        if (this.options.theme && this.options.theme !== "dark") {
            params.set("theme", this.options.theme);
        }

        return `${base}?${params.toString()}`;
    }

    getIframeSnippet() {
        const src = this.getDirectViewerUrl();
        if (this.options.responsive) {
            return `<div style="position:relative;width:100%;padding-top:56.25%;overflow:hidden;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.5);">
    <iframe src="${src}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="fullscreen; xr-spatial-tracking; accelerometer; gyroscope" allowfullscreen></iframe>
</div>`;
        }

        return `<iframe src="${src}" width="${this.options.width}" height="${this.options.height}" frameborder="0" style="border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.5);" allow="fullscreen; xr-spatial-tracking; accelerometer; gyroscope" allowfullscreen></iframe>`;
    }

    openModal() {
        let modal = document.getElementById("lo-embed-modal");
        if (!modal) {
            modal = this.createModalElement();
            document.body.appendChild(modal);
        }

        this.updateModalContent();
        modal.classList.add("active");
    }

    closeModal() {
        const modal = document.getElementById("lo-embed-modal");
        if (modal) {
            modal.classList.remove("active");
        }
    }

    createModalElement() {
        const modal = document.createElement("div");
        modal.id = "lo-embed-modal";
        modal.className = "lo-modal-backdrop";

        modal.innerHTML = `
            <div class="lo-modal-card">
                <div class="lo-modal-header">
                    <div class="lo-modal-title">
                        <span>🔗</span> Share & Embed Tour
                    </div>
                    <button id="lo-embed-close" class="lo-modal-close-btn" title="Close">✕</button>
                </div>

                <div class="lo-modal-body">
                    <!-- Direct Shareable Link -->
                    <div class="lo-embed-section">
                        <label class="lo-embed-label">Direct Viewer Link</label>
                        <div class="lo-embed-input-row">
                            <input id="lo-embed-direct-url" type="text" readonly class="lo-embed-input">
                            <button id="lo-copy-link-btn" class="lo-button lo-embed-copy-btn">📋 Copy Link</button>
                        </div>
                    </div>

                    <!-- QR Code Mobile Quick-Scan Section -->
                    <div class="lo-embed-section">
                        <div class="lo-embed-qr-container">
                            <div id="lo-embed-qr-code" class="lo-embed-qr-box"></div>
                            <div class="lo-embed-qr-info">
                                <label class="lo-embed-label">📱 Scan with Phone</label>
                                <div style="font-size:12px;opacity:0.75;line-height:1.4;margin-bottom:8px;">
                                    Point your phone camera at this QR code to launch the 3D tour instantly on mobile.
                                </div>
                                <button id="lo-download-qr-btn" class="lo-button lo-embed-copy-btn" style="width:auto;margin:0;padding:6px 14px;font-size:12px;">
                                    💾 Download QR (.svg)
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Embed Options Toggles -->
                    <div class="lo-embed-section">
                        <label class="lo-embed-label">Embed Customization</label>
                        <div class="lo-embed-grid">
                            <label class="lo-checkbox-label">
                                <input id="lo-embed-opt-responsive" type="checkbox" checked>
                                Responsive 16:9 Aspect Ratio
                            </label>
                            <label class="lo-checkbox-label">
                                <input id="lo-embed-opt-autospin" type="checkbox">
                                Autospin Camera on Load
                            </label>
                            <label class="lo-checkbox-label">
                                <input id="lo-embed-opt-autoplay" type="checkbox">
                                Autoplay Guided Tour on Load
                            </label>
                            <label class="lo-checkbox-label">
                                <input id="lo-embed-opt-noui" type="checkbox">
                                Minimal UI Mode (Hide controls)
                            </label>
                        </div>
                    </div>

                    <!-- HTML Iframe Code Snippet -->
                    <div class="lo-embed-section">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                            <label class="lo-embed-label" style="margin-bottom:0;">HTML Embed Code (&lt;iframe&gt;)</label>
                            <button id="lo-copy-snippet-btn" class="lo-button lo-embed-copy-btn" style="width:auto;margin:0;padding:6px 14px;font-size:12px;">📋 Copy Code</button>
                        </div>
                        <textarea id="lo-embed-snippet" readonly rows="4" class="lo-embed-textarea"></textarea>
                    </div>

                    <!-- Quick Standalone ZIP Download Button -->
                    <div class="lo-embed-section" style="border-top:1px solid rgba(255,255,255,0.12);padding-top:14px;display:flex;justify-content:space-between;align-items:center;">
                        <div>
                            <strong style="font-size:13px;color:#fff;">Self-Hosted Package</strong>
                            <div style="font-size:11.5px;opacity:0.65;margin-top:2px;">Export complete standalone offline web package</div>
                        </div>
                        <button id="lo-modal-export-zip-btn" class="lo-button" style="width:auto;margin:0;background:rgba(34,199,184,0.18);border-color:var(--lo-accent,#22C7B8);color:#fff;">
                            📦 Export .zip
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Prevent 3D canvas from receiving pointer events through the modal.
        // NOTE: Do NOT stop touchmove on the card — that would break the modal's own scroll.
        const card = modal.querySelector(".lo-modal-card");
        if (card) {
            card.addEventListener("pointerdown", (e) => e.stopPropagation());
            card.addEventListener("touchstart", (e) => e.stopPropagation(), { passive: true });
        }

        // Block canvas orbit-control from starting when the user touches the backdrop.
        modal.addEventListener("touchstart", (e) => {
            e.preventDefault();  // Blocks synthesized pointer events to canvas
            e.stopPropagation();
        }, { passive: false });
        modal.addEventListener("touchmove", (e) => {
            // Allow touchmove to propagate within modal (for scrolling body),
            // but prevent it from reaching the 3D canvas.
            e.stopPropagation();
        }, { passive: true });

        // Event listeners
        const closeBtn = modal.querySelector("#lo-embed-close");
        closeBtn.onclick = () => this.closeModal();

        // Close modal when tapping/clicking the backdrop (outside the card).
        // Use touchend for mobile because we call preventDefault on touchstart
        // (which blocks the synthesized click event on touch devices).
        modal.addEventListener("touchend", (e) => {
            if (e.target === modal) {
                e.preventDefault();
                this.closeModal();
            }
        }, { passive: false });
        modal.onclick = (e) => {
            if (e.target === modal) this.closeModal();
        };

        const copyLinkBtn = modal.querySelector("#lo-copy-link-btn");
        copyLinkBtn.onclick = async () => {
            const input = modal.querySelector("#lo-embed-direct-url");
            if (input) {
                await navigator.clipboard.writeText(input.value);
                copyLinkBtn.textContent = "✓ Copied!";
                if (this.lo.uiManager?.showToast) this.lo.uiManager.showToast("✓ Link copied to clipboard");
                setTimeout(() => { copyLinkBtn.textContent = "📋 Copy Link"; }, 2000);
            }
        };

        const copySnippetBtn = modal.querySelector("#lo-copy-snippet-btn");
        copySnippetBtn.onclick = async () => {
            const textarea = modal.querySelector("#lo-embed-snippet");
            if (textarea) {
                await navigator.clipboard.writeText(textarea.value);
                copySnippetBtn.textContent = "✓ Copied!";
                if (this.lo.uiManager?.showToast) this.lo.uiManager.showToast("✓ Iframe embed code copied to clipboard");
                setTimeout(() => { copySnippetBtn.textContent = "📋 Copy Code"; }, 2000);
            }
        };

        const downloadQrBtn = modal.querySelector("#lo-download-qr-btn");
        if (downloadQrBtn) {
            downloadQrBtn.onclick = () => {
                const url = this.getDirectViewerUrl();
                const svgContent = QRCodeGenerator.generateSVG(url, 400, 3);
                const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
                const dlUrl = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = dlUrl;
                a.download = `${this.getProjectSlug()}_qrcode.svg`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(dlUrl), 3000);
                if (this.lo.uiManager?.showToast) {
                    this.lo.uiManager.showToast("✓ QR Code downloaded");
                }
            };
        }

        const optResponsive = modal.querySelector("#lo-embed-opt-responsive");
        const optAutospin = modal.querySelector("#lo-embed-opt-autospin");
        const optAutoplay = modal.querySelector("#lo-embed-opt-autoplay");
        const optNoui = modal.querySelector("#lo-embed-opt-noui");

        const updateOptions = () => {
            this.options.responsive = optResponsive.checked;
            this.options.autospin = optAutospin.checked;
            this.options.autoplay = optAutoplay.checked;
            this.options.noui = optNoui.checked;
            this.updateModalContent();
        };

        optResponsive.onchange = updateOptions;
        optAutospin.onchange = updateOptions;
        optAutoplay.onchange = updateOptions;
        optNoui.onchange = updateOptions;

        const exportZipBtn = modal.querySelector("#lo-modal-export-zip-btn");
        exportZipBtn.onclick = () => {
            this.closeModal();
            this.lo.exportManager?.exportStandaloneZip();
        };

        return modal;
    }

    updateModalContent() {
        const modal = document.getElementById("lo-embed-modal");
        if (!modal) return;

        const directUrl = this.getDirectViewerUrl();
        const directUrlInput = modal.querySelector("#lo-embed-direct-url");
        const snippetTextarea = modal.querySelector("#lo-embed-snippet");
        const qrBox = modal.querySelector("#lo-embed-qr-code");

        if (directUrlInput) directUrlInput.value = directUrl;
        if (snippetTextarea) snippetTextarea.value = this.getIframeSnippet();
        if (qrBox) qrBox.innerHTML = QRCodeGenerator.generateSVG(directUrl, 120, 2);
    }
}
