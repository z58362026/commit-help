# commit-helper

commit-helper 是一个 VS Code 插件，帮助开发者高效对接禅道需求和 Bug，支持一键获取、可视化展示、复制、自动补全和自动提交等功能，极大提升团队协作和开发效率。

## 功能介绍

-   **禅道需求和 Bug 可视化列表**  
    支持二级列表展示项目需求和 Bug，便于快速区分和操作。
-   **一键复制编号和描述**  
    选中需求或 Bug 可直接复制到剪切板。
-   **自动补全到终端**  
    在终端输入时自动补全需求或 Bug 信息。
-   **全自动/半自动 commit 提交**  
    可一键生成并提交 git commit，也可手动复制信息到 commit。
-   **多种触发方式**  
    支持快捷键、按钮、git commit 文件自动弹窗等多种方式打开可视化列表。
-   **禅道账号登录与 token 长效缓存**  
    首次登录后自动保存 token 到工作区，无需重复输入账号密码。

## 使用说明

-   **快捷键触发**  
    默认快捷键：`Cmd+Alt+C`（Mac）或 `Ctrl+Alt+C`（Win/Linux），可在设置中自定义。
-   **按钮触发**  
    右下角状态栏有“Show ZenTao List”按钮，点击即可打开可视化列表。
-   **git commit 触发**  
    编辑 git commit message 时自动弹出需求和 Bug 选择列表。
-   **首次使用需登录禅道账号**  
    按提示输入账号和密码，token 自动保存到当前工作区。

## 配置项

在 VS Code 设置中可配置：

-   `commit-helper.enableHelloShortcut`：是否启用 helloWorld 快捷键
-   其它自定义配置项可在 `package.json` 的 `contributes.configuration` 中扩展

## 依赖环境

-   Node.js >= 16
-   VS Code >= 1.102.0
-   禅道 API 地址需在 `src/zenTao/api.js` 中配置为实际地址

## 已知问题

-   禅道 API 地址需正确配置，否则无法获取需求和 Bug。
-   仅支持工作区 token 缓存，切换工作区需重新登录。

---

**Enjoy coding with commit-helper!**
