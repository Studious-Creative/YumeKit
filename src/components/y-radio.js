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
                this.updateChecked();
                this._internals.setFormValue(newVal, this.name);
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
                -webkit-appearance: none;
                width: 16px;
                height: 16px;
                border: 2px solid var(--base-content--);
                border-radius: 50%;
                display: inline-block;
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
                        (opt) => `
                    <label>
                        <input
                            type="radio"
                            name="${name}"
                            value="${opt.value}"
                            ${disabled ? "disabled" : ""}
                            ${value === opt.value ? "checked" : ""}
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
            .forEach((input) => {
                input.addEventListener("change", (e) => {
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
        this.shadowRoot
            .querySelectorAll("input[type=radio]")
            .forEach((input) => {
                input.checked = input.value === this.value;
            });
    }
}

if (!customElements.get("y-radio")) {
    customElements.define("y-radio", YumeRadio);
}
