// src/ui/paperScale.js
import { isPageModeActive } from './viewModes.js';

export function initPaperScaleObserver() {
    const previewContainer = document.getElementById('preview-container');
    const preview = document.getElementById('markdown-preview');

    function fitPreviewPaperScale() {
        if (!isPageModeActive() || !previewContainer || previewContainer.classList.contains('hidden')) return;
        
        preview.style.transform = 'none';
        
        const availableW = previewContainer.clientWidth - 40; 
        const paperW     = preview.offsetWidth;
        const paperH     = preview.offsetHeight;
        const scale      = (paperW > availableW && paperW > 0) ? availableW / paperW : 1;
        
        if (scale < 1) {
            preview.style.transform = `scale(${scale})`;
            preview.style.transformOrigin = 'top center';
            preview.style.marginBottom = '0';
            
            const wrapper = preview.closest('.paper-scale-wrapper');
            if (wrapper) {
                wrapper.style.minHeight = `${(paperH * scale) + 80}px`;
            }
        } else {
            preview.style.transform = 'none';
            preview.style.marginBottom = '0';
            const wrapper = preview.closest('.paper-scale-wrapper');
            if (wrapper) wrapper.style.minHeight = 'auto';
        }
    }

    if(previewContainer) {
        const ro = new ResizeObserver(() => window.requestAnimationFrame(fitPreviewPaperScale));
        ro.observe(previewContainer);
    }
}
