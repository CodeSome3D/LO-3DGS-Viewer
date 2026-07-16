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

        const counter =
            document.createElement("div");

        counter.id = "lo-tour-counter";
        counter.textContent = "0 / 0";

        const next =
            document.createElement("button");

        next.id = "lo-tour-next";
        next.className = "lo-tour-button";
        next.textContent = "›";

        controls.append(
            previous,
            counter,
            next
        );

        card.append(
            title,
            description,
            controls
        );

        document.body.appendChild(card);

        previous.onclick = e => {

            e.stopPropagation();

            this.lo.tourManager.previous();
        };

        next.onclick = e => {

            e.stopPropagation();

            this.lo.tourManager.next();
        };
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

        if (!hotspot) {

            card.classList.remove("visible");

            return;
        }

        const index =
            this.lo.hotspots.indexOf(hotspot);

        if (counter && index !== -1) {

            counter.textContent =
                `${index + 1} / ${this.lo.hotspots.length}`;
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