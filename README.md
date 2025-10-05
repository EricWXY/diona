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

- [x] 项目目录改造（按照进程和功能扁平化分区）

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

> 记得关注以下 tsconfig.app.json 中的 include 部分

## 修改 package.json 的 main 属性

```JSON
{
  "main": ".vite/build/index.js", // 主进程入口
}
```

改造完成 `npm run start` 正常运行

--------------------------------------------------------

# section_3

- [x] 自定义标题栏

## 安装依赖

```bash
npm i -D @iconify/vue@5.0.0 @iconify-json/material-symbols@1.2.29
```

### main 进程改造 WindowService

```typescript
/// main/service/WindowService.ts

import type { WindowNames } from '@common/types';

import { IPC_EVENTS } from '@common/constants';
import { BrowserWindow, BrowserWindowConstructorOptions, ipcMain, IpcMainInvokeEvent, type IpcMainEvent } from 'electron';
import { debounce } from '@common/utils';

import path from 'node:path';

interface SizeOptions {
  width: number; // 窗口宽度
  height: number; // 窗口高度
  maxWidth?: number; // 窗口最大宽度，可选
  maxHeight?: number; // 窗口最大高度，可选
  minWidth?: number; // 窗口最小宽度，可选
  minHeight?: number; // 窗口最小高度，可选
}

const SHARED_WINDOW_OPTIONS = {
  titleBarStyle: 'hidden',
  title: 'Diona',
  webPreferences: {
    nodeIntegration: false, // 禁用 Node.js 集成，提高安全性
    contextIsolation: true, // 启用上下文隔离，防止渲染进程访问主进程 API
    sandbox: true, // 启用沙箱模式，进一步增强安全性
    backgroundThrottling: false,
    preload: path.join(__dirname, 'preload.js'),
  },
} as BrowserWindowConstructorOptions;

class WindowService {
  private static _instance: WindowService;

  private constructor() {
    this._setupIpcEvents();
  }

  private _setupIpcEvents() {
    const handleCloseWindow = (e: IpcMainEvent) => {
      this.close(BrowserWindow.fromWebContents(e.sender));
    }
    const handleMinimizeWindow = (e: IpcMainEvent) => {
      BrowserWindow.fromWebContents(e.sender)?.minimize();
    }
    const handleMaximizeWindow = (e: IpcMainEvent) => {
      this.toggleMax(BrowserWindow.fromWebContents(e.sender));
    }
    const handleIsWindowMaximized = (e: IpcMainInvokeEvent) => {
      return BrowserWindow.fromWebContents(e.sender)?.isMaximized() ?? false;
    }

    ipcMain.on(IPC_EVENTS.CLOSE_WINDOW, handleCloseWindow);
    ipcMain.on(IPC_EVENTS.MINIMIZE_WINDOW, handleMinimizeWindow);
    ipcMain.on(IPC_EVENTS.MAXIMIZE_WINDOW, handleMaximizeWindow);
    ipcMain.handle(IPC_EVENTS.IS_WINDOW_MAXIMIZED, handleIsWindowMaximized);
  }

  public static getInstance(): WindowService {
    if (!this._instance) {
      this._instance = new WindowService();
    }
    return this._instance;
  }

  public create(name: WindowNames, size: SizeOptions) {
    const window = new BrowserWindow({
      ...SHARED_WINDOW_OPTIONS,
      ...size,
    })

    this
      ._setupWinLifecycle(window, name)
      ._loadWindowTemplate(window, name)

    return window;
  }
  private _setupWinLifecycle(window: BrowserWindow, _name: WindowNames) {
    const updateWinStatus = debounce(() => !window?.isDestroyed()
      && window?.webContents?.send(IPC_EVENTS.MAXIMIZE_WINDOW + 'back', window?.isMaximized()), 80);
    window.once('closed', () => {
      window?.destroy();
      window?.removeListener('resize', updateWinStatus);
    });
    window.on('resize', updateWinStatus)
    return this;
  }

  private _loadWindowTemplate(window: BrowserWindow, name: WindowNames) {
    // 检查是否存在开发服务器 URL，若存在则表示处于开发环境
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      return window.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}${'/html/' + (name === 'main' ? '' : name)}`);
    }
    window.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/html/${name === 'main' ? 'index' : name}.html`));
  }

  public close(target: BrowserWindow | void | null) {
    if (!target) return;
    target?.close();
  }

  public toggleMax(target: BrowserWindow | void | null) {
    if (!target) return;
    target.isMaximized() ? target.unmaximize() : target.maximize();
  }

}

export const windowManager = WindowService.getInstance();

export default windowManager;
```

