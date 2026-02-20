export class YumeBadge extends HTMLElement {
    static get observedAttributes() {
        return ["value", "position", "alignment", "color", "size"];
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    connectedCallback() {
        this.render();
    }

    get alignment() {
        return this.getAttribute("alignment") || "right";
    }

    get color() {
        return this.getAttribute("color") || "primary";
    }

    get position() {
        return this.getAttribute("position") || "top";
    }

    get size() {
        return this.getAttribute("size") || "small";
    }

    get value() {
        return this.getAttribute("value") || "";
    }

    getBadgeColor(color) {
        const colorMap = {
            primary: "var(--primary-content--)",
            secondary: "var(--secondary-content--)",
            base: "var(--base-content--)",
            success: "var(--success-content--)",
            warning: "var(--warning-content--)",
            error: "var(--error-content--)",
            help: "var(--help-content--)",
        };
        return colorMap[color] || color;
    }

    getBadgePosition(position, alignment) {
        const offset = "var(--spacing-small, 6px)";
        const vertical =
            position === "top"
                ? `top: calc(${offset} * -1);`
                : `bottom: calc(${offset} * -1);`;
        const horizontal =
            alignment === "right"
                ? `right: calc(${offset} * -1);`
                : `left: calc(${offset} * -1);`;
        return `${vertical} ${horizontal}`;
    }

    getSizeAttributes(size) {
        const sizeMap = {
            small: {
                fontSize: "var(--font-size-small, 0.8em)",
                padding: "var(--component-badge-padding-small)",
                minSize: "var(--component-badge-size-small)",
            },
            medium: {
                fontSize: "var(--font-size-label, 0.83em)",
                padding: "var(--component-badge-padding-medium)",
                minSize: "var(--component-badge-size-medium)",
            },
            large: {
                fontSize: "var(--font-size-paragraph, 1em)",
                padding: "var(--component-badge-padding-large)",
                minSize: "var(--component-badge-size-large)",
            },
        };
        return sizeMap[size] || sizeMap.small;
    }

    render() {
        const badgeColor = this.getBadgeColor(this.color);
        const { fontSize, padding, minSize } = this.getSizeAttributes(
            this.size,
        );
        const positionStyles = this.getBadgePosition(
            this.position,
            this.alignment,
        );

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    position: relative;
                    display: inline-block;
                }
                .badge {
                    position: absolute;
                    ${positionStyles}
                    background: ${badgeColor};
                    color: var(--base-background-component, #fff);
                    font-size: ${fontSize};
                    font-weight: bold;
                    padding: ${padding};
                    border-radius: var(--component-badge-border-radius-circle, 9999px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: var(--font-family-body, sans-serif);
                    min-width: ${minSize};
                    height: ${minSize};
                    z-index: 20;
                }
                ::slotted(*) {
                    position: relative;
                    display: inline-block;
                }
            </style>
            <slot></slot>
            <div class="badge" part="badge">${this.value}</div>
        `;
    }
}

if (!customElements.get("y-badge")) {
    customElements.define("y-badge", YumeBadge);
}
