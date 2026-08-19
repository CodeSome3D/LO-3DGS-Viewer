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

        const title =
            document.createElement("div");

        title.id = "lo-tour-title";

        const description =
            document.createElement("div");

        description.id = "lo-tour-description";

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
            title,
            description,
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

        const title =
            document.getElementById("lo-tour-title");

        const description =
            document.getElementById(
                "lo-tour-description"
            );

        const counter =
            document.getElementById(
                "lo-tour-counter"
            );

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

            description.textContent =
                hotspot.description || "";

            title.style.display =
                hotspot.title?.trim()
                    ? ""
                    : "none";

            description.style.display =
                hotspot.description?.trim()
                    ? ""
                    : "none";

            card.classList.add("visible");

        }, 300);
    }
}