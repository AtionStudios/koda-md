// src/export/exporter.js
import JSZip from 'jszip';
import { dbGetAll } from '../persistence/db.js';
import { editorView, renderPreview } from '../editor/sync.js';

export function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * PDF export using the browser's native print dialog.
 * Order is critical:
 *   1. Make preview visible
 *   2. Force Light Mode (prevent white-on-white text)
 *   3. Render pages (synchronously via renderPreview)
 *   4. Wait for DOM paint (extra safety for large docs)
 *   5. Call window.print()
 *   6. Restore state after dialog closes
 */
function exportPdf(titleVal) {
    const previewContainer = document.getElementById('preview-container');
    const editorContainer  = document.getElementById('editor-container');
    const htmlEl           = document.documentElement;

    if (!previewContainer) return;

    const wasDark       = htmlEl.classList.contains('dark');
    const wasHidden     = previewContainer.classList.contains('hidden');
    const prevEdWidth   = editorContainer?.style.width;
    const prevPrevWidth = previewContainer.style.width;

    // Step 1: Force Light Mode for printing
    if (wasDark) htmlEl.classList.remove('dark');

    // Step 2: Ensure the preview-container is visible
    if (wasHidden) {
        previewContainer.classList.remove('hidden');
        previewContainer.style.width = '100%';
        if (editorContainer) {
            editorContainer.style.width = '0px';
            editorContainer.style.overflow = 'hidden';
        }
    }

    // Step 3: Force a clean re-render of all pages
    renderPreview();

    // Step 4: Set document title for PDF filename suggestion
    const originalTitle = document.title;
    document.title = (titleVal || 'Untitled Document').trim();

    // Step 5: Wait for DOM to paint all pages, then open print dialog
    // 800ms is safer for larger documents with many pages
    setTimeout(() => {
        window.print();

        // Step 6: Restore state after dialog closes
        document.title = originalTitle;
        if (wasDark) htmlEl.classList.add('dark');
        
        if (wasHidden) {
            previewContainer.classList.add('hidden');
            previewContainer.style.width = prevPrevWidth;
            if (editorContainer) {
                editorContainer.style.width = prevEdWidth;
                editorContainer.style.overflow = '';
            }
        }
    }, 800);
}

export function exportCurrent(format, titleInputVal, settings) {
    const title    = (titleInputVal || '').trim() || 'Untitled Document';
    const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const text     = editorView ? editorView.state.doc.toString() : '';

    if (format === 'pdf') {
        exportPdf(title);
    } else if (format === 'md') {
        downloadFile(text, `${safeTitle}.md`, 'text/markdown');
    } else if (format === 'txt') {
        downloadFile(text, `${safeTitle}.txt`, 'text/plain');
    }
}

export function initExporter() {
    let currentFormat = 'pdf';

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

    const downloadBtn = document.getElementById('btn-download');
    const titleInput  = document.getElementById('doc-title');

    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            exportCurrent(currentFormat, titleInput?.value, {
                paperFormat: document.getElementById('cfg-paper-size')?.value || 'a4',
                paperOri:    document.getElementById('cfg-paper-orientation')?.value || 'portrait'
            });
        });
    }

    const topExport = document.getElementById('btn-top-export');
    if (topExport) topExport.addEventListener('click', () => downloadBtn?.click());

    const backupZipBtn = document.getElementById('btn-backup-zip');
    if (backupZipBtn) backupZipBtn.addEventListener('click', () => exportAllAsZip());
}

export async function exportAllAsZip() {
    try {
        const docs = await dbGetAll('documents');
        if (!docs || docs.length === 0) { alert('No documents to backup.'); return; }

        const zip = new JSZip();
        docs.forEach(doc => {
            const safeTitle = (doc.title || 'untitled').replace(/[^a-z0-9]/gi, '_').toLowerCase();
            zip.file(`${safeTitle}_${doc.id.substring(0, 4)}.md`, doc.content || '');
        });

        const blob = await zip.generateAsync({ type: 'blob' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `koda_backup_${Date.now()}.zip`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error('Failed to create ZIP', e);
        alert('Failed to generate backup ZIP.');
    }
}
