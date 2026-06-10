// Language.ts
export class Language {
    private static translations: { [key: string]: any } = {};

    static initLanguage(game: Phaser.Game) {
        const langXml = game.cache.xml.get('language');
        const urlParams = new URLSearchParams(window.location.search);
        const languageStr = urlParams.get('lang')?.toUpperCase() || 'EN';
    
        // Type assertion added here for 'el' as Element
        const langElement = Array.from(langXml.getElementsByTagName('language') as NodeListOf<Element>).find((el: Element) => el.getAttribute('id')?.toUpperCase() === languageStr);
    
        if (!langElement) {
            console.warn(`Language ${languageStr} not found.`);
            return;
        }
    
        // Populate translations
        langElement.childNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element type
                const element = node as Element;
                Language.translations[element.tagName] = element.textContent || '';
            }
        });
    }
    static getTranslation(key: string): string {
        return Language.translations[key] || key;
    }

    getTranslation(key: string): string {
        return Language.translations[key] || key;
    }

}

// Inside Language.ts
export function translate(key: string): string {
    return Language.getTranslation(key);
}


