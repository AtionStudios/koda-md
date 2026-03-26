# Koda — Precise Markdown Editor

Koda is a distraction-free Markdown editor designed for high-fidelity document authoring and physical paper rendering. It combines the power of Markdown with a real-time pagination engine, allowing you to see exactly how your document will look in various paper formats (A4, Letter, Legal).

![Koda Showcase](Doc/Assets/showcase.png) <!-- Image placeholder, generate one if needed -->

## 🚀 Quick Start

### Installation
Clone the repository and install dependencies:
```bash
git clone [repo-url]
cd Koda
npm install
```

### Development
Run the local development server (Vite):
```bash
npm run dev
```

### Production Build
Generate the production bundle in the `dist/` folder:
```bash
npm run build
```

## ✨ Key Features

- **Real-time Pagination**: Physical paper preview (A4, Letter, Legal) while typing.
- **Modular Shell**: Lightweight architecture with isolated UI components.
- **Local-First Persistence**: Automatic saving to IndexedDB (zero-server dependency).
- **Advanced Export**: Export as PDF (print-ready), Raw Markdown (.md), or Plain Text (.txt).
- **Dark/Light Mode**: Seamlessly switch between themes with a single click.
- **Distraction-Free**: Clean, minimal UI focused on content creation.

## 📁 Technical Roadmap

For deep technical details, refer to the [Documentation Hub](Doc/00_PRODUCT_CONTEXT.md):

1. **[Product Context](Doc/00_PRODUCT_CONTEXT.md)**: Product vision and core value proposition.
2. **[Engineering Standards](Doc/01_ENGINEERING_STANDARDS.md)**: Coding patterns, styling strategies, and development rules.
3. **[Architecture](Doc/02_ARCHITECTURE.md)**: Modular structure and system design.
4. **[Styling Specs](Doc/Specs/01_STYLING.md)**: Design tokens and component styling.

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla JavaScript (ES6+), CSS3.
- **UI Shell**: Tailwind CSS (CDN).
- **Persistence**: IndexedDB (Native).
- **Bundler**: Vite.
- **Utils**: JSZip, html2pdf.js.

---
Built with ❤️ by Ation Studios.