写好 窗口管理 之后 可以替换之前的 窗口创建 代码

```typescript
/// main/index.ts

import { app, BrowserWindow } from 'electron';
import started from 'electron-squirrel-startup';
import { setupWindows } from './wins';
import windowManager from './service/WindowService';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  setupWindows();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      setupWindows();
    }
  });
});
```

### renderer 进程

首先需要 定义 `gloal.d.ts`

```typescript

interface WindowApi {
  closeWindow: () => void;
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  onWindowMaximized: (callback: (isMaximized: boolean) => void) => void;
  isWindowMaximized: () => Promise<boolean>;
}

declare interface Window {
  api: WindowApi;
}

```

然会后 在 `preload.ts` 中 实现 这些 方法

这里注意 ipc 的两种 通信方式 `send & on` `invoke & handle`

```typescript
import { contextBridge, ipcRenderer } from 'electron';
import { IPC_EVENTS } from '@common/constants';

const api: WindowApi = {
  closeWindow: () => ipcRenderer.send(IPC_EVENTS.CLOSE_WINDOW),
  minimizeWindow: () => ipcRenderer.send(IPC_EVENTS.MINIMIZE_WINDOW),
  maximizeWindow: () => ipcRenderer.send(IPC_EVENTS.MAXIMIZE_WINDOW),
  onWindowMaximized: (callback: (isMaximized: boolean) => void) => ipcRenderer.on(IPC_EVENTS.MAXIMIZE_WINDOW + 'back', (_, isMaximized) => callback(isMaximized)),
  isWindowMaximized: () => ipcRenderer.invoke(IPC_EVENTS.IS_WINDOW_MAXIMIZED),
}

contextBridge.exposeInMainWorld('api', api);
```

定义了 预加载脚本 就可以在 renderer 进程 中 调用 这些 方法

### 创建自定义的标题栏组件

```typescript
/// renderer/hooks/useWinManager.ts
export function useWinManager() {
  const isMaximized = ref(false)

  function closeWindow() {
    window.api.closeWindow();
  }

  function minimizeWindow() {
    window.api.minimizeWindow();
  }

  function maximizeWindow() {
    window.api.maximizeWindow();
  }

  onMounted(async () => {
    await nextTick();
    isMaximized.value = await window.api.isWindowMaximized();
    window.api.onWindowMaximized((_isMaximized: boolean) => isMaximized.value = _isMaximized);
  })

  return {
    isMaximized,
    closeWindow,
    minimizeWindow,
    maximizeWindow
  }
};
export default useWinManager;
```

/// renderer/components/TitleBar.vue
```vue
<script setup lang="ts">
import { Icon as IconifyIcon } from '@iconify/vue';
import { useWinManager } from '@renderer/hooks/useWinManager';

interface TitleBarProps {
  title?: string;
  isMaximizable?: boolean;
  isMinimizable?: boolean;
  isClosable?: boolean;
}
defineOptions({ name: 'TitleBar' })
withDefaults(defineProps<TitleBarProps>(), {
  isMaximizable: true,
  isMinimizable: true,
  isClosable: true,
})
const emit = defineEmits(['close']);
const btnSize = 15;

const {
  isMaximized,
  closeWindow,
  minimizeWindow,
  maximizeWindow
} = useWinManager();

function handleClose() {
  emit('close');
  closeWindow();
}
</script>
<template>
  <header class="title-bar flex items-start justify-between h-[30px]">
    <div class="title-bar-main flex-auto">
      <slot>{{ title ?? '' }}</slot>
    </div>
    <div class="title-bar-controls w-[80px] flex items-center justify-end">
      <button v-show="isMinimizable" class="title-bar-button cursor-pointer hover:bg-input" @click="minimizeWindow">
        <iconify-icon icon="material-symbols:chrome-minimize-sharp" :width="btnSize" :height="btnSize" />
      </button>
      <button v-show="isMaximizable" class="title-bar-button cursor-pointer hover:bg-input" @click="maximizeWindow">
        <iconify-icon icon="material-symbols:chrome-maximize-outline-sharp" :width="btnSize" :height="btnSize"
          v-show="!isMaximized" />
        <iconify-icon icon="material-symbols:chrome-restore-outline-sharp" :width="btnSize" :height="btnSize"
          v-show="isMaximized" />
      </button>
      <button v-show="isClosable" class="close-button title-bar-button cursor-pointer hover:bg-red-300 "
        @click="handleClose">
        <iconify-icon icon="material-symbols:close" :width="btnSize" :height="btnSize"></iconify-icon>
      </button>
    </div>
  </header>
</template>

<style scoped>
.title-bar-button {
  padding: 2px;
  border-radius: 50%;
  margin: .2rem;
}
</style>
```
有了这个组件之后就可以在 `App.vue` 中 引入它了，三个功能按钮就都可以用了。但是没有 标题栏的拖动

