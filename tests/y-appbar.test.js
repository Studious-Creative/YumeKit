import { fixture, html, expect } from "@open-wc/testing";
import "../src/components/y-appbar.js";

describe("YumeAppbar", () => {
    it("renders with default vertical orientation", async () => {
        const el = await fixture(html`<y-appbar></y-appbar>`);
        expect(el.orientation).to.equal("vertical");
        const bar = el.shadowRoot.querySelector(".appbar");
        expect(bar.classList.contains("vertical")).to.be.true;
    });

    it("accepts horizontal orientation", async () => {
        const el = await fixture(
            html`<y-appbar orientation="horizontal"></y-appbar>`,
        );
        expect(el.orientation).to.equal("horizontal");
        const bar = el.shadowRoot.querySelector(".appbar");
        expect(bar.classList.contains("horizontal")).to.be.true;
    });

    it("is not collapsed by default", async () => {
        const el = await fixture(html`<y-appbar></y-appbar>`);
        expect(el.collapsed).to.be.false;
        const bar = el.shadowRoot.querySelector(".appbar");
        expect(bar.classList.contains("collapsed")).to.be.false;
    });

    it("applies collapsed class when collapsed attribute is set", async () => {
        const el = await fixture(html`<y-appbar collapsed></y-appbar>`);
        expect(el.collapsed).to.be.true;
        const bar = el.shadowRoot.querySelector(".appbar");
        expect(bar.classList.contains("collapsed")).to.be.true;
    });

    it("ignores collapsed in horizontal mode", async () => {
        const el = await fixture(
            html`<y-appbar orientation="horizontal" collapsed></y-appbar>`,
        );
        const bar = el.shadowRoot.querySelector(".appbar");
        expect(bar.classList.contains("collapsed")).to.be.false;
    });

    it("toggle() switches collapsed state", async () => {
        const el = await fixture(html`<y-appbar></y-appbar>`);
        expect(el.collapsed).to.be.false;
        el.toggle();
        expect(el.collapsed).to.be.true;
        el.toggle();
        expect(el.collapsed).to.be.false;
    });

    it("has role navigation", async () => {
        const el = await fixture(html`<y-appbar></y-appbar>`);
        const bar = el.shadowRoot.querySelector(".appbar");
        expect(bar.getAttribute("role")).to.equal("navigation");
    });

    it("renders header, default, and footer slots", async () => {
        const el = await fixture(html`
            <y-appbar>
                <div slot="header">Header</div>
                <div>Body Item</div>
                <div slot="footer">Footer</div>
            </y-appbar>
        `);
        const headerSlot = el.shadowRoot.querySelector('slot[name="header"]');
        const defaultSlot = el.shadowRoot.querySelector("slot:not([name])");
        const footerSlot = el.shadowRoot.querySelector('slot[name="footer"]');

        expect(headerSlot).to.not.be.null;
        expect(defaultSlot).to.not.be.null;
        expect(footerSlot).to.not.be.null;
    });

    it("header slot receives assigned nodes", async () => {
        const el = await fixture(html`
            <y-appbar>
                <span slot="header">Logo</span>
            </y-appbar>
        `);
        const headerSlot = el.shadowRoot.querySelector('slot[name="header"]');
        const assigned = headerSlot.assignedNodes({ flatten: true });
        expect(assigned.length).to.be.greaterThan(0);
        expect(assigned[0].textContent).to.equal("Logo");
    });

    it("footer slot receives assigned nodes", async () => {
        const el = await fixture(html`
            <y-appbar>
                <span slot="footer">User</span>
            </y-appbar>
        `);
        const footerSlot = el.shadowRoot.querySelector('slot[name="footer"]');
        const assigned = footerSlot.assignedNodes({ flatten: true });
        expect(assigned.length).to.be.greaterThan(0);
        expect(assigned[0].textContent).to.equal("User");
    });

    it("re-renders when orientation changes", async () => {
        const el = await fixture(html`<y-appbar></y-appbar>`);
        let bar = el.shadowRoot.querySelector(".appbar");
        expect(bar.classList.contains("vertical")).to.be.true;

        el.setAttribute("orientation", "horizontal");
        bar = el.shadowRoot.querySelector(".appbar");
        expect(bar.classList.contains("horizontal")).to.be.true;
    });

    it("re-renders when collapsed changes", async () => {
        const el = await fixture(html`<y-appbar></y-appbar>`);
        let bar = el.shadowRoot.querySelector(".appbar");
        expect(bar.classList.contains("collapsed")).to.be.false;

        el.setAttribute("collapsed", "");
        bar = el.shadowRoot.querySelector(".appbar");
        expect(bar.classList.contains("collapsed")).to.be.true;
    });

    it("has three structural sections", async () => {
        const el = await fixture(html`<y-appbar></y-appbar>`);
        const header = el.shadowRoot.querySelector(".appbar-header");
        const body = el.shadowRoot.querySelector(".appbar-body");
        const footer = el.shadowRoot.querySelector(".appbar-footer");

        expect(header).to.not.be.null;
        expect(body).to.not.be.null;
        expect(footer).to.not.be.null;
    });

    it("sets collapsed property via setter", async () => {
        const el = await fixture(html`<y-appbar></y-appbar>`);
        el.collapsed = true;
        expect(el.hasAttribute("collapsed")).to.be.true;
        el.collapsed = false;
        expect(el.hasAttribute("collapsed")).to.be.false;
    });

    it("sets orientation property via setter", async () => {
        const el = await fixture(html`<y-appbar></y-appbar>`);
        el.orientation = "horizontal";
        expect(el.getAttribute("orientation")).to.equal("horizontal");
    });
});
