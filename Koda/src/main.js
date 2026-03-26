// src/main.js
import './shared/styles/global.css';
import './style.css';
import { exportCurrent, exportAllAsZip, initExporter } from './export/exporter.js';
import { initSettings, loadSettings } from './core/settings.js';
import { renderDocList } from './core/documentManager.js';
import { initEditorSync, renderPreview } from './editor/sync.js';
import { initToolbar } from './editor/toolbar.js';
import { initViewModes } from './ui/viewModes.js';
import { initModals } from './ui/modals.js';
import { initDragDrop } from './ui/dragDrop.js';
import { initThemeToggle } from './ui/theme.js';
import { initPaperScaleObserver } from './ui/paperScale.js';
import { startTour } from './ui/tour.js';
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
    initExporter();

    // 4. Initial State Load
    await loadSettings();
    await renderDocList();
    
    // Explicitly render the first time
    renderPreview();

    startTour();
});
