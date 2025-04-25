import { fixture, expect, html } from "@open-wc/testing";
import "../src/components/y-tabs.js"; // path to your component file

describe("YumeTabs", () => {
    const options = [
        { id: "one", label: "One", slot: "one-slot" },
        { id: "two", label: "Two", slot: "two-slot", disabled: true },
        { id: "three", label: "Three", slot: "three-slot" },
    ];

    it("renders with default medium size and top position", async () => {
        const el = await fixture(html`
            <y-tabs options="${JSON.stringify(options)}">
                <div slot="one-slot">First</div>
                <div slot="two-slot">Second</div>
                <div slot="three-slot">Third</div>
            </y-tabs>
        `);

        const tabs = el.shadowRoot.querySelectorAll("button");
        expect(tabs.length).to.equal(3);
        expect(el.getAttribute("size")).to.equal("medium");
        expect(el.getAttribute("position")).to.equal("top");

        // first tab selected
        expect(tabs[0].getAttribute("aria-selected")).to.equal("true");
    });

    it("skips disabled tabs on activation and navigation", async () => {
        const el = await fixture(html`
            <y-tabs options="${JSON.stringify(options)}">
                <div slot="one-slot">First</div>
                <div slot="two-slot">Second</div>
                <div slot="three-slot">Third</div>
            </y-tabs>
        `);

        const [btn1, btn2, btn3] = el.shadowRoot.querySelectorAll("button");
        // btn2 disabled
        expect(btn2.disabled).to.be.true;

        // clicking btn2 should do nothing
        btn2.click();
        expect(
            el.shadowRoot.querySelector('button[aria-selected="true"]').dataset
                .id
        ).to.equal("one");

        // Arrow navigation should skip disabled
        btn1.focus();
        const event = new KeyboardEvent("keydown", {
            key: "ArrowRight",
            bubbles: true,
        });
        btn1.dispatchEvent(event);
        // focus jumps to btn3
        expect(document.activeElement.shadowRoot.activeElement).to.equal(btn3);
    });

    it("updates content when tab changes", async () => {
        const el = await fixture(html`
            <y-tabs options="${JSON.stringify(options)}">
                <div slot="one-slot">First</div>
                <div slot="two-slot">Second</div>
                <div slot="three-slot">Third</div>
            </y-tabs>
        `);

        const btn3 = el.shadowRoot.querySelector('button[data-id="three"]');
        btn3.click();
        await el.updateComplete;

        const panel = el.shadowRoot.querySelector(".tabpanel");
        const slotted = panel.querySelector("slot");
        expect(slotted.name).to.equal("three-slot");
    });

    it("respects size and position attributes", async () => {
        const el = await fixture(html`
            <y-tabs
                options="${JSON.stringify(options)}"
                size="large"
                position="bottom"
            >
                <div slot="one-slot">First</div>
                <div slot="two-slot">Second</div>
                <div slot="three-slot">Third</div>
            </y-tabs>
        `);

        // attributes set
        expect(el.getAttribute("size")).to.equal("large");
        expect(el.getAttribute("position")).to.equal("bottom");

        // CSS uses the correct padding variable
        const cssText = el.shadowRoot.querySelector("style").textContent;
        expect(cssText).to.include("--component-tab-padding-large");
    });
});
