// src/main.js
import './style.css';
import { dbPut, dbGet, dbGetAll, dbDelete } from './persistence/db.js';
import { parseAndSanitize, htmlToMarkdown } from './renderer/markdown.js';
import { exportCurrent, exportAllAsZip } from './export/exporter.js';

document.addEventListener('DOMContentLoaded', () => {
    const textarea       = document.getElementById('markdown-input');
    const preview        = document.getElementById('markdown-preview');
    const editorContainer = document.getElementById('editor-container');
    const previewContainer = document.getElementById('preview-container');
    const titleInput     = document.getElementById('doc-title');
    const pageBreakToggle = document.getElementById('toggle-page-breaks');
    const downloadBtn    = document.getElementById('btn-download');
    const backupZipBtn   = document.getElementById('btn-backup-zip'); // NEW
    const modalDocList   = document.getElementById('modal-doc-list');
    const docsModal      = document.getElementById('docs-modal');
    const btnCloseModal  = document.getElementById('btn-close-modal');
    const statWords      = document.getElementById('stat-words');
    const statLines      = document.getElementById('stat-lines');
    const statSaved      = document.getElementById('stat-saved');

    // Config controls
    const cfgFontFamily  = document.getElementById('cfg-font-family');
    const cfgFontSize    = document.getElementById('cfg-font-size');
    const cfgLineHeight  = document.getElementById('cfg-line-height');
    const cfgPaperSize   = document.getElementById('cfg-paper-size');
    const cfgPaperOri    = document.getElementById('cfg-paper-orientation');

    // State
    let currentDocId   = null;
    let currentFormat  = 'pdf';
    let saveTimeout    = null;
    let isSyncing      = false;
    let isPreviewEditing = false;
    let previewEditTimeout = null;

    const PAGE_HEIGHTS = { 
        a4: { portrait: 1055, landscape: 720 }, 
        letter: { portrait: 1018, landscape: 750 }, 
        legal: { portrait: 1318, landscape: 750 } 
    };

    // --- Settings ---
    async function loadSettings() {
        try {
            const s = await dbGet('settings', 'editor');
            if (!s) return;
            if (s.fontFamily)  cfgFontFamily.value = s.fontFamily;
            if (s.fontSize)    cfgFontSize.value = s.fontSize;
            if (s.lineHeight)  cfgLineHeight.value = s.lineHeight;
            if (s.paperSize)   cfgPaperSize.value = s.paperSize;
            if (s.paperOri)    cfgPaperOri.value = s.paperOri;
            if (s.theme === 'light') document.documentElement.classList.remove('dark');
            if (s.pageBreaks)  pageBreakToggle.checked = true;
        } catch (e) {}
    }

    function saveSettings() {
        const isDark = document.documentElement.classList.contains('dark');
        dbPut('settings', {
            key: 'editor',
            fontFamily: cfgFontFamily.value,
            fontSize: cfgFontSize.value,
            lineHeight: cfgLineHeight.value,
            paperSize: cfgPaperSize.value,
            paperOri: cfgPaperOri.value,
            theme: isDark ? 'dark' : 'light',
            pageBreaks: pageBreakToggle.checked,
            lastDocId: currentDocId
        });
    }

    // --- Doc Logic ---
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
    }

    async function saveCurrentDoc() {
        if (!currentDocId) currentDocId = generateId();
        const doc = {
            id: currentDocId,
            title: titleInput.value.trim() || 'Untitled Document',
            content: textarea.value,
            updatedAt: Date.now()
        };
        await dbPut('documents', doc);
        saveSettings();
        showSaveStatus(true);
        renderDocList();
    }

    async function loadDoc(id) {
        const doc = await dbGet('documents', id);
        if (!doc) return;
        currentDocId = doc.id;
        titleInput.value = doc.title;
        textarea.value = doc.content;
        renderPreview();
        saveSettings();
        renderDocList();
    }

    async function deleteDoc(id) {
        await dbDelete('documents', id);
        if (currentDocId === id) {
            newDocument();
        }
        renderDocList();
    }

    function newDocument() {
        currentDocId = generateId();
        titleInput.value = 'Untitled Document';
        textarea.value = '';
        renderPreview();
        saveSettings();
        renderDocList();
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    async function renderDocList() {
        const docs = await dbGetAll('documents');
        docs.sort((a, b) => b.updatedAt - a.updatedAt);

        if (docs.length === 0) {
            modalDocList.innerHTML = '<p class="text-sm text-slate-400 italic col-span-full">No saved documents yet. Start typing to auto-save...</p>';
            return;
        }

        modalDocList.innerHTML = docs.map(doc => {
            const date = new Date(doc.updatedAt);
            const timeStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ', ' +
                            date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            const isActive = doc.id === currentDocId;
            const snippet = (doc.content || '').substring(0, 150).replace(/[#*`_>]+/g, ' ').replace(/\n/g, ' ').trim() + '...';
            const wordCount = (doc.content || '').trim() ? (doc.content || '').trim().split(/\s+/).length : 0;

            return `
                <div class="doc-item border ${isActive ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50'} rounded-xl p-5 cursor-pointer hover:border-primary/50 transition-colors flex flex-col group relative" data-id="${doc.id}">
                    <div class="flex items-start justify-between mb-3 w-full">
                        <h4 class="font-bold text-slate-900 dark:text-slate-100 truncate pr-6 text-sm flex-1">${escapeHtml(doc.title || 'Untitled Document')}</h4>
                        <button class="doc-delete absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-all z-10" data-delete="${doc.id}" title="Delete">
                            <span class="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                    </div>
                    <p class="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4 flex-1">${escapeHtml(snippet)}</p>
                    <div class="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-auto pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                        <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[12px]">schedule</span> ${timeStr}</span>
                        <span>${wordCount} words</span>
                    </div>
                </div>`;
        }).join('');

        modalDocList.querySelectorAll('.doc-item').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target.closest('[data-delete]')) return;
                loadDoc(el.dataset.id);
                docsModal.classList.add('hidden');
                docsModal.classList.remove('flex');
            });
        });
        modalDocList.querySelectorAll('[data-delete]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Delete this document?')) {
                    deleteDoc(btn.dataset.delete);
                }
            });
        });
    }

    // --- Markdown Rendering ---
    function renderPreview() {
        preview.innerHTML = parseAndSanitize(textarea.value);
        applyTypography();
        updatePageBreaks();
        updateStats();

        if (preview.contentEditable === "true") {
            bindPreviewEditEvents();
        }
    }

    function bindPreviewEditEvents() {
        preview.addEventListener('input', () => {
            if (!isPreviewEditing) {
                isPreviewEditing = true;
                showSaveStatus(false);
                clearTimeout(saveTimeout);
                clearTimeout(previewEditTimeout);

                previewEditTimeout = setTimeout(() => {
                    textarea.value = htmlToMarkdown(preview.innerHTML);
                    updateStats();
                    saveCurrentDoc();
                    isPreviewEditing = false;
                }, 1000);
            }
        });
    }

    preview.contentEditable = "true";
    bindPreviewEditEvents();

    function applyTypography() {
        const font = cfgFontFamily.value;
        const sizePx = Math.round((parseInt(cfgFontSize.value) || 12) * 1.333);
        const lh = parseFloat(cfgLineHeight.value) || 1.6;

        preview.style.fontFamily = font;
        preview.style.fontSize = sizePx + 'px';
        preview.style.lineHeight = String(lh);
    }

    function getPageHeight() {
        const paper = cfgPaperSize.value || 'a4';
        const ori = cfgPaperOri.value || 'portrait';
        return PAGE_HEIGHTS[paper][ori] || PAGE_HEIGHTS.a4.portrait;
    }

    function updatePageBreaks() {
        const ori = cfgPaperOri.value || 'portrait';
        if (ori === 'landscape') {
            preview.classList.add('paper-landscape');
            preview.classList.remove('paper-portrait');
        } else {
            preview.classList.add('paper-portrait');
            preview.classList.remove('paper-landscape');
        }

        let styleEl = document.getElementById('print-orientation-style');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'print-orientation-style';
            document.head.appendChild(styleEl);
        }
        styleEl.innerHTML = `@media print { @page { size: ${ori}; } }`;

        preview.querySelectorAll('.page-break-line, .page-break-label').forEach(el => el.remove());
        if (!pageBreakToggle.checked) return;

        requestAnimationFrame(() => {
            const contentHeight = preview.scrollHeight;
            const usableH = getPageHeight() - 120;
            if (usableH <= 0 || contentHeight <= usableH) return;

            const numBreaks = Math.floor(contentHeight / usableH);
            for (let i = 1; i <= numBreaks; i++) {
                const yPos = i * usableH;
                const line = document.createElement('div');
                line.className = 'page-break-line'; line.style.top = yPos + 'px';
                preview.appendChild(line);

                const label = document.createElement('div');
                label.className = 'page-break-label'; label.style.top = yPos + 'px';
                label.textContent = `Page ${i + 1}`;
                preview.appendChild(label);
            }
        });
    }

    function updateStats() {
        const text = textarea.value;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const lines = text ? text.split('\n').length : 0;
        statWords.textContent = `Words: ${words}`;
        statLines.textContent = `Lines: ${lines}`;
    }

    function showSaveStatus(saved) {
        if (saved) {
            statSaved.innerHTML = '<span class="material-symbols-outlined text-xs">check_circle</span> Saved';
            statSaved.className = 'text-green-500 flex items-center gap-1';
        } else {
            statSaved.innerHTML = '<span class="material-symbols-outlined text-xs">edit</span> Editing';
            statSaved.className = 'text-amber-500 flex items-center gap-1';
        }
    }

    textarea.addEventListener('input', () => {
        if (!isPreviewEditing) renderPreview();
        showSaveStatus(false);
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => saveCurrentDoc(), 1500);
    });

    titleInput.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => saveCurrentDoc(), 1500);
    });

    textarea.addEventListener('scroll', () => {
        if (isSyncing || previewContainer.classList.contains('hidden')) return;
        isSyncing = true;
        const maxScrollT = textarea.scrollHeight - textarea.clientHeight;
        if (maxScrollT > 0) {
            previewContainer.scrollTop = (textarea.scrollTop / maxScrollT) * (previewContainer.scrollHeight - previewContainer.clientHeight);
        }
        requestAnimationFrame(() => { isSyncing = false; });
    });

    previewContainer.addEventListener('scroll', () => {
        if (isSyncing || editorContainer.classList.contains('hidden')) return;
        isSyncing = true;
        const maxScrollP = previewContainer.scrollHeight - previewContainer.clientHeight;
        if (maxScrollP > 0) {
            textarea.scrollTop = (previewContainer.scrollTop / maxScrollP) * (textarea.scrollHeight - textarea.clientHeight);
        }
        requestAnimationFrame(() => { isSyncing = false; });
    });

    // --- UI bindings ---
    const viewBtns = {
        split: document.getElementById('btn-view-split'),
        code: document.getElementById('btn-view-code'),
        preview: document.getElementById('btn-view-preview')
    };

    function setViewClasses(active) {
        Object.values(viewBtns).forEach(btn => {
            btn.classList.remove('bg-white', 'dark:bg-slate-700', 'shadow-sm', 'text-primary');
            btn.classList.add('text-slate-500');
        });
        viewBtns[active].classList.add('bg-white', 'dark:bg-slate-700', 'shadow-sm', 'text-primary');
        viewBtns[active].classList.remove('text-slate-500');
    }

    viewBtns.split.onclick = () => {
        editorContainer.classList.remove('hidden'); editorContainer.style.width = '50%';
        previewContainer.classList.remove('hidden'); previewContainer.style.width = '50%';
        setViewClasses('split');
    };
    viewBtns.code.onclick = () => {
        editorContainer.classList.remove('hidden'); editorContainer.style.width = '100%';
        previewContainer.classList.add('hidden');
        setViewClasses('code');
    };
    viewBtns.preview.onclick = () => {
        editorContainer.classList.add('hidden');
        previewContainer.classList.remove('hidden'); previewContainer.style.width = '100%';
        setViewClasses('preview');
    };

    document.getElementById('toolbar-actions').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;

        const action = btn.dataset.action;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = textarea.value.substring(start, end);
        const before = textarea.value.substring(0, start);
        const after = textarea.value.substring(end);
        let insert = '';

        switch (action) {
            case 'h1': insert = `# ${selected || 'Heading 1'}`; break;
            case 'h2': insert = `## ${selected || 'Heading 2'}`; break;
            case 'h3': insert = `### ${selected || 'Heading 3'}`; break;
            case 'bold': insert = `**${selected || 'bold text'}**`; break;
            case 'italic': insert = `*${selected || 'italic text'}*`; break;
            case 'underline': insert = `<u>${selected || 'underlined'}</u>`; break;
            case 'list': insert = `\n- Item 1\n- Item 2\n- Item 3\n`; break;
            case 'link': insert = `[${selected || 'link text'}](https://)`; break;
            case 'image': insert = `![${selected || 'alt text'}](https://)`; break;
            case 'table': insert = `\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Cell     | Cell     | Cell     |\n`; break;
            case 'hr': insert = `\n---\n`; break;
            case 'code': insert = '\n```\n' + (selected || 'code here') + '\n```\n'; break;
        }

        textarea.value = before + insert + after;
        textarea.focus();
        textarea.setSelectionRange(start + insert.length, start + insert.length);
        textarea.dispatchEvent(new Event('input'));
    });

    document.getElementById('theme-toggle').onclick = () => {
        document.documentElement.classList.toggle('dark');
        saveSettings();
    };

    document.querySelectorAll('.export-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.export-option').forEach(el => {
                el.classList.remove('border-primary', 'bg-primary/5');
                el.classList.add('border-slate-200', 'dark:border-slate-800');
                el.querySelector('.format-icon').classList.remove('text-primary');
                el.querySelector('.format-icon').classList.add('text-slate-400');
                el.querySelector('.check-icon').classList.add('hidden');
            });

            opt.classList.remove('border-slate-200', 'dark:border-slate-800');
            opt.classList.add('border-primary', 'bg-primary/5');
            opt.querySelector('.format-icon').classList.remove('text-slate-400');
            opt.querySelector('.format-icon').classList.add('text-primary');
            opt.querySelector('.check-icon').classList.remove('hidden');

            currentFormat = opt.dataset.format;
        });
    });

    downloadBtn.addEventListener('click', () => {
        exportCurrent(currentFormat, textarea.value, titleInput.value);
    });

    document.getElementById('btn-top-export')?.addEventListener('click', () => {
        downloadBtn.click();
    });

    // Backup Zip trigger
    if(backupZipBtn) {
        backupZipBtn.addEventListener('click', () => {
            exportAllAsZip();
        });
    }

    document.getElementById('btn-new-doc').addEventListener('click', () => {
        saveCurrentDoc().then(() => newDocument());
    });

    document.getElementById('btn-open-doc')?.addEventListener('click', () => {
        docsModal.classList.remove('hidden'); docsModal.classList.add('flex');
    });

    btnCloseModal?.addEventListener('click', () => {
        docsModal.classList.add('hidden'); docsModal.classList.remove('flex');
    });

    [cfgFontFamily, cfgFontSize, cfgLineHeight, cfgPaperSize, cfgPaperOri, pageBreakToggle].forEach(el => {
        el.addEventListener('change', () => {
            applyTypography(); updatePageBreaks(); saveSettings();
        });
    });

    async function init() {
        await loadSettings();
        applyTypography();
        const settings = await dbGet('settings', 'editor');
        if (settings && settings.lastDocId) {
            const doc = await dbGet('documents', settings.lastDocId);
            if (doc) {
                currentDocId = doc.id;
                titleInput.value = doc.title;
                textarea.value = doc.content;
            }
        }
        if (!currentDocId) currentDocId = generateId();
        renderPreview();
        renderDocList();
    }
    init();
});
