// src/editor/codemirror_setup.js
import { EditorState, Compartment } from "@codemirror/state"
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine } from "@codemirror/view"
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands"
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search"
import { markdown } from "@codemirror/lang-markdown"
import { languages } from "@codemirror/language-data"
import { bracketMatching, foldGutter, foldKeymap, indentOnInput, syntaxHighlighting, defaultHighlightStyle, indentUnit } from "@codemirror/language"
import { oneDark } from "@codemirror/theme-one-dark"

export const lineNumbersCompartment = new Compartment();
export const themeCompartment = new Compartment();

// Tema customizado para o Koda (Light)
const kodaTheme = EditorView.theme({
    "&": {
        color: "var(--text-main)",
        backgroundColor: "transparent",
        height: "100%",
        fontSize: "14px",
    },
    "&.cm-editor.cm-focused": {
        outline: "none"
    },
    ".cm-content": {
        caretColor: "var(--color-primary)",
        padding: "40px 48px",
        fontFamily: "var(--font-mono, monospace)"
    },
    "&.cm-focused .cm-cursor": {
        borderLeftColor: "var(--color-primary)"
    },
    "&.cm-focused .cm-selectionBackground, ::selection": {
        backgroundColor: "var(--color-primary) !important",
        opacity: "0.2"
    },
    ".cm-gutters": {
        backgroundColor: "transparent",
        color: "#94a3b8", // slate-400
        border: "none",
        paddingRight: "8px"
    },
    ".cm-activeLineGutter": {
        backgroundColor: "rgba(0, 0, 0, 0.05)"
    },
    ".cm-activeLine": {
        backgroundColor: "rgba(0, 0, 0, 0.02)"
    }
}, { dark: false });

// Tema customizado para o Koda (Dark)
const kodaThemeDark = EditorView.theme({
    "&": {
        color: "#cbd5e1", // slate-300
        backgroundColor: "transparent",
        height: "100%",
        fontSize: "14px",
    },
    "&.cm-editor.cm-focused": {
        outline: "none"
    },
    ".cm-content": {
        caretColor: "var(--color-primary)",
        padding: "40px 48px",
        fontFamily: "var(--font-mono, monospace)"
    },
    "&.cm-focused .cm-cursor": {
        borderLeftColor: "var(--color-primary)"
    },
    "&.cm-focused .cm-selectionBackground, ::selection": {
        backgroundColor: "var(--color-primary) !important",
        opacity: "0.3"
    },
    ".cm-gutters": {
        backgroundColor: "transparent",
        color: "#64748b", // slate-500
        border: "none",
        paddingRight: "8px"
    },
    ".cm-activeLineGutter": {
        backgroundColor: "rgba(255, 255, 255, 0.05)"
    },
    ".cm-activeLine": {
        backgroundColor: "rgba(255, 255, 255, 0.02)"
    }
}, { dark: true });

/**
 * Cria uma nova instância do CodeMirror
 * @param {HTMLElement} parentEl Elemento pai que receberá o editor
 * @param {string} initialDoc Texto inicial do editor
 * @param {Function} onChange Callback chamado no evento de mudança de texto
 * @param {boolean} enableLineNumbers Flag para exibir números de linha
 * @param {boolean} isDark Flag para usar o tema dark
 * @returns {EditorView}
 */
export function createEditor(parentEl, initialDoc, onChange, enableLineNumbers = false, isDark = false) {
    const updateListener = EditorView.updateListener.of((update) => {
        if (update.docChanged) {
            onChange(update.state.doc.toString(), update);
        }
    });

    const extensions = [
        highlightSpecialChars(),
        history(),
        drawSelection(),
        dropCursor(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
        syntaxHighlighting(defaultHighlightStyle, {fallback: true}),
        bracketMatching(),
        rectangularSelection(),
        crosshairCursor(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        keymap.of([
            ...defaultKeymap,
            ...searchKeymap,
            ...historyKeymap,
            ...foldKeymap,
            indentWithTab
        ]),
        markdown({ codeLanguages: languages }),
        EditorView.lineWrapping,
        updateListener,
        indentUnit.of("    "),
        
        // Compartments
        lineNumbersCompartment.of(enableLineNumbers ? [lineNumbers(), highlightActiveLineGutter(), foldGutter()] : []),
        themeCompartment.of(isDark ? [oneDark, kodaThemeDark] : [kodaTheme])
    ];

    const state = EditorState.create({
        doc: initialDoc,
        extensions
    });

    const view = new EditorView({
        state,
        parent: parentEl
    });

    return view;
}

/**
 * Configura dinamicamente a visibilidade dos números de linha
 */
export function setLineNumbers(view, enable) {
    if(!view) return;
    view.dispatch({
        effects: lineNumbersCompartment.reconfigure(enable ? [lineNumbers(), highlightActiveLineGutter(), foldGutter()] : [])
    });
}

/**
 * Configura dinamicamente o tema do editor (Light/Dark)
 */
export function setTheme(view, isDark) {
    if(!view) return;
    view.dispatch({
        effects: themeCompartment.reconfigure(isDark ? [oneDark, kodaThemeDark] : [kodaTheme])
    });
}
