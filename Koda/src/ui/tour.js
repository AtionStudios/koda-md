// src/ui/tour.js
import { TOUR_STEPS } from '../shared/config/constants.js';

let tourStep = 0;

function clearTourEl() {
    document.querySelectorAll('.tour-highlight-box, .tour-tooltip').forEach(el => el.remove());
}

function endTour() {
    clearTourEl();
    localStorage.setItem('koda_onboarding_done', 'true');
}

export function startTour() {
    if (localStorage.getItem('koda_onboarding_done')) return;
    tourStep = 0;
    showTourStep(0);
}

function showTourStep(idx) {
    clearTourEl();
    if (idx >= TOUR_STEPS.length) { endTour(); return; }
    const step   = TOUR_STEPS[idx];
    const target = document.getElementById(step.targetId);
    if (!target) { showTourStep(idx + 1); return; }
    const rect   = target.getBoundingClientRect();
    const pad    = 8;

    const hbox = document.createElement('div');
    hbox.className = 'tour-highlight-box';
    hbox.style.cssText = `top:${rect.top - pad}px;left:${rect.left - pad}px;width:${rect.width + pad*2}px;height:${rect.height + pad*2}px`;
    document.body.appendChild(hbox);

    const tt = document.createElement('div');
    tt.className = 'tour-tooltip';
    const dots = TOUR_STEPS.map((_, i) =>
        `<span class="tour-dot ${i === idx ? 'active' : ''}"></span>`).join('');
    tt.innerHTML = `
        <div class="tour-step-count">Step ${idx + 1} of ${TOUR_STEPS.length}</div>
        <h4>${step.title}</h4>
        <p>${step.body}</p>
        <div class="tour-actions">
            <div class="flex items-center gap-2">
                <div class="tour-progress">${dots}</div>
                <button class="tour-btn-skip">Skip tour</button>
            </div>
            <button class="tour-btn-next">${idx === TOUR_STEPS.length - 1 ? 'Finish 🎉' : 'Next →'}</button>
        </div>`;

    const TT_W      = 320;
    const TT_H      = 190;
    const MARGIN    = 12;
    const vw        = window.innerWidth;
    const vh        = window.innerHeight;
    const PAD       = 12;

    let top;
    let left;

    if (vh - rect.bottom >= TT_H + MARGIN) {
        top = rect.bottom + MARGIN;
    } else if (rect.top >= TT_H + MARGIN) {
        top = rect.top - TT_H - MARGIN;
    } else if (vw - rect.right >= TT_W + MARGIN) {
        top  = rect.top;
        left = rect.right + MARGIN;
    } else if (rect.left >= TT_W + MARGIN) {
        top  = rect.top;
        left = rect.left - TT_W - MARGIN;
    } else {
        top  = (vh - TT_H) / 2;
        left = (vw - TT_W) / 2;
    }

    top  = Math.max(PAD, Math.min(top,  vh - TT_H - PAD));
    left = Math.max(PAD, Math.min(left, vw - TT_W - PAD));

    tt.style.top  = top + 'px';
    tt.style.left = left + 'px';
    document.body.appendChild(tt);

    tt.querySelector('.tour-btn-skip').onclick = endTour;
    tt.querySelector('.tour-btn-next').onclick = () => {
        tourStep++;
        showTourStep(tourStep);
    };
}
