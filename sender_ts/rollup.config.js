import commonJs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

export default {
    input: "src/index.ts",
    output: {
        file: "dist/bundle.js",
        format: "iife",
        exports: "auto",
        sourcemap: true,
        name: "CastSender",
        globals: {
            'chromecast-caf-sender': ['cast'],
        }
    },
    external: [
        'chromecast-caf-sender'
    ],
    plugins: [
        resolve(),
        commonJs({ extensions: [".js", ".ts"] }),
        typescript()
    ],
};