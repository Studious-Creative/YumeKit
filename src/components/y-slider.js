export class YumeSlider extends HTMLElement {
    static formAssociated = true;

    static get observedAttributes() {
        return [
            "value",
            "min",
            "max",
            "step",
            "size",
            "color",
            "label-display",
            "label-format",
            "label-position",
            "disabled",
            "name",
            "orientation",
        ];
    }

    constructor() {
        super();
        this._internals = this.attachInternals();
        this.attachShadow({ mode: "open" });
        this._dragging = false;
    }

    connectedCallback() {
        if (!this.hasAttribute("size")) this.setAttribute("size", "medium");
        if (!this.hasAttribute("min")) this.setAttribute("min", "0");
        if (!this.hasAttribute("max")) this.setAttribute("max", "100");
        if (!this.hasAttribute("value")) this.setAttribute("value", "50");
        if (!this.hasAttribute("label-position"))
            this.setAttribute("label-position", "top");

        this._internals.setFormValue(this.value);
        this.render();
        this._bindEvents();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            if (name === "value" || name === "name") {
                this._internals.setFormValue(
                    this.value,
                    this.getAttribute("name"),
                );
            }
            this.render();
            this._bindEvents();
        }
    }

    // --- Properties ---

    get value() {
        const val = parseFloat(this.getAttribute("value"));
        return Number.isNaN(val) ? 0 : val;
    }

    set value(val) {
        const clamped = Math.max(this.min, Math.min(this.max, Number(val)));
        const stepped = this._snapToStep(clamped);
        this.setAttribute("value", String(stepped));
    }

    get min() {
        return parseFloat(this.getAttribute("min")) || 0;
    }

    set min(val) {
        this.setAttribute("min", String(val));
    }

    get max() {
        return parseFloat(this.getAttribute("max")) || 100;
    }

    set max(val) {
        this.setAttribute("max", String(val));
    }

    get step() {
        const s = parseFloat(this.getAttribute("step"));
        return Number.isNaN(s) || s <= 0 ? null : s;
    }

    set step(val) {
        if (val === null || val === undefined) {
            this.removeAttribute("step");
        } else {
            this.setAttribute("step", String(val));
        }
    }

    get size() {
        return this.getAttribute("size") || "medium";
    }

    set size(val) {
        this.setAttribute("size", val);
    }

    get color() {
        return this.getAttribute("color") || "primary";
    }

    set color(val) {
        this.setAttribute("color", val);
    }

    get labelDisplay() {
        return this.getAttribute("label-display") !== "false";
    }

    set labelDisplay(val) {
        this.setAttribute("label-display", val ? "true" : "false");
    }

    get labelFormat() {
        return this.getAttribute("label-format") || "value";
    }

    set labelFormat(val) {
        this.setAttribute("label-format", val);
    }

    get labelPosition() {
        return this.getAttribute("label-position") || "top";
    }

    set labelPosition(val) {
        this.setAttribute("label-position", val);
    }

    get disabled() {
        return this.hasAttribute("disabled");
    }

    set disabled(val) {
        if (val) this.setAttribute("disabled", "");
        else this.removeAttribute("disabled");
    }

    get orientation() {
        return this.getAttribute("orientation") || "horizontal";
    }

    set orientation(val) {
        this.setAttribute("orientation", val);
    }

    // --- Computed helpers ---

    get percentage() {
        const range = this.max - this.min;
        if (range <= 0) return 0;
        const pct = ((this.value - this.min) / range) * 100;
        return Math.max(0, Math.min(100, pct));
    }

    _snapToStep(val) {
        if (!this.step) return val;
        const steps = Math.round((val - this.min) / this.step);
        return Math.max(
            this.min,
            Math.min(this.max, this.min + steps * this.step),
        );
    }

    getTrackColor(color) {
        const colorMap = {
            primary: "var(--primary-background-component)",
            secondary: "var(--secondary-background-component)",
            base: "var(--base-background-active)",
            success: "var(--success-background-component)",
            warning: "var(--warning-background-component)",
            error: "var(--error-background-component)",
            help: "var(--help-background-component)",
        };
        return colorMap[color] || color;
    }

    getThumbColor(color) {
        const colorMap = {
            primary: "var(--primary-content--)",
            secondary: "var(--secondary-content--)",
            base: "var(--base-content--)",
            success: "var(--success-content--)",
            warning: "var(--warning-content--)",
            error: "var(--error-content--)",
            help: "var(--help-content--)",
        };
        return colorMap[color] || color;
    }

    getSizeVars(size) {
        const map = {
            small: {
                trackHeight: "var(--sizing-small, 27px)",
            },
            medium: {
                trackHeight: "var(--sizing-medium, 35px)",
            },
            large: {
                trackHeight: "var(--sizing-large, 51px)",
            },
        };
        return map[size] || map.medium;
    }

    getLabel() {
        switch (this.labelFormat) {
            case "percent":
                return `${Math.round(this.percentage)}%`;
            case "fraction":
                return `${this.value - this.min} / ${this.max - this.min}`;
            case "value":
            default:
                return `${this.value}`;
        }
    }

    // --- Events ---

    _bindEvents() {
        const track = this.shadowRoot.querySelector(".slider-track");
        const thumb = this.shadowRoot.querySelector(".thumb");
        if (!track || !thumb) return;

        const onPointerDown = (e) => {
            if (this.disabled) return;
            e.preventDefault();
            this._dragging = true;
            this._updateFromPointer(e);
            document.addEventListener("pointermove", onPointerMove);
            document.addEventListener("pointerup", onPointerUp);
        };

        const onPointerMove = (e) => {
            if (!this._dragging) return;
            this._updateFromPointer(e);
        };

        const onPointerUp = () => {
            this._dragging = false;
            document.removeEventListener("pointermove", onPointerMove);
            document.removeEventListener("pointerup", onPointerUp);
            this.dispatchEvent(
                new Event("change", { bubbles: true, composed: true }),
            );
        };

        track.addEventListener("pointerdown", onPointerDown);
        thumb.addEventListener("pointerdown", onPointerDown);

        track.addEventListener("keydown", (e) => {
            if (this.disabled) return;
            const s = this.step || 1;
            let handled = true;
            switch (e.key) {
                case "ArrowRight":
                case "ArrowUp":
                    this.value = this.value + s;
                    break;
                case "ArrowLeft":
                case "ArrowDown":
                    this.value = this.value - s;
                    break;
                case "Home":
                    this.value = this.min;
                    break;
                case "End":
                    this.value = this.max;
                    break;
                default:
                    handled = false;
            }
            if (handled) {
                e.preventDefault();
                this.dispatchEvent(
                    new Event("input", { bubbles: true, composed: true }),
                );
                this.dispatchEvent(
                    new Event("change", { bubbles: true, composed: true }),
                );
            }
        });
    }

    _updateFromPointer(e) {
        const track = this.shadowRoot.querySelector(".slider-track");
        const rect = track.getBoundingClientRect();
        const ratio = Math.max(
            0,
            Math.min(1, (e.clientX - rect.left) / rect.width),
        );
        const rawValue = this.min + ratio * (this.max - this.min);
        this.value = rawValue;
        this.dispatchEvent(
            new Event("input", { bubbles: true, composed: true }),
        );
    }

    // --- Rendering ---

    render() {
        const pct = this.percentage;
        const trackFillColor = this.getTrackColor(this.color);
        const thumbColor = this.getThumbColor(this.color);
        const { trackHeight } = this.getSizeVars(this.size);
        const isDisabled = this.disabled;
        const showLabel = this.labelDisplay;
        const labelText = this.getLabel();
        const labelPos = this.labelPosition;
        const isLabelTop = labelPos === "top";

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    font-family: var(--font-family-body);
                    color: var(--base-content--);
                    opacity: ${isDisabled ? "0.5" : "1"};
                    pointer-events: ${isDisabled ? "none" : "auto"};
                }

                .slider-wrapper {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-2x-small, 4px);
                }

                .slider-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-size: var(--font-size-label, 0.83em);
                    order: ${isLabelTop ? "0" : "1"};
                }

                .label {
                    color: var(--base-content--);
                }

                .value-label {
                    color: var(--base-content-light);
                    font-variant-numeric: tabular-nums;
                }

                .slider-track {
                    position: relative;
                    width: 100%;
                    height: ${trackHeight};
                    background: var(--base-background-component);
                    border: var(--component-slider-border-width) solid var(--base-background-border);
                    border-radius: var(--component-slider-border-radius);
                    box-sizing: border-box;
                    padding: var(--component-slider-padding);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    outline: none;
                    overflow: hidden;
                }

                .slider-track:focus-visible {
                    border-color: ${thumbColor};
                }

                .fill {
                    height: 100%;
                    background: ${trackFillColor};
                    border-radius: var(--component-slider-border-radius) 0 0 var(--component-slider-border-radius);
                    width: ${pct}%;
                    pointer-events: none;
                    transition: width 0.1s ease;
                    flex-shrink: 0;
                }

                .thumb {
                    width: 8px;
                    height: 100%;
                    background: ${thumbColor};
                    border-radius: var(--component-slider-thumb-border-radius);
                    cursor: grab;
                    transition: width 0.1s ease;
                    z-index: 1;
                    touch-action: none;
                    flex-shrink: 0;
                }

                .thumb:active {
                    cursor: grabbing;
                }
            </style>

            <div class="slider-wrapper">
                <div class="slider-header">
                    <span class="label"><slot></slot></span>
                    ${showLabel ? `<span class="value-label" part="value-label">${labelText}</span>` : ""}
                </div>
                <div
                    class="slider-track"
                    part="track"
                    role="slider"
                    tabindex="${isDisabled ? "-1" : "0"}"
                    aria-valuenow="${this.value}"
                    aria-valuemin="${this.min}"
                    aria-valuemax="${this.max}"
                    ${this.step ? `aria-valuestep="${this.step}"` : ""}
                    aria-orientation="${this.orientation}"
                    ${isDisabled ? 'aria-disabled="true"' : ""}
                >
                    <div class="fill" part="fill"></div>
                    <div class="thumb" part="thumb"></div>
                </div>
            </div>
        `;
    }
}

if (!customElements.get("y-slider")) {
    customElements.define("y-slider", YumeSlider);
}
