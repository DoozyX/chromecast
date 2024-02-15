import commonJs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import terser from '@rollup/plugin-terser';

const getOutput = (fileName, plugins) => ({
    file: `dist/${fileName}`,
    format: "iife",
    exports: "auto",
    sourcemap: true,
    name: "CastReceiver",
    globals: {
        '../external/smart-web-player': 'SmartWebPlayer',
        'smart-web-player': 'SmartWebPlayer',
        'chromecast-caf-receiver': ['cast'],
        'chromecast-caf-receiver/cast.framework': ['cast.framework'],
        'chromecast-caf-receiver/cast.framework.messages': ['cast.framework.messages'],
        'chromecast-caf-receiver/cast.framework.events': ['cast.framework.events'],
        'chromecast-caf-receiver/cast.debug': ['cast.debug']
    },
    plugins: plugins
});
export default [{
    input: "src/index.ts",
    output: [getOutput('bundle.js'), getOutput('bundle.min.js', [terser()])],
    external: [
        '../external/smart-web-player',
        'smart-web-player',
        'chromecast-caf-receiver',
        'chromecast-caf-receiver/cast.framework',
        'chromecast-caf-receiver/cast.framework.messages',
        'chromecast-caf-receiver/cast.framework.events',
        'chromecast-caf-receiver/cast.debug'
    ],
    plugins: [
        resolve(),
        commonJs({ extensions: [".js", ".ts"] }),
        typescript()
    ],
}];