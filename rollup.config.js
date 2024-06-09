import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { readFile } from "fs/promises";
import { resolve as _resolve } from "path";
let tsConfig = await readFile(
  _resolve(process.cwd(), "tsconfig.json"),
  "utf-8",
);
tsConfig = JSON.parse(tsConfig);
console.log(tsConfig);
export default {
  input: "./lib/index.ts",
  output: [
    {
      file: "dist/index.js",
      format: "esm",
    },
    {
      file: "dist/index.cjs",
      format: "cjs",
    }
  ],
  plugins: [resolve(), commonjs(), typescript(tsConfig)],
};
