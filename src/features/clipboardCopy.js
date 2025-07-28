const vscode = require('vscode');

/**
 * 复制需求或 Bug 编号和描述到剪切板
 * @param {number[]} ids
 * @param {string[]} descriptions
 */
function copyToClipboard(ids, descriptions) {
    // 拼接成字符串，每行一个编号和描述
    const clipboardText = ids.map((id, index) => `${id}: ${descriptions[index]}`).join('\n');
    vscode.env.clipboard.writeText(clipboardText).then(() => {
        vscode.window.showInformationMessage('已复制到剪切板: ' + clipboardText);
    }, (err) => {
        vscode.window.showErrorMessage('复制到剪切板失败: ' + err);
    });
}

module.exports = {
    copyToClipboard
};