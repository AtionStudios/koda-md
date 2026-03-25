// src/ui/viewModes.js

export let isPageMode = false;

export function isPageModeActive() { return isPageMode; }

export function applyPageMode(active) {
    isPageMode = active;
    // The paginator renders pages on every change, 
    // we don't need to manually update classes on a single preview element anymore.
    // Sync.js calls renderPreview which uses the latest settings.
}

export function initViewModes() {
    const viewBtns = {
        split:   document.getElementById('btn-view-split'),
        code:    document.getElementById('btn-view-code'),
        preview: document.getElementById('btn-view-preview')
    };
    const editorContainer = document.getElementById('editor-container');
    const previewContainer = document.getElementById('preview-container');

    function setViewClasses(active) {
        Object.values(viewBtns).forEach(btn => {
            if(!btn) return;
            btn.classList.remove('bg-white', 'dark:bg-slate-700', 'shadow-sm', 'text-primary');
            btn.classList.add('text-slate-500');
        });
        if(viewBtns[active]) {
            viewBtns[active].classList.add('bg-white', 'dark:bg-slate-700', 'shadow-sm', 'text-primary');
            viewBtns[active].classList.remove('text-slate-500');
        }
    }

    if(viewBtns.split) viewBtns.split.onclick = () => {
        editorContainer.classList.remove('hidden'); editorContainer.style.width = '50%';
        previewContainer.classList.remove('hidden'); previewContainer.style.width = '50%';
        applyPageMode(true);
        setViewClasses('split');
    };
    if(viewBtns.code) viewBtns.code.onclick = () => {
        editorContainer.classList.remove('hidden'); editorContainer.style.width = '100%';
        previewContainer.classList.add('hidden');
        setViewClasses('code');
    };
    if(viewBtns.preview) viewBtns.preview.onclick = () => {
        editorContainer.classList.add('hidden');
        previewContainer.classList.remove('hidden'); previewContainer.style.width = '100%';
        applyPageMode(true);
        setViewClasses('preview');
    };
}
