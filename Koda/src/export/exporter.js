// src/export/exporter.js
import JSZip from 'jszip';
import { dbGetAll } from '../persistence/db.js';
import html2pdf from 'html2pdf.js';

export function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export function exportCurrent(format, text, titleInputVal, pdfConfig = null) {
    const title = titleInputVal.trim() || 'Untitled Document';
    const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    if (format === 'pdf') {
        if (!pdfConfig || !pdfConfig.element) {
            console.error('PDF export requires a configuration object with an element parameter.');
            return;
        }

        const paperFormat = pdfConfig.paperFormat || 'a4';
        const paperOri    = pdfConfig.paperOri || 'portrait';
        const paperContainer = pdfConfig.element;

        // html2pdf options
        const opt = {
            margin:       0,
            filename:     `${safeTitle}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
            jsPDF:        { unit: 'mm', format: paperFormat, orientation: paperOri }
        };

        html2pdf().set(opt).from(paperContainer).save();

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
    const titleInput = document.getElementById('doc-title');
    const textarea = document.getElementById('markdown-input');
    
    if(downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const paperFormat = document.getElementById('cfg-paper-size')?.value || 'a4';
            const paperOri = document.getElementById('cfg-paper-orientation')?.value || 'portrait';
            const paperContainer = document.getElementById('preview-container');

            exportCurrent(currentFormat, textarea?.value, titleInput?.value, {
                element: paperContainer,
                paperFormat: paperFormat,
                paperOri: paperOri
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
        if (!docs || docs.length === 0) {
            alert('No documents to backup.');
            return;
        }

        const zip = new JSZip();
        docs.forEach(doc => {
            const title = doc.title || 'Untitled Document';
            const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            zip.file(`${safeTitle}_${doc.id.substring(0,4)}.md`, doc.content || '');
        });

        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `koda_backup_${new Date().getTime()}.zip`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error('Failed to create ZIP', e);
        alert('Failed to generate backup ZIP.');
    }
}
