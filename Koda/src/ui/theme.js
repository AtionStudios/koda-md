// src/ui/theme.js
import { saveSettings } from '../core/settings.js';
import { setTheme } from '../editor/codemirror_setup.js';
import { editorView } from '../editor/sync.js';

export function initThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    if(!themeBtn) return;
    themeBtn.onclick = () => {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        setTheme(editorView, isDark);
        saveSettings();
    };
}
