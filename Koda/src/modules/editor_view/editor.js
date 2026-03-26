// src/modules/editor_view/editor.js
import './editor.css';
import template from './editor.html?raw';

export function mountEditor(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.outerHTML = template;
}
