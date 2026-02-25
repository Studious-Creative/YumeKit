import "../components/y-button.js";
import "../components/y-menu.js";

export class YumeAppbar extends HTMLElement {
    static get observedAttributes() {
        return ["orientation", "collapsed", "items", "size"];
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this._onCollapseClick = this._onCollapseClick.bind(this);
        this._idCounter = 0;
    }

    connectedCallback() {
        this.render();
    }

    disconnectedCallback() {}

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

    /**
     * Navigation items rendered as buttons in the body.
     * Each item: { text, icon, href, children }
     * `icon` is an HTML string (e.g. an SVG or <img>).
     * `children` follow the same structure as y-menu items
     *   ({ text, href, children }).
     */
    get items() {
        try {
            return JSON.parse(this.getAttribute("items")) || [];
        } catch {
            return [];
        }
    }
    set items(val) {
        this.setAttribute("items", JSON.stringify(val));
    }

    /** "small", "medium" (default), or "large" */
    get size() {
        return this.getAttribute("size") || "medium";
    }
    set size(val) {
        this.setAttribute("size", val);
    }

    /** Toggle collapsed state programmatically. */
    toggle() {
        this.collapsed = !this.collapsed;
    }

    /* ------------------------------------------------------------------ */
    /*  Internal helpers                                                    */
    /* ------------------------------------------------------------------ */

    _onCollapseClick() {
        this.toggle();
    }

    /** Generate a unique ID scoped to this component instance. */
    _uid(prefix) {
        return `${prefix}-${this._idCounter++}`;
    }

    /* ------------------------------------------------------------------ */
    /*  SVG icons                                                          */
    /* ------------------------------------------------------------------ */

    _chevronRightSVG() {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;
    }

    _collapseSVG() {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/></svg>`;
    }

    _expandSVG() {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>`;
    }

    /* ------------------------------------------------------------------ */
    /*  Render                                                             */
    /* ------------------------------------------------------------------ */

