// src/editor/toolbar.js
import { editorView } from './sync.js';

export function initToolbar() {
    const toolbarActions = document.getElementById('toolbar-actions');

    if(!toolbarActions) return;

    toolbarActions.addEventListener('click', (e) => {
        if(!editorView) return;
        const btn    = e.target.closest('[data-action]');
        if (!btn) return;
        const action = btn.dataset.action;
        
        const state = editorView.state;
        const ranges = state.selection.ranges;
        const start = ranges[0].from;
        const end = ranges[0].to;
        const sel = state.sliceDoc(start, end);
        let insert = '';
        
        switch (action) {
            case 'h1':        insert = `# ${sel || 'Heading 1'}`; break;
            case 'h2':        insert = `## ${sel || 'Heading 2'}`; break;
            case 'h3':        insert = `### ${sel || 'Heading 3'}`; break;
            case 'bold':      insert = `**${sel || 'bold text'}**`; break;
            case 'italic':    insert = `*${sel || 'italic text'}*`; break;
            case 'underline': insert = `<u>${sel || 'underlined'}</u>`; break;
            case 'list':      insert = `\n- Item 1\n- Item 2\n- Item 3\n`; break;
            case 'link':      insert = `[${sel || 'link text'}](https://)`; break;
            case 'image':     insert = `![${sel || 'alt text'}](https://)`; break;
            case 'table':     insert = `\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Cell     | Cell     | Cell     |\n`; break;
            case 'hr':        insert = `\n---\n`; break;
            case 'code':      insert = '\n```\n' + (sel || 'code here') + '\n```\n'; break;
        }

        editorView.dispatch({
            changes: {from: start, to: end, insert},
            selection: {anchor: start + insert.length}
        });
        editorView.focus();
    });
}
