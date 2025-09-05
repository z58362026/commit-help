const vscode = require("vscode");
const { createVisualList } = require("../features/visualList");

/**
 * 注册快捷键触发可视化列表
 */
function registerKeyboardShortcut(context) {
    // 注册命令
    const disposable = vscode.commands.registerCommand("commit-helper.openVisualList", () => {
        createVisualList();
    });

    context.subscriptions.push(disposable);

    // 设置快捷键（可在 package.json 里配置更好）
    const keybinding = {
        key: "ctrl+alt+c", // 可自定义快捷键
        command: "commit-helper.openVisualList",
        when: "editorTextFocus",
    };

    vscode.commands.executeCommand("setContext", "commit-helper:keyboardShortcut", keybinding);
}

module.exports = {
    registerKeyboardShortcut,
};
