// src/main.js
import './shared/styles/global.css';
import './style.css';
<<<<<<< HEAD
import { exportCurrent, exportAllAsZip, initExporter } from './export/exporter.js';
import { initSettings, loadSettings } from './core/settings.js';
import { renderDocList } from './core/documentManager.js';
import { initEditorSync, renderPreview } from './editor/sync.js';
=======
import { exportCurrent, exportAllAsZip } from './export/exporter.js';
import { initSettings, loadSettings } from './core/settings.js';
import { renderDocList } from './core/documentManager.js';
import { initEditorSync } from './editor/sync.js';
>>>>>>> fbf4d06169cf57db7eb69afe6721c991bdbc0d20
import { initToolbar } from './editor/toolbar.js';
import { initViewModes } from './ui/viewModes.js';
import { initModals } from './ui/modals.js';
import { initDragDrop } from './ui/dragDrop.js';
import { initThemeToggle } from './ui/theme.js';
import { initPaperScaleObserver } from './ui/paperScale.js';
import { startTour } from './ui/tour.js';
<<<<<<< HEAD
import { mountHeader } from './modules/header/header.js';
import { mountEditor } from './modules/editor_view/editor.js';
import { mountSidebar } from './modules/sidebar/sidebar.js';
import { mountToolbar } from './modules/toolbar/toolbar.js';
import { mountModals } from './modules/modals/modals.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 0. Mount UI Components
    mountHeader('app-header');
    mountToolbar('app-toolbar');
    mountEditor('app-main');
    mountSidebar('app-sidebar');
    mountModals('app-modals');

=======

document.addEventListener('DOMContentLoaded', async () => {
>>>>>>> fbf4d06169cf57db7eb69afe6721c991bdbc0d20
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
<<<<<<< HEAD
    initExporter();
=======
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
>>>>>>> fbf4d06169cf57db7eb69afe6721c991bdbc0d20

    // 4. Initial State Load
    await loadSettings();
    await renderDocList();
    
    // Explicitly render the first time
    renderPreview();

    startTour();
});
