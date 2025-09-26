Electron 开发的 AI 聊天软件 （教学版）

----------------------------------

# section_1

- [x] 快速介绍 Electron
- [x] 项目初始化

## Electron 快速介绍

- 是什么？
  - Electron 是一个基于 Chromium 和 Node.js 的框架，用于创建跨平台的桌面应用程序。
  - 它允许开发人员使用 web 技术（HTML、CSS、JavaScript）构建应用程序的前端界面，同时利用 Node.js 提供的后端功能。
  - Electron 应用程序可以在 Windows、macOS 和 Linux 等操作系统上运行。

- 优势
  - 跨平台：Electron 应用程序可以在多个操作系统上运行，无需为每个操作系统编写不同的代码。
  - 开发效率高：开发人员可以使用熟悉的 web 技术（HTML、CSS、JavaScript）来构建应用程序的前端界面，同时利用 Node.js 提供的后端功能。
  - 丰富的生态系统：Electron 拥有一个活跃的开发社区，提供了许多插件、库和工具，用于开发和部署 Electron 应用程序。

- 常见案例
  - Visual Studio Code：一个基于 Electron 的代码编辑器，提供了丰富的开发工具和插件。
  - Postman：一个用于测试和开发 API 的桌面应用程序，使用 Electron 构建。
  - Obsidian：一个用于笔记-taking 的桌面应用程序，使用 Electron 构建。
  - Discord：一个用于语音和文本沟通的桌面应用程序，使用 Electron 构建。
  - GitHub Desktop：一个用于管理 GitHub 仓库的桌面应用程序，使用 Electron 构建。

- 核心概念（看图）

![](https://cdn.jsdelivr.net/gh/EricWXY/PictureBed_0@master/202509241427239.png)

## 项目初始化

### 常见的方式

1 . 从头开始手动搭建

- `main.js` (主进程)

```javascript
const { app, BrowserWindow } = require('electron');
let mainWindow;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
  });
  mainWindow.loadFile('index.html');
});
```

- `index.html` (渲染进程)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <h1>Hello Electron</h1>
</body>
</html>
```
添加 npm script `start`
```JSON
{
  "name": "my-app",
  "version": "1.0.0",
  "description": "My Electron App",
  "main": "main.js",
  "scripts": {
    "start": "electron ." 
  },
  "author": "Your Name",
  "license": "MIT"
}
```


2. 使用 Electron Forge 初始化项目

```bash
npx create-electron-app@latest my-app
# or
npm init electron-app@latest my-app
```
可以选择 官方模板 `webpack` 、`webpack-typescript`、`vite`、`vite-typescript`


3. 本次项目使用的方式(考虑到 Electron 版本迭代还是很快的)

```bash
# 需要全局安装 degit
npm install -g degit
# 安装完之后
degit EricWXY/electron-ts-vue-starter my-app # 项目名称自定义
# 进入项目目录
cd my-app
# 安装依赖
npm install
```

--------------------------------------------------------

# section_2

- [ ] 项目目录改造（按照进程和功能扁平化分区）

## 安装依赖

```bash
npm i naive-ui@2.42.0 vfonts@0.0.3 pinia@3.0.3 vue-router@4.5.1 vue-i18n@11.1.9
npm i -D unplugin-auto-import@20.1.0
```

## 目录改造

> 先跑一遍 `npm run start` 看一下效果

开始改造

<!-- - forge.config.ts
- 目录重命名
- renderer 多入口改造 -->

## 创建目录
```bash
# 目录结构
.
├── common # 公共模块
├── html # 页面入口
├── locales # 国际化
├── main # 主进程
│   ├── index.ts
├── renderer # 渲染进程
│   ├── index.ts
│   ├── App.vue
├── preload.ts # 预加载脚本
```
创建 `html/index.html` 作为主窗口的入口

```html
<!DOCTYPE html>
<html>

<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="script-src 'self';">
</head>

<body>
  <div id="app"></div>
  <script type="module" src="../renderer/index.ts"></script>
  <!-- 对应 渲染进程相关的入口 -->
</body>

</html>

```
同样的内容 复制两份分别粘贴同目录的 `dialog.html` 和 `setting.html`


## 改造 vite.renderer.config.ts

```typescript
// ... import

export default defineConfig({
  // ...其他配置
  plugins:[
    // ... 默认部分，
    autoImport({ // 优化开发体验
        imports: ['vue', 'vue-router', 'pinia', 'vue-i18n', '@vueuse/core'],
        dts: 'renderer/auto-imports.d.ts'
    })
  ],
  css: {
    transformer: 'lightningcss' as CSSOptions['transformer'],
  },
  build: {
    target: 'es2022',
    publicDir: 'public',
    rollupOptions: { // 多入口配置(对应多个窗口)
      input: [
        resolve(__dirname, 'html/index.html'),
        resolve(__dirname, 'html/dialog.html'),
        resolve(__dirname, 'html/setting.html'),
      ]
    }
  },
  resolve: {
    alias: {
      '@common': resolve(__dirname, 'common'),
      '@main': resolve(__dirname, 'main'),
      '@renderer': resolve(__dirname, 'renderer'),
      '@locales': resolve(__dirname, 'locales'),
    }
  }
})
```

## 改造 forge.config.ts

```typescript
// ... import

export default defineConfig({
  // ...其他配置
  plugins: [
    // ... 默认部分，
    {
      name: '@electron-forge/plugin-vite',
      config: {
        build: [
          {
            entry: 'main/index.ts', // 主进程入口
            config: 'vite.main.config.ts',
            target: 'main',
          },
          {
            entry: 'preload.ts',// 预加载脚本入口
            config: 'vite.preload.config.ts',
            target: 'preload',
          },
        ],
        renderer: [ // 这里不用做修改
          {
            name:'main_window',
            config: 'vite.renderer.config.ts',
          }
        ]
      }
    }
  ],
});
```

## 改造 main/index.ts

```typescript

// ... 其他部分
if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
  mainWindow.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}${'/html/'}`);
} else {
  mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/html/index.html`));
}


```

## 修改 package.json 的 main 属性

```JSON
{
  "main": ".vite/build/index.js", // 主进程入口
}
```

改造完成 `npm run start` 正常运行
