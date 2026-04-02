// src/modules/toolbar/toolbar.js
import './toolbar.css';
import template from './toolbar.html?raw';

export function mountToolbar(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.outerHTML = template;
}
