const vscode = require("vscode");

/**
 * 注册按钮触发可视化列表
 */
function createButtonTrigger(context) {
    // 创建状态栏按钮
    const button = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 10);
    button.text = "$(git-commit) ZenTao";
    button.tooltip = "显示 ZenTao 提交列表";
    button.command = "commit-helper.showVisualList";
    // 使用setTimeout稍微延迟显示，确保VS Code UI已经准备好
    setTimeout(() => {
        button.show();
        console.log("ZenTao 状态栏按钮已显示");
    }, 100);
    context.subscriptions.push(button);
    console.log("ZenTao 状态栏按钮已添加到订阅列表");
}

module.exports = {
    createButtonTrigger,
};
