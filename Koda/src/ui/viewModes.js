// src/ui/viewModes.js

export let isPageMode = false;

export function isPageModeActive() { return isPageMode; }

export function applyPageMode(active) {
    const preview = document.getElementById('markdown-preview');
    if(!preview) return;
    isPageMode = active;
    if (active) {
        const paper = document.getElementById('cfg-paper-size')?.value || 'a4';
        const ori   = document.getElementById('cfg-paper-orientation')?.value  || 'portrait';
        preview.className = preview.className.replace(/page-[a-z]+-[a-z]+/g, '').trim();
        preview.classList.add(`page-${paper}-${ori}`);
    } else {
        preview.className = preview.className.replace(/page-[a-z]+-[a-z]+/g, '').trim();
    }
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
