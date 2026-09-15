import { ZipBuilder } from "./ZipBuilder.js";

export class ExportManager {

    constructor(lo) {
        this.lo = lo;
    }

    async exportStandaloneZip(progressCallback = null) {
        const updateProgress = (pct, msg) => {
            if (progressCallback) progressCallback(pct, msg);
            if (this.lo.uiManager?.showToast) {
                this.lo.uiManager.showToast(`📦 ${msg} (${pct}%)`);
            }
        };

        try {
            updateProgress(5, "Preparing standalone bundle...");
            const zip = new ZipBuilder();

            // 1. Export current project JSON
            const projectJson = this.lo.projectManager.export();
            const projectObj = JSON.parse(projectJson);
            const projectName = (this.lo.projectcard.name || "project").replace(/[^a-zA-Z0-9_\-]/g, "_");

            zip.addFile("project.json", projectJson);

            // 2. Fetch and add 3DGS splat model
            const splatUrl = this.lo.currentLoadedSplatUrl || this.lo.projectcard.scene;
            let bundledSplatName = "model.sog";

            if (splatUrl && !splatUrl.startsWith("blob:")) {
                updateProgress(20, "Packaging 3DGS model...");
                try {
                    const splatRes = await fetch(splatUrl);
                    if (splatRes.ok) {
                        const splatBuf = await splatRes.arrayBuffer();
                        const splatFilename = splatUrl.split("/").pop() || "model.sog";
                        bundledSplatName = splatFilename;
                        zip.addFile(bundledSplatName, new Uint8Array(splatBuf));
                    }
                } catch (e) {
                    console.warn("[ExportManager] Could not package splat model file:", e);
                }
            }

            // 3. Static engine assets to package
            const staticFiles = [
                "index.js",
                "index.css",
                "lightorigin.js",
                "lightorigin.css",
                "settings.json",
                "logo_LO.png",
                "logo_LO_dark.png",
                "logo_LO_hor.png",
                "logo_LO_hor_dark.png",
                "js/LightOrigin.js",
                "js/CameraManager.js",
                "js/HotspotManager.js",
                "js/ProjectManager.js",
                "js/Serializer.js",
                "js/UIManager.js",
                "js/PickingManager.js",
                "js/BackgroundManager.js",
                "js/TourManager.js",
                "js/TourUIManager.js",
                "js/IconLibrary.js",
                "js/MediaHelper.js",
                "js/ZipBuilder.js",
                "js/ExportManager.js",
                "js/EmbedManager.js",
                "js/QRCodeGenerator.js",
                "js/XRManager.js"
            ];

            let loadedCount = 0;
            for (const filePath of staticFiles) {
                try {
                    const res = await fetch(`./${filePath}`);
                    if (res.ok) {
                        const contentType = res.headers.get("content-type") || "";
                        if (filePath.endsWith(".png") || filePath.endsWith(".jpg") || filePath.endsWith(".webp") || filePath.endsWith(".sog") || filePath.endsWith(".ply")) {
                            const buf = await res.arrayBuffer();
                            zip.addFile(filePath, new Uint8Array(buf));
                        } else {
                            const text = await res.text();
                            zip.addFile(filePath, text);
                        }
                    }
                } catch (err) {
                    console.warn(`[ExportManager] Failed to fetch static file ${filePath}:`, err);
                }
                loadedCount++;
                const p = Math.round(20 + (loadedCount / staticFiles.length) * 60);
                updateProgress(p, `Packaging assets (${loadedCount}/${staticFiles.length})...`);
            }

            // 4. Standalone tailored index.html
            const standaloneHtml = `<!DOCTYPE html>
<html lang="en">
    <head>
        <title>${projectObj.project?.name || "3DGS Virtual Tour"}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
        <link rel="stylesheet" href="./index.css">
        <link rel="stylesheet" href="./lightorigin.css">
        <script>
            window.__LO_PROJECT_URL__ = './project.json';
        </script>
        <script type="module">
            const url = new URL(location.href);
            const isWebGL = url.searchParams.has('webgl');
            const renderer = isWebGL ? 'webgl' : 'webgpu';

            function createSseConfig() {
                return {
                    contentUrl: "./${bundledSplatName}",
                    contents: fetch("./${bundledSplatName}"),
                    noui: true,
                    renderer,
                    budget: undefined
                };
            }

            window.sse = {
                config: createSseConfig(),
                settings: fetch('./settings.json').then(r => r.json()).catch(() => ({}))
            };

            import { main } from './index.js';

            document.addEventListener('DOMContentLoaded', async () => {
                const canvas = document.getElementById('application-canvas');
                const settingsJson = await window.sse.settings;
                window.viewer = await main(canvas, settingsJson, window.sse.config);
            });
        </script>
    </head>
    <body>
        <div id="lightorigin-logo" style="display: none;">
            <img alt="Logo">
        </div>
        <canvas id="application-canvas"></canvas>

        <div id="ui">
            <div id="poster"></div>
            <div id="loadingText"></div>
            <div id="loadingBar"></div>
        </div>

        <script type="module" src="./lightorigin.js"></script>
    </body>
</html>`;

            zip.addFile("index.html", standaloneHtml);

            // 5. Generate ZIP Blob and trigger download
            updateProgress(90, "Compressing ZIP archive...");
            const zipBlob = await zip.buildBlob();

            updateProgress(100, "Download starting!");

            const downloadUrl = URL.createObjectURL(zipBlob);
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = `${projectName}_standalone.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);

            if (this.lo.uiManager?.showToast) {
                this.lo.uiManager.showToast(`✓ Standalone bundle exported: ${projectName}_standalone.zip`);
            }

            return zipBlob;
        } catch (error) {
            console.error("[ExportManager] Standalone export failed:", error);
            if (this.lo.uiManager?.showToast) {
                this.lo.uiManager.showToast(`❌ Export failed: ${error.message}`);
            }
            throw error;
        }
    }
}
