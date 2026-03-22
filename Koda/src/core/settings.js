// src/core/settings.js
import { dbGet, dbPut } from '../persistence/db.js';
import { PAGE_HEIGHTS } from '../config/constants.js';
import { getCurrentDocId } from './documentManager.js';
import { applyPageMode, isPageModeActive } from '../ui/viewModes.js';

let cfgFontFamily, cfgFontSize, cfgLineHeight, cfgPaperSize, cfgPaperOri, pageBreakToggle, preview;

export function initSettings() {
    cfgFontFamily = document.getElementById('cfg-font-family');
    cfgFontSize   = document.getElementById('cfg-font-size');
    cfgLineHeight = document.getElementById('cfg-line-height');
    cfgPaperSize  = document.getElementById('cfg-paper-size');
    cfgPaperOri   = document.getElementById('cfg-paper-orientation');
    pageBreakToggle = document.getElementById('toggle-page-breaks');
    preview       = document.getElementById('markdown-preview');

    [cfgFontFamily, cfgFontSize, cfgLineHeight, cfgPaperSize, cfgPaperOri, pageBreakToggle].forEach(el => {
        if(el) {
            el.addEventListener('change', () => {
                applyTypography(); 
                updatePageBreaks();
                if (isPageModeActive()) applyPageMode(true); 
                saveSettings();
            });
        }
    });
}

export async function loadSettings() {
    try {
        const s = await dbGet('settings', 'editor');
        if (!s) return;
        if (s.fontFamily && cfgFontFamily) cfgFontFamily.value = s.fontFamily;
        if (s.fontSize && cfgFontSize)     cfgFontSize.value   = s.fontSize;
        if (s.lineHeight && cfgLineHeight) cfgLineHeight.value  = s.lineHeight;
        if (s.paperSize && cfgPaperSize)   cfgPaperSize.value   = s.paperSize;
        if (s.paperOri && cfgPaperOri)     cfgPaperOri.value    = s.paperOri;
        if (s.theme === 'light') document.documentElement.classList.remove('dark');
        if (s.pageBreaks && pageBreakToggle) pageBreakToggle.checked = true;
    } catch {
        // Settings failed to load, continue with defaults
    }
}

export function saveSettings() {
    const isDark = document.documentElement.classList.contains('dark');
    dbPut('settings', {
        key: 'editor',
        fontFamily: cfgFontFamily?.value || '',
        fontSize:   cfgFontSize?.value || '',
        lineHeight: cfgLineHeight?.value || '',
        paperSize:  cfgPaperSize?.value || '',
        paperOri:   cfgPaperOri?.value || '',
        theme:      isDark ? 'dark' : 'light',
        pageBreaks: pageBreakToggle?.checked || false,
        lastDocId:  getCurrentDocId()
    });
}

export function applyTypography() {
    if(!preview || !cfgFontSize || !cfgFontFamily || !cfgLineHeight) return;
    const sizePx = Math.round((parseInt(cfgFontSize.value) || 12) * 1.333);
    preview.style.fontFamily  = cfgFontFamily.value;
    preview.style.fontSize    = sizePx + 'px';
    preview.style.lineHeight  = String(parseFloat(cfgLineHeight.value) || 1.6);
}

export function getPageHeight() {
    const paper = cfgPaperSize?.value || 'a4';
    const ori   = cfgPaperOri?.value  || 'portrait';
    return PAGE_HEIGHTS[paper]?.[ori] || PAGE_HEIGHTS.a4.portrait;
}

export function updatePageBreaks() {
    if(!preview) return;
    const ori   = cfgPaperOri?.value  || 'portrait';
    const paper = cfgPaperSize?.value || 'a4';

    preview.classList.toggle('paper-landscape', ori === 'landscape');
    preview.classList.toggle('paper-portrait',  ori !== 'landscape');

    const paperCssName = { a4: 'A4', letter: 'letter', legal: 'legal' };
    const cssName = paperCssName[paper] || 'A4';

    let styleEl = document.getElementById('print-orientation-style');
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'print-orientation-style';
        document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = `@media print { @page { size: ${cssName} ${ori}; margin: 18mm 20mm; } }`;

    preview.querySelectorAll('.page-break-line, .page-break-label').forEach(el => el.remove());
    if (!pageBreakToggle?.checked) return;

    requestAnimationFrame(() => {
        const contentHeight = preview.scrollHeight;
        const padTop = (ori === 'portrait') ? 91 : 76; 
        const padFix = (ori === 'portrait') ? 182 : 152; 
        const usableH = getPageHeight() - padFix;
        
        if (usableH <= 0 || contentHeight <= usableH) return;
        const numBreaks = Math.floor(contentHeight / usableH);
        
        for (let i = 1; i <= numBreaks; i++) {
            const yPos  = padTop + (i * usableH);
            const line  = Object.assign(document.createElement('div'), { className: 'page-break-line', 'data-no-print': 'true' });
            line.style.top = yPos + 'px';
            const label = Object.assign(document.createElement('div'), { className: 'page-break-label', textContent: `Page ${i + 1}`, 'data-no-print': 'true' });
            label.style.top = yPos + 'px';
            preview.appendChild(line);
            preview.appendChild(label);
        }
    });
}
