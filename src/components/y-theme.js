import variablesCSS from "../../styles/variables.css";
import blueLightCSS from "../../styles/blue-light.css";
import blueDarkCSS from "../../styles/blue-dark.css";
import orangeLightCSS from "../../styles/orange-light.css";
import orangeDarkCSS from "../../styles/orange-dark.css";

const THEMES = {
    "blue-light": blueLightCSS,
    "blue-dark": blueDarkCSS,
    "orange-light": orangeLightCSS,
    "orange-dark": orangeDarkCSS,
};

export class YumeTheme extends HTMLElement {
    static get observedAttributes() {
        return ["theme", "mode", "theme-path"];
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        this._applyTheme();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this._applyTheme();
        }
    }

    async _applyTheme() {
        const themePath = this.getAttribute("theme-path");
        let themeCSS;

        if (themePath) {
            try {
                const url = new URL(themePath, document.baseURI);
                const response = await fetch(url.href);
                themeCSS = await response.text();
            } catch (e) {
                console.error(`Failed to load theme from ${themePath}:`, e);
                themeCSS = "";
            }
        } else {
            const theme = this.getAttribute("theme") || "blue";
            const mode = this.getAttribute("mode") || "light";
            themeCSS = THEMES[`${theme}-${mode}`] || "";
        }

        this.shadowRoot.innerHTML = `
            <style>${variablesCSS}</style>
            ${themeCSS ? `<style>${themeCSS}</style>` : ""}
            <slot></slot>
        `;

        this.applyVariablesToHost(variablesCSS + themeCSS);
    }

    applyVariablesToHost(cssText) {
        const regex = /--([\w-]+):\s*([^;]+);/g;
        let match;

        while ((match = regex.exec(cssText)) !== null) {
            this.style.setProperty(`--${match[1]}`, match[2].trim());
        }
    }
}

if (!customElements.get("y-theme")) {
    customElements.define("y-theme", YumeTheme);
}
