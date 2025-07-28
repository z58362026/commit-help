const vscode = require("vscode");
const { createVisualList } = require("../features/visualList");

/**
 * 注册 git commit 触发可视化列表
 */
function registerGitCommitTrigger(context) {
    // 监听文本变化，如果是 git commit 文件则弹出可视化列表
    const disposable = vscode.workspace.onDidChangeTextDocument((event) => {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document.languageId === "git-commit") {
            createVisualList();
        }
    });

    context.subscriptions.push(disposable);
}

module.exports = {
    registerGitCommitTrigger,
};
