import { MediaHelper } from "./MediaHelper.js";

export class TourUIManager {

    constructor(lo) {
        this.lo = lo;
        this._lastDismissTime = 0;
        this._listenersAttached = false;
        this._updateTimer = null;
    }

    create() {

        if (document.getElementById("lo-tour-card")) {
            return;
        }

        const card =
            document.createElement("div");

        card.id = "lo-tour-card";

        const mediaContainer =
            document.createElement("div");

        mediaContainer.id = "lo-tour-media-container";

        const title =
            document.createElement("div");

        title.id = "lo-tour-title";

        const description =
            document.createElement("div");

        description.id = "lo-tour-description";

        const ctaContainer =
            document.createElement("div");

        ctaContainer.id = "lo-tour-cta-container";

        const ctaButton =
            document.createElement("a");

        ctaButton.id = "lo-tour-cta";
        ctaButton.className = "lo-tour-cta-button";
        ctaButton.target = "_blank";
        ctaButton.rel = "noopener noreferrer";

        ctaContainer.appendChild(ctaButton);

        const controls =
            document.createElement("div");

        controls.id = "lo-tour-controls";

        const previous =
            document.createElement("button");

        previous.id = "lo-tour-previous";
        previous.className = "lo-tour-button";
        previous.textContent = "‹";
        previous.title = "Previous Hotspot";

        const playBtn =
            document.createElement("button");

        playBtn.id = "lo-tour-play";
        playBtn.className = "lo-tour-play-button";
        playBtn.textContent = "▶";
        playBtn.title = "Play Tour";

        const counter =
            document.createElement("div");

        counter.id = "lo-tour-counter";
        counter.textContent = "0 / 0";

        const next =
            document.createElement("button");

        next.id = "lo-tour-next";
        next.className = "lo-tour-button";
        next.textContent = "›";
        next.title = "Next Hotspot";

        controls.append(
            previous,
            playBtn,
            counter,
            next
        );

        const progressContainer =
            document.createElement("div");

        progressContainer.id = "lo-tour-progress-container";

        const progressBar =
            document.createElement("div");

        progressBar.id = "lo-tour-progress-bar";

        progressContainer.appendChild(progressBar);

        card.append(
            mediaContainer,
            title,
            description,
            ctaContainer,
            controls,
            progressContainer
        );

        document.body.appendChild(card);

        this.attachListeners();

        previous.onclick = e => {

            e.stopPropagation();

            this.lo.tourManager.previous();
        };

        playBtn.onclick = e => {

            e.stopPropagation();

            this.lo.tourManager.toggleAutoplay();
        };

        next.onclick = e => {

            e.stopPropagation();

            this.lo.tourManager.next();
        };
    }

    attachListeners() {
        if (this._listenersAttached) return;
        this._listenersAttached = true;

        let pointerDownPos = null;
        const dragThreshold = 8;

        const onPointerDown = e => {
            if (e.button !== undefined && e.button !== 0) return;
            pointerDownPos = { x: e.clientX, y: e.clientY };
        };

        const onPointerUp = e => {
            if (!pointerDownPos) return;
            const dx = e.clientX - pointerDownPos.x;
            const dy = e.clientY - pointerDownPos.y;
            pointerDownPos = null;

            // If user moved pointer beyond threshold, it's a drag (camera orbit / pan), not a click
            if (Math.hypot(dx, dy) > dragThreshold) {
                return;
            }

            // Only dismiss if the tour card is currently visible
            if (!this.isCardVisible()) {
                return;
            }

            const target = e.target;
            if (!target) return;

            // If clicked anywhere inside the card, don't dismiss
            if (target.closest("#lo-tour-card")) {
                return;
            }

            // If clicked on a hotspot marker, let hotspot click handler run
            if (target.closest(".lo-hotspot")) {
                return;
            }

            // If clicked on toolbar, sidebar, modal, or toast, don't dismiss
            if (
                target.closest("#lo-viewer-toolbar") ||
                target.closest("#lo-sidebar") ||
                target.closest(".lo-modal") ||
                target.closest(".lo-modal-backdrop") ||
                target.closest(".lo-toast") ||
                target.closest(".lo-context-menu")
            ) {
                return;
            }

            // Editor placement/move modes should not be interrupted
            if (this.lo.waitingForHotspotPick || this.lo.moveHotspotMode) {
                return;
            }

            // Click on free space!
            this.dismiss();
        };

        window.addEventListener("pointerdown", onPointerDown, { capture: true, passive: true });
        window.addEventListener("pointerup", onPointerUp, { capture: true, passive: true });

        window.addEventListener("keydown", e => {
            if (e.key === "Escape" && this.isCardVisible()) {
                this.dismiss();
            }
        });
    }