    render() {
        const isVertical = this.orientation === "vertical";
        const isCollapsed = this.collapsed && isVertical;
        const size = this.size;

        /* Size maps — padding, collapsed-width, body gap */
        const sizeConfig = {
            small: {
                padding: "var(--spacing-x-small, 4px)",
                collapsedWidth: "40px",
                bodyGap: "2px",
                buttonSize: "small",
            },
            medium: {
                padding: "var(--spacing-small, 6px)",
                collapsedWidth: "52px",
                bodyGap: "3px",
                buttonSize: "medium",
            },
            large: {
                padding: "var(--spacing-medium, 8px)",
                collapsedWidth: "64px",
                bodyGap: "4px",
                buttonSize: "large",
            },
        };
        const cfg = sizeConfig[size] || sizeConfig.medium;

        this.shadowRoot.innerHTML = "";
        this._idCounter = 0;

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
                border: var(--component-appbar-border-width, var(--component-sidebar-border-width, 2px)) solid var(--base-background-border, #333);
                border-radius: var(--component-appbar-border-radius, var(--component-sidebar-border-radius, 4px));
                overflow: visible;
                padding: var(--_appbar-padding);
                box-sizing: border-box;
            }

            /* --- Vertical layout --- */
            .appbar.vertical {
                flex-direction: column;
                width: var(--component-appbar-width, 240px);
                height: 100%;
                transition: width 0.2s ease;
            }
            .appbar.vertical.collapsed {
                width: var(--_appbar-collapsed-width);
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
                gap: var(--_appbar-body-gap);
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

            /* ---------- Section dividers ---------- */
            .appbar.vertical .appbar-header {
                border-bottom: var(--component-appbar-inner-border-width, var(--component-sidebar-border-width, 2px)) solid var(--base-background-border, #333);
                padding-bottom: var(--_appbar-padding);
                margin-bottom: var(--_appbar-padding);
            }
            .appbar.vertical .appbar-footer {
                border-top: var(--component-appbar-inner-border-width, var(--component-sidebar-border-width, 2px)) solid var(--base-background-border, #333);
                padding-top: var(--_appbar-padding);
                margin-top: var(--_appbar-padding);
            }

            .appbar.horizontal .appbar-header {
                border-right: var(--component-appbar-inner-border-width, var(--component-sidebar-border-width, 2px)) solid var(--base-background-border, #333);
                padding-right: var(--_appbar-padding);
                margin-right: var(--_appbar-padding);
            }
            .appbar.horizontal .appbar-footer {
                border-left: var(--component-appbar-inner-border-width, var(--component-sidebar-border-width, 2px)) solid var(--base-background-border, #333);
                padding-left: var(--_appbar-padding);
                margin-left: var(--_appbar-padding);
            }

            /* ---------- Header content ---------- */
            .header-content {
                display: flex;
                align-items: center;
                gap: var(--spacing-small, 8px);
                overflow: hidden;
            }
            .appbar.horizontal .header-content,
            .appbar.vertical .header-content {
                flex-direction: row;
            }
            .appbar.vertical.collapsed .header-content {
                justify-content: center;
            }

            .header-title {
                font-weight: bold;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                font-size: var(--font-size-label, 0.9em);
            }
            .appbar.vertical.collapsed .header-title {
                display: none;
            }

            /* ---------- Nav button wrappers ---------- */
            .nav-item {
                display: flex;
                align-items: center;
                position: relative;
            }
            .appbar.vertical .nav-item {
                width: 100%;
            }
            .appbar.vertical .nav-item y-button {
                display: block;
                width: 100%;
            }
            .appbar.vertical .nav-item y-button::part(button),
            .appbar.vertical .appbar-footer y-button::part(button) {
                width: 100%;
                justify-content: flex-start;
            }

            /* Collapsed: icon-only buttons, centered */
            .appbar.vertical.collapsed .nav-item y-button::part(button),
            .appbar.vertical.collapsed .appbar-footer y-button::part(button) {
                justify-content: center;
                min-width: 0;
            }
            .appbar.vertical.collapsed .nav-item y-button::part(label),
            .appbar.vertical.collapsed .appbar-footer y-button::part(label) {
                display: none;
            }
            .appbar.vertical.collapsed .nav-item y-button::part(right-icon),
            .appbar.vertical.collapsed .appbar-footer y-button::part(right-icon) {
                display: none;
            }

            /* ---------- Footer ---------- */
            .appbar-footer {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            .appbar.horizontal .appbar-footer {
                flex-direction: row;
                align-items: center;
            }
            .appbar.vertical .appbar-footer y-button {
                display: block;
                width: 100%;
            }

            /* Center icons when collapsed */
            .appbar.vertical.collapsed .appbar-header,
            .appbar.vertical.collapsed .appbar-body,
            .appbar.vertical.collapsed .appbar-footer {
                align-items: center;
            }

            /* Slotted items */
            ::slotted(*) {
                display: block;
            }
        `;
        this.shadowRoot.appendChild(style);

        // Clone document stylesheets so CSS-class-based icons (e.g. Font Awesome) render in shadow DOM
        document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
            this.shadowRoot.appendChild(link.cloneNode(true));
        });

        const bar = document.createElement("div");
        bar.className = `appbar ${isVertical ? "vertical" : "horizontal"}`;
        if (isCollapsed) bar.classList.add("collapsed");
        bar.setAttribute("role", "navigation");
        bar.style.setProperty("--_appbar-padding", cfg.padding);
        bar.style.setProperty("--_appbar-collapsed-width", cfg.collapsedWidth);
        bar.style.setProperty("--_appbar-body-gap", cfg.bodyGap);

        /* --- Header: logo + title --- */
        const header = document.createElement("div");
        header.className = "appbar-header";

        const headerContent = document.createElement("div");
        headerContent.className = "header-content";

        const logoSlot = document.createElement("slot");
        logoSlot.name = "logo";
        headerContent.appendChild(logoSlot);

        const titleWrapper = document.createElement("div");
        titleWrapper.className = "header-title";
        const titleSlot = document.createElement("slot");
        titleSlot.name = "title";
        titleWrapper.appendChild(titleSlot);
        headerContent.appendChild(titleWrapper);

        header.appendChild(headerContent);
        bar.appendChild(header);

        /* --- Body: y-button nav items --- */
        const body = document.createElement("div");
        body.className = "appbar-body";

        const navItems = this.items;
        navItems.forEach((item) => {
            const hasChildren = item.children?.length > 0;
            const wrapper = document.createElement("div");
            wrapper.className = "nav-item";

            const btn = document.createElement("y-button");
            const btnId = this._uid("appbar-btn");
            btn.id = btnId;
            btn.setAttribute("color", "base");
            btn.setAttribute("style-type", "flat");
            btn.setAttribute("size", cfg.buttonSize);

            // Icon
            if (item.icon) {
                const iconEl = document.createElement("span");
                iconEl.slot = "left-icon";
                iconEl.innerHTML = item.icon;
                btn.appendChild(iconEl);
            }

            // Label (hidden when collapsed via CSS on the host)
            if (item.text && !isCollapsed) {
                const label = document.createTextNode(item.text);
                btn.appendChild(label);
            }

            // Arrow indicator for items with children
            if (hasChildren && !isCollapsed) {
                const arrow = document.createElement("span");
                arrow.slot = "right-icon";
                arrow.innerHTML = this._chevronRightSVG();
                btn.appendChild(arrow);
            }

            // If it's a simple link, navigate on click
            if (item.href && !hasChildren) {
                btn.addEventListener("click", () => {
                    window.location.href = item.href;
                });
            }

            wrapper.appendChild(btn);

            // Attach a y-menu for items with children
            if (hasChildren) {
                const menu = document.createElement("y-menu");
                menu.setAttribute("anchor", btnId);
                menu.items = item.children;
                wrapper.appendChild(menu);
            }

            body.appendChild(wrapper);
        });

        bar.appendChild(body);

        /* --- Footer: slot + collapse toggle (vertical only) --- */
        const footer = document.createElement("div");
        footer.className = "appbar-footer";

        const footerSlot = document.createElement("slot");
        footerSlot.name = "footer";
        footer.appendChild(footerSlot);

        if (isVertical) {
            const collapseBtn = document.createElement("y-button");
            collapseBtn.setAttribute("color", "base");
            collapseBtn.setAttribute("style-type", "flat");
            collapseBtn.setAttribute("size", cfg.buttonSize);
            collapseBtn.setAttribute(
                "aria-label",
                isCollapsed ? "Expand sidebar" : "Collapse sidebar",
            );
            collapseBtn.className = "collapse-btn";

            const collapseIcon = document.createElement("span");
            collapseIcon.slot = "left-icon";
            collapseIcon.innerHTML = isCollapsed
                ? this._expandSVG()
                : this._collapseSVG();
            collapseBtn.appendChild(collapseIcon);

            if (!isCollapsed) {
                const collapseLabel = document.createTextNode("Collapse");
                collapseBtn.appendChild(collapseLabel);
            }

            collapseBtn.addEventListener("click", this._onCollapseClick);
            footer.appendChild(collapseBtn);
        }

        bar.appendChild(footer);
        this.shadowRoot.appendChild(bar);
    }
}

if (!customElements.get("y-appbar")) {
    customElements.define("y-appbar", YumeAppbar);
}
