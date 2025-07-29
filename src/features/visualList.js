const vscode = require("vscode");
const { fetchRequirements, fetchBugs } = require("../zenTao/api");
const { formatRequirement, formatBug } = require("../zenTao/utils");

/**
 * 创建禅道需求和 Bug 的可视化列表
 * @param {vscode.ExtensionContext} context
 */
function createVisualList(context) {
    // 创建 Webview 面板用于展示需求和 Bug
    const panel = vscode.window.createWebviewPanel(
        "zenTaoVisualList",
        "ZenTao Requirements and Bugs",
        vscode.ViewColumn.One,
        { enableScripts: true }
    );

    panel.webview.html = getWebviewContent();

    // 传递 context 给 fetchRequirements 和 fetchBugs
    fetchRequirements(context).then((requirements) => {
        const formattedRequirements = requirements.map((req) => formatRequirement(req));
        panel.webview.postMessage({ type: "requirements", data: formattedRequirements });
    });

    fetchBugs(context).then((bugs) => {
        const formattedBugs = bugs.map((bug) => formatBug(bug));
        panel.webview.postMessage({ type: "bugs", data: formattedBugs });
    });

    // 监听 Webview 消息，实现复制和自动提交等功能
    panel.webview.onDidReceiveMessage(
        (message) => {
            switch (message.command) {
                case "copyToClipboard":
                    vscode.env.clipboard.writeText(message.data);
                    break;
                case "submitCommit":
                    // 自动提交逻辑可在此补充
                    break;
            }
        },
        undefined,
        context ? context.subscriptions : undefined
    );
}

/**
 * 返回 Webview 的 HTML 内容
 */
function getWebviewContent() {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ZenTao Visual List</title>
    </head>
    <body>
        <h1>ZenTao Requirements and Bugs</h1>
        <div id="requirements"></div>
        <div id="bugs"></div>
        <script>
            const vscode = acquireVsCodeApi();

            window.addEventListener('message', event => {
                const message = event.data;
                if (message.type === 'requirements') {
                    const requirementsDiv = document.getElementById('requirements');
                    message.data.forEach(req => {
                        const reqElement = document.createElement('div');
                        reqElement.textContent = req;
                        requirementsDiv.appendChild(reqElement);
                    });
                } else if (message.type === 'bugs') {
                    const bugsDiv = document.getElementById('bugs');
                    message.data.forEach(bug => {
                        const bugElement = document.createElement('div');
                        bugElement.textContent = bug;
                        bugsDiv.appendChild(bugElement);
                    });
                }
            });
        </script>
    </body>
    </html>`;
}

module.exports = {
    createVisualList,
};
