import { html, fixture, expect } from "@open-wc/testing";
import "../src/components/y-badge.js"; // adjust path as needed

describe("YumeBadge", () => {
    it("renders with default attributes", async () => {
        const el = await fixture(
            html`<y-badge value="5"><div>Item</div></y-badge>`
        );
        const badge = el.shadowRoot.querySelector(".badge");

        expect(badge).to.exist;
        expect(badge.textContent.trim()).to.equal("5");

        const computed = getComputedStyle(badge);
        expect(computed.position).to.equal("absolute");

        expect(el.shadowRoot.querySelector("slot")).to.exist;
    });

    it("applies custom position and alignment", async () => {
        const el = await fixture(
            html`<y-badge value="1" position="bottom" alignment="left"
                ><div>Box</div></y-badge
            >`
        );
        const style = el.shadowRoot.querySelector("style").textContent;

        expect(style).to.include("bottom: -10px;");
        expect(style).to.include("left: -10px;");
    });

    it("applies color from colorMap", async () => {
        const el = await fixture(
            html`<y-badge value="!" color="success"><div>Target</div></y-badge>`
        );
        const style = el.shadowRoot.querySelector("style").textContent;
        expect(style).to.include("background: var(--success");
    });

    it("uses fallback color if unknown color is provided", async () => {
        const el = await fixture(
            html`<y-badge value="!" color="#ff00ff"><div>Target</div></y-badge>`
        );
        const style = el.shadowRoot.querySelector("style").textContent;
        expect(style).to.include("background: #ff00ff");
    });

    it("adjusts size correctly for small", async () => {
        const el = await fixture(
            html`<y-badge value="1" size="small"><div>Size</div></y-badge>`
        );
        const style = el.shadowRoot.querySelector("style").textContent;
        expect(style).to.include("min-width: 15px");
    });

    it("updates when attribute changes", async () => {
        const el = await fixture(html`<y-badge value="7"></y-badge>`);
        el.setAttribute("value", "99");
        await el.updateComplete?.(); // optional for Lit-based rerendering
        const badge = el.shadowRoot.querySelector(".badge");
        expect(badge.textContent.trim()).to.equal("99");
    });
});
