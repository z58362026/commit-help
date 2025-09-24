// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
// 引入各个功能模块
const { createVisualList } = require("./src/features/visualList");
const { registerCommitHook } = require("./src/features/registerCommitHook");
const { createButtonTrigger } = require("./src/triggers/buttonTrigger");

/**
 * 扩展激活时调用
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    // 插件激活时校验commit规则
    registerCommitHook(context);
    // 右下角活动栏按钮
    createButtonTrigger(context);
    // 扩展激活时输出日志
    console.log('Congratulations, your extension "commit-helper" is now active!');
    // 注册 helloWorld 命令
    const disposable = vscode.commands.registerCommand("commit-helper.helloWorld", () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage("Hello World VS from commit-helper!");
    });
    // 注册可视化列表命令，传递 context
    const visualListCommand = vscode.commands.registerCommand("commit-helper.showVisualList", () => {
        // console.log("showVisualList command triggered");
        createVisualList(context);
    });

    // 将命令加入订阅，确保扩展卸载时自动清理
    context.subscriptions.push(disposable);
    context.subscriptions.push(visualListCommand);
}

/**
 * 扩展卸载时调用
 */
function deactivate() {}

module.exports = {
    activate,
    deactivate,
};
