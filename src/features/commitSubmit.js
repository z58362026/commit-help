// filepath: /commit-helper/commit-helper/src/features/commitSubmit.js
const vscode = require("vscode");
const { exec } = require("child_process");
const { getCommitTemp } = require("../store/commitContent");

/**
 * 自动提交功能，根据暂存区和工作区状态执行不同操作
 * @param {Object} params - 参数对象
 * @param {string} params.commitMsg - 提交信息
 * @param {vscode.ExtensionContext} params.context - 扩展上下文
 */
async function submitCommit({ commitMsg, context, type }) {
    const temp = getCommitTemp();
    const [id, title] = commitMsg.split(":").map((item) => item.trim());
    type = type === "bug" ? "fix" : "feat";
    commitMsg = temp.replace("{type}", type).replace("{id}", id).replace("{title}", title);

    try {
        // 获取当前工作区根路径
        const workspaceRoot = vscode.workspace.rootPath;
        if (!workspaceRoot) {
            vscode.window.showErrorMessage("未打开工作区");
            return;
        }

        // 检查是否有Git仓库
        const hasGitRepo = await checkGitRepo(workspaceRoot);
        if (!hasGitRepo) {
            vscode.window.showErrorMessage("当前工作区不是Git仓库");
            return;
        }

        // 1. 检查暂存区是否有内容
        const hasStagedChanges = await checkStagedChanges(workspaceRoot);

        if (hasStagedChanges) {
            // 暂存区有内容，直接提交并推送
            await commitAndPush(commitMsg, workspaceRoot);
            return;
        }

        // 2. 检查工作区是否有修改
        const hasUnstagedChanges = await checkUnstagedChanges(workspaceRoot);

        if (!hasUnstagedChanges) {
            // 工作区没有修改，提示用户
            vscode.window.showInformationMessage("暂无代码有修改");
            return;
        }

        // 3. 工作区有修改但暂存区为空，询问用户是否暂存所有更改并提交
        const shouldStageAndCommit = await vscode.window.showInformationMessage(
            "没有可提交的暂存更改，是否要暂存所有更改并直接提交？",
            { modal: true }, // 设置为模态对话框
            "是",
            "否"
        );

        // 如果用户点击"是"，则暂存所有更改并提交
        if (shouldStageAndCommit === "是") {
            // 暂存所有更改，然后提交并推送
            await stageAllChanges(workspaceRoot);
            await commitAndPush(commitMsg, workspaceRoot);
        }
        // 如果用户点击"否"或关闭对话框，则结束流程

        // 如果用户选择"否"或取消，则结束流程
    } catch (error) {
        console.error("提交过程中发生错误:", error);
        vscode.window.showErrorMessage(`提交失败: ${error.message || "未知错误"}`);
    }
}

/**
 * 检查指定路径是否是Git仓库
 * @param {string} cwd - 当前工作目录
 * @returns {Promise<boolean>} 是否是Git仓库
 */
function checkGitRepo(cwd) {
    return new Promise((resolve) => {
        exec("git rev-parse --is-inside-work-tree", { cwd }, (error, stdout) => {
            resolve(!error && stdout.trim() === "true");
        });
    });
}

/**
 * 检查暂存区是否有内容
 * @param {string} cwd - 当前工作目录
 * @returns {Promise<boolean>} 暂存区是否有内容
 */
function checkStagedChanges(cwd) {
    return new Promise((resolve) => {
        exec("git diff --cached --exit-code", { cwd }, (error) => {
            // 如果有差异，exit code 不为 0
            resolve(error !== null);
        });
    });
}

/**
 * 检查工作区是否有未暂存的修改
 * @param {string} cwd - 当前工作目录
 * @returns {Promise<boolean>} 工作区是否有未暂存的修改
 */
function checkUnstagedChanges(cwd) {
    return new Promise((resolve) => {
        exec("git diff --exit-code", { cwd }, (error) => {
            // 如果有差异，exit code 不为 0
            resolve(error !== null);
        });
    });
}

/**
 * 暂存所有更改
 * @param {string} cwd - 当前工作目录
 * @returns {Promise<void>}
 */
function stageAllChanges(cwd) {
    return new Promise((resolve, reject) => {
        exec("git add .", { cwd }, (error) => {
            if (error) {
                reject(new Error(`暂存更改失败: ${error.message}`));
            } else {
                resolve();
            }
        });
    });
}

/**
 * 提交更改并推送到远程
 * @param {string} commitMsg - 提交信息
 * @param {string} cwd - 当前工作目录
 * @returns {Promise<void>}
 */
async function commitAndPush(commitMsg, cwd) {
    try {
        // 提交更改
        await new Promise((resolve, reject) => {
            exec(`git commit -m "${commitMsg}"`, { cwd }, (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(`提交失败: ${stderr || error.message}`));
                } else {
                    console.log("提交成功:", stdout);
                    resolve();
                }
            });
        });

        // 推送到远程
        await new Promise((resolve, reject) => {
            exec("git push", { cwd }, (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(`推送失败: ${stderr || error.message}`));
                } else {
                    console.log("推送成功:", stdout);
                    vscode.window.showInformationMessage("代码已成功提交并推送到远程仓库");
                    resolve();
                }
            });
        });
    } catch (error) {
        throw error;
    }
}

module.exports = {
    submitCommit,
};
