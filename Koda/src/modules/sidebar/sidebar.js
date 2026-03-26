// src/modules/sidebar/sidebar.js
import './sidebar.css';
import template from './sidebar.html?raw';

export function mountSidebar(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.outerHTML = template;
}
