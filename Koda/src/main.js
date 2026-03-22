// src/main.js
import './style.css';
import { dbPut, dbGet, dbGetAll, dbDelete } from './persistence/db.js';
import { parseAndSanitize, htmlToMarkdown } from './renderer/markdown.js';
import { exportCurrent, exportAllAsZip } from './export/exporter.js';

// ═══════════════════════════════════════════
// TEMPLATES
// ═══════════════════════════════════════════
const TEMPLATES = {
    blank: '',
    report: `# Report Title

**Author:** Your Name  
**Date:** ${new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}  
**Version:** 1.0

---

## Executive Summary

Provide a brief summary of the report here.

## Background

Explain the context and motivation for this report.

## Findings

### Finding 1
Detail your first finding here.

### Finding 2
Detail your second finding here.

## Recommendations

- Recommendation 1
- Recommendation 2
- Recommendation 3

## Conclusion

Summarize the main takeaways and next steps.
`,
    meeting: `# Meeting Notes

**Date:** ${new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}  
**Time:** 00:00  
**Location / Link:**  

---

## Participants

- Name · Role
- Name · Role

## Agenda

1. Topic One
2. Topic Two
3. Topic Three

## Discussion

### Topic One
*Notes here...*

### Topic Two
*Notes here...*

## Decisions Made

- [ ] Decision 1
- [ ] Decision 2

## Action Items

| Task | Owner | Due Date |
|------|-------|----------|
| Task description | Name | dd/mm/yyyy |

## Next Meeting

**Date:** TBD
`,
    readme: `# Project Name

> One-line description of your project.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## Overview

Describe your project in more detail here.

## Features

- ✅ Feature 1
- ✅ Feature 2
- ✅ Feature 3

## Getting Started

### Prerequisites

List what the user needs to install first.

### Installation

\`\`\`bash
git clone https://github.com/your-org/your-repo.git
cd your-repo
npm install
\`\`\`

### Usage

\`\`\`bash
npm run dev
\`\`\`

## Contributing

Pull requests are welcome! For major changes, please open an issue first.

## License

[MIT](LICENSE) © Your Name
`
};

// ═══════════════════════════════════════════
// TOUR STEPS
// ═══════════════════════════════════════════
const TOUR_STEPS = [
    { targetId: 'markdown-input',   title: '✍️ Write markdown here', body: 'Type your content on the left. A live preview appears on the right — instantly.' },
    { targetId: 'markdown-preview', title: '👁️ Your document preview', body: 'This is what your final document will look like. You can also click directly here to edit.' },
    { targetId: 'toolbar-actions',  title: '🔧 Formatting toolbar', body: 'Quickly insert headings, bold, tables, code blocks and more with one click.' },
    { targetId: 'stat-saved',       title: '💾 Auto-save is on', body: 'Koda saves your work automatically to your browser\'s local storage. Nothing is sent to a server — ever.' },
    { targetId: 'btn-download',     title: '📄 Export your document', body: 'Download as PDF, raw Markdown (.md) or plain text (.txt) whenever you\'re ready.' },
];