可以利用 css 属性去实现 标题栏的拖动

```css
.drag-region {
  -webkit-app-region: drag;
}
```


--------------------------------------------------------

# section_4

- [x] 日志/异常 管理

## 安装依赖

```bash
npm i electron-log@5.4.3
```

> 先修改 package.json  中的项目名

## 开发 LogService (对electron-log 进行封装)

```typescript
// LogService.ts
import { IPC_EVENTS } from '@common/constants';
import { promisify } from 'util';
import { app, ipcMain } from 'electron';
import log from 'electron-log';
import * as path from 'path';
import * as fs from 'fs';

// 转换为Promise形式的fs方法
const readdirAsync = promisify(fs.readdir);
const statAsync = promisify(fs.stat);
const unlinkAsync = promisify(fs.unlink);

class LogService {
  private static _instance: LogService;

  // 日志保留天数，默认7天
  private LOG_RETENTION_DAYS = 7;

  // 清理间隔，默认24小时（毫秒）
  private readonly CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000;

  private constructor() {
    const logPath = path.join(app.getPath('userData'), 'logs');
    // c:users/{username}/AppData/Roaming/{appName}/logs

    // 创建日志目录
    try {
      if (!fs.existsSync(logPath)) {
        fs.mkdirSync(logPath, { recursive: true });
      }
    } catch (err) {
      this.error('Failed to create log directory:', err);
    }

    // 配置electron-log
    log.transports.file.resolvePathFn = () => {
      // 使用当前日期作为日志文件名，格式为 YYYY-MM-DD.log
      const today = new Date();
      const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      return path.join(logPath, `${formattedDate}.log`);
    };

    // 配置日志格式
    log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';

    // 配置日志文件大小限制，默认10MB
    log.transports.file.maxSize = 10 * 1024 * 1024; // 10MB

    // 配置控制台日志级别，开发环境可以设置为debug，生产环境可以设置为info
    log.transports.console.level = process.env.NODE_ENV === 'development' ? 'debug' : 'info';

    // 配置文件日志级别
    log.transports.file.level = 'debug';

    // 设置IPC事件
    this._setupIpcEvents();
    // 重写console方法
    this._rewriteConsole();


    this.info('LogService initialized successfully.');
    this._cleanupOldLogs();
    // 定时清理旧日志
    setInterval(() => this._cleanupOldLogs(), this.CLEANUP_INTERVAL_MS);
  }

  private _setupIpcEvents() {
    ipcMain.on(IPC_EVENTS.LOG_DEBUG, (_e, message: string, ...meta: any[]) => this.debug(message, ...meta));
    ipcMain.on(IPC_EVENTS.LOG_INFO, (_e, message: string, ...meta: any[]) => this.info(message, ...meta));
    ipcMain.on(IPC_EVENTS.LOG_WARN, (_e, message: string, ...meta: any[]) => this.warn(message, ...meta));
    ipcMain.on(IPC_EVENTS.LOG_ERROR, (_e, message: string, ...meta: any[]) => this.error(message, ...meta));
  }

  private _rewriteConsole() {
    console.debug = log.debug;
    console.log = log.info;
    console.info = log.info;
    console.warn = log.warn;
    console.error = log.error;
  }

  private async _cleanupOldLogs() {
    try {
      const logPath = path.join(app.getPath('userData'), 'logs');

      if (!fs.existsSync(logPath)) return;

      const now = new Date();
      const expirationDate = new Date(now.getTime() - this.LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000);

      const files = await readdirAsync(logPath);

      let deletedCount = 0;

      for (const file of files) {
        if (!file.endsWith('.log')) continue;
        const filePath = path.join(logPath, file);
        try {
          const stats = await statAsync(filePath);
          if (stats.isFile() && (stats.birthtime < expirationDate)) {
            await unlinkAsync(filePath);
            deletedCount++;
          }
        } catch (error) {
          this.error(`Failed to delete old log file ${filePath}:`, error);
        }
      }
      if (deletedCount > 0) {
        this.info(`Successfully cleaned up ${deletedCount} old log files.`);
      }

    } catch (err) {
      this.error('Failed to cleanup old logs:', err);
    }
  }

  public static getInstance(): LogService {
    if (!this._instance) {
      this._instance = new LogService();
    }
    return this._instance;
  }

  /**
   * 记录调试信息
   * @param {string} message - 日志消息
   * @param {any[]} meta - 附加的元数据
   */
  public debug(message: string, ...meta: any[]): void {
    log.debug(message, ...meta);
  }

  /**
   * 记录一般信息
   * @param {string} message - 日志消息
   * @param {any[]} meta - 附加的元数据
   */
  public info(message: string, ...meta: any[]): void {
    log.info(message, ...meta);
  }

  /**
   * 记录警告信息
   * @param {string} message - 日志消息
   * @param {any[]} meta - 附加的元数据
   */
  public warn(message: string, ...meta: any[]): void {
    log.warn(message, ...meta);
  }

  /**
   * 记录错误信息
   * @param {string} message - 日志消息
   * @param {any[]} meta - 附加的元数据，通常是错误对象
   */
  public error(message: string, ...meta: any[]): void {
    log.error(message, ...meta);
  }

}

export const logManager = LogService.getInstance();
export default logManager;

```

