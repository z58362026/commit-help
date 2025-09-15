const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

function registerCommitHook(context) {
    // 获取当前工作区的根目录
    const workspaceRoot = vscode.workspace.rootPath;
    if (!workspaceRoot) {
        // 没有工作区
        return;
    }

    // 获取 Git 目录路径
    const gitDir = path.join(workspaceRoot, ".git");
    if (!fs.existsSync(gitDir)) {
        // 没有git仓库
        return;
    }

    // 获取 hooks 目录路径
    const hooksDir = path.join(gitDir, "hooks");
    if (!fs.existsSync(hooksDir)) {
        fs.mkdirSync(hooksDir);
    }

    // 获取 commit-msg 脚本路径
    const preCommitPath = path.join(hooksDir, "commit-msg");

    // 定义要添加的规则，暂定为必须带有数字
    const ruleToAdd = `#!/bin/sh
# 获取提交信息
commit_msg=$(cat "$1")

# 检查提交信息是否包含数字
if ! echo "$commit_msg" | grep -q '[0-9]'; then
  echo "提交信息必须包含禅道id！"
  exit 1
fi
`;

    // 检查 commit-msg 脚本是否存在
    if (fs.existsSync(preCommitPath)) {
        // 读取现有的 commit-msg 脚本内容
        const existingContent = fs.readFileSync(preCommitPath, "utf8");

        // 检查是否已经包含了你的规则
        if (existingContent.includes(ruleToAdd.trim())) {
            // 已经存在相同的commit规则
            return;
        }

        // 追加规则到现有的 commit-msg 脚本
        fs.appendFileSync(preCommitPath, "\n" + ruleToAdd);
    } else {
        // 创建新的 commit-msg 脚本并添加规则
        fs.writeFileSync(preCommitPath, ruleToAdd, {
            flag: "w+",
            mode: 0o755,
        });

        // 保证脚本权限
        setFilePermissions(preCommitPath);
    }
    vscode.window.showInformationMessage("commit规则添加成功");
}

function setFilePermissions(filePath) {
    fs.chmod(filePath, 0o755, (err) => {
        if (err) {
            console.error("设置执行权限失败:", err);
        } else {
            console.log("成功设置执行权限");
        }
    });
}

module.exports = {
    registerCommitHook,
};
