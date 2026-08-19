import { MediaHelper } from "./MediaHelper.js";

export class TourUIManager {

    constructor(lo) {
        this.lo = lo;
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

            card.classList.remove("visible");

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

        setTimeout(() => {

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