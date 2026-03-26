// src/ui/paperScale.js
<<<<<<< HEAD

export function initPaperScaleObserver() {
    function fitPreviewPaperScale() {
        const previewContainer = document.getElementById('preview-container');
        if (!previewContainer || previewContainer.classList.contains('hidden')) return;
=======
import { isPageModeActive } from './viewModes.js';

export function initPaperScaleObserver() {
    const previewContainer = document.getElementById('preview-container');
    const preview = document.getElementById('markdown-preview');

    function fitPreviewPaperScale() {
        if (!isPageModeActive() || !previewContainer || previewContainer.classList.contains('hidden')) return;
>>>>>>> fbf4d06169cf57db7eb69afe6721c991bdbc0d20
        
        const wrapper = document.getElementById('page-wrapper');
        if (!wrapper) return;

        wrapper.style.transform = 'none';
        
        const firstPage = wrapper.querySelector('.preview-paper');
        if (!firstPage) return;

        const availableW = previewContainer.clientWidth - 80; 
        const paperW     = firstPage.offsetWidth;
        const scale      = (paperW > availableW && paperW > 0) ? availableW / paperW : 1;
        
        if (scale < 1) {
            wrapper.style.transform = `scale(${scale})`;
            wrapper.style.transformOrigin = 'top center';
        } else {
            wrapper.style.transform = 'none';
        }
    }

<<<<<<< HEAD
    // Wait one frame so that DOM modules are fully mounted before querying
    requestAnimationFrame(() => {
        const previewContainer = document.getElementById('preview-container');
        if (previewContainer) {
            const ro = new ResizeObserver(() => window.requestAnimationFrame(fitPreviewPaperScale));
            ro.observe(previewContainer);
            fitPreviewPaperScale();
        }
    });
=======
    if(previewContainer) {
        const ro = new ResizeObserver(() => window.requestAnimationFrame(fitPreviewPaperScale));
        ro.observe(previewContainer);
    }
>>>>>>> fbf4d06169cf57db7eb69afe6721c991bdbc0d20
}