document.addEventListener('DOMContentLoaded', () => {
    const textarea          = document.getElementById('markdown-input');
    const preview           = document.getElementById('markdown-preview');
    const editorContainer   = document.getElementById('editor-container');
    const previewContainer  = document.getElementById('preview-container');
    const titleInput        = document.getElementById('doc-title');
    const pageBreakToggle   = document.getElementById('toggle-page-breaks');
    const downloadBtn       = document.getElementById('btn-download');
    const backupZipBtn      = document.getElementById('btn-backup-zip');
    const modalDocList      = document.getElementById('modal-doc-list');
    const docsModal         = document.getElementById('docs-modal');
    const btnCloseModal     = document.getElementById('btn-close-modal');
    const statWords         = document.getElementById('stat-words');
    const statLines         = document.getElementById('stat-lines');
    const statSaved         = document.getElementById('stat-saved');

    // Config controls
    const cfgFontFamily = document.getElementById('cfg-font-family');
    const cfgFontSize   = document.getElementById('cfg-font-size');
    const cfgLineHeight = document.getElementById('cfg-line-height');
    const cfgPaperSize  = document.getElementById('cfg-paper-size');
    const cfgPaperOri   = document.getElementById('cfg-paper-orientation');

    // New doc modal
    const newDocModal        = document.getElementById('new-doc-modal');
    const newDocTitleInput   = document.getElementById('new-doc-title-input');
    const btnCloseNewModal   = document.getElementById('btn-close-new-modal');
    const btnCancelNewDoc    = document.getElementById('btn-cancel-new-doc');
    const btnConfirmNewDoc   = document.getElementById('btn-confirm-new-doc');
    const newDocFileInput    = document.getElementById('new-doc-file-input');
    const globalDropZone     = document.getElementById('global-drop-zone');

    // State
    let currentDocId       = null;
    let currentFormat      = 'pdf';
    let saveTimeout        = null;
    let isSyncing          = false;
    let isPreviewEditing   = false;
    let previewEditTimeout = null;
    let selectedTemplate   = 'blank';
    let isPageMode         = false;

    // Total heights in px at 96 DPI
    const PAGE_HEIGHTS = {
        a4:     { portrait: 1123, landscape: 794 },
        letter: { portrait: 1056, landscape: 816 },
        legal:  { portrait: 1344, landscape: 816 }
    };

    // ═══════════════════════════════════════════
    // SETTINGS
    // ═══════════════════════════════════════════
    async function loadSettings() {
        try {
            const s = await dbGet('settings', 'editor');
            if (!s) return;
            if (s.fontFamily)  cfgFontFamily.value = s.fontFamily;
            if (s.fontSize)    cfgFontSize.value   = s.fontSize;
            if (s.lineHeight)  cfgLineHeight.value  = s.lineHeight;
            if (s.paperSize)   cfgPaperSize.value   = s.paperSize;
            if (s.paperOri)    cfgPaperOri.value    = s.paperOri;
            if (s.theme === 'light') document.documentElement.classList.remove('dark');
            if (s.pageBreaks)  pageBreakToggle.checked = true;
        } catch (e) {}
    }

    function saveSettings() {
        const isDark = document.documentElement.classList.contains('dark');
        dbPut('settings', {
            key: 'editor',
            fontFamily: cfgFontFamily.value,
            fontSize:   cfgFontSize.value,
            lineHeight: cfgLineHeight.value,
            paperSize:  cfgPaperSize.value,
            paperOri:   cfgPaperOri.value,
            theme:      isDark ? 'dark' : 'light',
            pageBreaks: pageBreakToggle.checked,
            lastDocId:  currentDocId
        });
    }

    // ═══════════════════════════════════════════
    // DOCUMENT CRUD
    // ═══════════════════════════════════════════
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
    }

    async function saveCurrentDoc() {
        if (!currentDocId) currentDocId = generateId();
        await dbPut('documents', {
            id:        currentDocId,
            title:     titleInput.value.trim() || 'Untitled Document',
            content:   textarea.value,
            updatedAt: Date.now()
        });
        saveSettings();
        showSaveStatus(true);
        renderDocList();
    }

    async function loadDoc(id) {
        const doc = await dbGet('documents', id);
        if (!doc) return;
        currentDocId      = doc.id;
        titleInput.value  = doc.title;
        textarea.value    = doc.content;
        renderPreview();
        saveSettings();
        renderDocList();
    }

    async function deleteDoc(id) {
        await dbDelete('documents', id);
        if (currentDocId === id) createNewDocument('', '');
        renderDocList();
    }

    function createNewDocument(title, content) {
        currentDocId      = generateId();
        titleInput.value  = title || 'Untitled Document';
        textarea.value    = content || '';
        renderPreview();
        saveSettings();
        renderDocList();
    }

    function escapeHtml(str) {
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    async function renderDocList() {
        const docs = await dbGetAll('documents');
        docs.sort((a, b) => b.updatedAt - a.updatedAt);

        if (docs.length === 0) {
            modalDocList.innerHTML = '<p class="text-sm text-slate-400 italic col-span-full">No saved documents yet. Start typing to auto-save...</p>';
            return;
        }

        modalDocList.innerHTML = docs.map(doc => {
            const date    = new Date(doc.updatedAt);
            const timeStr = date.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) + ', ' +
                            date.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
            const isActive  = doc.id === currentDocId;
            const snippet   = (doc.content || '').substring(0, 150).replace(/[#*`_>]+/g, ' ').replace(/\n/g, ' ').trim() + '...';
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
                docsModal.classList.add('hidden'); docsModal.classList.remove('flex');
            });
        });
        modalDocList.querySelectorAll('[data-delete]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Delete this document?')) deleteDoc(btn.dataset.delete);
            });
        });
    }

    // ═══════════════════════════════════════════
    // MARKDOWN RENDERING
    // ═══════════════════════════════════════════
    function renderPreview() {
        preview.innerHTML = parseAndSanitize(textarea.value);
        applyTypography();
        updatePageBreaks();
        updateStats();
    }

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
            saveCurrentDoc();
            isPreviewEditing = false;
        }, 1000);
    });

    function applyTypography() {
        const sizePx = Math.round((parseInt(cfgFontSize.value) || 12) * 1.333);
        preview.style.fontFamily  = cfgFontFamily.value;
        preview.style.fontSize    = sizePx + 'px';
        preview.style.lineHeight  = String(parseFloat(cfgLineHeight.value) || 1.6);
    }

    function getPageHeight() {
        const paper = cfgPaperSize.value || 'a4';
        const ori   = cfgPaperOri.value  || 'portrait';
        return PAGE_HEIGHTS[paper]?.[ori] || PAGE_HEIGHTS.a4.portrait;
    }

    function updatePageBreaks() {
        const ori   = cfgPaperOri.value  || 'portrait';
        const paper = cfgPaperSize.value || 'a4';

        preview.classList.toggle('paper-landscape', ori === 'landscape');
        preview.classList.toggle('paper-portrait',  ori !== 'landscape');

        // Map internal paper names to CSS @page size values
        const paperCssName = { a4: 'A4', letter: 'letter', legal: 'legal' };
        const cssName = paperCssName[paper] || 'A4';

        // Inject FULL @page rule: size = paper + orientation
        // This makes the browser PDF engine use the exact same paper as the preview
        let styleEl = document.getElementById('print-orientation-style');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'print-orientation-style';
            document.head.appendChild(styleEl);
        }
        styleEl.innerHTML = `@media print { @page { size: ${cssName} ${ori}; margin: 18mm 20mm; } }`;

        preview.querySelectorAll('.page-break-line, .page-break-label').forEach(el => el.remove());
        if (!pageBreakToggle.checked) return;

        requestAnimationFrame(() => {
            const contentHeight = preview.scrollHeight;
            // 24mm ≈ 91px, 20mm ≈ 76px (@ 96dpi)
            const padTop = (ori === 'portrait') ? 91 : 76; 
            const padFix = (ori === 'portrait') ? 182 : 152; // top + bottom padding
            const usableH = getPageHeight() - padFix;
            
            if (usableH <= 0 || contentHeight <= usableH) return;
            const numBreaks = Math.floor(contentHeight / usableH);
            
            for (let i = 1; i <= numBreaks; i++) {
                const yPos  = padTop + (i * usableH);
                const line  = Object.assign(document.createElement('div'), { className: 'page-break-line', 'data-no-print': 'true' });
                line.style.top = yPos + 'px';
                const label = Object.assign(document.createElement('div'), { className: 'page-break-label', textContent: `Page ${i + 1}`, 'data-no-print': 'true' });
                label.style.top = yPos + 'px';
                preview.appendChild(line);
                preview.appendChild(label);
            }
        });
    }

    // ═══════════════════════════════════════════
    // F1: PREVIEW A4 REAL PAGE MODE
    // ═══════════════════════════════════════════
    function applyPageMode(active) {
        isPageMode = active;
        if (active) {
            const paper = cfgPaperSize.value || 'a4';
            const ori   = cfgPaperOri.value  || 'portrait';
            // Remove old page classes
            preview.className = preview.className.replace(/page-[a-z]+-[a-z]+/g, '').trim();
            preview.classList.add(`page-${paper}-${ori}`);
        } else {
            preview.className = preview.className.replace(/page-[a-z]+-[a-z]+/g, '').trim();
        }
    }

    // ═══════════════════════════════════════════
    // STATS & SAVE STATUS
    // ═══════════════════════════════════════════
    function updateStats() {
        const text    = textarea.value;
        const words   = text.trim() ? text.trim().split(/\s+/).length : 0;
        const lines   = text ? text.split('\n').length : 0;
        statWords.textContent = `Words: ${words}`;
        statLines.textContent = `Lines: ${lines}`;
    }

    function showSaveStatus(saved) {
        if (saved) {
            statSaved.innerHTML   = '<span class="material-symbols-outlined text-xs">check_circle</span> Saved';
            statSaved.className   = 'text-green-500 flex items-center gap-1';
        } else {
            statSaved.innerHTML   = '<span class="material-symbols-outlined text-xs">edit</span> Editing';
            statSaved.className   = 'text-amber-500 flex items-center gap-1';
        }
    }

    // ═══════════════════════════════════════════
    // TEXTAREA / SCROLL SYNC
    // ═══════════════════════════════════════════
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
        const maxT = textarea.scrollHeight - textarea.clientHeight;
        if (maxT > 0) previewContainer.scrollTop = (textarea.scrollTop / maxT) * (previewContainer.scrollHeight - previewContainer.clientHeight);
        requestAnimationFrame(() => { isSyncing = false; });
    });

    previewContainer.addEventListener('scroll', () => {
        if (isSyncing || editorContainer.classList.contains('hidden')) return;
        isSyncing = true;
        const maxP = previewContainer.scrollHeight - previewContainer.clientHeight;
        if (maxP > 0) textarea.scrollTop = (previewContainer.scrollTop / maxP) * (textarea.scrollHeight - textarea.clientHeight);
        requestAnimationFrame(() => { isSyncing = false; });
    });

    // ═══════════════════════════════════════════
    // FIT PAPER SCALE OBSERVER
    // ═══════════════════════════════════════════
    function fitPreviewPaperScale() {
        if (!isPageMode || previewContainer.classList.contains('hidden')) return;
        
        // Reset to read actual physically computed pixel width (from MM)
        preview.style.transform = 'none';
        
        const availableW = previewContainer.clientWidth - 40; // 20px padding each side in wrapper
        const paperW     = preview.offsetWidth;
        const paperH     = preview.offsetHeight;
        const scale      = (paperW > availableW && paperW > 0) ? availableW / paperW : 1;
        
        if (scale < 1) {
            preview.style.transform = `scale(${scale})`;
            preview.style.transformOrigin = 'top center';
            preview.style.marginBottom = '0'; // Remover a gambiarra antiga
            
            // Set scale wrapper height to match scaled down paper to properly handle container scrolling
            const wrapper = preview.closest('.paper-scale-wrapper');
            if (wrapper) {
                // padding applied in CSS is 40px top + 40px bottom roughly
                wrapper.style.minHeight = `${(paperH * scale) + 80}px`;
            }
        } else {
            preview.style.transform = 'none';
            preview.style.marginBottom = '0';
            const wrapper = preview.closest('.paper-scale-wrapper');
            if (wrapper) wrapper.style.minHeight = 'auto';
        }
    }

    const ro = new ResizeObserver(() => window.requestAnimationFrame(fitPreviewPaperScale));
    ro.observe(previewContainer);

    // ═══════════════════════════════════════════
    // VIEW MODES
    // ═══════════════════════════════════════════
    const viewBtns = {
        split:   document.getElementById('btn-view-split'),
        code:    document.getElementById('btn-view-code'),
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
        applyPageMode(true);
        setViewClasses('split');
    };
    viewBtns.code.onclick = () => {
        editorContainer.classList.remove('hidden'); editorContainer.style.width = '100%';
        previewContainer.classList.add('hidden');
        // pageMode can stay true behind the scenes
        setViewClasses('code');
    };
    viewBtns.preview.onclick = () => {
        editorContainer.classList.add('hidden');
        previewContainer.classList.remove('hidden'); previewContainer.style.width = '100%';
        applyPageMode(true);   // ← F1: activate page mode on preview
        setViewClasses('preview');
    };

    // ═══════════════════════════════════════════
    // TOOLBAR
    // ═══════════════════════════════════════════
    document.getElementById('toolbar-actions').addEventListener('click', (e) => {
        const btn    = e.target.closest('[data-action]');
        if (!btn) return;
        const action = btn.dataset.action;
        const start  = textarea.selectionStart;
        const end    = textarea.selectionEnd;
        const sel    = textarea.value.substring(start, end);
        const before = textarea.value.substring(0, start);
        const after  = textarea.value.substring(end);
        let insert   = '';

        switch (action) {
            case 'h1':        insert = `# ${sel || 'Heading 1'}`; break;
            case 'h2':        insert = `## ${sel || 'Heading 2'}`; break;
            case 'h3':        insert = `### ${sel || 'Heading 3'}`; break;
            case 'bold':      insert = `**${sel || 'bold text'}**`; break;
            case 'italic':    insert = `*${sel || 'italic text'}*`; break;
            case 'underline': insert = `<u>${sel || 'underlined'}</u>`; break;
            case 'list':      insert = `\n- Item 1\n- Item 2\n- Item 3\n`; break;
            case 'link':      insert = `[${sel || 'link text'}](https://)`; break;
            case 'image':     insert = `![${sel || 'alt text'}](https://)`; break;
            case 'table':     insert = `\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Cell     | Cell     | Cell     |\n`; break;
            case 'hr':        insert = `\n---\n`; break;
            case 'code':      insert = '\n```\n' + (sel || 'code here') + '\n```\n'; break;
        }

        textarea.value = before + insert + after;
        textarea.focus();
        textarea.setSelectionRange(start + insert.length, start + insert.length);
        textarea.dispatchEvent(new Event('input'));
    });

    // ═══════════════════════════════════════════
    // EXPORT
    // ═══════════════════════════════════════════
    document.querySelectorAll('.export-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.export-option').forEach(el => {
                el.classList.remove('border-primary', 'bg-primary/5');
                el.classList.add('border-slate-200', 'dark:border-slate-800');
                el.querySelector('.format-icon').classList.replace('text-primary', 'text-slate-400');
                el.querySelector('.check-icon').classList.add('hidden');
            });
            opt.classList.remove('border-slate-200', 'dark:border-slate-800');
            opt.classList.add('border-primary', 'bg-primary/5');
            opt.querySelector('.format-icon').classList.replace('text-slate-400', 'text-primary');
            opt.querySelector('.check-icon').classList.remove('hidden');
            currentFormat = opt.dataset.format;
        });
    });

    downloadBtn.addEventListener('click', () => exportCurrent(currentFormat, textarea.value, titleInput.value));
    document.getElementById('btn-top-export')?.addEventListener('click', () => downloadBtn.click());
    if (backupZipBtn) backupZipBtn.addEventListener('click', () => exportAllAsZip());

    // ═══════════════════════════════════════════
    // F2: NEW DOCUMENT MODAL
    // ═══════════════════════════════════════════
    function openNewDocModal() {
        selectedTemplate = 'blank';
        newDocTitleInput.value = '';
        document.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
        document.querySelector('[data-template="blank"]').classList.add('selected');
        newDocModal.classList.remove('hidden'); newDocModal.classList.add('flex');
        setTimeout(() => newDocTitleInput.focus(), 100);
    }

    function closeNewDocModal() {
        newDocModal.classList.add('hidden'); newDocModal.classList.remove('flex');
    }

    function confirmNewDoc() {
        const title   = newDocTitleInput.value.trim() || 'Untitled Document';
        const content = TEMPLATES[selectedTemplate] || '';
        closeNewDocModal();
        createNewDocument(title, content);
        saveCurrentDoc();
    }

    document.getElementById('btn-new-doc').addEventListener('click', openNewDocModal);
    btnCloseNewModal.addEventListener('click', closeNewDocModal);
    btnCancelNewDoc.addEventListener('click', closeNewDocModal);
    btnConfirmNewDoc.addEventListener('click', confirmNewDoc);
    newDocTitleInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') confirmNewDoc(); });

    document.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedTemplate = card.dataset.template;
        });
    });

    // File input upload
    function loadFileContent(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const content  = e.target.result;
            const title    = file.name.replace(/\.(md|txt)$/i, '');
            newDocTitleInput.value = title;
            selectedTemplate = 'blank';
            document.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
            document.querySelector('[data-template="blank"]').classList.add('selected');
            // close modal and open the file immediately
            closeNewDocModal();
            createNewDocument(title, content);
            saveCurrentDoc();
        };
        reader.readAsText(file);
    }

    newDocFileInput.addEventListener('change', (e) => loadFileContent(e.target.files[0]));

    // Global drag & drop over the page
    let dragCounter = 0;
    document.addEventListener('dragenter', (e) => {
        if (e.dataTransfer.types.includes('Files')) {
            dragCounter++;
            globalDropZone.classList.remove('hidden');
            globalDropZone.classList.add('drop-zone-active');
        }
    });
    document.addEventListener('dragleave', () => {
        dragCounter--;
        if (dragCounter <= 0) {
            dragCounter = 0;
            globalDropZone.classList.add('hidden');
            globalDropZone.classList.remove('drop-zone-active');
        }
    });
    document.addEventListener('dragover', (e) => e.preventDefault());
    document.addEventListener('drop', (e) => {
        e.preventDefault();
        dragCounter = 0;
        globalDropZone.classList.add('hidden');
        globalDropZone.classList.remove('drop-zone-active');
        const file = e.dataTransfer.files[0];
        if (file && /\.(md|txt)$/i.test(file.name)) {
            loadFileContent(file);
        } else if (file) {
            alert('Only .md and .txt files are supported.');
        }
    });

    // ═══════════════════════════════════════════
    // MISC UI
    // ═══════════════════════════════════════════
    document.getElementById('theme-toggle').onclick = () => {
        document.documentElement.classList.toggle('dark');
        saveSettings();
    };

    document.getElementById('btn-open-doc')?.addEventListener('click', () => {
        docsModal.classList.remove('hidden'); docsModal.classList.add('flex');
    });
    btnCloseModal?.addEventListener('click', () => {
        docsModal.classList.add('hidden'); docsModal.classList.remove('flex');
    });

    [cfgFontFamily, cfgFontSize, cfgLineHeight, cfgPaperSize, cfgPaperOri, pageBreakToggle].forEach(el => {
        el.addEventListener('change', () => {
            applyTypography(); updatePageBreaks();
            if (isPageMode) applyPageMode(true); // re-apply page class on paper change
            saveSettings();
        });
    });

    // ═══════════════════════════════════════════
    // F3: ONBOARDING TOUR
    // ═══════════════════════════════════════════
    let tourStep = 0;
    let tourEl   = null;

    function startTour() {
        if (localStorage.getItem('koda_onboarding_done')) return;
        tourStep = 0;
        showTourStep(0);
    }

    function showTourStep(idx) {
        clearTourEl();
        if (idx >= TOUR_STEPS.length) { endTour(); return; }
        const step   = TOUR_STEPS[idx];
        const target = document.getElementById(step.targetId);
        if (!target) { showTourStep(idx + 1); return; }
        const rect   = target.getBoundingClientRect();
        const pad    = 8;

        // Highlight box
        const hbox = document.createElement('div');
        hbox.className = 'tour-highlight-box';
        hbox.style.cssText = `top:${rect.top - pad}px;left:${rect.left - pad}px;width:${rect.width + pad*2}px;height:${rect.height + pad*2}px`;
        document.body.appendChild(hbox);

        // Tooltip
        const tt = document.createElement('div');
        tt.className = 'tour-tooltip';
        const dots = TOUR_STEPS.map((_, i) =>
            `<span class="tour-dot ${i === idx ? 'active' : ''}"></span>`).join('');
        tt.innerHTML = `
            <div class="tour-step-count">Step ${idx + 1} of ${TOUR_STEPS.length}</div>
            <h4>${step.title}</h4>
            <p>${step.body}</p>
            <div class="tour-actions">
                <div class="flex items-center gap-2">
                    <div class="tour-progress">${dots}</div>
                    <button class="tour-btn-skip">Skip tour</button>
                </div>
                <button class="tour-btn-next">${idx === TOUR_STEPS.length - 1 ? 'Finish 🎉' : 'Next →'}</button>
            </div>`;

        // Smart positioning — never leave the viewport
        const TT_W      = 320;
        const TT_H      = 190;
        const MARGIN    = 12;
        const vw        = window.innerWidth;
        const vh        = window.innerHeight;
        const PAD       = 12;

        let top  = 0;
        let left = rect.left;

        if (vh - rect.bottom >= TT_H + MARGIN) {
            // Prefer below
            top = rect.bottom + MARGIN;
        } else if (rect.top >= TT_H + MARGIN) {
            // Try above
            top = rect.top - TT_H - MARGIN;
        } else if (vw - rect.right >= TT_W + MARGIN) {
            // Try right
            top  = rect.top;
            left = rect.right + MARGIN;
        } else if (rect.left >= TT_W + MARGIN) {
            // Try left
            top  = rect.top;
            left = rect.left - TT_W - MARGIN;
        } else {
            // Fallback: center of screen
            top  = (vh - TT_H) / 2;
            left = (vw - TT_W) / 2;
        }

        // Final clamp — always stay inside viewport
        top  = Math.max(PAD, Math.min(top,  vh - TT_H - PAD));
        left = Math.max(PAD, Math.min(left, vw - TT_W - PAD));

        tt.style.top   = top  + 'px';
        tt.style.left  = left + 'px';
        tt.style.width = TT_W + 'px';

        document.body.appendChild(tt);
        tt.querySelector('.tour-btn-next').onclick  = () => showTourStep(idx + 1);
        tt.querySelector('.tour-btn-skip').onclick  = () => endTour();

        tourEl = [hbox, tt];
    }

    function clearTourEl() {
        if (tourEl) { tourEl.forEach(el => el.remove()); tourEl = null; }
    }

    function endTour() {
        clearTourEl();
        localStorage.setItem('koda_onboarding_done', '1');
    }

    // ═══════════════════════════════════════════
    // INIT
    // ═══════════════════════════════════════════
    async function init() {
        await loadSettings();
        applyTypography();

        const settings = await dbGet('settings', 'editor');
        if (settings?.lastDocId) {
            const doc = await dbGet('documents', settings.lastDocId);
            if (doc) {
                currentDocId     = doc.id;
                titleInput.value = doc.title;
                textarea.value   = doc.content;
            }
        }
        if (!currentDocId) currentDocId = generateId();

        renderPreview();
        renderDocList();
        
        // Ativa o modo de página físico assim que a renderização inicial estiver pronta
        applyPageMode(true);
        setViewClasses('split'); // Garante que o estado visual dos botões também condiz com inicialização

        setTimeout(startTour, 800); // slight delay so UI is stable
    }

    init();
});
