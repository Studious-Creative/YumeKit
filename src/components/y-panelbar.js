export class YumePanelBar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.render();
    }

    render() {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(`
            :host {
                display: block;
            }
        `);

        this.shadowRoot.adoptedStyleSheets = [sheet];
        this.shadowRoot.innerHTML = `
            <slot></slot>
        `;
    }
}

if (!customElements.get("y-panelbar")) {
    customElements.define("y-panelbar", YumePanelBar);
}
