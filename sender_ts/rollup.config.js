import commonJs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import terser from '@rollup/plugin-terser';

const getOutput = (fileName, plugins) => ({
    file: `dist/${fileName}`,
    format: "iife",
    exports: "auto",
    sourcemap: true,
    name: "CastSender",
    globals: {
        'chromecast-caf-sender': ['cast'],
    },
    plugins: plugins
});

export default [{
    input: "src/index.ts",
    output: [getOutput('bundle.js'), getOutput('bundle.min.js', [terser()])],
    external: [
        'chromecast-caf-sender',
    ],
    plugins: [
        resolve(),
        commonJs({ extensions: [".js", ".ts"] }),
        typescript()
    ],
}];