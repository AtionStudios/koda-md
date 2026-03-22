// src/export/exporter.js
import JSZip from 'jszip';
import { dbGetAll } from '../persistence/db.js';

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
        window.print();
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
