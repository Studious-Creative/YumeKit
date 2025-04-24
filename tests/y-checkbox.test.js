import { fixture, html, expect } from "@open-wc/testing";
import "../src/components/y-checkbox.js";

describe("<y-checkbox>", () => {
    it("renders with default unchecked state", async () => {
        const el = await fixture(html`<y-checkbox>Label</y-checkbox>`);
        expect(el.checked).to.be.false;
    });

    it("renders as checked when attribute is set", async () => {
        const el = await fixture(html`<y-checkbox checked>Label</y-checkbox>`);
        expect(el.checked).to.be.true;
        const box = el.shadowRoot.querySelector(".checkbox");
        expect(box.getAttribute("aria-checked")).to.equal("true");
    });

    it("toggles checked state when clicked", async () => {
        const el = await fixture(html`<y-checkbox>Label</y-checkbox>`);
        const box = el.shadowRoot.querySelector(".checkbox");
        box.click();
        expect(el.checked).to.be.true;
        box.click();
        expect(el.checked).to.be.false;
    });

    it("emits change event when toggled", async () => {
        const el = await fixture(html`<y-checkbox>Label</y-checkbox>`);
        const box = el.shadowRoot.querySelector(".checkbox");

        let changed = false;
        el.addEventListener("change", () => (changed = true));
        box.click();

        expect(changed).to.be.true;
    });

    it("reflects disabled state and prevents toggle", async () => {
        const el = await fixture(html`<y-checkbox disabled>Label</y-checkbox>`);
        const box = el.shadowRoot.querySelector(".checkbox");
        box.click();
        expect(el.checked).to.be.false;
    });

    it("supports indeterminate state and clears when toggled", async () => {
        const el = await fixture(
            html`<y-checkbox indeterminate>Label</y-checkbox>`
        );
        expect(el.indeterminate).to.be.true;
        const box = el.shadowRoot.querySelector(".checkbox");
        box.click();
        expect(el.checked).to.be.true;
        expect(el.indeterminate).to.be.false;
    });

    it("can be used in a form and submits value when checked", async () => {
        const form = await fixture(html`
            <form>
                <y-checkbox name="agree" value="yes" checked>Agree</y-checkbox>
            </form>
        `);
        const data = new FormData(form);
        expect(data.get("agree")).to.equal("yes");
    });

    it("does not submit value if unchecked", async () => {
        const form = await fixture(html`
            <form>
                <y-checkbox name="agree" value="yes">Agree</y-checkbox>
            </form>
        `);
        const data = new FormData(form);
        expect(data.get("agree")).to.equal(null);
    });
});
