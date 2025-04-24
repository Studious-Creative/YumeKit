import { fixture, html, expect, oneEvent } from "@open-wc/testing";
import "../src/components/y-radio.js";

describe("<y-radio>", () => {
    const options = [
        { value: "apple", label: "Apple" },
        { value: "banana", label: "Banana" },
        { value: "cherry", label: "Cherry" },
    ];

    it("renders all radio options from the 'options' attribute", async () => {
        const el = await fixture(
            html`<y-radio .options=${options} name="fruits"></y-radio>`
        );

        const inputs = el.shadowRoot.querySelectorAll('input[type="radio"]');
        expect(inputs.length).to.equal(3);

        inputs.forEach((input, index) => {
            expect(input.value).to.equal(options[index].value);
        });
    });

    it("selects a radio option when clicked", async () => {
        const el = await fixture(
            html`<y-radio .options=${options} name="fruits"></y-radio>`
        );

        const input = el.shadowRoot.querySelectorAll("input")[1];
        input.click();

        expect(el.value).to.equal("banana");
        expect(input.checked).to.be.true;
    });

    it("reflects initial 'value' attribute as checked", async () => {
        const el = await fixture(
            html`<y-radio
                .options=${options}
                name="fruits"
                value="cherry"
            ></y-radio>`
        );

        const input = el.shadowRoot.querySelector('input[value="cherry"]');
        expect(input.checked).to.be.true;
        expect(el.value).to.equal("cherry");
    });

    it("emits a 'change' event with new value", async () => {
        const el = await fixture(
            html`<y-radio .options=${options} name="fruits"></y-radio>`
        );

        const input = el.shadowRoot.querySelectorAll("input")[2];
        setTimeout(() => input.click());

        const event = await oneEvent(el, "change");
        expect(event.detail.value).to.equal("cherry");
    });

    it("participates in forms", async () => {
        const el = await fixture(html`
            <form>
                <y-radio
                    name="fruit"
                    value="banana"
                    .options=${[
                        { value: "apple", label: "Apple" },
                        { value: "banana", label: "Banana" },
                    ]}
                ></y-radio>
            </form>
        `);

        const form = el;

        // Simulate a form submission
        const formData = new FormData(form);
        expect(formData.get("fruit")).to.equal("banana");
    });

    it("updates the selected value when the 'value' attribute is changed", async () => {
        const el = await fixture(
            html`<y-radio .options=${options} name="fruits"></y-radio>`
        );

        el.setAttribute("value", "apple");
        await el.updateComplete;

        expect(el.value).to.equal("apple");

        const input = el.shadowRoot.querySelector('input[value="apple"]');
        expect(input.checked).to.be.true;
    });
});
