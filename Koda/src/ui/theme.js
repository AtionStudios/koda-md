// src/ui/theme.js
import { saveSettings } from '../core/settings.js';

export function initThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    if(!themeBtn) return;
    themeBtn.onclick = () => {
        document.documentElement.classList.toggle('dark');
        saveSettings();
    };
}
