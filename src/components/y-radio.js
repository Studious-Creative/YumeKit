export class YumeRadio extends HTMLElement {
    static formAssociated = true;

    static get observedAttributes() {
        return ["options", "name", "value", "disabled"];
    }

    constructor() {
        super();
        this._internals = this.attachInternals();
        this.attachShadow({ mode: "open" });
        this._value = "";
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (oldVal !== newVal) {
            if (name === "value") {
                this._value = newVal;
                this._internals.setFormValue(newVal, this.name);
                this.updateChecked();
            } else if (["options", "name", "disabled"].includes(name)) {
                this.render();
            }
        }
    }

    get value() {
        return this._value;
    }

    set value(val) {
        this._value = val;
        this.setAttribute("value", val);
        this._internals.setFormValue(val, this.name);
        this.updateChecked();
    }

    get name() {
        return this.getAttribute("name") || "";
    }

    get options() {
        try {
            return JSON.parse(this.getAttribute("options") || "[]");
        } catch {
            return [];
        }
    }

    set options(val) {
        this.setAttribute("options", JSON.stringify(val));
    }

    render() {
        const name = this.name;
        const disabled = this.hasAttribute("disabled");
        const value = this.value;
        const options = this.options;

        const style = `
            :host {
                display: block;
                font-family: var(--font-family-body);
            }
            fieldset {
                border: none;
                padding: 0;
                margin: 0;
                display: flex;
                flex-direction: column;
                gap: var(--spacing-x-small, 8px);
            }
            label {
                display: flex;
                align-items: center;
                gap: 0.5em;
                cursor: pointer;
            }
            input[type="radio"] {
                appearance: none;
                width: 16px;
                height: 16px;
                border: 2px solid var(--base-content--);
                border-radius: 50%;
                position: relative;
                outline: none;
                cursor: pointer;
            }
            input[type="radio"]:checked::after {
                content: '';
                position: absolute;
                top: 2px;
                left: 2px;
                width: 8px;
                height: 8px;
                background: var(--primary-content--);
                border-radius: 50%;
            }
            input[type="radio"]:focus-visible {
                outline: 2px solid var(--primary-content--);
                outline-offset: 2px;
            }
            input[disabled] {
                opacity: 0.5;
                cursor: not-allowed;
            }
        `;

        this.shadowRoot.innerHTML = `
            <style>${style}</style>
            <fieldset role="radiogroup">
                ${options
                    .map(
                        (opt, idx) => `
                    <label>
                        <input
                            type="radio"
                            name="${name}"
                            value="${opt.value}"
                            ${disabled ? "disabled" : ""}
                            ${value === opt.value ? "checked" : ""}
                            tabindex="${value ? (value === opt.value ? "0" : "-1") : idx === 0 ? "0" : "-1"}"
                            role="radio"
                            aria-checked="${value === opt.value}"
                        />
                        ${opt.label}
                    </label>
                `
                    )
                    .join("")}
            </fieldset>
        `;

        this.shadowRoot
            .querySelectorAll("input[type=radio]")
            .forEach((input, i, list) => {
                input.addEventListener("keydown", (e) =>
                    this.handleKey(e, i, list)
                );
                input.addEventListener("click", (e) => {
                    this.value = e.target.value;
                    this.dispatchEvent(
                        new CustomEvent("change", {
                            detail: { value: this.value },
                            bubbles: true,
                            composed: true,
                        })
                    );
                });
            });
    }

    updateChecked() {
        const radios = this.shadowRoot.querySelectorAll("input[type=radio]");
        radios.forEach((input, i) => {
            const isSelected = input.value === this.value;
            input.checked = isSelected;
            input.setAttribute("aria-checked", isSelected);
            input.setAttribute("tabindex", isSelected ? "0" : "-1");
        });
    }

    handleKey(e, index, radios) {
        const len = radios.length;
        let newIndex = index;

        if (e.key === "ArrowDown" || e.key === "ArrowRight") {
            e.preventDefault();
            newIndex = (index + 1) % len;
        } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
            e.preventDefault();
            newIndex = (index - 1 + len) % len;
        } else if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            this.value = radios[index].value;
            this.dispatchEvent(
                new CustomEvent("change", {
                    detail: { value: this.value },
                    bubbles: true,
                    composed: true,
                })
            );
            return;
        } else {
            return; // Ignore other keys
        }

        // Shift focus only (no selection change)
        radios[newIndex].focus();
    }
}

if (!customElements.get("y-radio")) {
    customElements.define("y-radio", YumeRadio);
}
