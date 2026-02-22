import sinon from "sinon";
import { fixture, html, expect } from "@open-wc/testing";
import "../src/components/y-drawer.js";

describe("YumeDrawer", () => {
    it("is hidden by default", async () => {
        const el = await fixture(html`
            <y-drawer>
                <div slot="header">Header</div>
                <div slot="body">Body</div>
                <div slot="footer">Footer</div>
            </y-drawer>
        `);
        expect(el.hasAttribute("visible")).to.be.false;
        expect(getComputedStyle(el).display).to.equal("none");
    });

    it("shows when visible attribute is set", async () => {
        const el = await fixture(html`<y-drawer visible></y-drawer>`);
        expect(el.hasAttribute("visible")).to.be.true;
        expect(getComputedStyle(el).display).to.equal("block");
    });

    it("defaults position to left", async () => {
        const el = await fixture(html`<y-drawer></y-drawer>`);
        expect(el.position).to.equal("left");
        const panel = el.shadowRoot.querySelector(".drawer-panel");
        expect(panel.getAttribute("data-position")).to.equal("left");
    });

    it("accepts position attribute for each side", async () => {
        for (const pos of ["left", "right", "top", "bottom"]) {
            const el = await fixture(
                html`<y-drawer position="${pos}"></y-drawer>`,
            );
            expect(el.position).to.equal(pos);
            const panel = el.shadowRoot.querySelector(".drawer-panel");
            expect(panel.getAttribute("data-position")).to.equal(pos);
        }
    });

    it("toggles visibility when anchor element is clicked", async () => {
        const container = await fixture(html`
            <div>
                <button id="drawer-trigger">Open</button>
                <y-drawer anchor="drawer-trigger">
                    <div slot="body">Content</div>
                </y-drawer>
            </div>
        `);
        const btn = container.querySelector("#drawer-trigger");
        const drawer = container.querySelector("y-drawer");

        expect(drawer.hasAttribute("visible")).to.be.false;
        btn.click();
        expect(drawer.hasAttribute("visible")).to.be.true;
        btn.click();
        expect(drawer.hasAttribute("visible")).to.be.false;
    });

    it("closes on Escape key when open", async () => {
        const el = await fixture(html`<y-drawer visible></y-drawer>`);
        expect(el.hasAttribute("visible")).to.be.true;
        document.dispatchEvent(
            new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
        );
        expect(el.hasAttribute("visible")).to.be.false;
    });

    it("closes when overlay is clicked", async () => {
        const el = await fixture(html`<y-drawer visible></y-drawer>`);
        expect(el.hasAttribute("visible")).to.be.true;
        const overlay = el.shadowRoot.querySelector(".overlay");
        overlay.click();
        expect(el.hasAttribute("visible")).to.be.false;
    });

    it("focuses the drawer panel on show", async () => {
        const el = await fixture(html`<y-drawer></y-drawer>`);
        const panel = el.shadowRoot.querySelector(".drawer-panel");
        const focusSpy = sinon.spy(panel, "focus");
        el.visible = true;
        expect(focusSpy.calledOnce).to.be.true;
    });

    it("renders header, body, and footer slots", async () => {
        const el = await fixture(html`
            <y-drawer visible>
                <div slot="header">My Header</div>
                <p slot="body">My Body</p>
                <span slot="footer">My Footer</span>
            </y-drawer>
        `);
        const headerSlot = el.shadowRoot.querySelector('slot[name="header"]');
        const bodySlot = el.shadowRoot.querySelector('slot[name="body"]');
        const footerSlot = el.shadowRoot.querySelector('slot[name="footer"]');

        expect(
            headerSlot
                .assignedNodes()
                .find((n) => n.textContent.includes("My Header")),
        ).to.exist;
        expect(
            bodySlot
                .assignedNodes()
                .find((n) => n.textContent.includes("My Body")),
        ).to.exist;
        expect(
            footerSlot
                .assignedNodes()
                .find((n) => n.textContent.includes("My Footer")),
        ).to.exist;
    });

    it("updates position via property setter", async () => {
        const el = await fixture(html`<y-drawer></y-drawer>`);
        el.position = "right";
        await new Promise((r) => setTimeout(r, 0));
        const panel = el.shadowRoot.querySelector(".drawer-panel");
        expect(panel.getAttribute("data-position")).to.equal("right");
    });

    it("adds open class to panel and overlay on show", async () => {
        const el = await fixture(html`<y-drawer></y-drawer>`);
        el.visible = true;
        await new Promise((r) => setTimeout(r, 0));
        const panel = el.shadowRoot.querySelector(".drawer-panel");
        const overlay = el.shadowRoot.querySelector(".overlay");
        expect(panel.classList.contains("open")).to.be.true;
        expect(overlay.classList.contains("open")).to.be.true;
    });

    it("removes open class on hide", async () => {
        const el = await fixture(html`<y-drawer visible></y-drawer>`);
        await new Promise((r) => setTimeout(r, 50));
        el.visible = false;
        await new Promise((r) => setTimeout(r, 0));
        const panel = el.shadowRoot.querySelector(".drawer-panel");
        const overlay = el.shadowRoot.querySelector(".overlay");
        expect(panel.classList.contains("open")).to.be.false;
        expect(overlay.classList.contains("open")).to.be.false;
    });

    it("does not show resize handle by default", async () => {
        const el = await fixture(html`<y-drawer></y-drawer>`);
        const handle = el.shadowRoot.querySelector(".resize-handle");
        expect(handle).to.exist;
        expect(handle.style.display).to.equal("none");
    });

    it("shows resize handle when resizable is set", async () => {
        const el = await fixture(html`<y-drawer resizable></y-drawer>`);
        const handle = el.shadowRoot.querySelector(".resize-handle");
        expect(handle.style.display).to.equal("flex");
    });

    it("contains grip SVG inside resize handle", async () => {
        const el = await fixture(html`<y-drawer resizable></y-drawer>`);
        const handle = el.shadowRoot.querySelector(".resize-handle");
        const svg = handle.querySelector("svg");
        expect(svg).to.exist;
    });

    it("resizable property getter reflects attribute", async () => {
        const el = await fixture(html`<y-drawer></y-drawer>`);
        expect(el.resizable).to.be.false;
        el.resizable = true;
        expect(el.hasAttribute("resizable")).to.be.true;
        expect(el.resizable).to.be.true;
    });
});
