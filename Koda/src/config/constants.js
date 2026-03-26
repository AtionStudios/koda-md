// src/config/constants.js

export const TEMPLATES = {
    blank: '',
    report: `# Report Title\n\n**Author:** Your Name  \n**Date:** ${new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}  \n**Version:** 1.0\n\n---\n\n## Executive Summary\n\nProvide a brief summary of the report here.\n\n## Background\n\nExplain the context and motivation for this report.\n\n## Findings\n\n### Finding 1\nDetail your first finding here.\n\n### Finding 2\nDetail your second finding here.\n\n## Recommendations\n\n- Recommendation 1\n- Recommendation 2\n- Recommendation 3\n\n## Conclusion\n\nSummarize the main takeaways and next steps.\n`,
    meeting: `# Meeting Notes\n\n**Date:** ${new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}  \n**Time:** 00:00  \n**Location / Link:**  \n\n---\n\n## Participants\n\n- Name · Role\n- Name · Role\n\n## Agenda\n\n1. Topic One\n2. Topic Two\n3. Topic Three\n\n## Discussion\n\n### Topic One\n*Notes here...*\n\n### Topic Two\n*Notes here...*\n\n## Decisions Made\n\n- [ ] Decision 1\n- [ ] Decision 2\n\n## Action Items\n\n| Task | Owner | Due Date |\n|------|-------|----------|\n| Task description | Name | dd/mm/yyyy |\n\n## Next Meeting\n\n**Date:** TBD\n`,
    readme: `# Project Name\n\n> One-line description of your project.\n\n[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)\n\n---\n\n## Overview\n\nDescribe your project in more detail here.\n\n## Features\n\n- ✅ Feature 1\n- ✅ Feature 2\n- ✅ Feature 3\n\n## Getting Started\n\n### Prerequisites\n\nList what the user needs to install first.\n\n### Installation\n\n\`\`\`bash\ngit clone https://github.com/your-org/your-repo.git\ncd your-repo\nnpm install\n\`\`\`\n\n### Usage\n\n\`\`\`bash\nnpm run dev\n\`\`\`\n\n## Contributing\n\nPull requests are welcome! For major changes, please open an issue first.\n\n## License\n\n[MIT](LICENSE) © Your Name\n`
};

export const TOUR_STEPS = [
    { targetId: 'markdown-input',   title: '✍️ Write markdown here', body: `Type your content on the left. A live preview appears on the right — instantly.` },
    { targetId: 'markdown-preview', title: '👁️ Your document preview', body: `This is what your final document will look like. You can also click directly here to edit.` },
    { targetId: 'toolbar-actions',  title: '🔧 Formatting toolbar', body: `Quickly insert headings, bold, tables, code blocks and more with one click.` },
    { targetId: 'stat-saved',       title: '💾 Auto-save is on', body: `Koda saves your work automatically to your browser's local storage. Nothing is sent to a server — ever.` },
    { targetId: 'btn-download',     title: '📄 Export your document', body: `Download as PDF, raw Markdown (.md) or plain text (.txt) whenever you're ready.` },
];

export const PAGE_HEIGHTS = {
    a4:     { portrait: 1123, landscape: 794 },
    letter: { portrait: 1056, landscape: 816 },
    legal:  { portrait: 1344, landscape: 816 }
};
