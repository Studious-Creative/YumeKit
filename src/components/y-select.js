class YumeSelect extends HTMLElement {
    static formAssociated = true;

    static get observedAttributes() {
        return [
            "label-position",
            "disabled",
            "invalid",
            "required",
            "value",
            "name",
            "placeholder",
            "options",
            "display-mode",
        ];
    }

    constructor() {
        super();
        this._internals = this.attachInternals();
        this.attachShadow({ mode: "open" });
        this.selectedValues = new Set(); // For multi-select mode
        this.render();
    }

    connectedCallback() {
        if (!this.hasAttribute("label-position")) {
            this.setAttribute("label-position", "top");
        }
        this.updateValidation();
        this._internals.setFormValue(this.value);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;

        if (name === "value") {
            this.updateDisplay();
            this._internals.setFormValue(newValue, this.getAttribute("name"));
            this.updateSelectedStyles();
        }

        if (
            [
                "label-position",
                "disabled",
                "invalid",
                "required",
                "placeholder",
                "options",
            ].includes(name)
        ) {
            this.render();
        }

        if (name === "name") {
            this._internals.setFormValue(this.value, newValue);
        }
    }

    get value() {
        if (this.hasAttribute("multiple")) {
            return Array.from(this.selectedValues).join(",");
        }
        return this._value || "";
    }

    set value(val) {
        if (this.hasAttribute("multiple")) {
            if (typeof val === "string") {
                this.selectedValues = new Set(
                    val.split(",").map((v) => v.trim())
                );
            } else if (Array.isArray(val)) {
                this.selectedValues = new Set(val);
            }
        } else {
            this._value = val;
        }

        this.setAttribute("value", val);
        this._internals.setFormValue(this.value, this.getAttribute("name"));
        this.updateDisplay();
        this.updateSelectedStyles();
    }

    /** Render and Setup **/

    render() {
        this.applyStyles();
        this.shadowRoot.innerHTML = this.generateTemplate();
        this.queryRefs();
        this.attachEventListeners();
        this.updateValidationState();
    }

    applyStyles() {
        const isDisabled = this.hasAttribute("disabled");

        const sheet = new CSSStyleSheet();
        sheet.replaceSync(`
            :host {
                display: block;
                font-family: var(--font-family-body);
                color: var(--base-content--);
                opacity: ${isDisabled ? "0.75" : "1"};
                pointer-events: ${isDisabled ? "none" : "auto"};
            }

            .select-wrapper {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-2x-small, 4px);
                position: relative;
            }

            .select-container {
                display: flex;
                align-items: center;
                gap: var(--spacing-x-small);
                background: var(--base-background-app);
                border: var(--component-inputs-border-width) solid var(--base-background-border);
                border-radius: var(--component-inputs-border-radius-outer);
                padding: var(--component-inputs-padding-medium);
                box-sizing: border-box;
                transition: border-color 0.2s ease-in-out;
                cursor: pointer;
            }

            .select-container:hover {
                border-color: var(--base-content--);
            }

            .select-container:focus-within {
                border-color: var(--primary-content--);
            }

            .select-container.is-invalid {
                border-color: var(--error-background-border);
                background: var(--error-background-component);
            }

            .select-container.is-invalid:hover {
                border-color: var(--error-content--);
            }

            .select-container.is-invalid:focus-within {
                border-color: var(--error-content--);
            }

            .label-wrapper.is-invalid ::slotted([slot="label"]) {
                color: var(--error-content--);
            }

            ::slotted([slot="label"]) {
                font-weight: 500;
                font-size: 0.875em;
                color: var(--base-content-light);
            }

            .dropdown {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                z-index: 10;
                background: var(--base-background-app);
                border: 1px solid var(--base-background-border);
                border-radius: var(--component-inputs-border-radius-outer);
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                margin-top: 4px;
                max-height: 200px;
                overflow-y: auto;
                display: none;
            }

            .dropdown.open {
                display: block;
            }

            .dropdown-item {
                padding: var(--spacing-small, 6px);
                cursor: pointer;
            }

            .dropdown-item:hover {
                background: var(--base-hover);
            }

            .dropdown-item.selected {
                background: var(--primary-content--);
                color: var(--base-background-component);
            }

            .value-display {
                flex: 1;
                font-size: 1em;
                color: inherit;
                display: flex;
                gap: var(--spacing-x-small);
            }

            .label-wrapper {
                display: block;
            }

            .chevron-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                margin-left: auto;
                transition: transform 0.2s ease;
            }

            .chevron-icon svg {
                transition: transform 0.2s ease;
                transform-origin: center;
            }

            .select-container.open .chevron-icon svg {
                transform: scaleY(-1);
            }
        `);

        this.shadowRoot.adoptedStyleSheets = [sheet];
    }

    generateTemplate() {
        const labelPosition = this.getAttribute("label-position") || "top";
        const isLabelTop = labelPosition === "top";
        const isInvalid = this.hasAttribute("invalid");
        const isMulti = this.hasAttribute("multiple");

        const valueSet = isMulti ? this.selectedValues : new Set([this.value]);

        return `
            <div class="select-wrapper">
                ${isLabelTop ? '<div class="label-wrapper"><slot name="label"></slot></div>' : ""}
                <div class="select-container ${isInvalid ? "is-invalid" : ""}" tabindex="0">
                    <div class="value-display">${this.getDisplayText()}</div>
                    <div class="chevron-icon" part="chevron-icon">
                        <svg viewBox="0 0 20 20" width="20" height="20">
                            <path d="M5 7 L10 12 L15 7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" />
                        </svg>
                    </div>
                </div>
                ${!isLabelTop ? '<div class="label-wrapper"><slot name="label"></slot></div>' : ""}
                <div class="dropdown" part="dropdown">
                    ${this.getOptions()
                        .map(
                            (opt) => `
                        <div class="dropdown-item ${valueSet.has(opt.value) ? "selected" : ""}" data-value="${opt.value}">
                            ${opt.label}
                        </div>
                    `
                        )
                        .join("")}
                </div>
            </div>
        `;
    }

    getDisplayText() {
        const options = this.getOptions();
        const isMulti = this.hasAttribute("multiple");
        const isTagMode = this.getAttribute("display-mode") === "tag";

        if (isMulti && isTagMode) {
            // Tags will be rendered manually in renderTags()
            return "";
        }

        if (isMulti) {
            const count = options.filter((opt) =>
                this.selectedValues.has(opt.value)
            ).length;
            return count > 0
                ? `${count} Selected`
                : this.getAttribute("placeholder") || "Select...";
        } else {
            const selected = options.find((opt) => opt.value === this.value);
            return (
                selected?.label ||
                this.getAttribute("placeholder") ||
                "Select..."
            );
        }
    }

    attachEventListeners() {
        this.selectContainer.addEventListener("click", () =>
            this.toggleDropdown()
        );

        this.dropdown.querySelectorAll(".dropdown-item").forEach((item) => {
            item.addEventListener("click", () => {
                const val = item.getAttribute("data-value");
                const isRequired = this.hasAttribute("required");
                const isMulti = this.hasAttribute("multiple");

                if (isMulti) {
                    if (this.selectedValues.has(val)) {
                        if (!isRequired || this.selectedValues.size > 1) {
                            this.selectedValues.delete(val);
                        }
                    } else {
                        this.selectedValues.add(val);
                    }

                    this.setAttribute(
                        "value",
                        Array.from(this.selectedValues).join(",")
                    );
                } else {
                    const isSelected = val === this.value;
                    if (isSelected && !isRequired) {
                        this.value = "";
                    } else {
                        this.value = val;
                    }
                }

                this.dispatchEvent(
                    new CustomEvent("change", {
                        detail: { value: this.value },
                        bubbles: true,
                        composed: true,
                    })
                );

                this.updateValidation();
                this.closeDropdown();
            });
        });
    }

    toggleDropdown() {
        const isOpen = this.dropdown.classList.contains("open");
        this.dropdown.classList.toggle("open", !isOpen);
        this.selectContainer.classList.toggle("open", !isOpen);
    }

    closeDropdown() {
        this.dropdown.classList.remove("open");
        this.selectContainer.classList.remove("open");
    }

    queryRefs() {
        this.selectContainer =
            this.shadowRoot.querySelector(".select-container");
        this.dropdown = this.shadowRoot.querySelector(".dropdown");
        this.labelWrapper = this.shadowRoot.querySelector(".label-wrapper");
        this.displayElement = this.shadowRoot.querySelector(".value-display");
    }

    getOptions() {
        try {
            return JSON.parse(this.getAttribute("options") || "[]");
        } catch (e) {
            return [];
        }
    }

    renderTags() {
        const isMulti = this.hasAttribute("multiple");
        const isTagMode = this.getAttribute("display-mode") === "tag";
        if (!isMulti || !isTagMode || !this.displayElement) return;

        const options = this.getOptions();
        this.displayElement.innerHTML = "";

        const selected = options.filter((opt) =>
            this.selectedValues.has(opt.value)
        );

        selected.forEach((opt) => {
            const tag = document.createElement("y-tag");
            tag.setAttribute("removable", "");
            tag.setAttribute("color", "primary");
            tag.setAttribute("style-type", "filled");
            tag.textContent = opt.label;
            tag.dataset.value = opt.value;

            tag.addEventListener("remove", () => {
                this.selectedValues.delete(opt.value);
                this.setAttribute(
                    "value",
                    Array.from(this.selectedValues).join(",")
                );
                this.renderTags();
                this.updateSelectedStyles();
                this.updateValidation();

                this.dispatchEvent(
                    new CustomEvent("change", {
                        detail: { value: this.value },
                        bubbles: true,
                        composed: true,
                    })
                );
            });

            this.displayElement.appendChild(tag);
        });
    }

    updateDisplay() {
        const isTagMode = this.getAttribute("display-mode") === "tag";

        if (isTagMode) {
            this.renderTags();
        } else if (this.displayElement) {
            this.displayElement.textContent = this.getDisplayText();
        }
    }

    updateSelectedStyles() {
        const isMulti = this.hasAttribute("multiple");
        const valueSet = isMulti ? this.selectedValues : new Set([this.value]);

        this.dropdown?.querySelectorAll(".dropdown-item").forEach((item) => {
            const val = item.getAttribute("data-value");
            item.classList.toggle("selected", valueSet.has(val));
        });
    }

    updateValidation() {
        const required = this.hasAttribute("required");
        const isMulti = this.hasAttribute("multiple");
        const isValid = isMulti
            ? this.selectedValues.size > 0
            : this.value && this.value !== "";

        if (required && !isValid) {
            this.setAttribute("invalid", "");
        } else {
            this.removeAttribute("invalid");
        }
    }

    updateValidationState() {
        const isInvalid = this.hasAttribute("invalid");
        this.selectContainer?.classList.toggle("is-invalid", isInvalid);
        this.labelWrapper?.classList.toggle("is-invalid", isInvalid);
    }
}

if (!customElements.get("y-select")) {
    customElements.define("y-select", YumeSelect);
}
