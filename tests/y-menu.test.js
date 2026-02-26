import { fixture, html, expect } from "@open-wc/testing";
import "../src/components/y-menu.js";
import "../src/components/y-button.js";

describe("YumeMenu", () => {
    const testItems = [
        { text: "Dashboard", url: "/dashboard" },
        {
            text: "Settings",
            children: [
                { text: "Profile", url: "/settings/profile" },
                { text: "Security" },
            ],
        },
        { text: "Help" },
    ];

    it("renders menu items correctly", async () => {
        const el = await fixture(html`<y-menu .items=${testItems}></y-menu>`);

        const ul = el.shadowRoot.querySelector("ul.menu");
        expect(ul).to.exist;

        // Only count top-level menu items (ignore submenu children)
        const topItems = ul.querySelectorAll(":scope > li.menuitem");
        expect(topItems.length).to.equal(3);
    });

    it("toggles visibility when anchor is clicked", async () => {
        const wrapper = await fixture(html`
            <div>
                <y-button id="trigger">Menu</y-button>
                <y-menu id="menu" anchor="trigger" .items=${testItems}></y-menu>
            </div>
        `);

        const triggerBtn = wrapper
            .querySelector('y-button[id="trigger"]')
            .shadowRoot.querySelector("button");
        triggerBtn.click();
        // allow attributeChangedCallback to run
        await new Promise((r) => setTimeout(r, 0));

        const menu = wrapper.querySelector("#menu");
        expect(menu.hasAttribute("visible")).to.be.true;
    });

    it("renders submenu for items with children", async () => {
        const el = await fixture(html`<y-menu .items=${testItems}></y-menu>`);
        const items = el.shadowRoot.querySelectorAll("li.menuitem");
        const hasSubmenu = Array.from(items).some((item) =>
            item.querySelector("ul.submenu"),
        );

        expect(hasSubmenu).to.be.true;
    });

    it("displays correct submenu indicator for nested items", async () => {
        const el = await fixture(html`<y-menu .items=${testItems}></y-menu>`);
        const indicators = el.shadowRoot.querySelectorAll(".submenu-indicator");
        expect(indicators.length).to.equal(1);
        expect(indicators[0].textContent).to.equal("▶");
    });

    it("hides menu when visible is toggled off", async () => {
        const el = await fixture(
            html`<y-menu .items="\${testItems}"></y-menu>`,
        );
        // Mock an anchor element so positioning logic can set display
        el._anchorEl = el;

        // Show the menu by toggling visible property
        el.visible = true;
        await new Promise((r) => setTimeout(r, 0));
        expect(el.style.display).to.equal("block");

        // Now hide the menu
        el.visible = false;
        await new Promise((r) => setTimeout(r, 0));
        expect(el.style.display).to.equal("none");
    });

    it("defaults direction to 'down'", async () => {
        const el = await fixture(html`<y-menu .items=${testItems}></y-menu>`);
        expect(el.direction).to.equal("down");
    });

    it("accepts direction attribute 'right'", async () => {
        const el = await fixture(
            html`<y-menu direction="right" .items=${testItems}></y-menu>`,
        );
        expect(el.direction).to.equal("right");
    });

    it("sets direction via property setter", async () => {
        const el = await fixture(html`<y-menu .items=${testItems}></y-menu>`);
        el.direction = "right";
        expect(el.getAttribute("direction")).to.equal("right");
    });
});
