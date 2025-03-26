import { hideEmptySlotContainers } from "../modules/helpers.js";

class YumeCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.render();
    }

    static get observedAttributes() {
        return ["color", "raised"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            if (name === "color") {
                this.updateColorStyles();
            }
            if (name === "raised") {
                this.updateElevationStyles();
            }
            this.render();
        }
    }

    connectedCallback() {
        this.updateColorStyles();
        this.updateElevationStyles();
    }

    updateColorStyles() {
        const color = this.getAttribute("color") || "base";

        const colorVars = {
            primary: [
                "--base-content--",
                "--primary-background-component",
                "--primary-background-border",
                "--primary-background-active",
            ],
            secondary: [
                "--base-content--",
                "--secondary-background-component",
                "--secondary-background-border",
                "--secondary-background-active",
            ],
            base: [
                "--base-content--",
                "--base-background-component",
                "--base-background-border",
                "--base-background-active",
            ],
            success: [
                "--base-content--",
                "--success-background-component",
                "--success-background-border",
                "--success-background-active",
            ],
            error: [
                "--base-content--",
                "--error-background-component",
                "--error-background-border",
                "--error-background-active",
            ],
            warning: [
                "--base-content--",
                "--warning-background-component",
                "--warning-background-border",
                "--warning-background-active",
            ],
        };

        const selected = colorVars[color] || colorVars.base;

        this.style.setProperty("--card-content-color", `var(${selected[0]})`);
        this.style.setProperty("--card-border-color", `var(${selected[2]})`);
        this.style.setProperty("--card-background", `var(${selected[1]})`);
        this.style.setProperty(
            "--card-section-background",
            `var(${selected[2]})`
        );
    }

    updateElevationStyles() {
        const isRaised = this.hasAttribute("raised");

        if (isRaised) {
            this.style.setProperty("--card-border-width", "0");
            this.style.setProperty("--card-box-shadow", "var(--base-shadow)");
        } else {
            this.style.setProperty(
                "--card-border-width",
                "var(--component-card-border-width)"
            );
            this.style.setProperty("--card-box-shadow", "none");
        }
    }

    render() {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(`
            :host {
                display: block;
                box-sizing: border-box;
                background: var(--card-background, var(--base-background-component));
                border: var(--card-border-width, var(--component-card-border-width)) solid var(--card-border-color, var(--base-background-border));
                border-radius: var(--component-card-border-radius-outer);
                font-family: var(--font-family-body);
                color: var(--card-content-color, var(--base-content--));
                box-shadow: var(--card-box-shadow, none);
            }

            .header {
                background: var(--card-section-background, var(--base-background-border));
                padding: var(--component-card-padding-inner) var(--component-card-padding-outer);
            }

            .body {
                padding: var(--component-card-padding-outer);
            }

            .footer {
                padding: var(--component-card-padding-inner) var(--component-card-padding-outer);
                border-top: var(--component-card-border-width) solid var(--card-border-color, var(--base-background-border));
            }

            ::slotted(*) {
                margin: 0;
            }
        `);

        this.shadowRoot.adoptedStyleSheets = [sheet];

        this.shadowRoot.innerHTML = `
            <div class="header" part="header">
                <slot name="header"></slot>
            </div>
            <div class="body" part="body">
                <slot></slot>
            </div>
            <div class="footer" part="footer">
                <slot name="footer"></slot>
            </div>
        `;

        hideEmptySlotContainers(this.shadowRoot, {
            header: ".header",
            footer: ".footer",
        });
    }
}

if (!customElements.get("y-card")) {
    customElements.define("y-card", YumeCard);
}
