// src/ui/viewModes.js

export let isPageMode = false;

export function isPageModeActive() { return isPageMode; }

export function applyPageMode(active) {
    isPageMode = active;
<<<<<<< HEAD
=======
    // The paginator renders pages on every change, 
    // we don't need to manually update classes on a single preview element anymore.
    // Sync.js calls renderPreview which uses the latest settings.
>>>>>>> fbf4d06169cf57db7eb69afe6721c991bdbc0d20
}

export function initViewModes() {
    const viewBtns = {
        split:   document.getElementById('btn-view-split'),
        code:    document.getElementById('btn-view-code'),
        preview: document.getElementById('btn-view-preview')
    };
<<<<<<< HEAD
    const editorContainer  = document.getElementById('editor-container');
=======
    const editorContainer = document.getElementById('editor-container');
>>>>>>> fbf4d06169cf57db7eb69afe6721c991bdbc0d20
    const previewContainer = document.getElementById('preview-container');

    function setViewClasses(active) {
        Object.values(viewBtns).forEach(btn => {
<<<<<<< HEAD
            if (!btn) return;
            btn.classList.remove('bg-white', 'dark:bg-slate-700', 'shadow-sm', 'text-primary');
            btn.classList.add('text-slate-500');
        });
        if (viewBtns[active]) {
=======
            if(!btn) return;
            btn.classList.remove('bg-white', 'dark:bg-slate-700', 'shadow-sm', 'text-primary');
            btn.classList.add('text-slate-500');
        });
        if(viewBtns[active]) {
>>>>>>> fbf4d06169cf57db7eb69afe6721c991bdbc0d20
            viewBtns[active].classList.add('bg-white', 'dark:bg-slate-700', 'shadow-sm', 'text-primary');
            viewBtns[active].classList.remove('text-slate-500');
        }
    }

<<<<<<< HEAD
    if (viewBtns.split) viewBtns.split.onclick = () => {
=======
    if(viewBtns.split) viewBtns.split.onclick = () => {
>>>>>>> fbf4d06169cf57db7eb69afe6721c991bdbc0d20
        editorContainer.classList.remove('hidden'); editorContainer.style.width = '50%';
        previewContainer.classList.remove('hidden'); previewContainer.style.width = '50%';
        applyPageMode(true);
        setViewClasses('split');
<<<<<<< HEAD
        window.dispatchEvent(new CustomEvent('koda-request-render'));
    };
    if (viewBtns.code) viewBtns.code.onclick = () => {
        editorContainer.classList.remove('hidden'); editorContainer.style.width = '100%';
        previewContainer.classList.add('hidden');
        applyPageMode(false);
        setViewClasses('code');
    };
    if (viewBtns.preview) viewBtns.preview.onclick = () => {
=======
    };
    if(viewBtns.code) viewBtns.code.onclick = () => {
        editorContainer.classList.remove('hidden'); editorContainer.style.width = '100%';
        previewContainer.classList.add('hidden');
        setViewClasses('code');
    };
    if(viewBtns.preview) viewBtns.preview.onclick = () => {
>>>>>>> fbf4d06169cf57db7eb69afe6721c991bdbc0d20
        editorContainer.classList.add('hidden');
        previewContainer.classList.remove('hidden'); previewContainer.style.width = '100%';
        applyPageMode(true);
        setViewClasses('preview');
<<<<<<< HEAD
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
=======
    };
>>>>>>> fbf4d06169cf57db7eb69afe6721c991bdbc0d20
}
