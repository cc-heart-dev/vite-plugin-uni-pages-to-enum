# vite-plugin-uni-pages-to-enum

vite-plugin-uni-pages-to-enum 是一个 Vite 插件，用于将 uni-app 项目中的 pages.json 路由配置文件转换为 TypeScript Enum，以便在代码中更安全地使用路由路径。

## 安装

使用 npm:

```bash
npm install @cc-heart/vite-plugin-uni-pages-to-enum --save-dev
```

## 使用

在 `vite.config.js` 中引入该插件：

```js
import { defineConfig } from 'vite';
import uniPagesToEnum from '@cc-heart/vite-plugin-uni-pages-to-enum';

export default defineConfig({
  plugins: [
    uniPagesToEnum({
      input: 'src/pages.json',
      output: 'src/pages-router.ts',
      isConstEnum: true,
      enumName: 'PAGES'
    }),
  ],
});
```

该插件会根据配置读取文件，并且生成相应的 `ts Enum` 文件,例如 `page.json` 包含：

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "type": "home",
      "style": {
        "navigationStyle": "custom"
      }
    },
    {
      "path": "pages/delivery/add-consignee",
      "type": "page",
      "style": {
        "navigationStyle": "custom"
      }
    }
  ]
}
```

则会生成以下的内容：

```ts
export const enum PAGES {
  PAGES_INDEX_INDEX = '/pages/index/index',
  PAGES_DELIVERY_ADD_CONSIGNEE = '/pages/delivery/add-consignee',
}
```

## 许可证

[MIT License](./LICENSE)

