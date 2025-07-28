const vscode = require("vscode");
const { createVisualList } = require("../features/visualList");

/**
 * 注册按钮触发可视化列表
 */
function createButtonTrigger(context) {
    // 创建状态栏按钮
    const button = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    button.text = "Show ZenTao List";
    button.command = "wangming.showZenTaoList";
    button.show();

    context.subscriptions.push(button);

    // 注册按钮点击命令
    const disposable = vscode.commands.registerCommand("wangming.showZenTaoList", () => {
        createVisualList();
    });

    context.subscriptions.push(disposable);
}

module.exports = {
    createButtonTrigger,
};
