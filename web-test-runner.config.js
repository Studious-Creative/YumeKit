import { playwrightLauncher } from "@web/test-runner-playwright";

export default {
    nodeResolve: true,
    files: ["tests/**/*.test.js"],
    rootDir: ".",
    browserStartTimeout: 20000,
    browsers: [playwrightLauncher({ product: "chromium" })],
};
