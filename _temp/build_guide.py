import os
import base64
import subprocess
import re

def get_base64_image(file_path):
    if not os.path.exists(file_path):
        return ""
    with open(file_path, "rb") as f:
        data = f.read()
    ext = os.path.splitext(file_path)[1].lower().replace(".", "")
    if ext == "svg":
        mime = "image/svg+xml"
    elif ext in ("jpg", "jpeg"):
        mime = "image/jpeg"
    elif ext == "png":
        mime = "image/png"
    elif ext == "webp":
        mime = "image/webp"
    else:
        mime = "image/png"
    return f"data:{mime};base64,{base64.b64encode(data).decode('ascii')}"

def build_pdf_guide():
    base_dir = r"c:\Egor\3DGS\WEB 3DGS\LO-3DGS-Viewer"
    logo_dark = get_base64_image(os.path.join(base_dir, "logo_LO_hor_dark.png"))
    
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Light Origin 3DGS Viewer &amp; Editor - User Guide</title>
    <style>
        @page {{
            size: A4 portrait;
            margin: 16mm 15mm 16mm 15mm;
            @bottom-right {{
                content: "Page " counter(page);
                font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
                font-size: 8.5pt;
                color: #64748b;
            }}
            @bottom-left {{
                content: "Light Origin 3DGS Viewer & Virtual Touring — User Guide";
                font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
                font-size: 8pt;
                color: #94a3b8;
            }}
        }}

        *, *::before, *::after {{
            box-sizing: border-box;
        }}

        body {{
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
            color: #1e293b;
            background: #ffffff;
            line-height: 1.45;
            font-size: 9.2pt;
            margin: 0;
            padding: 0;
        }}

        /* Print and page break controls */
        .page-break {{
            page-break-after: always;
            break-after: page;
        }}

        .avoid-break {{
            page-break-inside: avoid;
            break-inside: avoid;
        }}

        h1, h2, h3, h4 {{
            color: #0f172a;
            font-weight: bold;
            page-break-after: avoid;
            break-after: avoid;
        }}

        h1 {{
            font-size: 16pt;
            border-bottom: 2px solid #06b6d4;
            padding-bottom: 3px;
            margin-top: 10pt;
            margin-bottom: 6pt;
        }}

        h2 {{
            font-size: 11.5pt;
            border-left: 3.5px solid #0891b2;
            padding-left: 6px;
            margin-top: 9pt;
            margin-bottom: 3pt;
            color: #0e7490;
        }}

        h3 {{
            font-size: 9.8pt;
            margin-top: 7pt;
            margin-bottom: 2pt;
            color: #1e293b;
        }}

        p {{
            margin-top: 0;
            margin-bottom: 4pt;
            text-align: justify;
        }}

        ul, ol {{
            margin-top: 0;
            margin-bottom: 4pt;
            padding-left: 16px;
        }}

        li {{
            margin-bottom: 2pt;
        }}

        code {{
            font-family: "Consolas", "Courier New", monospace;
            background: #f1f5f9;
            color: #0369a1;
            padding: 1px 3.5px;
            border-radius: 3px;
            font-size: 8.2pt;
            border: 1px solid #e2e8f0;
        }}

        pre {{
            font-family: "Consolas", "Courier New", monospace;
            background: #0f172a;
            color: #e2e8f0;
            padding: 6px 10px;
            border-radius: 4px;
            font-size: 7.8pt;
            overflow-x: auto;
            margin: 4pt 0;
            line-height: 1.3;
            page-break-inside: avoid;
            break-inside: avoid;
        }}

        /* Cover Page */
        .cover-page {{
            min-height: 250mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            page-break-after: always;
            break-after: page;
            padding: 10mm 4mm 4mm 4mm;
        }}

        .cover-top {{
            text-align: left;
        }}

        .cover-logo {{
            height: 48px;
            margin-bottom: 24px;
            display: block;
        }}

        .cover-badge {{
            display: inline-block;
            background: #0891b2;
            color: #ffffff;
            padding: 3px 10px;
            border-radius: 16px;
            font-size: 8.5pt;
            font-weight: bold;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            margin-bottom: 12px;
        }}

        .cover-title {{
            font-size: 28pt;
            font-weight: bold;
            color: #0f172a;
            line-height: 1.15;
            margin: 0 0 10pt 0;
            letter-spacing: -0.5px;
        }}

        .cover-title span {{
            color: #0891b2;
        }}

        .cover-subtitle {{
            font-size: 11.5pt;
            color: #475569;
            margin: 0 0 18pt 0;
            font-weight: normal;
            line-height: 1.4;
        }}

        .cover-cards {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 10px;
            margin-bottom: 18px;
        }}

        .cover-card {{
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 10px 12px;
        }}

        .cover-card h4 {{
            margin: 0 0 3px 0;
            color: #0891b2;
            font-size: 9.8pt;
        }}

        .cover-card p {{
            margin: 0;
            font-size: 8.2pt;
            color: #475569;
            line-height: 1.35;
        }}

        .cover-footer {{
            border-top: 1px solid #e2e8f0;
            padding-top: 8pt;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            font-size: 8pt;
            color: #64748b;
        }}

        /* Table of Contents - Single Column Classic Layout */
        .toc-list {{
            list-style: none;
            padding: 0;
            margin: 6pt 0;
        }}

        .toc-item {{
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            padding: 1.8px 0;
            border-bottom: 1px dotted #cbd5e1;
            font-size: 8.4pt;
        }}

        .toc-item.level-1 {{
            font-weight: bold;
            font-size: 9pt;
            margin-top: 4.5pt;
            border-bottom: 1px solid #94a3b8;
            color: #0f172a;
        }}

        .toc-item.level-2 {{
            padding-left: 12px;
            color: #334155;
        }}

        .toc-link {{
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            width: 100%;
            color: inherit;
            text-decoration: none;
        }}

        .toc-link:hover {{
            color: #0891b2;
        }}

        /* Tables */
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 4pt 0 6pt 0;
            font-size: 8.2pt;
            page-break-inside: avoid;
            break-inside: avoid;
        }}

        th {{
            background: #0f172a;
            color: #ffffff;
            font-weight: bold;
            text-align: left;
            padding: 4px 6px;
            border: 1px solid #1e293b;
        }}

        td {{
            padding: 3.5px 6px;
            border: 1px solid #cbd5e1;
            vertical-align: top;
        }}

        tr:nth-child(even) td {{
            background: #f8fafc;
        }}

        /* Badges & Pills */
        .badge {{
            display: inline-block;
            padding: 1.5px 5px;
            border-radius: 3px;
            font-size: 7.2pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }}

        .badge-cyan {{ background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }}
        .badge-teal {{ background: #ccfbf1; color: #0f766e; border: 1px solid #99f6e4; }}
        .badge-amber {{ background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }}
        .badge-purple {{ background: #f3e8ff; color: #7e22ce; border: 1px solid #e9d5ff; }}
        .badge-rose {{ background: #ffe4e6; color: #be123c; border: 1px solid #fecdd3; }}
        .badge-slate {{ background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; }}

        /* Hotkey / Keyboard Key */
        .kbd {{
            display: inline-block;
            font-family: Arial, sans-serif;
            background: #ffffff;
            color: #0f172a;
            border: 1px solid #94a3b8;
            border-bottom: 2px solid #64748b;
            border-radius: 3px;
            padding: 0 4px;
            font-size: 7.5pt;
            font-weight: bold;
            box-shadow: 0 1px 2px rgba(0,0,0,0.06);
            margin: 0 1px;
        }}

        /* Callout / Alert Boxes */
        .callout {{
            border-radius: 4px;
            padding: 5px 8px;
            margin: 4pt 0;
            page-break-inside: avoid;
            break-inside: avoid;
            font-size: 8.3pt;
            line-height: 1.35;
        }}

        .callout-title {{
            font-weight: bold;
            margin-bottom: 2px;
            color: #0f172a;
        }}

        .callout-info {{ background: #f0f9ff; border-left: 3.5px solid #0284c7; color: #0369a1; }}
        .callout-tip {{ background: #f0fdf4; border-left: 3.5px solid #16a34a; color: #15803d; }}
        .callout-warning {{ background: #fffbeb; border-left: 3.5px solid #d97706; color: #b45309; }}
        .callout-important {{ background: #faf5ff; border-left: 3.5px solid #9333ea; color: #7e22ce; }}

        /* Feature Card Grid */
        .feature-grid {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6pt;
            margin: 5pt 0;
            page-break-inside: avoid;
            break-inside: avoid;
        }}

        .feature-box {{
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 5px;
            padding: 5px 7px;
        }}

        .feature-box-title {{
            font-size: 8.8pt;
            font-weight: bold;
            color: #0f172a;
            margin-bottom: 2pt;
        }}

        .feature-box p {{
            margin: 0;
            font-size: 8.2pt;
            color: #475569;
        }}

        /* Icons showcase grid using vector SVGs */
        .icon-grid {{
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 4.5pt;
            margin: 5pt 0 7pt 0;
            page-break-inside: avoid;
            break-inside: avoid;
        }}

        .icon-card {{
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 3.5px 5.5px;
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 7.8pt;
        }}

        .icon-svg-box {{
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 18px;
            height: 18px;
            background: #ffffff;
            border-radius: 3px;
            border: 1px solid #cbd5e1;
            color: #0891b2;
        }}

        .icon-number {{
            font-weight: bold;
            font-size: 8pt;
            color: #0891b2;
        }}

        /* Diagram Box */
        .diagram-container {{
            background: #0f172a;
            color: #e2e8f0;
            border-radius: 4px;
            padding: 5pt 8pt;
            margin: 5pt 0;
            font-size: 7.8pt;
            page-break-inside: avoid;
            break-inside: avoid;
        }}

        .diagram-title {{
            font-weight: bold;
            color: #38bdf8;
            margin-bottom: 2pt;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 7.8pt;
        }}
    </style>
</head>
<body>

    <!-- ==================== COVER PAGE (PAGE 1) ==================== -->
    <div class="cover-page">
        <div class="cover-top">
            <img class="cover-logo" src="{logo_dark}" alt="Light Origin">
            <div class="cover-badge">3D GAUSSIAN SPLATTING ENGINE • COMPREHENSIVE TECHNICAL MANUAL</div>
            <h1 class="cover-title">User Guide &amp; Reference<br><span>Editor &amp; Viewer</span></h1>
            <p class="cover-subtitle">Complete operating handbook for authoring, presenting, embedding, and navigating interactive 3D Gaussian Splatting digital twins, virtual tours, and spatial narratives.</p>

            <div class="cover-cards">
                <div class="cover-card">
                    <h4>Authoring in Editor Mode</h4>
                    <p>3D surface hotspot picking, multi-room portal linking, custom 360-degree backgrounds, camera view anchors, rich markdown, video/audio embeds, draft autosave, and standalone ZIP packaging.</p>
                </div>
                <div class="cover-card">
                    <h4>Presenting in Viewer Mode</h4>
                    <p>Clean presentation viewport, guided tour autoplay with countdown progress bar, responsive iframe embed code, vector QR quick-scan, and immersive WebXR / Mobile Gyroscope look controls.</p>
                </div>
            </div>
        </div>

        <div class="cover-footer">
            <div>
                <strong>Light Origin 3DGS Viewer System Documentation</strong><br>
                Engine: SuperSplat / PlayCanvas WebGPU &amp; WebGL Engine<br>
                Compatible Formats: <code>.sog</code> (SuperSplat Compressed), <code>.ply</code> (Standard 3DGS)
            </div>
            <div style="text-align: right;">
                <strong>Document Version:</strong> 2.0 (Official Release)<br>
                <strong>Date:</strong> 2026<br>
                <strong>Status:</strong> Production Ready
            </div>
        </div>
    </div>

    <!-- ==================== TABLE OF CONTENTS (PAGE 2) ==================== -->
    <div class="page-break">
        <h1 style="margin-top: 6pt; margin-bottom: 6pt;">Table of Contents</h1>
        
        <ul class="toc-list">
            <li class="toc-item level-1"><a class="toc-link" href="#sec1"><span>1. System Architecture &amp; Fundamentals</span> <span>Section 1</span></a></li>
            <li class="toc-item level-2"><a class="toc-link" href="#sec1-1"><span>1.1 What is Light Origin 3DGS Viewer?</span> <span>Overview</span></a></li>
            <li class="toc-item level-2"><a class="toc-link" href="#sec1-2"><span>1.2 Dual-Mode Architecture: Editor vs. Viewer</span> <span>Design</span></a></li>
            <li class="toc-item level-2"><a class="toc-link" href="#sec1-3"><span>1.3 Supported File Formats (.sog, .ply, .json, .zip)</span> <span>Formats</span></a></li>
            <li class="toc-item level-2"><a class="toc-link" href="#sec1-4"><span>1.4 Strict Naming Rule &amp; Assets Directory Structure</span> <span>Storage</span></a></li>

            <li class="toc-item level-1"><a class="toc-link" href="#sec2"><span>2. Quick Start Guide</span> <span>Section 2</span></a></li>
            <li class="toc-item level-2"><a class="toc-link" href="#sec2-1"><span>2.1 Launching the Application &amp; URL Modes</span> <span>Setup</span></a></li>
            <li class="toc-item level-2"><a class="toc-link" href="#sec2-2"><span>2.2 Loading 3D Gaussian Splats</span> <span>Import</span></a></li>
            <li class="toc-item level-2"><a class="toc-link" href="#sec2-3"><span>2.3 Step-by-Step: Creating Your First Tour</span> <span>Workflow</span></a></li>

            <li class="toc-item level-1"><a class="toc-link" href="#sec3"><span>3. Editor Mode — Complete Functional Reference</span> <span>Section 3</span></a></li>
            <li class="toc-item level-2"><a class="toc-link" href="#sec3-1"><span>3.1 Workspace Layout &amp; Header</span> <span>UI</span></a></li>
            <li class="toc-item level-2"><a class="toc-link" href="#sec3-2"><span>3.2 Project Identity &amp; Title Editing</span> <span>Metadata</span></a></li>
            <li class="toc-item level-2"><a class="toc-link" href="#sec3-3"><span>3.3 Environment &amp; Background Configurations</span> <span>Skybox</span></a></li>
            <li class="toc-item level-2"><a class="toc-link" href="#sec3-4"><span>3.4 Tour Playback Settings &amp; Step Dwell Times</span> <span>Pacing</span></a></li>
            <li class="toc-item level-2"><a class="toc-link" href="#sec3-5"><span>3.5 Viewer Logo &amp; Custom Brand Upload</span> <span>Branding</span></a></li>
            <li class="toc-item level-2"><a class="toc-link" href="#sec3-6"><span>3.6 Initial View &amp; Camera 0 Calibration</span> <span>Camera</span></a></li>
            <li class="toc-item level-2"><a class="toc-link" href="#sec3-7"><span>3.7 3DGS Model Upload &amp; Management</span> <span>Models</span></a></li>
            <li class="toc-item level-2"><a class="toc-link" href="#sec3-8"><span>3.8 Hotspot Authoring, Surface Picking &amp; Ordering</span> <span>Hotspots</span></a></li>
            <li class="toc-item level-2"><a class="toc-link" href="#sec3-9"><span>3.9 Hotspot Properties, Markdown &amp; Media Attachments</span> <span>Content</span></a></li>
            <li class="toc-item level-2"><a class="toc-link" href="#sec3-10"><span>3.10 Icon Library &amp; Custom Glyphs</span> <span>Icons</span></a></li>
            <li class="toc-item level-2"><a class="toc-link" href="#sec3-11"><span>3.11 Cross-Scene Portals (Virtual Touring &amp; Scene Swapping)</span> <span>Portals</span></a></li>
            <li class="toc-item level-2"><a class="toc-link" href="#sec3-12"><span>3.12 Project Actions, File Saving &amp; Draft Autosave</span> <span>Projects</span></a></li>
            <li class="toc-item level-2"><a class="toc-link" href="#sec3-13"><span>3.13 Standalone Offline Export (.zip Package)</span> <span>Export</span></a></li>
            <li class="toc-item level-2"><a class="toc-link" href="#sec3-14"><span>3.14 Share &amp; Embed Modal Generator</span> <span>Share</span></a></li>
            <li class="toc-item level-2"><a class="toc-link" href="#sec3-15"><span>3.15 Editor Color Themes (Dark, Light, Midnight, Earth)</span> <span>Themes</span></a></li>
            <li class="toc-item level-2"><a class="toc-link" href="#sec3-16"><span>3.16 Editor Keyboard Shortcuts Cheat Sheet</span> <span>Hotkeys</span></a></li>

            <li class="toc-item level-1"><a class="toc-link" href="#sec4"><span>4. Viewer Mode — Complete Functional Reference</span> <span>Section 4</span></a></li>
            <li class="toc-item level-2"><a class="toc-link" href="#sec4-1"><span>4.1 Presentation Interface &amp; Clean Layout</span> <span>Presentation</span></a></li>
            <li class="toc-item level-2"><a class="toc-link" href="#sec4-2"><span>4.2 Spatial Hotspot Markers &amp; Smooth Fly-To</span> <span>Interpolation</span></a></li>
            <li class="toc-item level-2"><a class="toc-link" href="#sec4-3"><span>4.3 Floating Tour Card, Step Navigation &amp; Rich Media</span> <span>Tour Card</span></a></li>
            <li class="toc-item level-2"><a class="toc-link" href="#sec4-4"><span>4.4 Guided Tour Autoplay &amp; Smart Interaction Pause</span> <span>Autoplay</span></a></li>
            <li class="toc-item level-2"><a class="toc-link" href="#sec4-5"><span>4.5 Top-Right Quick Action Toolbar</span> <span>Toolbar</span></a></li>
            <li class="toc-item level-2"><a class="toc-link" href="#sec4-6"><span>4.6 WebXR Immersive VR &amp; Smartphone Gyroscope Mode</span> <span>VR / Gyro</span></a></li>
            <li class="toc-item level-2"><a class="toc-link" href="#sec4-7"><span>4.7 Complete URL Query Parameters Dictionary</span> <span>URL API</span></a></li>

            <li class="toc-item level-1"><a class="toc-link" href="#sec5"><span>5. Deployment, Performance &amp; Best Practices</span> <span>Section 5</span></a></li>
            <li class="toc-item level-2"><a class="toc-link" href="#sec5-1"><span>5.1 Model Compression &amp; Performance Optimization</span> <span>Optimization</span></a></li>
            <li class="toc-item level-2"><a class="toc-link" href="#sec5-2"><span>5.2 Web Server MIME Types &amp; HTTPS Requirements</span> <span>Server</span></a></li>
            <li class="toc-item level-2"><a class="toc-link" href="#sec5-3"><span>5.3 Troubleshooting Guide</span> <span>Diagnostics</span></a></li>
        </ul>
    </div>

    <!-- ==================== CHAPTER 1 (PAGE 3) ==================== -->
    <div class="page-break">
        <h1 id="sec1" style="margin-top: 4pt;">1. System Architecture &amp; Fundamentals</h1>
        
        <h2 id="sec1-1">1.1 What is Light Origin 3DGS Viewer?</h2>
        <p><strong>Light Origin 3DGS Viewer</strong> is a state-of-the-art web application engineered for high-fidelity interactive visualization, digital twin exploration, and virtual touring of <strong>3D Gaussian Splats (3DGS)</strong>. Unlike traditional polygon meshes that rely on simplified triangles and baked texture maps, Gaussian Splatting reproduces volumetric radiance fields with photorealistic lighting, reflections, micro-details, and thin structures.</p>
        <p>Built upon the modern high-performance SuperSplat and PlayCanvas rendering cores, Light Origin 3DGS Viewer executes hardware-accelerated splat sorting and rasterization natively inside web browsers utilizing modern <strong>WebGPU</strong> with automatic fallback to <strong>WebGL</strong>.</p>

        <h2 id="sec1-2">1.2 Dual-Mode Architecture: Editor vs. Viewer</h2>
        <p>Light Origin 3DGS Viewer is architected with a unified codebase featuring two dedicated operational modes:</p>
        
        <div class="feature-grid">
            <div class="feature-box">
                <div class="feature-box-title">Editor Mode (Authoring)</div>
                <p>Designed for content creators, 3D artists, architects, and tour designers. Provides a comprehensive sidebar to set initial camera views, pick 3D surface points, anchor rich media hotspots, connect multi-room portals, configure 360-degree panoramas, customize branding, and export self-contained offline packages.</p>
            </div>
            <div class="feature-box">
                <div class="feature-box-title">Viewer Mode (Presentation)</div>
                <p>Designed for end-user audiences, public presentations, client showcases, and website embeds. Strips away editing panels in favor of a sleek, distraction-free view with interactive hotspots, guided autoplay, countdown progress, quick sharing, WebXR VR, and mobile gyroscope look controls.</p>
            </div>
        </div>

        <h2 id="sec1-3">1.3 Supported File Formats &amp; Standards</h2>
        <table class="avoid-break">
            <thead>
                <tr>
                    <th style="width: 18%;">Format</th>
                    <th style="width: 20%;">Type</th>
                    <th>Description &amp; Operational Capabilities</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><code>.sog</code></td>
                    <td><span class="badge badge-cyan">3DGS Splat</span></td>
                    <td><strong>SuperSplat Compressed Format</strong>. Highly compressed, streamable chunked format that delivers fast load times, lower memory consumption, and superior streaming performance over the web. (Highly Recommended).</td>
                </tr>
                <tr>
                    <td><code>.ply</code></td>
                    <td><span class="badge badge-teal">3DGS Splat</span></td>
                    <td><strong>Standard Polygon File Format</strong> containing 3D Gaussian splat parameters (positions, scale, rotation, spherical harmonics color, and opacity). Supported for direct import from NeRFstudio, Postshot, Luma, and 3DGS tools.</td>
                </tr>
                <tr>
                    <td><code>.json</code></td>
                    <td><span class="badge badge-amber">Project Data</span></td>
                    <td><strong>Light Origin 3DGS Viewer Scene Metadata</strong>. Serialized JSON configuration storing project title, background configurations, cameras, initial views, hotspot annotations, icon selections, rich media, and cross-scene portal targets.</td>
                </tr>
                <tr>
                    <td><code>.zip</code></td>
                    <td><span class="badge badge-purple">Standalone Bundle</span></td>
                    <td><strong>Self-Contained Offline Web Package</strong> generated via 1-click export. Bundles the project JSON, 3D model, JavaScript runtime, stylesheets, and index file for instant hosting anywhere without external dependencies.</td>
                </tr>
            </tbody>
        </table>

        <h2 id="sec1-4">1.4 Strict Naming Rule &amp; Assets Directory Structure</h2>
        
        <div class="callout callout-important avoid-break">
            <div class="callout-title">MANDATORY IDENTICAL NAMING RULE:</div>
            <strong>The project's directory and all project asset files MUST have exactly the same name.</strong><br>
            For any project (for example, named <code>villa</code>):
            <ul>
                <li>The folder must be named: <code>./projects/villa/</code></li>
                <li>The project metadata file must be named: <code>villa.json</code></li>
                <li>The 3D model file must be named: <code>villa.sog</code> (or <code>villa.ply</code>)</li>
            </ul>
            Both the directory and the files must share the exact same base name (e.g. <code>./projects/villa/villa.json</code> and <code>./projects/villa/villa.sog</code>). Inconsistent naming will prevent the loader from resolving the associated 3D model.
        </div>

        <div class="callout callout-info avoid-break">
            <div class="callout-title">GRAPHICAL ASSETS STORAGE: THE '/assets' DIRECTORY</div>
            <strong>All graphical assets MUST be stored inside the <code>/assets</code> folder.</strong><br>
            This includes static background images, 360-degree equirectangular panoramas, custom logos, textures, and local illustrations. In all project definitions and configurations, reference these files via the relative path <code>assets/&lt;filename&gt;</code> (for example: <code>assets/panorama.jpg</code> or <code>assets/client_logo.png</code>).
        </div>
    </div>

    <!-- ==================== CHAPTER 2 (PAGE 4) ==================== -->
    <div class="page-break">
        <h1 id="sec2" style="margin-top: 4pt;">2. Quick Start Guide</h1>

        <h2 id="sec2-1">2.1 Launching the Application &amp; URL Modes</h2>
        <p>The viewer is accessible through any standard modern web browser (Google Chrome, Microsoft Edge, Safari, Firefox, or Opera). The mode is governed directly by the URL parameters:</p>
        
        <ul>
            <li><strong>Editor Mode (Default):</strong> <code>http://localhost:8080/index.html</code> or <code>http://domain.com/?mode=editor</code><br>
            Opens the full authoring studio with the left sidebar enabled.</li>
            <li><strong>Viewer Mode:</strong> <code>http://localhost:8080/index.html?mode=viewer&amp;project=museum</code><br>
            Launches clean presentation mode for project <code>museum</code> with editing tools hidden.</li>
        </ul>

        <h2 id="sec2-2">2.2 Loading 3D Gaussian Splats</h2>
        <p>There are two primary methods to load a 3DGS model into the Editor:</p>
        <ol>
            <li><strong>Toolbar Upload:</strong> In the left sidebar, navigate to the <strong>3DGS Model</strong> section and click <span class="badge badge-cyan">Upload 3DGS</span>. Select your local <code>.sog</code> or <code>.ply</code> file.</li>
            <li><strong>Drag &amp; Drop:</strong> Drag any <code>.sog</code> or <code>.ply</code> file directly from your operating system file manager and drop it anywhere over the 3D viewport canvas.</li>
        </ol>

        <div class="callout callout-tip avoid-break">
            <div class="callout-title">PRO-TIP: PROJECT DIRECTORY SETUP</div>
            Always organize your projects in <code>./projects/&lt;project_name&gt;/</code> with identically named files (e.g. <code>./projects/villa/villa.json</code> and <code>./projects/villa/villa.sog</code>). When launching <code>?project=villa</code>, Light Origin 3DGS Viewer immediately pairs and loads the scene.
        </div>

        <h2 id="sec2-3">2.3 Step-by-Step: Creating Your First Tour</h2>
        <div class="diagram-container avoid-break">
            <div class="diagram-title">Workflow Pipeline: From Raw Splat to Published Virtual Tour</div>
            1. LOAD SPLAT &rarr; 2. FRAME INITIAL VIEW &rarr; 3. SET BACKGROUND &rarr; 4. ANCHOR HOTSPOTS &rarr; 5. LINK PORTALS &rarr; 6. EXPORT / SHARE
        </div>

        <ol>
            <li><strong>Set the Initial View:</strong> Rotate, pan, and zoom the camera until the scene is perfectly framed. In the left sidebar, click <strong>Set Initial View</strong>. This viewpoint becomes the opening vantage point when users load the tour.</li>
            <li><strong>Customize the Environment:</strong> In the <strong>Background</strong> section, select between Solid Color, Linear Gradient, 2D Image, or 360-degree Panorama. Make sure all images and panoramas are located in the <code>/assets</code> folder.</li>
            <li><strong>Add Hotspots:</strong> Click <strong>+ Add Hotspot</strong>. The cursor transforms into a crosshair. Click anywhere on the 3D geometry surface. A glowing marker is anchored at that exact 3D coordinate.</li>
            <li><strong>Configure Content:</strong> In the <strong>Properties</strong> panel, choose an icon from the built-in library, enter a Title, format a Rich Text description using Markdown, and optionally paste an image URL or YouTube video link.</li>
            <li><strong>Bind Camera Angles:</strong> Rotate your camera to the desired viewing angle for that hotspot, and click <strong>Update Camera</strong>. When users click this hotspot in Viewer mode, the camera will smoothly glide to this exact vantage point.</li>
            <li><strong>Share &amp; Export:</strong> Click <strong>Share &amp; Embed Tour</strong> for responsive iframe embed snippets and mobile QR codes, or click <strong>Export Standalone (.zip)</strong> for a completely offline self-hosted web package.</li>
        </ol>
    </div>

    <!-- ==================== CHAPTER 3 ==================== -->
    <div class="page-break">
        <h1 id="sec3" style="margin-top: 4pt;">3. Editor Mode — Complete Functional Reference</h1>

        <h2 id="sec3-1">3.1 Workspace Layout &amp; Header</h2>
        <p>The Editor interface is structured into two primary zones:</p>
        <ul>
            <li><strong>Left Sidebar (Authoring Panel):</strong> A collapsible vertical control deck containing project configuration cards, environment pickers, hotspot management lists, properties inspectors, and project actions.</li>
            <li><strong>3D Viewport:</strong> Full-window interactive WebGPU canvas rendering the splat cloud, spatial hotspot markers, real-time lighting, and background skybox.</li>
            <li><strong>Toast Notification System:</strong> Non-intrusive floating notifications at the top of the screen that confirm actions (e.g. <em>"Initial view set"</em>, <em>"Loading 3DGS: 45%"</em>, <em>"Project saved"</em>).</li>
        </ul>

        <h2 id="sec3-2">3.2 Project Identity &amp; Title Editing</h2>
        <p>At the top of the sidebar under the Light Origin 3DGS Viewer header, the project name is displayed. Click on the project name to activate the inline editor:</p>
        <ul>
            <li>Type the new name (e.g. <em>"Grand Architectural Hall"</em>).</li>
            <li>Press <span class="kbd">Enter</span> or click outside to commit the name.</li>
            <li>Press <span class="kbd">Esc</span> to cancel edits.</li>
            <li>This name is automatically used in the browser tab title, metadata exports, and generated zip package filenames.</li>
        </ul>

        <h2 id="sec3-3">3.3 Environment &amp; Background Configurations</h2>
        <p>Light Origin 3DGS Viewer provides 5 distinct background rendering modes accessible via the <strong>Type</strong> dropdown:</p>

        <table class="avoid-break">
            <thead>
                <tr>
                    <th style="width: 20%;">Mode</th>
                    <th style="width: 28%;">Controls</th>
                    <th>Behavior &amp; Best Use Cases</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Transparent</strong></td>
                    <td>None</td>
                    <td>Clears the background buffer entirely. Ideal when embedding the 3D model inside existing web pages, allowing the underlying website background or hero section to show through.</td>
                </tr>
                <tr>
                    <td><strong>Solid Color</strong></td>
                    <td>Hex Color Picker</td>
                    <td>Renders a uniform solid backdrop. Clean, professional look that focuses complete attention on the 3D splat object.</td>
                </tr>
                <tr>
                    <td><strong>Gradient</strong></td>
                    <td>Color 1, Color 2, Angle Slider (0°–360°)</td>
                    <td>Generates a sleek two-tone linear gradient. The dynamic angle slider allows directional lighting effects that match the dominant lighting in your 3D capture.</td>
                </tr>
                <tr>
                    <td><strong>2D Image</strong></td>
                    <td>Select Image Button</td>
                    <td>Loads a static backdrop image (JPG/PNG/WebP stored in <code>/assets</code>) positioned behind the 3D canvas with <code>cover</code> aspect ratio scaling.</td>
                </tr>
                <tr>
                    <td><strong>360° Panorama</strong></td>
                    <td>Select Panorama Button, Rotation Slider (-180° to +180°)</td>
                    <td>Mounts an equirectangular 360-degree spherical skybox (stored in <code>/assets</code>). As the user orbits the 3D camera, the panorama rotates synchronously. The horizontal rotation slider permits aligning the skybox lighting with the 3DGS splats.</td>
                </tr>
            </tbody>
        </table>

        <h2 id="sec3-4">3.4 Tour Playback Settings &amp; Step Dwell Times</h2>
        <p>Configures how the tour behaves upon opening in Viewer mode:</p>
        <ul>
            <li><strong>Autospin on load:</strong> When checked, the camera begins a slow, elegant 360-degree ambient orbit around the scene center upon loading. Pauses automatically whenever user interaction begins.</li>
            <li><strong>Autoplay tour on load:</strong> When checked, Viewer mode automatically starts the guided hotspot sequence 800ms after scene initialization.</li>
            <li><strong>Tour Duration (Dwell Time):</strong> Dropdown selector configuring how many seconds the camera pauses at each hotspot before transitioning to the next: <code>3 Seconds</code> (rapid reel), <code>5 Seconds (Default)</code>, <code>8 Seconds</code>, <code>10 Seconds</code>, and <code>15 Seconds</code> (narration/study).</li>
        </ul>

        <h2 id="sec3-5">3.5 Viewer Logo &amp; Custom Brand Upload</h2>
        <p>Empowers studios, agencies, and enterprises to whitelabel the presentation experience:</p>
        <ul>
            <li><strong>Show logo in Viewer:</strong> Master toggle to display or hide the floating brand mark in the lower-left corner of the Viewer.</li>
            <li><strong>Light Origin (Default):</strong> Displays the official Light Origin logo mark, automatically switching between light and dark variants based on the active theme.</li>
            <li><strong>Custom Logo Upload:</strong> Allows uploading custom client branding (PNG, SVG, WebP, JPG stored in <code>/assets</code>). Features interactive thumbnail preview, filename display, and a reset button. Logos are serialized as base64 data URLs for seamless portability.</li>
        </ul>

        <h2 id="sec3-6">3.6 Initial View &amp; Camera 0 Calibration</h2>
        <p>The initial view defines the exact camera coordinates, pitch, yaw, target focus point, and field of view (FOV) when a visitor first opens the project.</p>
        <ol>
            <li>Navigate freely around the scene to frame the desired perspective.</li>
            <li>Position the camera to your optimal hero angle.</li>
            <li>Click the <strong>Set Initial View</strong> button. A confirmation toast (<em>"Initial view set"</em>) confirms <code>camera-0</code> is recorded.</li>
        </ol>

        <div class="callout callout-important avoid-break">
            <div class="callout-title">RESERVED CAMERA-0 PROTECTION:</div>
            Light Origin 3DGS Viewer reserves <code>camera-0</code> exclusively for the scene's initial entry view. If any hotspot is assigned to <code>camera-0</code>, the system automatically migrates that hotspot to an independent camera ID (e.g. <code>camera-1</code>) during import, ensuring the opening view is never corrupted or overwritten.
        </div>

        <h2 id="sec3-7">3.7 3DGS Model Upload &amp; Management</h2>
        <p>The <strong>3DGS Model</strong> section controls active splat assets in memory:</p>
        <ul>
            <li><strong>Upload 3DGS:</strong> Launches a system file picker filtered for <code>.sog</code> and <code>.ply</code> files with live upload progress percentage.</li>
            <li><strong>Delete 3DGS:</strong> Unloads the active model from WebGPU/WebGL memory, resets the canvas, and frees GPU resources.</li>
            <li><strong>Model Swapping:</strong> Uploading a new model automatically unloads the previous model to prevent GPU memory leaks.</li>
        </ul>

        <h2 id="sec3-8">3.8 Hotspot Authoring, Surface Picking &amp; Ordering</h2>
        <p>Hotspots are 3D spatial points anchored directly to surfaces of the Gaussian splat cloud:</p>
        
        <div class="feature-grid">
            <div class="feature-box">
                <div class="feature-box-title">Placing a Hotspot</div>
                <p>Click <strong>+ Add Hotspot</strong>. The button turns active and the mouse cursor transforms into a precision crosshair. Click anywhere on the 3D model. Raycasting computes the exact surface intersection coordinate and creates the marker.</p>
            </div>
            <div class="feature-box">
                <div class="feature-box-title">Reordering &amp; Deleting</div>
                <p>Hotspots appear in the sidebar list. Use the <span class="kbd">Up</span> and <span class="kbd">Down</span> buttons to reorder annotations. The guided tour navigates through hotspots in this exact top-to-bottom sequence. Click delete to remove.</p>
            </div>
        </div>

        <h3>Moving Existing Hotspots</h3>
        <p>To reposition a hotspot without losing attached descriptions or media: select the hotspot, press the <span class="kbd">M</span> key, and click the new target location on the 3D surface.</p>

        <h2 id="sec3-9">3.9 Hotspot Properties, Markdown &amp; Media Attachments</h2>
        <p>Selecting any hotspot opens its comprehensive <strong>Properties</strong> card:</p>

        <ul>
            <li><strong>Title &amp; Color:</strong> Edit the headline (up to 30 characters) and pick a custom dot accent color from the palette picker.</li>
            <li><strong>Rich Text Description (Markdown):</strong> Supports GitHub-flavored markdown syntax (<code>**bold**</code>, <code>*italic*</code>, <code>[Link Title](url)</code>, <code># Headings</code>, <code>- Lists</code>, and <code>`code`</code>).</li>
            <li><strong>Media Attachments:</strong> Select between Image, Video, or Audio:
                <ul>
                    <li><strong>Image:</strong> URL to JPG, PNG, WebP image (or local path under <code>/assets</code>). Renders as a responsive banner frame inside the card.</li>
                    <li><strong>Video:</strong> Paste YouTube URLs (auto-converts to <code>youtube-nocookie.com/embed</code>), Vimeo URLs, or direct MP4/WebM files.</li>
                    <li><strong>Audio:</strong> URL to MP3 or WAV audio clip (or local audio in <code>/assets</code>). Embeds an audio player for voiceover narrations or ambient sound effects.</li>
                </ul>
            </li>
            <li><strong>Call-to-Action (CTA) Button:</strong> Add an interactive button (e.g. <em>"Reserve Tickets"</em> or <em>"Buy Now"</em>) with target URL.</li>
            <li><strong>Camera Controls:</strong> <strong>Go To Camera</strong> (flies to the bound viewpoint) and <strong>Update Camera</strong> (overwrites with current view).</li>
        </ul>

        <h2 id="sec3-10">3.10 Icon Library &amp; Custom Glyphs</h2>
        <p>Light Origin 3DGS Viewer includes an integrated vector SVG icon library with 20+ specialized glyphs rendered with scalable vectors:</p>

        <div class="icon-grid">
            <div class="icon-card"><span class="icon-svg-box"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></span> <strong>info</strong> (Info)</div>
            <div class="icon-card"><span class="icon-svg-box"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></span> <strong>photo</strong> (Photo)</div>
            <div class="icon-card"><span class="icon-svg-box"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg></span> <strong>video</strong> (Video)</div>
            <div class="icon-card"><span class="icon-svg-box"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg></span> <strong>audio</strong> (Audio)</div>
            <div class="icon-card"><span class="icon-svg-box"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></span> <strong>pin</strong> (Location)</div>
            <div class="icon-card"><span class="icon-svg-box"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span> <strong>search</strong> (Inspect)</div>
            <div class="icon-card"><span class="icon-svg-box"><svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span> <strong>star</strong> (Featured)</div>
            <div class="icon-card"><span class="icon-svg-box"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg></span> <strong>tag</strong> (Product)</div>
            <div class="icon-card"><span class="icon-svg-box"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6m-4 4h2m-7-12a5 5 0 0 1 10 0c0 2-1 3.5-2 4.5v1.5a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-1.5c-1-1-2-2.5-2-4.5z"/></svg></span> <strong>light</strong> (Idea)</div>
            <div class="icon-card"><span class="icon-svg-box"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M6 21V3h12v18"/><circle cx="14" cy="12" r="1.5" fill="currentColor"/></svg></span> <strong>door</strong> (Entrance)</div>
            <div class="icon-card"><span class="icon-svg-box"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg></span> <strong>cart</strong> (Shop)</div>
            <div class="icon-card"><span class="icon-svg-box"><span class="icon-number">1-9</span></span> <strong>num-1 … num-9</strong></div>
            <div class="icon-card"><span class="icon-svg-box"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 12a2 2 0 1 0 -4 0a4 4 0 0 0 8 0a6 6 0 0 0 -12 0a8 8 0 0 0 16 0a10 10 0 0 0 -20 0"/></svg></span> <strong>portal</strong> (Swirl)</div>
            <div class="icon-card"><span class="icon-svg-box"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 19 21 12 17 5 21 12 2"/></svg></span> <strong>rocket</strong> (Teleport)</div>
            <div class="icon-card"><span class="icon-svg-box"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></span> <strong>globe</strong> (Exterior)</div>
            <div class="icon-card"><span class="icon-svg-box"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></span> <strong>custom</strong> (SVG/Text)</div>
        </div>

        <div class="callout callout-tip avoid-break">
            <div class="callout-title">CUSTOM EMOJI &amp; SVG SUPPORT:</div>
            Selecting the <strong>Custom</strong> icon reveals an input field. You can input custom SVG XML markup, or enter up to 3 text characters. The system automatically formats the glyph with proportional scaling.
        </div>

        <h2 id="sec3-11">3.11 Cross-Scene Portals (Virtual Touring)</h2>
        <p>Portals represent gateways connecting distinct 3DGS scenes into an interconnected virtual multi-room facility, estate, or museum.</p>
        
        <ul>
            <li><strong>Adding a Portal:</strong> Click <strong>+ Add Portal</strong> and click the 3D mesh (e.g. on a doorway or staircase).</li>
            <li><strong>Visual Distinctions:</strong> Portals feature a distinctive glowing cyan swirl icon surrounded by an animated pulsing halo.</li>
            <li><strong>Target Project URL:</strong> Enter the relative or absolute path to the target project JSON (e.g. <code>./projects/garden/garden.json</code>). Remember that the target folder and its files must have the same name.</li>
            <li><strong>Isolated Navigation:</strong> Portals appear in a separate <strong>Portals</strong> list in the Editor and are intentionally excluded from the linear step-by-step hotspot tour.</li>
            <li><strong>Cinematic Transition Screen:</strong> When clicked, the screen smoothly cross-fades into a dark glassmorphism overlay with an animated spinning swirl, preventing asset flicker while the new 3DGS model loads.</li>
            <li><strong>Browser History Synchronization:</strong> Entering a portal invokes <code>history.pushState</code> with the updated project URL. Users can seamlessly use their browser's native <strong>Back</strong> and <strong>Forward</strong> buttons to retrace their steps.</li>
        </ul>

        <h2 id="sec3-12">3.12 Project Actions, File Saving &amp; Draft Autosave</h2>
        <ul>
            <li><strong>New Project:</strong> Resets all cameras, hotspots, and environment parameters back to a clean default state.</li>
            <li><strong>Save Project:</strong> Generates and downloads the complete <code>&lt;project_name&gt;.json</code> file to your computer.</li>
            <li><strong>Open Project:</strong> Opens a file dialog to load existing project JSON files.</li>
            <li><strong>Draft Autosave (LocalStorage):</strong> Every edit made in the sidebar is automatically cached in browser localStorage. If the browser tab is accidentally refreshed or closed, the editor restores your working session on next launch.</li>
        </ul>

        <h2 id="sec3-13">3.13 Standalone Offline Export (.zip Package)</h2>
        <p>Light Origin 3DGS Viewer provides an automated <strong>1-Click Standalone Export</strong> feature via the <span class="badge badge-purple">Export Standalone (.zip)</span> button:</p>

        <div class="feature-grid">
            <div class="feature-box">
                <div class="feature-box-title">What the ZIP Contains</div>
                <p>1. Tailored standalone <code>index.html</code><br>
                2. Active 3DGS model file (<code>.sog</code> or <code>.ply</code>)<br>
                3. Complete project configuration (<code>project.json</code>)<br>
                4. Full engine JavaScript runtime &amp; modules<br>
                5. High-resolution styles, icons &amp; logos<br>
                6. Settings and renderer configurations</p>
            </div>
            <div class="feature-box">
                <div class="feature-box-title">Deployment Flexibility</div>
                <p>The extracted folder is 100% self-contained. It can be hosted on any static web host (AWS S3, Netlify, Vercel, GitHub Pages, Apache, NGINX) or opened directly via a local static web server without requiring internet connectivity or external APIs.</p>
            </div>
        </div>

        <h2 id="sec3-14">3.14 Share &amp; Embed Modal Generator</h2>
        <p>Clicking <strong>Share &amp; Embed Tour</strong> opens an interactive modal generator containing ready-to-use distribution tools:</p>

        <table class="avoid-break">
            <thead>
                <tr>
                    <th style="width: 28%;">Feature</th>
                    <th>Functionality &amp; Capabilities</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Direct Shareable Link</strong></td>
                    <td>Generates the exact URL pointing directly to the presentation Viewer. Includes a 1-click <span class="badge badge-cyan">Copy Link</span> button.</td>
                </tr>
                <tr>
                    <td><strong>Mobile QR Code</strong></td>
                    <td>Dynamically generates a sharp vector QR code encoding the direct viewer URL. Point any iOS or Android phone camera at the screen to test the tour immediately. Includes a <strong>Download QR (.svg)</strong> button for print media and marketing flyers.</td>
                </tr>
                <tr>
                    <td><strong>Embed Customization</strong></td>
                    <td>Interactive checkboxes that dynamically update the generated code:
                        <ul>
                            <li><code>Responsive 16:9 Aspect Ratio</code> — Wraps iframe in a responsive CSS container.</li>
                            <li><code>Autospin Camera on Load</code> — Appends <code>&amp;autospin=true</code> parameter.</li>
                            <li><code>Autoplay Guided Tour on Load</code> — Appends <code>&amp;autoplay=true</code> parameter.</li>
                            <li><code>Minimal UI Mode</code> — Appends <code>&amp;noui=true</code> to conceal UI overlays.</li>
                        </ul>
                    </td>
                </tr>
                <tr>
                    <td><strong>HTML Iframe Code</strong></td>
                    <td>Provides standard responsive <code>&lt;iframe&gt;</code> HTML markup with pre-configured permissions for fullscreen, spatial tracking, accelerometer, and gyroscope. Includes a 1-click <span class="badge badge-teal">Copy Code</span> button.</td>
                </tr>
            </tbody>
        </table>

        <h2 id="sec3-15">3.15 Editor Color Themes</h2>
        <p>Light Origin 3DGS Viewer features 4 professionally calibrated color themes accessible via the swatches in the sidebar:</p>

        <table class="avoid-break">
            <thead>
                <tr>
                    <th style="width: 20%;">Theme</th>
                    <th style="width: 25%;">Palette Tone</th>
                    <th>Visual Character &amp; Aesthetic</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Dark (Default)</strong></td>
                    <td>Charcoal &amp; Teal (#22C7B8)</td>
                    <td>High-contrast modern dark mode optimized for creative studios and long authoring sessions. Reduces eye fatigue.</td>
                </tr>
                <tr>
                    <td><strong>Light</strong></td>
                    <td>Clean White &amp; Emerald (#11998E)</td>
                    <td>Bright, crisp gallery aesthetic with high legibility. Automatically swaps the header and viewer logos to dark variants.</td>
                </tr>
                <tr>
                    <td><strong>Midnight</strong></td>
                    <td>Deep Indigo &amp; Neon Violet (#9B87FF)</td>
                    <td>Sci-fi, futuristic dark mode with soft purples and luminous accents. Excellent for tech and automotive presentations.</td>
                </tr>
                <tr>
                    <td><strong>Earth</strong></td>
                    <td>Warm Umber &amp; Terracotta (#E8893A)</td>
                    <td>Rich organic warmth with copper and clay tones. Perfectly complements cultural heritage, museums, and real estate.</td>
                </tr>
            </tbody>
        </table>

        <h2 id="sec3-16">3.16 Editor Keyboard Shortcuts Cheat Sheet</h2>
        <table class="avoid-break">
            <thead>
                <tr>
                    <th style="width: 22%;">Key</th>
                    <th style="width: 32%;">Action</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><span class="kbd">Delete</span></td>
                    <td>Delete Selected Hotspot</td>
                    <td>Removes the currently selected hotspot and its camera from the project.</td>
                </tr>
                <tr>
                    <td><span class="kbd">F2</span></td>
                    <td>Rename Hotspot</td>
                    <td>Instantly focuses the title input in the sidebar for rapid inline renaming.</td>
                </tr>
                <tr>
                    <td><span class="kbd">M</span></td>
                    <td>Move Hotspot Mode</td>
                    <td>Enters relocation mode. Click any new point on the 3D surface to reposition.</td>
                </tr>
                <tr>
                    <td><span class="kbd">[</span></td>
                    <td>Previous Hotspot</td>
                    <td>Selects and navigates to the preceding hotspot in the tour list.</td>
                </tr>
                <tr>
                    <td><span class="kbd">]</span></td>
                    <td>Next Hotspot</td>
                    <td>Selects and navigates to the subsequent hotspot in the tour list.</td>
                </tr>
                <tr>
                    <td><span class="kbd">Esc</span></td>
                    <td>Cancel Operation</td>
                    <td>Aborts active hotspot placement mode, move mode, or dismisses open dialogs.</td>
                </tr>
                <tr>
                    <td><span class="kbd">F</span></td>
                    <td>Frame Scene</td>
                    <td>Centers and frames the entire 3D model within the current viewport.</td>
                </tr>
                <tr>
                    <td><span class="kbd">R</span></td>
                    <td>Reset Camera</td>
                    <td>Resets the camera back to the default overview perspective.</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- ==================== CHAPTER 4 ==================== -->
    <div class="page-break">
        <h1 id="sec4" style="margin-top: 4pt;">4. Viewer Mode — Complete Functional Reference</h1>

        <h2 id="sec4-1">4.1 Presentation Interface &amp; Clean Layout</h2>
        <p>In <strong>Viewer Mode</strong> (accessed via <code>?mode=viewer</code> or standalone export packages), the application transforms into an ultra-clean presentation stage:</p>
        <ul>
            <li>All authoring panels, sidebars, and property editors are completely removed.</li>
            <li>The 3D splat environment fills 100% of the display window.</li>
            <li>Branding logo rests elegantly in the lower-left corner.</li>
            <li>Quick-action floating toolbar sits discretely in the upper-right corner.</li>
            <li>Spatial 3D markers float unobtrusively over the Gaussian splat geometry.</li>
        </ul>

        <h2 id="sec4-2">4.2 Spatial Hotspot Markers &amp; Smooth Camera Fly-To</h2>
        <p>Each hotspot in the 3D environment is rendered as a spatial circular billboard marker:</p>
        <ul>
            <li><strong>Dynamic Occlusion &amp; Scaling:</strong> Markers maintain legible sizing regardless of camera distance and dynamically track their 3D anchor points during camera moves.</li>
            <li><strong>Hover States:</strong> Hovering a marker expands a soft glow halo and displays the title label.</li>
            <li><strong>Smooth Interpolated Fly-To:</strong> Clicking any marker triggers a smooth mathematical camera transition that glides the viewer to the exact position, pitch, yaw, and field of view bound to that hotspot.</li>
        </ul>

        <h2 id="sec4-3">4.3 Floating Tour Card, Step Navigation &amp; Rich Media</h2>
        <p>Upon arriving at a hotspot (or selecting it via navigation controls), the <strong>Tour Card</strong> appears smoothly at the bottom-center of the screen:</p>
        
        <div class="feature-grid">
            <div class="feature-box">
                <div class="feature-box-title">Media Player Frame</div>
                <p>If the hotspot includes an image, YouTube video, Vimeo stream, MP4 file, or audio narration, it renders at the top of the card in a 16:9 responsive frame with full media playback controls.</p>
            </div>
            <div class="feature-box">
                <div class="feature-box-title">Card Content &amp; CTA</div>
                <p>Displays the hotspot title, full formatted markdown text (bold, italic, links, lists), and the custom action button (CTA) that links directly to external resources or ecommerce checkouts.</p>
            </div>
        </div>

        <h3>Tour Navigation Bar</h3>
        <p>Integrated at the bottom of the card:</p>
        <ul>
            <li><span class="kbd">&lt;</span> <strong>Previous Button:</strong> Transitions to the prior hotspot in the sequence.</li>
            <li><span class="kbd">&gt;</span> <strong>Next Button:</strong> Advances to the subsequent hotspot in the sequence.</li>
            <li><strong>Step Counter (<code>X / N</code>):</strong> Indicates current step number out of total hotspots in the tour.</li>
            <li><strong>Card Dismissal:</strong> Clicking anywhere on open 3D space (or pressing <span class="kbd">Esc</span>) dismisses the card. Built-in drag threshold detection ensures that rotating or panning the camera does not accidentally dismiss the card.</li>
        </ul>

        <h2 id="sec4-4">4.4 Guided Tour Autoplay &amp; Smart Interaction Pause</h2>
        <p>The guided tour engine provides an automated hands-free walkthrough experience:</p>

        <ul>
            <li><strong>Play / Pause Button:</strong> Toggles automatic sequence playback.</li>
            <li><strong>Countdown Progress Bar:</strong> A sleek animated bar spans across the bottom of the card, visibly counting down the dwell time (e.g. 5 seconds) remaining until the next camera transition.</li>
            <li><strong>Smart Interaction Pause:</strong> If a visitor manually touches, rotates, pans, or zooms the camera while autoplay is running, the autoplay engine pauses immediately, granting the user full manual control without unexpected transitions. When the user stops interacting, autoplay resumes automatically.</li>
        </ul>

        <h2 id="sec4-5">4.5 Top-Right Quick Action Toolbar</h2>
        <p>The floating action bar in the top-right provides instant utility buttons:</p>
        <ul>
            <li><span class="badge badge-cyan">Share</span> <strong>Share &amp; Embed:</strong> Opens the sharing modal for instant links, iframe snippets, and mobile QR codes.</li>
            <li><span class="badge badge-teal">VR</span> <strong>VR / Motion Gyroscope:</strong> Toggles spatial VR viewing or mobile phone tilt-to-look controls.</li>
            <li><span class="badge badge-slate">Full</span> <strong>Fullscreen:</strong> Toggles native browser borderless fullscreen mode.</li>
        </ul>

        <h2 id="sec4-6">4.6 WebXR Immersive VR &amp; Smartphone Gyroscope Mode</h2>
        <p>Light Origin 3DGS Viewer provides dual spatial immersion capabilities:</p>

        <div class="feature-grid">
            <div class="feature-box">
                <div class="feature-box-title">Immersive WebXR VR Mode</div>
                <p>On devices equipped with WebXR headsets (Meta Quest 2/3/Pro, Apple Vision Pro, Pico 4, HTC Vive), clicking the VR button launches true stereoscopic 6-DOF immersive virtual reality inside the headset.</p>
            </div>
            <div class="feature-box">
                <div class="feature-box-title">Mobile Gyroscope Mode</div>
                <p>On smartphones (iPhone &amp; Android), clicking the button activates the internal motion gyroscope. Tilting and rotating your physical phone smoothly steers the 3D camera, providing a realistic "magic window" into the space.</p>
            </div>
        </div>

        <div class="callout callout-info avoid-break">
            <div class="callout-title">IOS 13+ DEVICEORIENTATION PERMISSION:</div>
            On Apple iOS devices, mobile browsers require explicit user permission to read gyroscope sensors. Light Origin 3DGS Viewer automatically invokes the native <code>DeviceOrientationEvent.requestPermission()</code> prompt upon the first tap.
        </div>

        <h2 id="sec4-7">4.7 Complete URL Query Parameters Dictionary</h2>
        <p>All viewer behaviors and settings can be controlled via URL parameters for seamless CMS and website integrations:</p>

        <table class="avoid-break">
            <thead>
                <tr>
                    <th style="width: 20%;">Parameter</th>
                    <th style="width: 20%;">Values</th>
                    <th>Functional Purpose</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><code>mode</code></td>
                    <td><code>viewer</code> | <code>editor</code></td>
                    <td>Toggles presentation mode (<code>viewer</code>) or authoring studio (<code>editor</code>).</td>
                </tr>
                <tr>
                    <td><code>project</code></td>
                    <td><code>&lt;slug&gt;</code></td>
                    <td>Specifies project name/folder to load (e.g. <code>?project=museum</code>).</td>
                </tr>
                <tr>
                    <td><code>autospin</code></td>
                    <td><code>true</code> | <code>false</code></td>
                    <td>Forces camera ambient rotation to start automatically on load.</td>
                </tr>
                <tr>
                    <td><code>autoplay</code></td>
                    <td><code>true</code> | <code>false</code></td>
                    <td>Forces guided tour sequence autoplay to commence immediately.</td>
                </tr>
                <tr>
                    <td><code>noui</code></td>
                    <td><code>true</code></td>
                    <td>Hides all bottom buttons and floating toolbar for pure minimal embeds.</td>
                </tr>
                <tr>
                    <td><code>theme</code></td>
                    <td><code>dark</code>, <code>light</code>, <code>midnight</code>, <code>earth</code></td>
                    <td>Overrides project theme with specified visual style preset.</td>
                </tr>
                <tr>
                    <td><code>logo</code></td>
                    <td><code>none</code> | <code>false</code></td>
                    <td>Hides the floating logo mark in the lower-left corner.</td>
                </tr>
                <tr>
                    <td><code>webgl</code></td>
                    <td><em>flag</em></td>
                    <td>Forces WebGL rendering engine instead of modern WebGPU.</td>
                </tr>
                <tr>
                    <td><code>budget</code></td>
                    <td><code>&lt;number&gt;</code></td>
                    <td>Sets maximum splat rendering limit (e.g. <code>budget=1000000</code>) for lower-end hardware.</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- ==================== CHAPTER 5 ==================== -->
    <div class="page-break">
        <h1 id="sec5" style="margin-top: 4pt;">5. Deployment, Performance &amp; Best Practices</h1>

        <h2 id="sec5-1">5.1 Model Compression &amp; Performance Optimization</h2>
        <p>To ensure fluid 60 FPS performance and rapid streaming across mobile connections:</p>
        <ul>
            <li><strong>Use .SOG wherever possible:</strong> SuperSplat compressed (<code>.sog</code>) files are up to 70% smaller than raw <code>.ply</code> files and support progressive chunk streaming.</li>
            <li><strong>Clean Floating Splats:</strong> Before exporting your 3DGS capture, crop ground boundaries and remove floaters/sky artifacts in SuperSplat to minimize unnecessary rasterization load.</li>
            <li><strong>Optimize Media URLs:</strong> Keep images under 1500px resolution and leverage YouTube / Vimeo embeds for video rather than massive uncompressed MP4 files.</li>
            <li><strong>Local Assets Organization:</strong> Store all project images, skyboxes, and audio narration files directly in the <code>/assets</code> folder to prevent broken references.</li>
        </ul>

        <h2 id="sec5-2">5.2 Web Server MIME Types &amp; HTTPS Requirements</h2>
        <table class="avoid-break">
            <thead>
                <tr>
                    <th style="width: 25%;">Requirement</th>
                    <th style="width: 25%;">Standard</th>
                    <th>Configuration Notes</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>HTTPS / SSL</strong></td>
                    <td>Mandatory for Sensors</td>
                    <td>Modern browsers (iOS Safari, Android Chrome) block DeviceOrientation, Gyroscope, and WebXR APIs on unencrypted HTTP connections. Always host production tours over HTTPS.</td>
                </tr>
                <tr>
                    <td><strong>SOG MIME Type</strong></td>
                    <td><code>application/octet-stream</code></td>
                    <td>Configure your web server (NGINX, Apache, IIS) to serve <code>.sog</code> and <code>.ply</code> files as binary streams (<code>application/octet-stream</code>).</td>
                </tr>
                <tr>
                    <td><strong>CORS Headers</strong></td>
                    <td><code>Access-Control-Allow-Origin: *</code></td>
                    <td>When loading 3DGS models or project JSON files across separate subdomains, ensure cross-origin resource sharing headers are configured.</td>
                </tr>
            </tbody>
        </table>

        <h2 id="sec5-3">5.3 Troubleshooting Guide</h2>
        <table class="avoid-break">
            <thead>
                <tr>
                    <th style="width: 25%;">Issue Encountered</th>
                    <th style="width: 28%;">Probable Cause</th>
                    <th>Recommended Resolution</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Black Screen on Launch</strong></td>
                    <td>WebGPU unsupported by browser or older graphics driver.</td>
                    <td>Add <code>?webgl</code> to the URL to force the WebGL compatibility renderer, or update graphics drivers.</td>
                </tr>
                <tr>
                    <td><strong>Mobile Gyroscope Fails</strong></td>
                    <td>Insecure HTTP origin or permission denied.</td>
                    <td>Ensure page is served via <code>https://</code> and click "Allow" when the iOS motion sensor prompt appears.</td>
                </tr>
                <tr>
                    <td><strong>YouTube Video Blocked</strong></td>
                    <td>Video owner disabled embedding.</td>
                    <td>Ensure the YouTube video privacy is set to <em>Public</em> or <em>Unlisted</em> with "Allow embedding" enabled in YouTube Studio.</td>
                </tr>
                <tr>
                    <td><strong>Hotspot Displaced</strong></td>
                    <td>Model was re-centered or replaced.</td>
                    <td>Select the hotspot, press <span class="kbd">M</span>, and click the 3D surface to re-anchor it to the new geometry.</td>
                </tr>
                <tr>
                    <td><strong>3D Model Not Loading</strong></td>
                    <td>Project folder and file names do not match.</td>
                    <td>Ensure the directory in <code>./projects/&lt;name&gt;/</code> and the files inside (<code>&lt;name&gt;.json</code> and <code>&lt;name&gt;.sog</code>) share the exact same name.</td>
                </tr>
            </tbody>
        </table>

        <div style="margin-top: 8pt; padding-top: 4pt; border-top: 1px solid #cbd5e1; text-align: center; color: #64748b; font-size: 8.5pt; page-break-inside: avoid; break-inside: avoid;">
            <strong>Light Origin 3DGS Viewer &amp; Editor</strong> • Built with SuperSplat &amp; PlayCanvas Technologies • Official User Guide
        </div>
    </div>

</body>
</html>
"""
    
    html_path = os.path.join(base_dir, "_temp", "user_guide_print.html")
    pdf_path = os.path.join(base_dir, "LightOrigin_3DGS_User_Guide.pdf")
    
    os.makedirs(os.path.dirname(html_path), exist_ok=True)
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html_content)
    
    print(f"Generated HTML source at: {html_path}")
    
    # Run Edge headless to compile the PDF
    edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    if not os.path.exists(edge_path):
        edge_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    
    cmd = [
        edge_path,
        "--headless",
        "--disable-gpu",
        "--run-all-compositor-stages-before-draw",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_path}",
        f"file:///{html_path.replace(os.sep, '/')}"
    ]
    
    print(f"Compiling PDF via: {edge_path}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if os.path.exists(pdf_path):
        size_kb = os.path.getsize(pdf_path) / 1024
        print(f"SUCCESS: PDF created at {pdf_path} ({size_kb:.1f} KB)")
        
        # Verify Font Subtypes to ensure Type3 is 100% eliminated for Adobe Acrobat
        with open(pdf_path, "rb") as f:
            t = f.read().decode("latin1", errors="ignore")
        subtypes = set(re.findall(r"/Subtype\s*/([A-Za-z0-9_]+)", t))
        print("Font Subtypes in compiled PDF:", subtypes)
        if "Type3" in subtypes:
            print("WARNING: Type3 font still detected!")
        else:
            print("PERFECT: Zero Type3 fonts! 100% Adobe Acrobat compatible.")
    else:
        print("ERROR: PDF was not generated.")

if __name__ == "__main__":
    build_pdf_guide()
