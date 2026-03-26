// src/editor/toolbar.js

export function initToolbar() {
    const toolbarActions = document.getElementById('toolbar-actions');
    const textarea = document.getElementById('markdown-input');

    if(!toolbarActions || !textarea) return;

    toolbarActions.addEventListener('click', (e) => {
        const btn    = e.target.closest('[data-action]');
        if (!btn) return;
        const action = btn.dataset.action;
        const start  = textarea.selectionStart;
        const end    = textarea.selectionEnd;
        const sel    = textarea.value.substring(start, end);
        const before = textarea.value.substring(0, start);
        const after  = textarea.value.substring(end);
        let insert   = '';

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

        textarea.value = before + insert + after;
        textarea.focus();
        textarea.setSelectionRange(start + insert.length, start + insert.length);
        textarea.dispatchEvent(new Event('input'));
    });
}