    isCardVisible() {
        const card = document.getElementById("lo-tour-card");
        return Boolean(card && card.classList.contains("visible"));
    }

    dismiss() {
        if (this._updateTimer) {
            clearTimeout(this._updateTimer);
            this._updateTimer = null;
        }

        const card = document.getElementById("lo-tour-card");
        if (!card) return false;

        const wasVisible = card.classList.contains("visible");
        card.classList.remove("visible");

        // Stop any media playing in container
        const mediaContainer = document.getElementById("lo-tour-media-container");
        if (mediaContainer) {
            mediaContainer.querySelectorAll("video").forEach(v => {
                try { v.pause(); } catch (_) {}
            });
            mediaContainer.querySelectorAll("audio").forEach(a => {
                try { a.pause(); } catch (_) {}
            });
            mediaContainer.querySelectorAll("iframe").forEach(iframe => {
                const src = iframe.src;
                iframe.src = "";
                iframe.src = src;
            });
        }

        if (this.lo.tourManager) {
            if (this.lo.tourManager.isPlaying) {
                this.lo.tourManager.pauseAutoplay(false);
            }
            this.lo.tourManager.currentHotspotIndex = -1;
        }

        this.lo.clearHotspotSelection?.();
        this._lastDismissTime = Date.now();
        return wasVisible;
    }

    setPlayState(isPlaying) {

        const playBtn =
            document.getElementById("lo-tour-play");

        const progressContainer =
            document.getElementById("lo-tour-progress-container");

        if (playBtn) {
            playBtn.textContent = isPlaying ? "⏸" : "▶";
            playBtn.classList.toggle("playing", isPlaying);
            playBtn.title = isPlaying ? "Pause Tour" : "Play Tour";
        }

        if (progressContainer) {
            progressContainer.classList.toggle("visible", isPlaying);
            if (!isPlaying) {
                this.setProgress(0);
            }
        }
    }

    setProgress(progress) {

        const progressBar =
            document.getElementById("lo-tour-progress-bar");

        if (progressBar) {
            const pct = Math.max(0, Math.min(100, Math.round(progress * 100)));
            progressBar.style.width = `${pct}%`;
        }
    }

    update(hotspot) {

        if (this._updateTimer) {
            clearTimeout(this._updateTimer);
            this._updateTimer = null;
        }

        const card =
            document.getElementById("lo-tour-card");

        const mediaContainer =
            document.getElementById("lo-tour-media-container");

        const title =
            document.getElementById("lo-tour-title");

        const description =
            document.getElementById("lo-tour-description");

        const ctaContainer =
            document.getElementById("lo-tour-cta-container");

        const ctaButton =
            document.getElementById("lo-tour-cta");

        const counter =
            document.getElementById("lo-tour-counter");

        if (
            !card ||
            !title ||
            !description
        ) {
            return;
        }

        if (!hotspot || hotspot.type === "portal") {
            this.dismiss();
            return;
        }

        const tourHotspots = (this.lo.hotspots || []).filter(h => h.type !== "portal");
        const index =
            tourHotspots.indexOf(hotspot);

        if (counter && index !== -1) {

            counter.textContent =
                `${index + 1} / ${tourHotspots.length}`;
        }

        card.classList.remove("visible");

        this._updateTimer = setTimeout(() => {
            this._updateTimer = null;

            title.textContent =
                hotspot.title || "";

            title.style.display =
                hotspot.title?.trim()
                    ? ""
                    : "none";

            if (hotspot.description?.trim()) {
                description.innerHTML =
                    MediaHelper.parseMarkdown(hotspot.description);
                description.style.display = "";
            } else {
                description.innerHTML = "";
                description.style.display = "none";
            }

            const mediaHtml =
                MediaHelper.getMediaEmbedHTML(hotspot.mediaType, hotspot.mediaUrl);

            if (mediaContainer) {
                mediaContainer.innerHTML = mediaHtml;
                mediaContainer.classList.toggle("has-media", Boolean(mediaHtml));
            }

            if (ctaContainer && ctaButton) {
                const hasCta = Boolean(hotspot.actionButton?.label?.trim() && hotspot.actionButton?.url?.trim());
                if (hasCta) {
                    ctaButton.textContent = hotspot.actionButton.label.trim();
                    ctaButton.href = hotspot.actionButton.url.trim();
                    ctaContainer.classList.add("visible");
                } else {
                    ctaContainer.classList.remove("visible");
                }
            }

            card.classList.add("visible");

        }, 300);
    }
}