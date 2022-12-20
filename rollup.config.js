import { defineConfig } from "rollup";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import external from "rollup-plugin-node-externals";

export default defineConfig({
    input: "src/index.ts",
    output: {
        dir: "dist",
    },
    plugins: [
        nodeResolve({
            extensions: [".ts", ".tsx", ".js"],
        }),
        typescript(),
        commonjs(),
        external({
            exclude: ["react-head"],
        }),
    ],
});
