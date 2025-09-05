const vscode = require("vscode");
const { fetchRequirements, fetchBugs, ensureToken, fetchProducts, fetchProjects } = require("../zenTao/api");
const { formatRequirement, formatBug } = require("../zenTao/utils");
const { getProjects, saveProjects, getProducts, saveProducts } = require("../store/index");

async function fetchProductsAndProjects(params) {
    const { context, token } = params;
    const reqArr = [fetchProducts({ context, token }), fetchProjects({ context, token })];

    try {
        const [products, projects] = await Promise.all(reqArr);
        return { products, projects };
    } catch (error) {
        console.error("获取产品和项目列表失败:", error);
        return false;
    }
}

/**
 * 创建禅道需求和 Bug 的可视化列表
 * @param {vscode.ExtensionContext} context
 */
async function createVisualList(context) {
    // 1, 确保有有效的 token
    const token = await ensureToken(context);
    if (!token) {
        vscode.window.showErrorMessage("无法获取禅道 token，无法显示需求和 Bug 列表。");
        return;
    }
    // 2, 获取产品和项目列表
    const projects = getProjects(context);
    const products = getProducts(context);
    if (!projects?.curId && !products?.curId) {
        // 不存在或没选择产品项目的情况下，重新获取
        const result = await fetchProductsAndProjects({ context, token });
        if (!result) {
            return;
        }
    }

    // 创建 Webview 面板用于展示需求和 Bug
    const panel = vscode.window.createWebviewPanel(
        "zenTaoVisualList",
        "ZenTao Requirements and Bugs",
        vscode.ViewColumn.One,
        { enableScripts: true }
    );

    panel.webview.html = getWebviewContent();

    // 传递 context 给 fetchRequirements 和 fetchBugs
    fetchRequirements(token).then((requirements) => {
        const formattedRequirements = requirements.map((req) => formatRequirement(req));
        panel.webview.postMessage({ type: "requirements", data: formattedRequirements });
    });

    fetchBugs(token).then((bugs) => {
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
        <style>
            .section-title { font-weight: bold; margin-top: 16px; }
            ul { padding-left: 20px; }
            li { margin: 4px 0; }
        </style>
    </head>
    <body>
        <h1>ZenTao 可视化需求与 Bug 列表</h1>
        <div>
            <div class="section-title">需求列表</div>
            <ul id="requirements"></ul>
        </div>
        <div>
            <div class="section-title">Bug 列表</div>
            <ul id="bugs"></ul>
        </div>
        <script>
            const vscode = acquireVsCodeApi();

            window.addEventListener('message', event => {
                const message = event.data;
                if (message.type === 'requirements') {
                    const requirementsUl = document.getElementById('requirements');
                    requirementsUl.innerHTML = '';
                    message.data.forEach(req => {
                        const li = document.createElement('li');
                        li.textContent = req;
                        requirementsUl.appendChild(li);
                    });
                } else if (message.type === 'bugs') {
                    const bugsUl = document.getElementById('bugs');
                    bugsUl.innerHTML = '';
                    message.data.forEach(bug => {
                        const li = document.createElement('li');
                        li.textContent = bug;
                        bugsUl.appendChild(li);
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
