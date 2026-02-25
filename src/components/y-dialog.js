class YumeDialog extends HTMLElement {
    static get observedAttributes() {
        return ["visible", "anchor"];
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onAnchorClick = this.onAnchorClick.bind(this);
    }

    connectedCallback() {
        this.render();
        this.setupAnchor();
        if (this.visible) this.show();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        if (name === "visible") {
            this.visible ? this.show() : this.hide();
        }
        if (name === "anchor") {
            this.setupAnchor();
        }
    }

    get visible() {
        return this.hasAttribute("visible");
    }

    set visible(val) {
        if (val) this.setAttribute("visible", "");
        else this.removeAttribute("visible");
    }

    get anchor() {
        return this.getAttribute("anchor");
    }

    set anchor(id) {
        this.setAttribute("anchor", id);
    }

    render() {
        const style = document.createElement("style");
        style.textContent = `
            :host {
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                display: none;
                align-items: center;
                justify-content: center;
                background: rgba(0,0,0,0.5);
                z-index: 1000;
            }
            :host([visible]) { display: flex; }
            .dialog {
                background: var(--base-background-component);
                border: var(--component-dialog-border-width, 1px) solid var(--base-background-border);
                border-radius: var(--component-dialog-border-radius-outer, 4px);
                max-width: 90%;
                max-height: 90%;
                display: flex;
                flex-direction: column;
                box-shadow: var(--component-dialog-shadow, 0 2px 10px rgba(0,0,0,0.3));
            }
            .header {
                padding: var(--component-dialog-padding, var(--spacing-medium));
                font-weight: bold;
                border-bottom: var(--component-dialog-inner-border-width, 1px) solid var(--base-background-border);
            }
            .body {
                padding: var(--component-dialog-padding, var(--spacing-medium));
                overflow: auto;
                flex: 1;
            }
            .footer {
                padding: var(--component-dialog-padding, var(--spacing-medium));
                border-top: var(--component-dialog-inner-border-width, 1px) solid var(--base-background-border);
                text-align: right;
            }

            ::slotted(*) {
                margin: 0;
            }
        `;

        this.shadowRoot.innerHTML = "";
        this.shadowRoot.appendChild(style);

        const dialog = document.createElement("div");
        dialog.className = "dialog";
        dialog.setAttribute("role", "dialog");
        dialog.setAttribute("aria-modal", "true");
        dialog.setAttribute("tabindex", "-1");

        const header = document.createElement("div");
        header.className = "header";
        header.innerHTML = `<slot name="header"></slot>`;

        const body = document.createElement("div");
        body.className = "body";
        body.innerHTML = `<slot name="body"></slot>`;

        const footer = document.createElement("div");
        footer.className = "footer";
        footer.innerHTML = `<slot name="footer"></slot>`;

        dialog.appendChild(header);
        dialog.appendChild(body);
        dialog.appendChild(footer);
        this.shadowRoot.appendChild(dialog);
    }

    setupAnchor() {
        if (this._anchorEl) {
            this._anchorEl.removeEventListener("click", this.onAnchorClick);
        }
        if (this.anchor) {
            const el = document.getElementById(this.anchor);
            if (el) {
                this._anchorEl = el;
                this._anchorEl.addEventListener("click", this.onAnchorClick);
            }
        }
    }

    onAnchorClick() {
        this.visible = !this.visible;
    }

    show() {
        if (!this.shadowRoot.querySelector(".dialog")) {
            this.render();
        }

        document.addEventListener("keydown", this.onKeyDown);

        const dialog = this.shadowRoot.querySelector(".dialog");
        if (dialog && typeof dialog.focus === "function") {
            dialog.focus();
        }
    }

    hide() {
        document.removeEventListener("keydown", this.onKeyDown);
    }

    onKeyDown(e) {
        if (e.key === "Escape" && this.visible) {
            this.visible = false;
        }
    }
}

if (!customElements.get("y-dialog")) {
    customElements.define("y-dialog", YumeDialog);
}
