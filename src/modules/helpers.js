// helpers/slot-utils.js
export function hideEmptySlotContainers(shadowRoot, slotsConfig = {}) {
    Object.entries(slotsConfig).forEach(([slotName, containerSelector]) => {
        const slot = shadowRoot.querySelector(
            `slot${slotName ? `[name="${slotName}"]` : ":not([name])"}`
        );
        const container = shadowRoot.querySelector(containerSelector);

        if (slot && container) {
            const assigned = slot
                .assignedNodes({ flatten: true })
                .filter((n) => {
                    return !(
                        n.nodeType === Node.TEXT_NODE &&
                        n.textContent.trim() === ""
                    );
                });

            container.style.display = assigned.length > 0 ? "" : "none";
        }
    });
}
