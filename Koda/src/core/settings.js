// src/core/settings.js
import { dbGet, dbPut } from '../persistence/db.js';
<<<<<<< HEAD
import { PAGE_HEIGHTS } from '../shared/config/constants.js';
=======
import { PAGE_HEIGHTS } from '../config/constants.js';
>>>>>>> fbf4d06169cf57db7eb69afe6721c991bdbc0d20
import { getCurrentDocId } from './documentManager.js';
import { applyPageMode, isPageModeActive } from '../ui/viewModes.js';

let cfgFontFamily, cfgFontSize, cfgLineHeight, cfgPaperSize, cfgPaperOri, pageBreakToggle, multiBreakToggle, preview;
let cfgMT, cfgMB, cfgML, cfgMR;

export function initSettings() {
    cfgFontFamily = document.getElementById('cfg-font-family');
    cfgFontSize   = document.getElementById('cfg-font-size');
    cfgLineHeight = document.getElementById('cfg-line-height');
    cfgPaperSize  = document.getElementById('cfg-paper-size');
    cfgPaperOri   = document.getElementById('cfg-paper-orientation');
    cfgMT         = document.getElementById('cfg-margin-top');
    cfgMB         = document.getElementById('cfg-margin-bottom');
    cfgML         = document.getElementById('cfg-margin-left');
    cfgMR         = document.getElementById('cfg-margin-right');
    pageBreakToggle = document.getElementById('toggle-page-breaks');
    multiBreakToggle = document.getElementById('toggle-multi-breaks');
    preview       = document.getElementById('preview-container'); // Container of pages

    [cfgFontFamily, cfgFontSize, cfgLineHeight, cfgPaperSize, cfgPaperOri, cfgMT, cfgMB, cfgML, cfgMR, pageBreakToggle, multiBreakToggle].forEach(el => {
        if(el) {
            el.addEventListener('change', () => {
                window.dispatchEvent(new CustomEvent('koda-request-render'));
                saveSettings();
            });
            el.addEventListener('input', () => {
                if(el.type === 'number') {
                   window.dispatchEvent(new CustomEvent('koda-request-render'));
                }
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
        if (s.marginTop && cfgMT)          cfgMT.value          = s.marginTop;
        if (s.marginBottom && cfgMB)       cfgMB.value          = s.marginBottom;
        if (s.marginLeft && cfgML)         cfgML.value          = s.marginLeft;
        if (s.marginRight && cfgMR)        cfgMR.value          = s.marginRight;
        if (s.theme === 'light') document.documentElement.classList.remove('dark');
        if (s.pageBreaks && pageBreakToggle) pageBreakToggle.checked = true;
        if (s.multiBreaks && multiBreakToggle) multiBreakToggle.checked = true;
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
        paperOri:   cfgPaperOri?.value || 'portrait',
        marginTop:  cfgMT?.value || '20',
        marginBottom: cfgMB?.value || '20',
        marginLeft: cfgML?.value || '20',
        marginRight: cfgMR?.value || '20',
        theme:      isDark ? 'dark' : 'light',
        pageBreaks: pageBreakToggle?.checked || false,
        multiBreaks: multiBreakToggle?.checked || false,
        lastDocId:  getCurrentDocId()
    });
}

export function getPageSettings() {
    return {
        paperSize: cfgPaperSize?.value || 'a4',
        paperOrientation: cfgPaperOri?.value || 'portrait',
        marginTop: cfgMT?.value || '20',
        marginBottom: cfgMB?.value || '20',
        marginLeft: cfgML?.value || '20',
        marginRight: cfgMR?.value || '20',
        multiBreaks: multiBreakToggle?.checked || false
    };
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
