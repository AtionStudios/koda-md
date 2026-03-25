// src/main.js
import './style.css';
import { exportCurrent, exportAllAsZip } from './export/exporter.js';
import { initSettings, loadSettings } from './core/settings.js';
import { renderDocList } from './core/documentManager.js';
import { initEditorSync } from './editor/sync.js';
import { initToolbar } from './editor/toolbar.js';
import { initViewModes } from './ui/viewModes.js';
import { initModals } from './ui/modals.js';
import { initDragDrop } from './ui/dragDrop.js';
import { initThemeToggle } from './ui/theme.js';
import { initPaperScaleObserver } from './ui/paperScale.js';
import { startTour } from './ui/tour.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Core & Editor logic
    initSettings();
    initEditorSync();
    initToolbar();

    // 2. UI Modules
    initViewModes();
    initModals();
    initDragDrop();
    initThemeToggle();
    initPaperScaleObserver();

    // 3. Export Bindings
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
        downloadBtn.addEventListener('click', () => exportCurrent(currentFormat, textarea?.value, titleInput?.value));
    }
    document.getElementById('btn-top-export')?.addEventListener('click', () => downloadBtn?.click());
    
    const backupZipBtn = document.getElementById('btn-backup-zip');
    if (backupZipBtn) backupZipBtn.addEventListener('click', () => exportAllAsZip());

    // 4. Initial State Load
    await loadSettings();
    await renderDocList();
    
    // Explicitly render the first time
    renderPreview();

    startTour();
});
