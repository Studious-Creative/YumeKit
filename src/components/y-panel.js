export class YumePanel extends HTMLElement {
    static get observedAttributes() {
        return ["selected", "expanded", "href", "history"];
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this._expanded = false;
        this._checkRouteMatchBound = this.checkRouteMatch.bind(this);
        this.render();
    }

    connectedCallback() {
        this.addHeaderListeners();
        this.checkForChildren();
        this.updateChildState();
        this.updateSelectedState();
        this.updateExpandedState();

        if (this.hasAttribute("href")) {
            this.checkRouteMatch();
            window.addEventListener("popstate", this._checkRouteMatchBound);
        }
    }

    disconnectedCallback() {
        if (this.hasAttribute("href")) {
            window.removeEventListener("popstate", this._checkRouteMatchBound);
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;

        if (name === "selected") {
            this.updateSelectedState();
        }

        if (name === "expanded") {
            this.updateExpandedState();
        }

        if (name === "href") {
            this.checkRouteMatch();
        }
    }

    get selected() {
        return this.hasAttribute("selected");
    }

    set selected(val) {
        if (val) this.setAttribute("selected", "");
        else this.removeAttribute("selected");
    }

    get expanded() {
        return this.hasAttribute("expanded");
    }

    set expanded(val) {
        if (val) this.setAttribute("expanded", "");
        else this.removeAttribute("expanded");
    }

    updateSelectedState() {
        this.classList.toggle("selected", this.selected);
    }

    updateChildState() {
        const parentPanel = this.parentElement?.closest("y-panel");
        const isChild = Boolean(parentPanel && parentPanel !== this);
        this.setAttribute("data-is-child", isChild ? "true" : "false");
    }

    checkRouteMatch() {
        const href = this.getAttribute("href");
        if (href && window.location.pathname === href) {
            this.selected = true;
        } else {
            this.selected = false;
        }
    }

    render() {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(`
            :host {
                display: block;
                box-sizing: border-box;
                background: var(--base-background-component);
                color: var(--base-content--);
                font-family: var(--font-family-body);
                overflow: hidden;
            }

            :host([expanded]) {
                background: var(--base-background-app);
            }

            :host([selected]) {
                color: var(--primary-content--);
            }

            :host([data-is-child="true"]) {
                box-shadow: inset var(--component-panelbar-border-width, 2px) 0 0 0 var(--base-background-active);
            }

            :host([data-is-child="true"][selected]) {
                box-shadow: inset var(--component-panelbar-border-width, 2px) 0 0 0 var(--primary-content--);
            }

            :host([selected]) .header:hover {
                background: var(--primary-background-active);
            }

            :host([data-is-child="true"]) .header {
                padding-left: calc(var(--component-panelbar-padding, 4px) * 2);}

            .header {
                display: flex;
                align-items: center;
                gap: var(--spacing-medium, 8px);
                padding: var(--component-panelbar-padding, 4px);
                cursor: pointer;
                transition: background 0.2s ease;
                user-select: none;
            }

            .header:hover {
                background: var(--base-background-hover);
            }

            :host([data-has-children="false"]) .header {
                cursor: default;
            }

            .header ::slotted([slot="icon"]) {
                margin-right: 6px;
            }

            .header ::slotted([slot="label"]) {
                flex-grow: 1;
                cursor: inherit;
                font-size: 1rem;
                line-height: 1.2;
            }

            .arrow {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 20px;
                height: 20px;
                transition: transform 0.2s ease;
            }

            :host([expanded]) .arrow {
                transform: rotate(180deg);
            }

            .children {
                display: none;
                padding: 0;
                width: 100%;
                box-sizing: border-box;
            }

            .children ::slotted(y-panel) {
                width: 100%;
                box-sizing: border-box;
            }

            :host([expanded]) .children {
                display: block;
            }

            :host([data-has-children="false"]) .arrow {
                visibility: hidden;
            }
        `);

        this.shadowRoot.adoptedStyleSheets = [sheet];
        this.shadowRoot.innerHTML = `
            <div class="header" part="header" role="button" tabindex="0" aria-expanded="false">
                <slot name="icon"></slot>
                <slot name="label"><slot></slot></slot>
                <span class="arrow" id="arrow" part="arrow">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
                        <path d="M5 7 L10 12 L15 7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" />
                    </svg>
                </span>
            </div>
            <div class="children" id="childrenContainer" part="children">
                <slot name="children"></slot>
            </div>
        `;
    }

    addHeaderListeners() {
        const header = this.shadowRoot.querySelector(".header");
        if (!header) return;

        header.addEventListener("click", () => {
            if (this.hasAttribute("href")) {
                const href = this.getAttribute("href");
                if (this.getAttribute("history") !== "false") {
                    history.pushState({}, "", href);
                    window.dispatchEvent(
                        new PopStateEvent("popstate", { state: {} }),
                    );
                } else {
                    window.location.href = href;
                }
                return;
            }

            if (this.hasChildren()) {
                this.toggle();
            } else {
                this.dispatchEvent(
                    new CustomEvent("select", {
                        detail: { selected: true },
                        bubbles: true,
                        composed: true,
                    }),
                );
            }
        });

        header.addEventListener("keydown", (e) => {
            if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                header.click();
            }
        });

        const childrenSlot = this.shadowRoot.querySelector(
            'slot[name="children"]',
        );
        if (childrenSlot) {
            childrenSlot.addEventListener("slotchange", () =>
                this.checkForChildren(),
            );
        }
    }

    hasChildren() {
        const childrenSlot = this.shadowRoot.querySelector(
            'slot[name="children"]',
        );
        if (!childrenSlot) return false;
        const nodes = childrenSlot.assignedNodes({ flatten: true });
        return nodes.some((n) => {
            if (n.nodeType === Node.TEXT_NODE) {
                return n.textContent.trim() !== "";
            }
            return true;
        });
    }

    checkForChildren() {
        const hasChildren = this.hasChildren();
        this.setAttribute("data-has-children", hasChildren ? "true" : "false");
        if (!hasChildren && this.expanded) {
            this.expanded = false;
        }
    }

    toggle() {
        if (!this.hasChildren()) return;
        if (!this._expanded) {
            const parentBar = this.closest("y-panelbar");
            if (parentBar && parentBar.hasAttribute("exclusive")) {
                const siblingPanels = parentBar.querySelectorAll("y-panel");
                siblingPanels.forEach((panel) => {
                    if (panel !== this && panel.expanded) {
                        panel.collapse();
                    }
                });
            }
            this.expand();
        } else {
            this.collapse();
        }
        this.dispatchEvent(
            new CustomEvent("toggle", {
                detail: { expanded: this._expanded },
                bubbles: true,
                composed: true,
            }),
        );
    }

    expand() {
        if (!this.hasChildren()) return;
        this.expanded = true;
        this._expanded = true;
        this.updateExpandedState();
        this.dispatchEvent(
            new CustomEvent("expand", {
                detail: { expanded: true },
                bubbles: true,
                composed: true,
            }),
        );
    }

    collapse() {
        this.expanded = false;
        this._expanded = false;
        this.updateExpandedState();
        this.dispatchEvent(
            new CustomEvent("collapse", {
                detail: { expanded: false },
                bubbles: true,
                composed: true,
            }),
        );
    }

    updateExpandedState() {
        const hasChildren = this.hasChildren();
        const header = this.shadowRoot.querySelector(".header");
        const isExpanded = this.expanded && hasChildren;
        this._expanded = isExpanded;

        if (header) {
            header.setAttribute("aria-expanded", String(isExpanded));
        }
    }
}

if (!customElements.get("y-panel")) {
    customElements.define("y-panel", YumePanel);
}
