// src/ui/viewModes.js

export let isPageMode = false;

export function isPageModeActive() { return isPageMode; }

export function applyPageMode(active) {
    isPageMode = active;
}

export function initViewModes() {
    const viewBtns = {
        split:   document.getElementById('btn-view-split'),
        code:    document.getElementById('btn-view-code'),
        preview: document.getElementById('btn-view-preview')
    };
    const editorContainer  = document.getElementById('editor-container');
    const previewContainer = document.getElementById('preview-container');

    function setViewClasses(active) {
        Object.values(viewBtns).forEach(btn => {
            if (!btn) return;
            btn.classList.remove('bg-white', 'dark:bg-slate-700', 'shadow-sm', 'text-primary');
            btn.classList.add('text-slate-500');
        });
        if (viewBtns[active]) {
            viewBtns[active].classList.add('bg-white', 'dark:bg-slate-700', 'shadow-sm', 'text-primary');
            viewBtns[active].classList.remove('text-slate-500');
        }
        
        // Aplica classe no body para permitir CSS contextual (ex: layout centralizado no modo code)
        document.body.classList.remove('mode-split', 'mode-code', 'mode-preview');
        document.body.classList.add(`mode-${active}`);
    }

    if (viewBtns.split) viewBtns.split.onclick = () => {
        editorContainer.classList.remove('hidden'); editorContainer.style.width = '50%';
        previewContainer.classList.remove('hidden'); previewContainer.style.width = '50%';
        applyPageMode(true);
        setViewClasses('split');
        window.dispatchEvent(new CustomEvent('koda-request-render'));
    };
    if (viewBtns.code) viewBtns.code.onclick = () => {
        editorContainer.classList.remove('hidden'); editorContainer.style.width = '100%';
        previewContainer.classList.add('hidden');
        applyPageMode(false);
        setViewClasses('code');
    };
    if (viewBtns.preview) viewBtns.preview.onclick = () => {
        editorContainer.classList.add('hidden');
        previewContainer.classList.remove('hidden'); previewContainer.style.width = '100%';
        applyPageMode(true);
        setViewClasses('preview');
        window.dispatchEvent(new CustomEvent('koda-request-render'));
    };

    // Activate split mode by default on load so paper is visible immediately
    if (editorContainer && previewContainer) {
        editorContainer.classList.remove('hidden');
        editorContainer.style.width = '50%';
        previewContainer.classList.remove('hidden');
        previewContainer.style.width = '50%';
        applyPageMode(true);
        setViewClasses('split');
    }
}
