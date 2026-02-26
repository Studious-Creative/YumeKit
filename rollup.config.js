import { readdirSync, mkdirSync, copyFileSync, existsSync } from "fs";
import { join } from "path";
import terser from "@rollup/plugin-terser";

const componentDir = "src/components";
const componentFiles = readdirSync(componentDir).filter((f) =>
    f.endsWith(".js"),
);

// Copy non-JS assets (styles/, modules/) into dist/
function copyAssets() {
    return {
        name: "copy-assets",
        writeBundle() {
            // styles/
            const stylesOut = "dist/styles";
            if (!existsSync(stylesOut))
                mkdirSync(stylesOut, { recursive: true });
            for (const f of readdirSync("styles")) {
                copyFileSync(join("styles", f), join(stylesOut, f));
            }
            // modules/
            const modulesOut = "dist/modules";
            if (!existsSync(modulesOut))
                mkdirSync(modulesOut, { recursive: true });
            for (const f of readdirSync("src/modules")) {
                copyFileSync(join("src/modules", f), join(modulesOut, f));
            }
        },
    };
}

export default [
    // 1. ESM bundle (tree-shakeable)
    {
        input: "src/index.js",
        output: {
            file: "dist/index.js",
            format: "esm",
        },
        plugins: [copyAssets()],
    },

    // 2. IIFE bundle (CDN / <script> tag)
    {
        input: "src/index.js",
        output: {
            file: "dist/yumekit.min.js",
            format: "iife",
            name: "YumeKit",
        },
        plugins: [terser()],
    },

    // 3. Individual components
    ...componentFiles.map((file) => ({
        input: `${componentDir}/${file}`,
        output: {
            file: `dist/components/${file}`,
            format: "esm",
        },
    })),
];
