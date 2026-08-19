export class SettingsValidator {
    static getDefaultSettings() {
        return {
            version: 2,
            tonemapping: "none",
            highPrecisionRendering: false,
            background: {
                color: [0, 0, 0]
            },
            postEffectSettings: {
                sharpness: { enabled: false, amount: 0 },
                bloom: { enabled: false, intensity: 1, blurLevel: 2 },
                grading: { enabled: false, brightness: 1, contrast: 1, saturation: 1, tint: [1, 1, 1] },
                vignette: { enabled: false, intensity: 0.5, inner: 0.3, outer: 0.75, curvature: 1 },
                fringing: { enabled: false, intensity: 0.5 }
            },
            animTracks: [],
            cameras: [
                {
                    initial: {
                        position: [0, 0, 5],
                        target: [0, 0, 0],
                        fov: 75
                    }
                }
            ],
            annotations: [],
            startMode: "default"
        };
    }

    static validate(json) {
        if (!json || typeof json !== 'object') {
            return this.getDefaultSettings();
        }

        const defaults = this.getDefaultSettings();

        // Top level properties
        const validated = {
            version: typeof json.version === 'number' ? json.version : defaults.version,
            tonemapping: typeof json.tonemapping === 'string' ? json.tonemapping : defaults.tonemapping,
            highPrecisionRendering: typeof json.highPrecisionRendering === 'boolean' ? json.highPrecisionRendering : defaults.highPrecisionRendering,
            startMode: typeof json.startMode === 'string' ? json.startMode : defaults.startMode,
        };

        // Background
        validated.background = {
            color: (json.background?.color && Array.isArray(json.background.color) && json.background.color.length === 3) 
                ? json.background.color 
                : defaults.background.color
        };

        // Post effects
        const pe = json.postEffectSettings || {};
        validated.postEffectSettings = {
            sharpness: { ...defaults.postEffectSettings.sharpness, ...pe.sharpness },
            bloom: { ...defaults.postEffectSettings.bloom, ...pe.bloom },
            grading: { ...defaults.postEffectSettings.grading, ...pe.grading },
            vignette: { ...defaults.postEffectSettings.vignette, ...pe.vignette },
            fringing: { ...defaults.postEffectSettings.fringing, ...pe.fringing }
        };

        // Ensure array fields are actually arrays
        validated.animTracks = Array.isArray(json.animTracks) ? json.animTracks : defaults.animTracks;
        validated.annotations = Array.isArray(json.annotations) ? json.annotations : defaults.annotations;
        validated.cameras = Array.isArray(json.cameras) && json.cameras.length > 0 ? json.cameras : defaults.cameras;

        return validated;
    }
}
