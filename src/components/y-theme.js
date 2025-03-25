class YumeTheme extends HTMLElement {
    static defaultVariablesLoaded = false;
    static defaultVariablesCSS = "";

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    static get observedAttributes() {
        return ["theme-path"];
    }

    connectedCallback() {
        this.loadDefaultVariables().then(() => {
            const themePath = this.getAttribute("theme-path");
            this.loadTheme(themePath);
        });
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "theme-path" && oldValue !== newValue) {
            this.loadTheme(newValue);
        }
    }

    async loadDefaultVariables() {
        if (!YumeTheme.defaultVariablesLoaded) {
            try {
                const variablesUrl = new URL(
                    "styles/variables.css",
                    document.baseURI
                );
                const response = await fetch(variablesUrl.href);
                YumeTheme.defaultVariablesCSS = await response.text();
                YumeTheme.defaultVariablesLoaded = true;
            } catch (e) {
                console.error(
                    "Failed to load default variables from styles/variables.css:",
                    e
                );
            }
        }
        return Promise.resolve();
    }

    async loadTheme(themePath) {
        let themeCSS = "";
        if (themePath) {
            try {
                const themeUrl = new URL(themePath, document.baseURI);
                const response = await fetch(themeUrl.href);
                themeCSS = await response.text();
            } catch (e) {
                console.error(`Failed to load theme from ${themePath}:`, e);
            }
        }

        const combinedCSS = `
        <style>
          ${YumeTheme.defaultVariablesCSS}
        </style>
        ${themeCSS ? `<style>${themeCSS}</style>` : ""}
      `;

        this.shadowRoot.innerHTML = `${combinedCSS}<slot></slot>`;
        this.applyVariablesToHost(YumeTheme.defaultVariablesCSS + themeCSS);
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
