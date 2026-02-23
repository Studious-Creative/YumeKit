export class YumeAppbar extends HTMLElement {
    static get observedAttributes() {
        return ["orientation", "collapsed"];
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (oldVal === newVal) return;
        this.render();
    }

    /* ------------------------------------------------------------------ */
    /*  Properties                                                         */
    /* ------------------------------------------------------------------ */

    /** "vertical" (default) or "horizontal" */
    get orientation() {
        return this.getAttribute("orientation") || "vertical";
    }
    set orientation(val) {
        this.setAttribute("orientation", val);
    }

    /** When true the vertical bar shows only icons (collapsed). Ignored for horizontal. */
    get collapsed() {
        return this.hasAttribute("collapsed");
    }
    set collapsed(val) {
        if (val) this.setAttribute("collapsed", "");
        else this.removeAttribute("collapsed");
    }

    /** Toggle collapsed state programmatically. */
    toggle() {
        this.collapsed = !this.collapsed;
    }

    /* ------------------------------------------------------------------ */
    /*  Render                                                             */
    /* ------------------------------------------------------------------ */

    render() {
        const isVertical = this.orientation === "vertical";
        const isCollapsed = this.collapsed && isVertical;

        this.shadowRoot.innerHTML = "";

        const style = document.createElement("style");
        style.textContent = `
            :host {
                display: block;
                font-family: var(--font-family-body, sans-serif);
                color: var(--base-content--, #fff);
            }

            .appbar {
                display: flex;
                background: var(--base-background-component, #111);
                border: var(--component-sidebar-border-width, 2px) solid var(--base-background-border, #333);
                border-radius: var(--component-sidebar-border-radius, 4px);
                overflow: hidden;
                padding: var(--component-appbar-padding, var(--component-sidebar-padding, 8px));
            }

            /* --- Vertical layout --- */
            .appbar.vertical {
                flex-direction: column;
                width: var(--component-appbar-width, 240px);
                height: 100%;
                transition: width 0.2s ease;
            }
            .appbar.vertical.collapsed {
                width: var(--component-appbar-collapsed-width, 56px);
            }

            /* --- Horizontal layout --- */
            .appbar.horizontal {
                flex-direction: row;
                width: 100%;
                height: auto;
                align-items: center;
            }

            /* ---------- Sections ---------- */
            .appbar-header,
            .appbar-body,
            .appbar-footer {
                flex-shrink: 0;
            }

            .appbar-body {
                flex: 1;
                overflow-y: auto;
                overflow-x: hidden;
                display: flex;
                gap: 2px;
            }

            .appbar.vertical .appbar-body {
                flex-direction: column;
            }
            .appbar.horizontal .appbar-body {
                flex-direction: row;
                overflow-y: hidden;
                overflow-x: auto;
                align-items: center;
            }

            /* Dividers between sections (vertical) */
            .appbar.vertical .appbar-header {
                border-bottom: var(--component-sidebar-border-width, 2px) solid var(--base-background-border, #333);
                padding-bottom: var(--component-appbar-padding, var(--component-sidebar-padding, 8px));
                margin-bottom: var(--component-appbar-padding, var(--component-sidebar-padding, 8px));
            }
            .appbar.vertical .appbar-footer {
                border-top: var(--component-sidebar-border-width, 2px) solid var(--base-background-border, #333);
                padding-top: var(--component-appbar-padding, var(--component-sidebar-padding, 8px));
                margin-top: var(--component-appbar-padding, var(--component-sidebar-padding, 8px));
            }

            /* Dividers between sections (horizontal) */
            .appbar.horizontal .appbar-header {
                border-right: var(--component-sidebar-border-width, 2px) solid var(--base-background-border, #333);
                padding-right: var(--component-appbar-padding, var(--component-sidebar-padding, 8px));
                margin-right: var(--component-appbar-padding, var(--component-sidebar-padding, 8px));
            }
            .appbar.horizontal .appbar-footer {
                border-left: var(--component-sidebar-border-width, 2px) solid var(--base-background-border, #333);
                padding-left: var(--component-appbar-padding, var(--component-sidebar-padding, 8px));
                margin-left: var(--component-appbar-padding, var(--component-sidebar-padding, 8px));
            }

            /* ---------- Slotted items ---------- */
            ::slotted(*) {
                display: block;
            }

            /* When collapsed, center items */
            .appbar.vertical.collapsed .appbar-header,
            .appbar.vertical.collapsed .appbar-body,
            .appbar.vertical.collapsed .appbar-footer {
                align-items: center;
            }
        `;
        this.shadowRoot.appendChild(style);

        const bar = document.createElement("div");
        bar.className = `appbar ${isVertical ? "vertical" : "horizontal"}`;
        if (isCollapsed) bar.classList.add("collapsed");
        bar.setAttribute("role", "navigation");

        // Header
        const header = document.createElement("div");
        header.className = "appbar-header";
        header.innerHTML = `<slot name="header"></slot>`;
        bar.appendChild(header);

        // Body (multiple sections via default slot)
        const body = document.createElement("div");
        body.className = "appbar-body";
        body.innerHTML = `<slot></slot>`;
        bar.appendChild(body);

        // Footer
        const footer = document.createElement("div");
        footer.className = "appbar-footer";
        footer.innerHTML = `<slot name="footer"></slot>`;
        bar.appendChild(footer);

        this.shadowRoot.appendChild(bar);
    }
}

if (!customElements.get("y-appbar")) {
    customElements.define("y-appbar", YumeAppbar);
}
