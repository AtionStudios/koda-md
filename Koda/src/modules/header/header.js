// src/modules/header/header.js
import './header.css';
import template from './header.html?raw';

export function mountHeader(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.outerHTML = template;
}