## 错误捕获

- main

```typescript
process.on('uncaughtException', (err) => {
  logManager.error('uncaughtException', err);
});

process.on('unhandledRejection', (reason, promise) => {
  logManager.error('unhandledRejection', reason, promise);
});
```

- renderer

```typescript
// app 是 Vue 实例
app.config.errorHandler = (err, instance, info) => {
  logger.error('Vue error:', err, instance, info);
};

window.onerror = (message, source, lineno, colno, error) => {
  logger.error('Window error:', message, source, lineno, colno, error);
};

window.onunhandledrejection = (event) => {
  logger.error('Unhandled Promise Rejection:', event);
};
```

--------------------------------------------------------

# section_5

- [x] css 主题
- [x] 首页布局

## css 变量

```css
/* dark.css */
@media (prefers-color-scheme: dark) {
  :root {
    --primary-color: #07C160;
    --bg-color: #1E1E1E;
    --bg-secondary: #2C2C2C;

    --text-primary: #E0E0E0;
    --text-secondary: #A0A0A0;

    --bubble-self: var(--primary-color);
    --bubble-others: #3A3A3A;
    --input-bg: #333333;
    --ripple-color: var(--text-secondary);
    --ripple-opacity: 0.2;
  }
}

```

```css
/* light.css */
@media (prefers-color-scheme: light) {
  :root {
    --primary-color: #07C160;
    --bg-color: #FFFFFF;
    --bg-secondary: #F5F5F5;
    --text-primary: #000000;
    --text-secondary: #7F7F7F;

    --header-bg: var(--primary-color);
    --bubble-self: var(--primary-color);
    --bubble-others: #FFFFFF;
    --input-bg: #F0F0F0;
    --ripple-color: var(--text-secondary);
    --ripple-opacity: 0.2;
  }
}

```

```css
/* theme/index.css */
@import './dark.css';
@import './light.css';

@theme {
  --color-primary: var(--primary-color);
  --color-primary-light: var(--primary-color-light);
  --color-primary-dark: var(--primary-color-dark);
  --color-primary-hover: var(--primary-color-hover);
  --color-primary-active: var(--primary-color-active);
  --color-primary-subtle: var(--primary-color-subtle);
  --color-main: var(--bg-color);
  --color-secondary: var(--bg-secondary);
  --color-input: var(--input-bg);
  --color-bubble-self: var(--bubble-self);
  --color-bubble-others: var(--bubble-others);
  --color-tx-primary: var(--text-primary);
  --color-tx-secondary: var(--text-secondary);
}
```

