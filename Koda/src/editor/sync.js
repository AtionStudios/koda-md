// src/editor/sync.js
import { parseAndSanitize, htmlToMarkdown } from '../renderer/markdown.js';
import { applyTypography, updatePageBreaks } from '../core/settings.js';
import { saveCurrentDoc } from '../core/documentManager.js';

let isSyncing = false;
let isPreviewEditing = false;
let saveTimeout = null;
let previewEditTimeout = null;

let textarea, preview, editorContainer, previewContainer, titleInput, statWords, statLines, statSaved;

export function initEditorSync() {
    textarea = document.getElementById('markdown-input');
    preview = document.getElementById('markdown-preview');
    editorContainer = document.getElementById('editor-container');
    previewContainer = document.getElementById('preview-container');
    titleInput = document.getElementById('doc-title');
    statWords = document.getElementById('stat-words');
    statLines = document.getElementById('stat-lines');
    statSaved = document.getElementById('stat-saved');

    if (preview) {
        preview.contentEditable = "true";
        preview.addEventListener('input', () => {
            if (isPreviewEditing) return;
            isPreviewEditing = true;
            showSaveStatus(false);
            clearTimeout(saveTimeout);
            clearTimeout(previewEditTimeout);
            previewEditTimeout = setTimeout(() => {
                textarea.value = htmlToMarkdown(preview.innerHTML);
                updateStats();
                saveCurrentDoc(showSaveStatus);
                isPreviewEditing = false;
            }, 1000);
        });
    }

    if (textarea) {
        textarea.addEventListener('input', () => {
            if (!isPreviewEditing) renderPreview();
            showSaveStatus(false);
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => saveCurrentDoc(showSaveStatus), 1500);
        });

        textarea.addEventListener('scroll', () => {
            if (isSyncing || previewContainer.classList.contains('hidden')) return;
            isSyncing = true;
            const maxT = textarea.scrollHeight - textarea.clientHeight;
            if (maxT > 0) previewContainer.scrollTop = (textarea.scrollTop / maxT) * (previewContainer.scrollHeight - previewContainer.clientHeight);
            requestAnimationFrame(() => { isSyncing = false; });
        });
    }

    if (titleInput) {
        titleInput.addEventListener('input', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => saveCurrentDoc(showSaveStatus), 1500);
        });
    }

    if (previewContainer) {
        previewContainer.addEventListener('scroll', () => {
            if (isSyncing || editorContainer.classList.contains('hidden')) return;
            isSyncing = true;
            const maxP = previewContainer.scrollHeight - previewContainer.clientHeight;
            if (maxP > 0) textarea.scrollTop = (previewContainer.scrollTop / maxP) * (textarea.scrollHeight - textarea.clientHeight);
            requestAnimationFrame(() => { isSyncing = false; });
        });
    }
}

export function renderPreview() {
    if(!preview || !textarea) return;
    preview.innerHTML = parseAndSanitize(textarea.value);
    applyTypography();
    updatePageBreaks();
    updateStats();
}

export function updateStats() {
    if(!textarea || !statWords || !statLines) return;
    const text    = textarea.value;
    const words   = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines   = text ? text.split('\n').length : 0;
    statWords.textContent = `Words: ${words}`;
    statLines.textContent = `Lines: ${lines}`;
}

export function showSaveStatus(saved) {
    if(!statSaved) return;
    if (saved) {
        statSaved.innerHTML   = '<span class="material-symbols-outlined text-xs">check_circle</span> Saved';
        statSaved.className   = 'text-green-500 flex items-center gap-1';
    } else {
        statSaved.innerHTML   = '<span class="material-symbols-outlined text-xs">edit</span> Editing';
        statSaved.className   = 'text-amber-500 flex items-center gap-1';
    }
}
