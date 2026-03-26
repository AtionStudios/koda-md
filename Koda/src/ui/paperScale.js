// src/ui/paperScale.js

export function initPaperScaleObserver() {
    function fitPreviewPaperScale() {
        const previewContainer = document.getElementById('preview-container');
        if (!previewContainer || previewContainer.classList.contains('hidden')) return;
        
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

    // Wait one frame so that DOM modules are fully mounted before querying
    requestAnimationFrame(() => {
        const previewContainer = document.getElementById('preview-container');
        if (previewContainer) {
            const ro = new ResizeObserver(() => window.requestAnimationFrame(fitPreviewPaperScale));
            ro.observe(previewContainer);
            fitPreviewPaperScale();
        }
    });
}