--------------------------------------------------------

# section_6

- [ ] ThemeService
- [ ] 主题切换

## ThemeService

```typescript
// main/services/ThemeService.ts
import { BrowserWindow, ipcMain, nativeTheme } from 'electron';
import { logManager } from './LogService';
import { IPC_EVENTS } from '@common/constants'

class ThemeService {
  private static _instance: ThemeService;
  private _isDark: boolean = nativeTheme.shouldUseDarkColors;

  constructor() {
    const themeMode = 'dark';
    if (themeMode) {
      nativeTheme.themeSource = themeMode;
      this._isDark = nativeTheme.shouldUseDarkColors;
    }
    this._setupIpcEvent();
    logManager.info('ThemeService initialized successfully.');
  }

  private _setupIpcEvent() {
    ipcMain.handle(IPC_EVENTS.SET_THEME_MODE, (_e, mode: ThemeMode) => {
      nativeTheme.themeSource = mode;
      return nativeTheme.shouldUseDarkColors;
    });
    ipcMain.handle(IPC_EVENTS.GET_THEME_MODE, () => {
      return nativeTheme.themeSource;
    });
    ipcMain.handle(IPC_EVENTS.IS_DARK_THEME, () => {
      return nativeTheme.shouldUseDarkColors;
    });
    nativeTheme.on('updated', () => {
      this._isDark = nativeTheme.shouldUseDarkColors;
      BrowserWindow.getAllWindows().forEach(win =>
        win.webContents.send(IPC_EVENTS.THEME_MODE_UPDATED, this._isDark)
      );
    });
  }
  public static getInstance() {
    if (!this._instance) {
      this._instance = new ThemeService();
    }
    return this._instance;
  }

  public get isDark() {
    return this._isDark;
  }

  public get themeMode() {
    return nativeTheme.themeSource;
  }
}

export const themeManager = ThemeService.getInstance();
export default themeManager;
```

> themeManager 一定记得要在 main 进程中初始化，否则 ThemeService 不会在系统中实例化

## 主题切换

- 先在 预加载脚本中定义好 api
- 写一个通用的 hook

```typescript
// renderer/hooks/useThemeMode.ts
const iconMap = new Map([
  ['system', 'material-symbols:auto-awesome-outline'],
  ['light', 'material-symbols:light-mode-outline'],
  ['dark', 'material-symbols:dark-mode-outline'],
])
export function useThemeMode() {
  const themeMode = ref<ThemeMode>('dark');
  const isDark = ref<boolean>(false);
  const themeIcon = computed(() => iconMap.get(themeMode.value) || 'material-symbols:auto-awesome-outline');

  const themeChangeCallbacks: Array<(mode: ThemeMode) => void> = [];

  function setThemeMode(mode: ThemeMode) {
    themeMode.value = mode;
    window.api.setThemeMode(mode);
  }
  function getThemeMode() {
    return themeMode.value;
  }

  function onThemeChange(callback: (mode: ThemeMode) => void) {
    themeChangeCallbacks.push(callback);
  }

  onMounted(async () => {
    window.api.onSystemThemeChange((_isDark) => window.api.getThemeMode().then(res => {
      isDark.value = _isDark;
      if (res !== themeMode.value) themeMode.value = res;
      themeChangeCallbacks.forEach(cb => cb(res));
    }));
    isDark.value = await window.api.isDarkTheme();
    themeMode.value = await window.api.getThemeMode();
  });

  return {
    themeMode,
    themeIcon,
    isDark,
    setThemeMode,
    getThemeMode,
    onThemeChange,
  }
}

export default useThemeMode;
```

- 然后在组件中使用

```vue
<script setup lang="ts">
import { useThemeMode } from '@renderer/hooks/useThemeMode';
import { Icon as IconifyIcon } from '@iconify/vue';

defineOptions({ name: 'ThemeSwitcher' });

const {
  themeIcon,
  setThemeMode,
} = useThemeMode();
const isDarkMode = usePreferredDark();

function toggleThemeMode() {
  setThemeMode(isDarkMode.value ? 'light' : 'dark');
}
</script>

<template>
  <iconify-icon :icon="themeIcon" width="24" height="24" @click="toggleThemeMode" />
</template>
```
