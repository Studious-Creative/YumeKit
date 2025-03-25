class YumeButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.init();
    }

    static get observedAttributes() {
        return [
            "left-icon",
            "right-icon",
            "color",
            "size",
            "style-type",
            "type",
            "disabled",
            "name",
            "value",
            "autofocus",
            "form",
            "formaction",
            "formenctype",
            "formmethod",
            "formnovalidate",
            "formtarget",
            "aria-label",
            "aria-pressed",
            "aria-hidden",
        ];
    }

    init() {
        this.applyStyles();
        this.render();
        this.proxyNativeOnClick();
        this.addEventListeners();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        const attributes = YumeButton.observedAttributes;

        if (oldValue !== newValue && attributes.includes(name)) {
            if (newValue === null) {
                this.button.removeAttribute(name);
            } else {
                this.button.setAttribute(name, newValue);
            }
        }

        this.init();

        if (["color", "size", "style-type", "disabled"].includes(name)) {
            this.updateStyles();
        }
    }

    updateButtonAttributes() {
        const attributes = YumeButton.observedAttributes;

        attributes.forEach((attr) => {
            if (this.hasAttribute(attr)) {
                this.button.setAttribute(attr, this.getAttribute(attr));
            } else {
                this.button.removeAttribute(attr);
            }
        });
    }

    connectedCallback() {
        if (!this.hasAttribute("size")) {
            this.setAttribute("size", "medium");
        }

        this.init();
    }

    render() {
        if (!this.button) {
            this.button = document.createElement("button");
            this.button.classList.add("button");
            this.button.setAttribute("role", "button");
            this.button.setAttribute("tabindex", "0");
            this.button.setAttribute("part", "button");
            this.shadowRoot.appendChild(this.button);
        }

        this.updateButtonAttributes();

        if (this.hasAttribute("disabled")) {
            this.button.setAttribute("disabled", "");
            this.button.setAttribute("aria-disabled", "true");
        } else {
            this.button.removeAttribute("disabled");
            this.button.setAttribute("aria-disabled", "false");
        }

        this.button.innerHTML = `
          <span class="icon left-icon" part="left-icon"><slot name="left-icon"></slot></span>
          <span class="label" part="label"><slot></slot></span>
          <span class="icon right-icon" part="right-icon"><slot name="right-icon"></slot></span>
      `;

        this.manageSlotVisibility("left-icon", ".left-icon");
        this.manageSlotVisibility("right-icon", ".right-icon");
        this.manageSlotVisibility("", ".label");
    }

    addEventListeners() {
        // Focus and blur events.
        this.button.addEventListener("focus", () => {
            this.dispatchEvent(
                new CustomEvent("focus", { bubbles: true, composed: true })
            );
        });

        this.button.addEventListener("blur", () => {
            this.dispatchEvent(
                new CustomEvent("blur", { bubbles: true, composed: true })
            );
        });

        // Keyboard events.
        this.button.addEventListener("keydown", (event) => {
            this.dispatchEvent(
                new CustomEvent("keydown", {
                    detail: { key: event.key, code: event.code },
                    bubbles: true,
                    composed: true,
                })
            );
        });

        this.button.addEventListener("keyup", (event) => {
            this.dispatchEvent(
                new CustomEvent("keyup", {
                    detail: { key: event.key, code: event.code },
                    bubbles: true,
                    composed: true,
                })
            );
        });

        // Click event.
        this.button.addEventListener("click", (event) => {
            this.handleClick();

            // If button type is "submit", trigger form submission.
            if (this.getAttribute("type") === "submit") {
                const form = this.closest("form");
                if (form) {
                    event.preventDefault();
                    form.requestSubmit();
                }
            }
        });
    }

    applyStyles() {
        const style = document.createElement("style");
        style.textContent = `
        :host {
          display: inline-block;
        }
        /* Ensure fonts exist in Shadow DOM */
        @font-face {
            font-family: "Fredoka";
            font-display: swap;
        }

        .button {
          box-sizing: border-box;
          display: inline-flex;
          min-height: var(--button-min-height, 35px);
          min-width: var(--button-min-width, 35px);
          padding: var(--button-padding, 16px);
          justify-content: center;
          align-items: center;
          position: relative;
          overflow: hidden;
          border-radius: var(--border-small, 4px);
          border: var(--button-border-width, 1px) solid var(--border-color, #1D1D1D);
          background: var(--background-color, #F1F6FA);
          transition: background-color 0.1s, color 0.1s, border-color 0.1s;
          cursor: pointer;
          width: 100%;
          color: var(--text-color);
          font-family: Fredoka, sans-serif;
          font-size: var(--size-paragraph, 16px);
        }

        .button:hover:not(:disabled),
        .button:hover:not(:disabled) .button-content {
          background: var(--hover-background-color);
          color: var(--hover-text-color);
        }
        .button:focus:not(:disabled),
        .button:focus:not(:disabled) .button-content {
          background: var(--focus-background-color);
          color: var(--focus-text-color);
        }
        .button:active:not(:disabled),
        .button:active:not(:disabled) .button-content {
          background: var(--active-background-color);
          color: var(--active-text-color);
        }
        .icon {
          display: flex;
          min-width: 16px;
          justify-content: center;
        }
        .label, .icon {
          padding-bottom: var(--spacing-x-small, 4px);
        }
      `;
        this.shadowRoot.appendChild(style);
    }

    updateStyles() {
        const color = this.getAttribute("color") || "base";
        const size = this.getAttribute("size") || "medium";
        const styleType = this.getAttribute("style-type") || "outlined";

        const colorVars = {
            primary: [
                "--primary-content--",
                "--primary-hover",
                "--primary-active",
                "--primary-background-app",
                "--primary-background-hover",
                "--primary-background-active",
            ],
            secondary: [
                "--secondary-content--",
                "--secondary-hover",
                "--secondary-active",
                "--secondary-background-app",
                "--secondary-background-hover",
                "--secondary-background-active",
            ],
            base: [
                "--base-content--",
                "--base-content-emphasize",
                "--base-content-light",
                "--base-background-app",
                "--base-background-hover",
                "--base-background-focus",
            ],
            success: [
                "--success-content--",
                "--success-hover",
                "--success-active",
                "--success-background-app",
                "--success-background-hover",
                "--success-background-active",
            ],
            error: [
                "--error-content--",
                "--error-hover",
                "--error-active",
                "--error-background-app",
                "--error-background-hover",
                "--error-background-active",
            ],
            warning: [
                "--warning-content--",
                "--warning-hover",
                "--warning-active",
                "--warning-background-app",
                "--warning-background-hover",
                "--warning-background-active",
            ],
        };

        const sizeVars = {
            small: ["--spacing-2x-small", "--spacing-x-small"],
            medium: ["--spacing-x-small", "--spacing-small"],
            large: ["--spacing-small", "--spacing-medium"],
        };

        const styleVars = {
            outlined: {
                "--background-color": `var(${colorVars[color][3]}, rgba(241,246,250,1))`,
                "--border-color": `var(${colorVars[color][0]}, rgba(29,29,29,1))`,
                "--text-color": `var(${colorVars[color][0]}, rgba(29,29,29,1))`,
            },
            filled: {
                "--background-color": `var(${colorVars[color][0]}, rgba(29,29,29,1))`,
                "--border-color": `var(${colorVars[color][0]}, rgba(29,29,29,1))`,
                "--text-color": `var(${colorVars[color][3]}, rgba(241,246,250,1))`,
            },
            flat: {
                "--background-color": `var(${colorVars[color][3]},rgba(241,246,250,1))`,
                "--border-color": `var(${colorVars[color][3]},rgba(241,246,250,1))`,
                "--text-color": `var(${colorVars[color][0]},rgba(29,29,29,1))`,
            },
        };

        const currentStyle = styleVars[styleType] || styleVars.outlined;
        Object.entries(currentStyle).forEach(([key, value]) => {
            this.button.style.setProperty(key, value);
        });

        this.button.style.setProperty(
            "--hover-background-color",
            `var(${colorVars[color][4]}, rgba(215,219,222,1))`
        );
        this.button.style.setProperty(
            "--hover-text-color",
            `var(${colorVars[color][0]}, rgba(29,29,29,1))`
        );
        this.button.style.setProperty(
            "--focus-background-color",
            `var(${colorVars[color][5]}, rgba(188,192,195,1))`
        );
        this.button.style.setProperty(
            "--focus-text-color",
            `var(${colorVars[color][0]}, rgba(29,29,29,1))`
        );
        this.button.style.setProperty(
            "--active-background-color",
            `var(${colorVars[color][0]}, rgba(29,29,29,1))`
        );
        this.button.style.setProperty(
            "--active-text-color",
            `var(${colorVars[color][3]}, rgba(241,246,250,1))`
        );

        const [contentPadding, buttonPadding] =
            sizeVars[size] || sizeVars.medium;
        this.button.style.setProperty(
            "--content-padding",
            `var(${contentPadding}, 4px)`
        );
        this.button.style.setProperty(
            "--button-padding",
            `var(${buttonPadding}, 8px)`
        );
        this.button.style.setProperty("--gap", `var(${buttonPadding}, 16px)`);

        const minSizeMapping = {
            small: "27px",
            medium: "35px",
            large: "51px",
        };
        this.button.style.setProperty(
            "--button-min-height",
            minSizeMapping[size] || "40px"
        );
        this.button.style.setProperty(
            "--button-min-width",
            minSizeMapping[size] || "40px"
        );
    }

    handleClick() {
        const detail = {};
        const eventType = this.getAttribute("data-event");

        if (this.hasAttribute("disabled") || !eventType) return;

        Array.from(this.attributes)
            .filter((attr) => attr.name.startsWith("data-detail-"))
            .forEach((attr) => {
                const key = attr.name.replace("data-detail-", "");
                detail[key] = attr.value;
            });

        this.dispatchEvent(
            new CustomEvent(eventType, {
                detail,
                bubbles: true,
                composed: true,
            })
        );
    }

    proxyNativeOnClick() {
        try {
            Object.defineProperty(this, "onclick", {
                get: () => this.button.onclick,
                set: (value) => {
                    this.button.onclick = value;
                },
                configurable: true,
                enumerable: true,
            });
        } catch (e) {
            console.warn("Could not redefine onclick:", e);
        }
    }

    manageSlotVisibility(slotName, selector) {
        const slot = slotName
            ? this.shadowRoot.querySelector(`slot[name="${slotName}"]`)
            : this.shadowRoot.querySelector("slot:not([name])");
        const container = this.shadowRoot.querySelector(selector);

        const updateVisibility = () => {
            const hasContent = slot.assignedNodes().length > 0;
            container.style.display = hasContent ? "inline-flex" : "none";
        };

        updateVisibility();
        slot.addEventListener("slotchange", updateVisibility);
    }

    get value() {
        if (this.hasAttribute("multiple")) {
            return Array.from(this.selectedValues).join(",");
        } else {
            return this.selectedValues.size
                ? Array.from(this.selectedValues)[0]
                : "";
        }
    }

    set value(newVal) {
        if (this.hasAttribute("multiple")) {
            if (typeof newVal === "string") {
                this.selectedValues = new Set(
                    newVal.split(",").map((s) => s.trim())
                );
            } else if (Array.isArray(newVal)) {
                this.selectedValues = new Set(newVal);
            }
        } else {
            if (typeof newVal === "string") {
                this.selectedValues = new Set([newVal.trim()]);
            } else {
                this.selectedValues = new Set();
            }
        }

        this.setAttribute("value", newVal);
    }

    setOptions(options) {
        this.setAttribute("options", JSON.stringify(options));
    }
}

if (!customElements.get("y-button")) {
    customElements.define("y-button", YumeButton);
}
