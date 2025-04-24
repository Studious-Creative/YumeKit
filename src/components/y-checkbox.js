export class YumeCheckbox extends HTMLElement {
    static formAssociated = true;

    static get observedAttributes() {
        return [
            "checked",
            "disabled",
            "indeterminate",
            "label-position",
            "name",
            "value",
        ];
    }

    constructor() {
        super();
        this._internals = this.attachInternals();
        this.attachShadow({ mode: "open" });
        this.render();
    }

    connectedCallback() {
        if (!this.hasAttribute("label-position")) {
            this.setAttribute("label-position", "right");
        }

        this._internals.setFormValue(this.checked ? this.value : null);
    }

    get checked() {
        return this.hasAttribute("checked");
    }

    set checked(val) {
        if (val) this.setAttribute("checked", "");
        else this.removeAttribute("checked");
    }

    get disabled() {
        return this.hasAttribute("disabled");
    }

    set disabled(val) {
        if (val) this.setAttribute("disabled", "");
        else this.removeAttribute("disabled");
    }

    get indeterminate() {
        return this.hasAttribute("indeterminate");
    }

    set indeterminate(val) {
        if (val) this.setAttribute("indeterminate", "");
        else this.removeAttribute("indeterminate");
    }

    get value() {
        return this.getAttribute("value") || "on";
    }

    set value(val) {
        this.setAttribute("value", val);
    }

    get name() {
        return this.getAttribute("name");
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (name === "checked" || name === "value") {
            this._internals.setFormValue(this.checked ? this.value : null);
        }

        if (name === "indeterminate") {
            this.updateIcon();
        }

        if (name === "label-position") {
            this.render();
        }

        this.updateState();
    }

    toggle() {
        if (this.disabled) return;
        if (this.indeterminate) {
            this.indeterminate = false;
            this.checked = true;
        } else {
            this.checked = !this.checked;
        }

        this.dispatchEvent(
            new Event("change", { bubbles: true, composed: true })
        );
    }

    updateIcon() {
        const icon = this.shadowRoot.querySelector(".icon");
        if (!icon) return;

        if (this.indeterminate) {
            icon.innerHTML = `
                <svg viewBox="0 0 24 24">
                    <rect x="4" y="11" width="16" height="2" rx="1" ry="1" fill="currentColor"/>
                </svg>
            `;
        } else if (this.checked) {
            icon.innerHTML = `
                <svg viewBox="0 0 24 24">
                    <polyline points="5 13 10 17 19 6" fill="none" stroke="currentColor" stroke-width="2"/>
                </svg>
            `;
        } else {
            icon.innerHTML = "";
        }
    }

    updateState() {
        const box = this.shadowRoot.querySelector(".checkbox");
        box.setAttribute(
            "aria-checked",
            this.indeterminate ? "mixed" : this.checked ? "true" : "false"
        );
        this.updateIcon();
    }

    render() {
        const labelPosition = this.getAttribute("label-position") || "right";
        const isDisabled = this.disabled;

        const sheet = new CSSStyleSheet();
        sheet.replaceSync(`
            :host {
                display: inline-block;
                font-family: var(--font-family-body);
                cursor: ${isDisabled ? "not-allowed" : "pointer"};
                opacity: ${isDisabled ? "0.6" : "1"};
            }

            .wrapper {
                display: inline-flex;
                align-items: center;
                gap: var(--spacing-x-small, 6px);
                flex-direction: ${
                    labelPosition === "top"
                        ? "column"
                        : labelPosition === "bottom"
                          ? "column-reverse"
                          : labelPosition === "left"
                            ? "row-reverse"
                            : "row"
                };
            }

            .checkbox {
                width: 20px;
                height: 20px;
                border: 2px solid var(--base-content--);
                border-radius: var(--border-radius-small, 4px);
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--base-background-component);
                box-sizing: border-box;
                transition: border-color 0.2s ease;
            }

            .checkbox:hover {
                border-color: var(--primary-content--);
            }

            .checkbox svg {
                width: 16px;
                height: 16px;
                stroke: var(--primary-content--);
            }

            .label {
                font-size: 0.9em;
                color: var(--base-content--);
            }

            .icon {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
            }

        `);

        this.shadowRoot.adoptedStyleSheets = [sheet];

        this.shadowRoot.innerHTML = `
            <div class="wrapper">
                <div class="checkbox" role="checkbox" tabindex="0">
                    <span class="icon"></span>
                </div>
                <label part="label">
                    <slot></slot>
                </label>
            </div>
        `;

        this.shadowRoot
            .querySelector(".checkbox")
            .addEventListener("click", () => this.toggle());
        this.shadowRoot
            .querySelector(".checkbox")
            .addEventListener("keydown", (e) => {
                if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    this.toggle();
                }
            });

        this.updateState();
    }
}

if (!customElements.get("y-checkbox")) {
    customElements.define("y-checkbox", YumeCheckbox);
}
