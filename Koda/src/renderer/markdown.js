// src/renderer/markdown.js
import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.setOptions({ breaks: true, gfm: true });

export function parseAndSanitize(markdownText, options = {}) {
    if (!markdownText || !markdownText.trim()) {
        return '<h1>Untitled Document</h1><p>Start typing in the editor...</p>';
    }
    
    let processedMd = markdownText;
    if (options.multiBreaks) {
        // Replace multiple newlines with markers to prevent marked from collapsing them
        // We use a function to repeat the &nbsp; marker for every extra newline
        processedMd = processedMd.replace(/\n\s*\n/g, (match) => {
            const newlines = (match.match(/\n/g) || []).length;
            return '\n\n' + '&nbsp;\n\n'.repeat(newlines - 1);
        });
    }

    const rawHtml = marked.parse(processedMd);
    const cleanHtml = DOMPurify.sanitize(rawHtml);
    return cleanHtml;
}

export function htmlToMarkdown(html) {
    let md = html;
    md = md.replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n');
    md = md.replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n');
    md = md.replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n');
    md = md.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
    md = md.replace(/<b>(.*?)<\/b>/gi, '**$1**');
    md = md.replace(/<em>(.*?)<\/em>/gi, '*$1*');
    md = md.replace(/<i>(.*?)<\/i>/gi, '*$1*');
    md = md.replace(/<p>(.*?)<\/p>/gi, '$1\n\n');
    md = md.replace(/<br\s*\/?>/gi, '\n');
    md = md.replace(/<[^>]+>/g, '');
    md = md.replace(/&nbsp;/g, ' ');
    md = md.replace(/&lt;/g, '<');
    md = md.replace(/&gt;/g, '>');
    md = md.replace(/&amp;/g, '&');
    return md.trim();
}
