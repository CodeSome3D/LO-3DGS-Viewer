import re

def update_build_guide():
    path = r'c:\Egor\3DGS\WEB 3DGS\LO-3DGS-Viewer\_temp\build_guide.py'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update CSS to include .toc-link
    old_css_target = """.toc-item.level-2 {{
            padding-left: 12px;
            color: #334155;
        }}"""
    
    new_css_replacement = """.toc-item.level-2 {{
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
        }}"""
    
    if old_css_target in content:
        content = content.replace(old_css_target, new_css_replacement, 1)
        print("Updated TOC CSS")
    else:
        print("CSS target not found!")

    # 2. Update TOC items with <a class="toc-link" href="#id">...</a>
    toc_mappings = [
        # (old_line_substr, href_id)
        ('1. System Architecture &amp; Fundamentals', 'sec1'),
        ('1.1 What is Light Origin 3DGS Viewer?', 'sec1-1'),
        ('1.2 Dual-Mode Architecture: Editor vs. Viewer', 'sec1-2'),
        ('1.3 Supported File Formats (.sog, .ply, .json, .zip)', 'sec1-3'),
        ('1.4 Strict Naming Rule &amp; Assets Directory Structure', 'sec1-4'),

        ('2. Quick Start Guide', 'sec2'),
        ('2.1 Launching the Application &amp; URL Modes', 'sec2-1'),
        ('2.2 Loading 3D Gaussian Splats', 'sec2-2'),
        ('2.3 Step-by-Step: Creating Your First Tour', 'sec2-3'),

        ('3. Editor Mode — Complete Functional Reference', 'sec3'),
        ('3.1 Workspace Layout &amp; Header', 'sec3-1'),
        ('3.2 Project Identity &amp; Title Editing', 'sec3-2'),
        ('3.3 Environment &amp; Background Configurations', 'sec3-3'),
        ('3.4 Tour Playback Settings &amp; Step Dwell Times', 'sec3-4'),
        ('3.5 Viewer Logo &amp; Custom Brand Upload', 'sec3-5'),
        ('3.6 Initial View &amp; Camera 0 Calibration', 'sec3-6'),
        ('3.7 3DGS Model Upload &amp; Management', 'sec3-7'),
        ('3.8 Hotspot Authoring, Surface Picking &amp; Ordering', 'sec3-8'),
        ('3.9 Hotspot Properties, Markdown &amp; Media Attachments', 'sec3-9'),
        ('3.10 Icon Library &amp; Custom Glyphs', 'sec3-10'),
        ('3.11 Cross-Scene Portals (Virtual Touring &amp; Scene Swapping)', 'sec3-11'),
        ('3.12 Project Actions, File Saving &amp; Draft Autosave', 'sec3-12'),
        ('3.13 Standalone Offline Export (.zip Package)', 'sec3-13'),
        ('3.14 Share &amp; Embed Modal Generator', 'sec3-14'),
        ('3.15 Editor Color Themes (Dark, Light, Midnight, Earth)', 'sec3-15'),
        ('3.16 Editor Keyboard Shortcuts Cheat Sheet', 'sec3-16'),

        ('4. Viewer Mode — Complete Functional Reference', 'sec4'),
        ('4.1 Presentation Interface &amp; Clean Layout', 'sec4-1'),
        ('4.2 Spatial Hotspot Markers &amp; Smooth Fly-To', 'sec4-2'),
        ('4.3 Floating Tour Card, Step Navigation &amp; Rich Media', 'sec4-3'),
        ('4.4 Guided Tour Autoplay &amp; Smart Interaction Pause', 'sec4-4'),
        ('4.5 Top-Right Quick Action Toolbar', 'sec4-5'),
        ('4.6 WebXR Immersive VR &amp; Smartphone Gyroscope Mode', 'sec4-6'),
        ('4.7 Complete URL Query Parameters Dictionary', 'sec4-7'),

        ('5. Deployment, Performance &amp; Best Practices', 'sec5'),
        ('5.1 Model Compression &amp; Performance Optimization', 'sec5-1'),
        ('5.2 Web Server MIME Types &amp; HTTPS Requirements', 'sec5-2'),
        ('5.3 Troubleshooting Guide', 'sec5-3')
    ]

    for title, href_id in toc_mappings:
        # Match <li class="toc-item level-[12]"><span>{title}</span> <span>{label}</span></li>
        pattern = rf'(<li class="toc-item level-[12]">)(<span>{re.escape(title)}</span>\s*<span>[^<]+</span>)(</li>)'
        replacement = rf'\1<a class="toc-link" href="#{href_id}">\2</a>\3'
        content, count = re.subn(pattern, replacement, content, count=1)
        if count == 0:
            print(f"Warning: TOC item not matched for {title}")
        else:
            print(f"TOC link added: #{href_id}")

    # 3. Add IDs to <h1> and <h2> headings in body
    heading_mappings = [
        ('<h1 style="margin-top: 4pt;">1. System Architecture &amp; Fundamentals</h1>',
         '<h1 id="sec1" style="margin-top: 4pt;">1. System Architecture &amp; Fundamentals</h1>'),
        ('<h2>1.1 What is Light Origin 3DGS Viewer?</h2>',
         '<h2 id="sec1-1">1.1 What is Light Origin 3DGS Viewer?</h2>'),
        ('<h2>1.2 Dual-Mode Architecture: Editor vs. Viewer</h2>',
         '<h2 id="sec1-2">1.2 Dual-Mode Architecture: Editor vs. Viewer</h2>'),
        ('<h2>1.3 Supported File Formats &amp; Standards</h2>',
         '<h2 id="sec1-3">1.3 Supported File Formats &amp; Standards</h2>'),
        ('<h2>1.4 Strict Naming Rule &amp; Assets Directory Structure</h2>',
         '<h2 id="sec1-4">1.4 Strict Naming Rule &amp; Assets Directory Structure</h2>'),

        ('<h1 style="margin-top: 4pt;">2. Quick Start Guide</h1>',
         '<h1 id="sec2" style="margin-top: 4pt;">2. Quick Start Guide</h1>'),
        ('<h2>2.1 Launching the Application &amp; URL Modes</h2>',
         '<h2 id="sec2-1">2.1 Launching the Application &amp; URL Modes</h2>'),
        ('<h2>2.2 Loading 3D Gaussian Splats</h2>',
         '<h2 id="sec2-2">2.2 Loading 3D Gaussian Splats</h2>'),
        ('<h2>2.3 Step-by-Step: Creating Your First Tour</h2>',
         '<h2 id="sec2-3">2.3 Step-by-Step: Creating Your First Tour</h2>'),

        ('3. Editor Mode', 'sec3'), # Let's handle h1 below
        ('<h2>3.1 Workspace Layout &amp; Header</h2>',
         '<h2 id="sec3-1">3.1 Workspace Layout &amp; Header</h2>'),
        ('<h2>3.2 Project Identity &amp; Title Editing</h2>',
         '<h2 id="sec3-2">3.2 Project Identity &amp; Title Editing</h2>'),
        ('<h2>3.3 Environment &amp; Background Configurations</h2>',
         '<h2 id="sec3-3">3.3 Environment &amp; Background Configurations</h2>'),
        ('<h2>3.4 Tour Playback Settings &amp; Step Dwell Times</h2>',
         '<h2 id="sec3-4">3.4 Tour Playback Settings &amp; Step Dwell Times</h2>'),
        ('<h2>3.5 Viewer Logo &amp; Custom Brand Upload</h2>',
         '<h2 id="sec3-5">3.5 Viewer Logo &amp; Custom Brand Upload</h2>'),
        ('<h2>3.6 Initial View &amp; Camera 0 Calibration</h2>',
         '<h2 id="sec3-6">3.6 Initial View &amp; Camera 0 Calibration</h2>'),
        ('<h2>3.7 3DGS Model Upload &amp; Management</h2>',
         '<h2 id="sec3-7">3.7 3DGS Model Upload &amp; Management</h2>'),
        ('<h2>3.8 Hotspot Authoring, Surface Picking &amp; Ordering</h2>',
         '<h2 id="sec3-8">3.8 Hotspot Authoring, Surface Picking &amp; Ordering</h2>'),
        ('<h2>3.9 Hotspot Properties, Markdown &amp; Media Attachments</h2>',
         '<h2 id="sec3-9">3.9 Hotspot Properties, Markdown &amp; Media Attachments</h2>'),
        ('<h2>3.10 Icon Library &amp; Custom Glyphs</h2>',
         '<h2 id="sec3-10">3.10 Icon Library &amp; Custom Glyphs</h2>'),
        ('<h2>3.11 Cross-Scene Portals (Virtual Touring)</h2>',
         '<h2 id="sec3-11">3.11 Cross-Scene Portals (Virtual Touring)</h2>'),
        ('<h2>3.12 Project Actions, File Saving &amp; Draft Autosave</h2>',
         '<h2 id="sec3-12">3.12 Project Actions, File Saving &amp; Draft Autosave</h2>'),
        ('<h2>3.13 Standalone Offline Export (.zip Package)</h2>',
         '<h2 id="sec3-13">3.13 Standalone Offline Export (.zip Package)</h2>'),
        ('<h2>3.14 Share &amp; Embed Modal Generator</h2>',
         '<h2 id="sec3-14">3.14 Share &amp; Embed Modal Generator</h2>'),
        ('<h2>3.15 Editor Color Themes</h2>',
         '<h2 id="sec3-15">3.15 Editor Color Themes</h2>'),
        ('<h2>3.16 Editor Keyboard Shortcuts Cheat Sheet</h2>',
         '<h2 id="sec3-16">3.16 Editor Keyboard Shortcuts Cheat Sheet</h2>'),

        ('4. Viewer Mode', 'sec4'), # handled below
        ('<h2>4.1 Presentation Interface &amp; Clean Layout</h2>',
         '<h2 id="sec4-1">4.1 Presentation Interface &amp; Clean Layout</h2>'),
        ('<h2>4.2 Spatial Hotspot Markers &amp; Smooth Camera Fly-To</h2>',
         '<h2 id="sec4-2">4.2 Spatial Hotspot Markers &amp; Smooth Camera Fly-To</h2>'),
        ('<h2>4.3 Floating Tour Card, Step Navigation &amp; Rich Media</h2>',
         '<h2 id="sec4-3">4.3 Floating Tour Card, Step Navigation &amp; Rich Media</h2>'),
        ('<h2>4.4 Guided Tour Autoplay &amp; Smart Interaction Pause</h2>',
         '<h2 id="sec4-4">4.4 Guided Tour Autoplay &amp; Smart Interaction Pause</h2>'),
        ('<h2>4.5 Top-Right Quick Action Toolbar</h2>',
         '<h2 id="sec4-5">4.5 Top-Right Quick Action Toolbar</h2>'),
        ('<h2>4.6 WebXR Immersive VR &amp; Smartphone Gyroscope Mode</h2>',
         '<h2 id="sec4-6">4.6 WebXR Immersive VR &amp; Smartphone Gyroscope Mode</h2>'),
        ('<h2>4.7 Complete URL Query Parameters Dictionary</h2>',
         '<h2 id="sec4-7">4.7 Complete URL Query Parameters Dictionary</h2>'),

        ('<h1 style="margin-top: 4pt;">5. Deployment, Performance &amp; Best Practices</h1>',
         '<h1 id="sec5" style="margin-top: 4pt;">5. Deployment, Performance &amp; Best Practices</h1>'),
        ('<h2>5.1 Model Compression &amp; Performance Optimization</h2>',
         '<h2 id="sec5-1">5.1 Model Compression &amp; Performance Optimization</h2>'),
        ('<h2>5.2 Web Server MIME Types &amp; HTTPS Requirements</h2>',
         '<h2 id="sec5-2">5.2 Web Server MIME Types &amp; HTTPS Requirements</h2>'),
        ('<h2>5.3 Troubleshooting Guide</h2>',
         '<h2 id="sec5-3">5.3 Troubleshooting Guide</h2>'),
    ]

    for item in heading_mappings:
        if isinstance(item, tuple) and len(item) == 2 and item[0].startswith('<'):
            old_h, new_h = item
            if old_h in content:
                content = content.replace(old_h, new_h, 1)
                print(f"Heading ID added: {new_h[:30]}...")
            else:
                print(f"Warning: Heading not found: {old_h}")

    # Handle h1 for chapter 3 and 4 with regex for dash
    content = re.sub(
        r'<h1 style="margin-top: 4pt;">3\. Editor Mode [^<]+</h1>',
        r'<h1 id="sec3" style="margin-top: 4pt;">3. Editor Mode — Complete Functional Reference</h1>',
        content,
        count=1
    )
    content = re.sub(
        r'<h1 style="margin-top: 4pt;">4\. Viewer Mode [^<]+</h1>',
        r'<h1 id="sec4" style="margin-top: 4pt;">4. Viewer Mode — Complete Functional Reference</h1>',
        content,
        count=1
    )

    # 4. Replace arrow icon with genuine Archimedean swirl/spiral SVG icon
    old_swirl_icon = '<div class="icon-card"><span class="icon-svg-box"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" stroke-dasharray="3 2"/><path d="M12 7v10M7 12l5-5 5 5"/></svg></span> <strong>portal</strong> (Swirl)</div>'
    
    new_swirl_icon = '<div class="icon-card"><span class="icon-svg-box"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 12a2 2 0 1 0 -4 0a4 4 0 0 0 8 0a6 6 0 0 0 -12 0a8 8 0 0 0 16 0a10 10 0 0 0 -20 0"/></svg></span> <strong>portal</strong> (Swirl)</div>'

    if old_swirl_icon in content:
        content = content.replace(old_swirl_icon, new_swirl_icon, 1)
        print("Updated Portal Swirl Icon SVG to actual spiral!")
    else:
        print("Warning: old swirl icon not found in content!")

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("build_guide.py updated successfully!")

if __name__ == '__main__':
    update_build_guide()
