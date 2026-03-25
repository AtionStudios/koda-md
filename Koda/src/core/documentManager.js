// src/core/documentManager.js
import { dbPut, dbGet, dbGetAll, dbDelete } from '../persistence/db.js';
import { saveSettings } from './settings.js';
// renderPreview import removed to fix circular dependency

let currentDocId = null;

export function getCurrentDocId() {
    return currentDocId;
}

export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
}

function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

export async function saveCurrentDoc(showSaveStatusCb) {
    const titleInput = document.getElementById('doc-title');
    const textarea = document.getElementById('markdown-input');
    if (!currentDocId) currentDocId = generateId();
    await dbPut('documents', {
        id:        currentDocId,
        title:     titleInput.value.trim() || 'Untitled Document',
        content:   textarea.value,
        updatedAt: Date.now()
    });
    saveSettings();
    if(showSaveStatusCb) showSaveStatusCb(true);
    renderDocList();
}

export async function loadDoc(id) {
    const doc = await dbGet('documents', id);
    if (!doc) return;
    currentDocId = doc.id;
    document.getElementById('doc-title').value = doc.title;
    document.getElementById('markdown-input').value = doc.content;
    window.dispatchEvent(new CustomEvent('koda-request-render'));
    saveSettings();
    renderDocList();
}

export async function deleteDoc(id) {
    await dbDelete('documents', id);
    if (currentDocId === id) createNewDocument('', '');
    renderDocList();
}

export function createNewDocument(title, content) {
    currentDocId = generateId();
    document.getElementById('doc-title').value = title || 'Untitled Document';
    document.getElementById('markdown-input').value = content || '';
    window.dispatchEvent(new CustomEvent('koda-request-render'));
    saveSettings();
    renderDocList();
}

export async function renderDocList() {
    const modalDocList = document.getElementById('modal-doc-list');
    const docsModal = document.getElementById('docs-modal');
    if(!modalDocList) return;

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
            if(docsModal) { docsModal.classList.add('hidden'); docsModal.classList.remove('flex'); }
        });
    });
    
    modalDocList.querySelectorAll('[data-delete]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Delete this document?')) deleteDoc(btn.dataset.delete);
        });
    });
}
