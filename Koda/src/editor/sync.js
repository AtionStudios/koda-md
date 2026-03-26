// src/editor/sync.js
import { parseAndSanitize, htmlToMarkdown } from '../renderer/markdown.js';
import { applyTypography, getPageSettings } from '../core/settings.js';
import { saveCurrentDoc } from '../core/documentManager.js';
import { Paginator } from '../core/paginator.js';
import { createEditor } from './codemirror_setup.js';

const paginator = new Paginator('page-wrapper');

let isSyncing = false;
let saveTimeout = null;

let editorContainer, previewContainer, titleInput, statWords, statLines, statSaved;

export let editorView = null; // Instância do CodeMirror acessível globalmente

export function initEditorSync() {
    window.addEventListener('koda-request-render', () => renderPreview());
    
    const editorWrapper = document.getElementById('codemirror-wrapper');
    editorContainer = document.getElementById('editor-container');
    previewContainer = document.getElementById('preview-container');
    titleInput = document.getElementById('doc-title');
    statWords = document.getElementById('stat-words');
    statLines = document.getElementById('stat-lines');
    statSaved = document.getElementById('stat-saved');

    if (editorWrapper) {
        const isDark = document.documentElement.classList.contains('dark');
        const enableLineNumbers = document.getElementById('toggle-line-numbers')?.checked || false;

        editorView = createEditor(editorWrapper, "", (text, update) => {
            renderPreview();
            showSaveStatus(false);
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => saveCurrentDoc(showSaveStatus), 2000);
        }, enableLineNumbers, isDark);

        const cmScroller = editorWrapper.querySelector('.cm-scroller');
        if (cmScroller) {
            cmScroller.addEventListener('scroll', () => {
                if (isSyncing || previewContainer.classList.contains('hidden')) return;
                isSyncing = true;
                const maxT = cmScroller.scrollHeight - cmScroller.clientHeight;
                if (maxT > 0) previewContainer.scrollTop = (cmScroller.scrollTop / maxT) * (previewContainer.scrollHeight - previewContainer.clientHeight);
                requestAnimationFrame(() => { isSyncing = false; });
            });
        }
    }

    if (titleInput) {
        titleInput.addEventListener('input', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => saveCurrentDoc(showSaveStatus), 2000);
        });
    }

    if (previewContainer) {
        previewContainer.addEventListener('scroll', () => {
            if (isSyncing || editorContainer.classList.contains('hidden')) return;
            isSyncing = true;
            const maxP = previewContainer.scrollHeight - previewContainer.clientHeight;
            if (maxP > 0 && editorWrapper) {
                const cmScroller = editorWrapper.querySelector('.cm-scroller');
                if (cmScroller) cmScroller.scrollTop = (previewContainer.scrollTop / maxP) * (cmScroller.scrollHeight - cmScroller.clientHeight);
            }
            requestAnimationFrame(() => { isSyncing = false; });
        });
    }
}

export function renderPreview() {
    if(!editorView || !paginator) return;
    const settings = getPageSettings();
    const text = editorView.state.doc.toString();
    const html = parseAndSanitize(text, { multiBreaks: settings.multiBreaks });
    
    paginator.render(html, settings);
    
    // Apply typography to each generated page
    const pages = document.querySelectorAll('.preview-paper');
    pages.forEach(page => applyTypographyToPage(page));
    
    updateStats();
}

function applyTypographyToPage(page) {
    const settings = getPageSettings();
    const cfgFontSize = document.getElementById('cfg-font-size');
    const cfgFontFamily = document.getElementById('cfg-font-family');
    const cfgLineHeight = document.getElementById('cfg-line-height');
    
    if(!page || !cfgFontSize || !cfgFontFamily || !cfgLineHeight) return;
    const sizePx = Math.round((parseInt(cfgFontSize.value) || 12) * 1.333);
    page.style.fontFamily  = cfgFontFamily.value;
    page.style.fontSize    = sizePx + 'px';
    page.style.lineHeight  = String(parseFloat(cfgLineHeight.value) || 1.6);
}

export function updateStats() {
    if(!editorView || !statWords || !statLines) return;
    const text    = editorView.state.doc.toString();
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
