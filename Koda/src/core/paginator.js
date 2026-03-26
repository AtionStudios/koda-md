// src/core/paginator.js

/**
 * Paginator for Koda Markdown Editor
 * Distributes HTML content into multiple physical paper pages.
 */
export class Paginator {
    constructor(containerId) {
<<<<<<< HEAD
        this.containerId = containerId;
        this.container = null; // Resolved lazily on first render
=======
        this.container = document.getElementById(containerId);
>>>>>>> fbf4d06169cf57db7eb69afe6721c991bdbc0d20
        this.pages = [];
    }

    /**
     * Renders the HTML content into multiple pages.
     * @param {string} html 
     * @param {object} settings {纸张大小, 纸张方向, 边距}
     */
    render(html, settings) {
<<<<<<< HEAD
        // Lazily resolve after modules have been mounted
        if (!this.container) {
            this.container = document.getElementById(this.containerId);
        }
=======
>>>>>>> fbf4d06169cf57db7eb69afe6721c991bdbc0d20
        if (!this.container) return;

        let measureContainer = document.getElementById('paginator-measure-container');
        if (!measureContainer) {
            measureContainer = document.createElement('div');
            measureContainer.id = 'paginator-measure-container';
            measureContainer.style.position = 'fixed';
            measureContainer.style.left = '-10000px';
            measureContainer.style.top = '0';
            measureContainer.style.visibility = 'hidden';
            measureContainer.style.pointerEvents = 'none';
            document.body.appendChild(measureContainer);
        }
        measureContainer.innerHTML = '';

        const tempDiv = document.createElement('div');
        tempDiv.style.width = this.getPageContentWidth(settings);
        tempDiv.classList.add('prose', 'max-w-none');
        if (document.documentElement.classList.contains('dark')) tempDiv.classList.add('dark:prose-invert');
        tempDiv.innerHTML = html;
        measureContainer.appendChild(tempDiv);

        const currentPages = [];
        let currentPage = this.createPageElement(settings);
        let contentContainer = currentPage.querySelector('.page-content');
        measureContainer.appendChild(currentPage);
        currentPages.push(currentPage);

        const children = Array.from(tempDiv.childNodes);
        const maxHeight = this.getUsableHeight(settings);

        children.forEach(child => {
            this.addContentToPage(child, settings, maxHeight, (newPage) => {
                currentPage = newPage;
                contentContainer = currentPage.querySelector('.page-content');
                currentPages.push(currentPage);
                measureContainer.appendChild(currentPage);
            }, contentContainer);
        });

        this.container.innerHTML = '';
        currentPages.forEach(p => this.container.appendChild(p));
        measureContainer.innerHTML = '';
    }

    /**
     * Recursive function to add content, breaking elements if necessary (like lists)
     */
    addContentToPage(node, settings, maxHeight, onNewPage, contentContainer) {
        const clone = node.cloneNode(true);
        contentContainer.appendChild(clone);

        if (contentContainer.scrollHeight > maxHeight) {
            contentContainer.removeChild(clone);

            // If it's a list, we can try to break its items
            if ((node.tagName === 'UL' || node.tagName === 'OL') && node.children.length > 0) {
                const listClone = node.cloneNode(false); // Copy only the tag (ul/ol)
                contentContainer.appendChild(listClone);
                
                Array.from(node.children).forEach(li => {
                    this.addContentToPage(li, settings, maxHeight, (newPage) => {
                        onNewPage(newPage);
                        contentContainer = newPage.querySelector('.page-content');
                        // Re-create the list tag in the new page
                        const nextListClone = node.cloneNode(false);
                        contentContainer.appendChild(nextListClone);
                    }, contentContainer.lastChild); // Target the lastChild which is the list clone
                });
            } 
            // Otherwise, it's atomic (p, h1, img, table) - move to next page
            else {
                const newPage = this.createPageElement(settings);
                onNewPage(newPage);
                const newContentContainer = newPage.querySelector('.page-content');
                newContentContainer.appendChild(clone);
            }
        }
    }

    createPageElement(settings) {
        const page = document.createElement('div');
        const paperClass = `page-${settings.paperSize}-${settings.paperOrientation}`;
        page.className = `preview-paper ${paperClass} prose max-w-none dark:prose-invert`;
        
        // Camada 1: Pape (A4/etc) - Tamanho Físico
        page.style.position = 'relative';

        // Camada 2: Margin Container - Área Útil Fixa
        // Isso isola o conteúdo dos paddings da folha
        const marginBox = document.createElement('div');
        marginBox.className = 'page-margin-container';
        marginBox.style.position = 'absolute';
        marginBox.style.top    = `${settings.marginTop}mm`;
        marginBox.style.bottom = `${settings.marginBottom}mm`;
        marginBox.style.left   = `${settings.marginLeft}mm`;
        marginBox.style.right  = `${settings.marginRight}mm`;
        marginBox.style.overflow = 'hidden';
        
        // Camada 3: Content Container - Onde o texto mora
        const content = document.createElement('div');
        content.className = 'page-content';
        content.style.width = '100%';
        
        marginBox.appendChild(content);
        page.appendChild(marginBox);

        return page;
    }

    getUsableHeight(settings) {
        // Convert mm to pixels (approx 1mm = 3.78px at 96dpi)
        const mmToPx = 3.7795;
        const totalHeightMm = this.getPaperHeightMm(settings.paperSize, settings.paperOrientation);
        const marginsHeightMm = parseFloat(settings.marginTop) + parseFloat(settings.marginBottom);
        return (totalHeightMm - marginsHeightMm) * mmToPx;
    }

    getPageContentWidth(settings) {
        const totalW = this.getPaperWidthMm(settings.paperSize, settings.paperOrientation);
        const marginsW = parseFloat(settings.marginLeft) + parseFloat(settings.marginRight);
        return `${totalW - marginsW}mm`;
    }

    getPaperHeightMm(size, orientation) {
        const sizes = {
            a4: { portrait: 297, landscape: 210 },
            letter: { portrait: 279.4, landscape: 215.9 },
            legal: { portrait: 355.6, landscape: 215.9 }
        };
        return sizes[size]?.[orientation] || 297;
    }

    getPaperWidthMm(size, orientation) {
        const sizes = {
            a4: { portrait: 210, landscape: 297 },
            letter: { portrait: 215.9, landscape: 279.4 },
            legal: { portrait: 215.9, landscape: 355.6 }
        };
        return sizes[size]?.[orientation] || 210;
    }
}
