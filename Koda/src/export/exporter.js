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

export function exportCurrent(format, text, titleInputVal) {
    const title = titleInputVal.trim() || 'Untitled Document';
    const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    if (format === 'pdf') {
        // Read current paper settings from DOM
        const formatSelect = document.getElementById('cfg-paper-size');
        const oriSelect    = document.getElementById('cfg-paper-orientation');
        
        const paperFormat = formatSelect ? formatSelect.value : 'a4';
        const paperOri    = oriSelect    ? oriSelect.value    : 'portrait';

        const paperContainer = document.getElementById('preview-container');
        if (!paperContainer) return;

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
