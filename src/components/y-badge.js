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
            primary: "var(--primary--, rgba(0, 123, 255, 1))",
            secondary: "var(--secondary--, rgba(108, 117, 125, 1))",
            base: "var(--base-text, rgba(33, 37, 41, 1))",
            success: "var(--success, rgba(40, 167, 69, 1))",
            warning: "var(--warning, rgba(255, 193, 7, 1))",
            error: "var(--error, rgba(220, 53, 69, 1))",
        };
        return colorMap[color] || color;
    }

    getBadgePosition(position, alignment) {
        const vertical = position === "top" ? "top: -10px;" : "bottom: -10px;";
        const horizontal =
            alignment === "right" ? "right: -10px;" : "left: -10px;";
        return `${vertical} ${horizontal}`;
    }

    getSizeAttributes(size) {
        const sizeMap = {
            small: {
                fontSize: "var(--size-p, 16px)",
                padding: "var(--spacing-2x-small, 2px)",
                minSize: "15px",
            },
            medium: {
                fontSize: "var(--size-h5, 18px)",
                padding: "var(--spacing-small, 2px)",
                minSize: "18px",
            },
            large: {
                fontSize: "var(--size-h4, 20px)",
                padding: "var(--spacing-small, 2px)",
                minSize: "22px",
            },
        };
        return sizeMap[size] || sizeMap.small;
    }

    render() {
        const badgeColor = this.getBadgeColor(this.color);
        const { fontSize, padding, minSize } = this.getSizeAttributes(
            this.size
        );
        const positionStyles = this.getBadgePosition(
            this.position,
            this.alignment
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
                    color: var(--base-text, rgba(33, 37, 41, 1));
                    font-size: ${fontSize};
                    font-weight: bold;
                    padding: ${padding};
                    border-radius: var(--radii-full, 9999px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: var(--font-family-mono, monospace);
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
