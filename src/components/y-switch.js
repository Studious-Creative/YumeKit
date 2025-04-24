class YumeSwitch extends HTMLElement {
    static formAssociated = true;

    static get observedAttributes() {
        return [
            "checked",
            "disabled",
            "animate",
            "label-display",
            "label-position",
            "size",
            "value",
        ];
    }

    constructor() {
        super();
        this._internals = this.attachInternals();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        if (!this.hasAttribute("size")) this.setAttribute("size", "medium");
        if (!this.hasAttribute("label-display"))
            this.setAttribute("label-display", "true");
        if (!this.hasAttribute("label-position"))
            this.setAttribute("label-position", "top");
        if (!this.hasAttribute("animate")) this.setAttribute("animate", "true");

        this.render();
        this.mirrorToggleLabels();

        const sw = this.shadowRoot.querySelector(".switch");
        sw.addEventListener("click", () => this.toggle());
        sw.addEventListener("keydown", (e) => {
            if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                this.toggle();
            }
        });
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.update();
        }
    }

    get checked() {
        return this.hasAttribute("checked");
    }

    set checked(val) {
        if (val) this.setAttribute("checked", "");
        else this.removeAttribute("checked");
        this.update();
    }

    get value() {
        return this.getAttribute("value") || "on";
    }

    set value(val) {
        this.setAttribute("value", val);
        this.update();
    }

    toggle() {
        if (this.hasAttribute("disabled")) return;
        this.checked = !this.checked;
        this.dispatchEvent(
            new Event("change", { bubbles: true, composed: true })
        );
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-flex;
                    flex-direction: var(--switch-dir, column);
                    align-items: center;
                    gap: var(--spacing-x-small);
                    font-family: var(--font-family-body);
                }

                .label {
                    font-size: var(--font-size-label);
                    color: var(--base-content--);
                }

                .switch {
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                    background: var(--base-background-component);
                    border: var(--component-switch-border-width) solid var(--base-background-border);
                    border-radius: var(--component-switch-border-radius);
                    cursor: pointer;
                    height: var(--switch-height);
                    font-size: var(--switch-font-size);
                    box-sizing: border-box;
                    padding: 2px;
                    width: max-content;
                }

                .track {
                    display: flex;
                    align-items: center;
                    height: 100%;
                    position: relative;
                    z-index: 0;
                }

                .label-content {
                    flex: 0 0 auto;
                    align-items: center;
                    justify-content: center;
                    padding: 0 8px;
                    white-space: nowrap;
                    position: relative;
                    z-index: 0;
                    color: var(--base-content-light);
                    display: var(--show-labels, flex);
                }

                .toggle {
                    position: absolute;
                    top: 2px;
                    bottom: 2px;
                    left: 2px;
                    height: calc(100% - 4px);
                    background: var(--toggle-bg, var(--base-content-light));
                    color: var(--base-background-component);
                    border-radius: var(--component-switch-border-radius);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 8px;
                    font-weight: 500;
                    z-index: 1;
                    white-space: nowrap;
                    transform: translateX(var(--toggle-x, 0));
                    transition: var(--toggle-transition, transform 0.25s ease, background 0.25s ease);
                }

                .toggle .on,
                .toggle .off {
                    display: none;
                }

                :host([checked]) .toggle .on {
                    display: inline-flex;
                }

                :host(:not([checked])) .toggle .off {
                    display: inline-flex;
                }


                :host([animate="false"]) .toggle {
                    transition: none !important;
                }
            </style>

            ${this.labelTag("top")}

            <div class="switch" part="switch" tabindex="0" role="switch" aria-checked="${this.checked}" aria-disabled="${this.disabled}">
                <div class="track">
                    <div class="label-content"><slot name="off-label">Off</slot></div>
                    <div class="label-content"><slot name="on-label">On</slot></div>
                </div>
                <div class="toggle" part="toggle">
                    <span class="off"></span>
                    <span class="on"></span>
                </div>
            </div>

            ${this.labelTag("bottom")}
        `;

        this.update();
    }

    labelTag(pos) {
        const labelPos = this.getAttribute("label-position");
        const shouldRender =
            (pos === "top" && (labelPos === "top" || labelPos === "left")) ||
            (pos === "bottom" &&
                (labelPos === "bottom" || labelPos === "right"));
        return shouldRender ? `<label><slot name="label"></slot></label>` : "";
    }

    mirrorToggleLabels() {
        requestAnimationFrame(() => {
            const toggle = this.shadowRoot?.querySelector(".toggle");
            if (!toggle) return;

            toggle.innerHTML = ""; // Clear old content

            const offSlot = this.querySelector('[slot="off-label"]');
            const onSlot = this.querySelector('[slot="on-label"]');

            const fallbackOff = document.createTextNode("Off");
            const fallbackOn = document.createTextNode("On");

            const offClone = offSlot?.cloneNode(true) || fallbackOff;
            const onClone = onSlot?.cloneNode(true) || fallbackOn;

            const offWrapper = document.createElement("span");
            offWrapper.className = "off";
            offWrapper.appendChild(offClone);

            const onWrapper = document.createElement("span");
            onWrapper.className = "on";
            onWrapper.appendChild(onClone);

            toggle.appendChild(offWrapper);
            toggle.appendChild(onWrapper);
        });
    }

    update() {
        this.updateSizeStyles();
        this.updateTogglePosition();
        this.updateLabelDisplay();
        this.updateDirection();
        this.updateAria();
        this.updateFormValue();
        this.mirrorToggleLabels();
    }

    updateSizeStyles() {
        const size = this.getAttribute("size") || "medium";
        const heightMap = { small: "24px", medium: "32px", large: "40px" };
        const fontMap = {
            small: "var(--font-size-small)",
            medium: "var(--font-size-label)",
            large: "var(--font-size-h4)",
        };
        this.style.setProperty("--switch-height", heightMap[size]);
        this.style.setProperty("--switch-font-size", fontMap[size]);
    }

    updateTogglePosition() {
        const isChecked = this.checked;
        this.style.setProperty("--toggle-x", isChecked ? "100%" : "0");
        this.style.setProperty(
            "--toggle-bg",
            isChecked ? "var(--primary-content--)" : "var(--base-content-light)"
        );
        this.style.setProperty(
            "--toggle-transition",
            this.getAttribute("animate") === "false"
                ? "none"
                : "transform 0.25s ease, background 0.25s ease"
        );
    }

    updateLabelDisplay() {
        const showLabels = this.getAttribute("label-display") !== "false";
        this.style.setProperty("--show-labels", showLabels ? "flex" : "none");
    }

    updateDirection() {
        const pos = this.getAttribute("label-position");
        const directionMap = {
            top: "column",
            bottom: "column-reverse",
            left: "row-reverse",
            right: "row",
        };
        this.style.setProperty("--switch-dir", directionMap[pos] || "column");
    }

    updateAria() {
        const sw = this.shadowRoot?.querySelector(".switch");
        if (sw) {
            sw.setAttribute("aria-checked", this.checked);
            sw.setAttribute("aria-disabled", this.disabled ? "true" : "false");
        }
    }

    updateFormValue() {
        this._internals.setFormValue(this.checked ? this.value : "");
    }
}

if (!customElements.get("y-switch")) {
    customElements.define("y-switch", YumeSwitch);
}
