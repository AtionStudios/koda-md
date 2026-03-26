// src/modules/modals/modals.js
import './modals.css';
import template from './modals.html?raw';

export function mountModals(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.outerHTML = template;
}
