// src/ui/modals.js
<<<<<<< HEAD
import { TEMPLATES } from '../shared/config/constants.js';
=======
import { TEMPLATES } from '../config/constants.js';
>>>>>>> fbf4d06169cf57db7eb69afe6721c991bdbc0d20
import { createNewDocument, saveCurrentDoc } from '../core/documentManager.js';

let selectedTemplate = 'blank';

export function initModals() {
    const newDocModal        = document.getElementById('new-doc-modal');
    const newDocTitleInput   = document.getElementById('new-doc-title-input');
    const btnCloseNewModal   = document.getElementById('btn-close-new-modal');
    const btnCancelNewDoc    = document.getElementById('btn-cancel-new-doc');
    const btnConfirmNewDoc   = document.getElementById('btn-confirm-new-doc');
    const newDocFileInput    = document.getElementById('new-doc-file-input');

    const docsModal         = document.getElementById('docs-modal');
    const btnCloseModal     = document.getElementById('btn-close-modal');
    
    document.getElementById('btn-new-doc')?.addEventListener('click', () => {
        selectedTemplate = 'blank';
        if(newDocTitleInput) newDocTitleInput.value = '';
        document.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
        const blankOpt = document.querySelector('[data-template="blank"]');
        if(blankOpt) blankOpt.classList.add('selected');
        if(newDocModal) { newDocModal.classList.remove('hidden'); newDocModal.classList.add('flex'); }
        setTimeout(() => newDocTitleInput?.focus(), 100);
    });

    function closeNewDocModal() {
        if(newDocModal) { newDocModal.classList.add('hidden'); newDocModal.classList.remove('flex'); }
    }

    function confirmNewDoc() {
        const title   = newDocTitleInput?.value.trim() || 'Untitled Document';
        const content = TEMPLATES[selectedTemplate] || '';
        closeNewDocModal();
        createNewDocument(title, content);
        saveCurrentDoc();
    }

    btnCloseNewModal?.addEventListener('click', closeNewDocModal);
    btnCancelNewDoc?.addEventListener('click', closeNewDocModal);
    btnConfirmNewDoc?.addEventListener('click', confirmNewDoc);
    newDocTitleInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') confirmNewDoc(); });

    document.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedTemplate = card.dataset.template;
        });
    });

    if(newDocFileInput) {
        newDocFileInput.addEventListener('change', (e) => loadFileContent(e.target.files[0]));
    }

    document.getElementById('btn-open-doc')?.addEventListener('click', () => {
        if(docsModal) { docsModal.classList.remove('hidden'); docsModal.classList.add('flex'); }
    });
    btnCloseModal?.addEventListener('click', () => {
        if(docsModal) { docsModal.classList.add('hidden'); docsModal.classList.remove('flex'); }
    });
}

export function loadFileContent(file) {
    if (!file) return;
    const reader = new FileReader();
    const newDocTitleInput = document.getElementById('new-doc-title-input');
    const newDocModal = document.getElementById('new-doc-modal');
    
    reader.onload = (e) => {
        const content  = e.target.result;
        const title    = file.name.replace(/\.(md|txt)$/i, '');
        if(newDocTitleInput) newDocTitleInput.value = title;
        selectedTemplate = 'blank';
        document.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
        const blankOpt = document.querySelector('[data-template="blank"]');
        if(blankOpt) blankOpt.classList.add('selected');
        if(newDocModal) { newDocModal.classList.add('hidden'); newDocModal.classList.remove('flex'); }
        createNewDocument(title, content);
        saveCurrentDoc();
    };
    reader.readAsText(file);
}
