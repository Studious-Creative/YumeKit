class YumeInput extends HTMLElement {
    static formAssociated = true;

    static get observedAttributes() {
        return [
            "type",
            "size",
            "value",
            "label-position",
            "disabled",
            "invalid",
            "name",
        ];
    }

    constructor() {
        super();
        this._internals = this.attachInternals();
        this.attachShadow({ mode: "open" });
        this.render();
    }

    connectedCallback() {
        if (!this.hasAttribute("size")) {
            this.setAttribute("size", "medium");
        }
        if (!this.hasAttribute("label-position")) {
            this.setAttribute("label-position", "top");
        }
        this._internals.setFormValue(this.value);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;

        if (name === "value") {
            if (this.input) this.input.value = newValue;
            if (this._internals) {
                this._internals.setFormValue(
                    newValue,
                    this.getAttribute("name")
                );
            }
            return;
        }

        if (name === "name") {
            this._internals.setFormValue(this.value, newValue);
            return;
        }

        if (name === "invalid") {
            this.updateValidationState();
            return;
        }

        this.render();
    }

    get value() {
        return this.input?.value || "";
    }

    set value(val) {
        if (this.input) this.input.value = val;
        else this.setAttribute("value", val);
        this._internals.setFormValue(val, this.getAttribute("name"));
    }

    checkValidity() {
        return this.input?.checkValidity?.() ?? true;
    }

    updateValidationState() {
        const isManuallyInvalid = this.hasAttribute("invalid");
        const isAutomaticallyInvalid = this.input && !this.checkValidity();
        const isInvalid = isManuallyInvalid || isAutomaticallyInvalid;

        this.inputContainer?.classList.toggle("is-invalid", isInvalid);
        this.labelWrapper?.classList.toggle("is-invalid", isInvalid);
    }

    render() {
        const type = this.getAttribute("type") || "text";
        const size = this.getAttribute("size") || "medium";
        const value = this.getAttribute("value") || "";
        const labelPosition = this.getAttribute("label-position") || "top";
        const isDisabled = this.hasAttribute("disabled");
        const isLabelTop = labelPosition === "top";

        const paddingVar = {
            small: "--component-inputs-padding-small",
            medium: "--component-inputs-padding-medium",
            large: "--component-inputs-padding-large",
        }[size];

        const sheet = new CSSStyleSheet();
        sheet.replaceSync(`
            :host {
                display: block;
                font-family: var(--font-family-body);
                color: var(--base-content--);
                opacity: ${isDisabled ? "0.75" : "1"};
                pointer-events: ${isDisabled ? "none" : "auto"};
            }

            .input-wrapper {
                position: relative;
                display: flex;
                flex-direction: column;
                gap: var(--spacing-2x-small, 4px);
            }

            .input-container {
                display: flex;
                align-items: center;
                gap: var(--spacing-x-small);
                background: ${isDisabled ? "var(--base-background-component)" : "var(--base-background-app)"};
                border: var(--component-inputs-border-width) solid var(--base-background-border);
                border-radius: var(--component-inputs-border-radius-outer);
                padding: var(${paddingVar});
                box-sizing: border-box;
                transition: border-color 0.2s ease-in-out;
            }

            .input-container.is-invalid {
                border-color: var(--error-background-border);
                background: var(--error-background-component);
            }

            .input-container.is-invalid input {
                color: var(--error-content--);
            }

            .input-container.is-invalid:hover {
                border-color: var(--error-content--);
            }

            .input-container.is-invalid:focus-within {
                border-color: var(--error-content--);
            }

            .input-container.is-invalid:focus-within input {
                color: var(--base-content--);
            }

            input {
                all: unset;
                flex: 1;
                font-family: inherit;
                font-size: 1em;
                color: inherit;
                min-width: 0;
            }

            .input-container:hover {
                border-color: var(--base-content--);
                transition: border-color 0.2s ease-in-out;
            }

            .input-container:focus-within {
                border-color: var(--primary-content--);
            }

            .label-wrapper.is-invalid ::slotted([slot="label"]) {
                color: var(--error-content--);
            }

            ::slotted([slot="label"]) {
                font-weight: 500;
                font-size: 0.875em;
                color: var(--base-content-light);
            }

            ::slotted([slot="left-icon"]),
            ::slotted([slot="right-icon"]) {
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--base-content-lighter);
            }
        `);

        this.shadowRoot.adoptedStyleSheets = [sheet];

        this.shadowRoot.innerHTML = `
            <div class="input-wrapper">
                ${isLabelTop ? '<div class="label-wrapper"><slot name="label"></slot></div>' : ""}
                <div class="input-container">
                    <slot name="left-icon"></slot>
                    <input part="input" type="${type}" value="${value}" ${isDisabled ? "disabled" : ""} />
                    <slot name="right-icon"></slot>
                </div>
                ${!isLabelTop ? '<div class="label-wrapper"><slot name="label"></slot></div>' : ""}
            </div>
        `;

        this.input = this.shadowRoot.querySelector("input");
        this.inputContainer = this.shadowRoot.querySelector(".input-container");
        this.labelWrapper = this.shadowRoot.querySelector(".label-wrapper");

        if (!isDisabled) {
            this.input.addEventListener("input", (e) => {
                this.setAttribute("value", e.target.value);
                this.dispatchEvent(
                    new CustomEvent("input", {
                        detail: { value: e.target.value },
                        bubbles: true,
                        composed: true,
                    })
                );
                this.updateValidationState();
            });

            this.updateValidationState();
        }
    }
}

if (!customElements.get("y-input")) {
    customElements.define("y-input", YumeInput);
}
