// filepath: /commit-helper/commit-helper/src/features/commitSubmit.js
const vscode = require("vscode");
const { createVisualList } = require("./visualList");
const { fetchRequirements, fetchBugs } = require("../zenTao/api");

/**
 * 自动提交功能，弹出选择需求或 Bug，自动生成 commit message 并提交
 */
async function submitCommit({ commitMsg, context }) {
    // 构造可选列表
    const visualList = createVisualList(requirements, bugs);

    // 弹出选择框，用户选择要提交的内容
    vscode.window
        .showQuickPick(visualList, {
            placeHolder: "选择一个需求或 Bug 进行提交",
            canPickMany: false,
        })
        .then((selected) => {
            if (selected) {
                // 自动生成提交信息并执行 git commit
                const commitMessage = `Commit related to: ${selected.label}`;
                vscode.commands.executeCommand("git.commit", { message: commitMessage });
            }
        });
}

module.exports = {
    submitCommit,
};
