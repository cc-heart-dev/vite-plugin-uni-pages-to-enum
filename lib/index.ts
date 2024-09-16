import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import JSON5 from "json5";
import { defineOnceFn, noop, pipe } from "@cc-heart/utils";

interface EnumField {
  field: string;
  path: string;
  comment?: string;
}

type Pages = Array<{ path: string; style: Record<string, unknown> }>;
type SubPackages = Array<{ root: string; pages: Pages }>;

interface VitePluginUniPagesToEnumParams {
  input: string;
  output: string;
  isConstEnum?: boolean;
  enumName?: string;
  onFinished?: () => void;
}
function resolvePath(path: string) {
  return resolve(process.cwd(), path);
}

async function readPagesJson(config: VitePluginUniPagesToEnumParams) {
  const pagesJSON = await readFile(resolvePath(config.input), "utf-8");
  return [JSON5.parse(pagesJSON), config];
}

function formatPathToEnum(path: string) {
  return path
    .split("/")
    .map((target) => {
      return target
        .split("-")
        .map((item) => item.replace(/\[/g, "").replace(/]/, "").toUpperCase())
        .join("_");
    })
    .join("_");
}

async function compileEnumType([pagesJson, config]: [
  Record<string, unknown>,
  VitePluginUniPagesToEnumParams,
]): Promise<[EnumField[] | null, VitePluginUniPagesToEnumParams]> {
  let pages = (pagesJson.pages as Pages) || [];

  pages = pages.concat(
    ...(pagesJson.subPackages as SubPackages).map((target) => {
      return target.pages.map((page) => {
        return {
          ...page,
          path: `${target.root}/${page.path.replace(/\./g, "_")}`,
        };
      });
    }),
  );
  pages = pages.flat();

  if (Array.isArray(pages)) {
    return [
      pages.map((target: { path: string; style: Record<string, unknown> }) => {
        const { path, style } = target;
        const field = formatPathToEnum(path);
        return {
          field,
          path: `/${path}`,
          comment: style?.navigationBarTitleText as string,
        };
      }),
      config,
    ];
  }
  return [null, config];
}

function generatorEnum([enumTypeList, config]: [
  EnumField[] | null,
  VitePluginUniPagesToEnumParams,
]) {
  const enumName = config.enumName || "PAGES";
  const enumKeywords = config.isConstEnum ? "enum " : "";
  const assignKeywords = config.isConstEnum ? "" : "=";
  let str = `export const ${enumKeywords}${enumName} ${assignKeywords} {\n`;

  const attributeAssignKeywords = config.isConstEnum? " =" : ":";

  (enumTypeList || []).forEach((target) => {
    str += "\t" + target.field + attributeAssignKeywords + ` '${target.path}'` + ",";
    if (target.comment) {
      str += "\t" + "//" + target.comment;
    }
    str += "\n";
  });
  str += "}";
  return [str, config];
}

async function writePages([str, config]: [
  string,
  VitePluginUniPagesToEnumParams,
]) {
  const path = resolvePath(config.output);
  return writeFile(path, str, "utf-8");
}

function bootstrap(pluginParams: VitePluginUniPagesToEnumParams) {
  const { onFinished = noop, ...restParams } = pluginParams;

  const taskFn = pipe(
    readPagesJson,
    compileEnumType,
    generatorEnum,
    writePages,
    onFinished,
  );
  taskFn(restParams);
}

const buildStartBootstrap = defineOnceFn(bootstrap);

export default function (pluginParams: VitePluginUniPagesToEnumParams) {
  return {
    name: "vite-plugin-uni-pages-to-enum",
    buildStart() {
      buildStartBootstrap(pluginParams);
    },
    watchChange(id: string) {
      if (id.includes(pluginParams.input)) {
        bootstrap(pluginParams);
      }
    },
  };
}
