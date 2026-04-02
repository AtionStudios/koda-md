// src/ui/dragDrop.js
import { loadFileContent } from './modals.js';

export function initDragDrop() {
    let dragCounter = 0;
    const globalDropZone = document.getElementById('global-drop-zone');

    document.addEventListener('dragenter', (e) => {
        if (e.dataTransfer.types.includes('Files')) {
            dragCounter++;
            if(globalDropZone) {
                globalDropZone.classList.remove('hidden');
                globalDropZone.classList.add('drop-zone-active');
            }
        }
    });

    document.addEventListener('dragleave', () => {
        dragCounter--;
        if (dragCounter <= 0) {
            dragCounter = 0;
            if(globalDropZone) {
                globalDropZone.classList.add('hidden');
                globalDropZone.classList.remove('drop-zone-active');
            }
        }
    });

    document.addEventListener('dragover', (e) => e.preventDefault());

    document.addEventListener('drop', (e) => {
        e.preventDefault();
        dragCounter = 0;
        if(globalDropZone) {
            globalDropZone.classList.add('hidden');
            globalDropZone.classList.remove('drop-zone-active');
        }
        const file = e.dataTransfer.files[0];
        if (file && /\.(md|txt)$/i.test(file.name)) {
            loadFileContent(file);
        } else if (file) {
            alert('Only .md and .txt files are supported.');
        }
    });
}
