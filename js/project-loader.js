import { Serializer } from './Serializer.js';

const url = new URL(location.href);

function createImage(url) {
    const img = new Image();
    img.src = url;
    return img;
}

export function createViewerConfig(contentUrl) {

    const posterUrl = url.searchParams.get('poster');
    const skyboxUrl = url.searchParams.get('skybox');
    const collisionUrl =
        url.searchParams.get('collision') ??
        url.searchParams.get('voxel');

    const renderer =
        url.searchParams.has('webgl')
            ? 'webgl'
            : 'webgpu';

    const budgetParam = url.searchParams.get('budget');
    const budget =
        budgetParam !== null
            ? Number(budgetParam)
            : undefined;

    return {

        poster: posterUrl && createImage(posterUrl),
        skyboxUrl,
        collisionUrl,

        contentUrl,

        contents: fetch("index.sog"),

        noui: url.searchParams.has("noui"),
        noanim: url.searchParams.has("noanim"),
        nofx: url.searchParams.has("nofx"),

        hpr: url.searchParams.has("hpr")
            ? ["", "1", "true", "enable"].includes(url.searchParams.get("hpr"))
            : undefined,

        ministats: url.searchParams.has("ministats"),
        colorize: url.searchParams.has("colorize"),
        renderer,
        aa: url.searchParams.has("aa"),
        budget,
        heatmap: url.searchParams.has("heatmap"),
        fullload: url.searchParams.has("fullload"),
        debug: url.searchParams.has("debug")
    };

}

export async function loadViewerProject() {

    const projectUrl = url.searchParams.get("project");

    let project = null;

    if (projectUrl) {

        const response = await fetch(projectUrl);

        if (!response.ok) {
            throw new Error(`Failed to load project: ${projectUrl}`);
        }

        const serializer = new Serializer();
        const projectText = await response.text();
        project = serializer.import(projectText);
    }

    window.project = project;

    const contentUrl =
        project?.project?.scene ??
        project?.scene ??
        url.searchParams.get("scene") ??
        url.searchParams.get("content") ??
        "./scene.sog";

    return createViewerConfig(contentUrl);

}