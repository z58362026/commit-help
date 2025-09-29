const vscode = require("vscode");
const { getProjects, saveProjects, getProducts, saveProducts, getUserInfo } = require("../store/index");
const { fetchProjects, fetchProducts, fetchRequirements, fetchBugs, ensureToken } = require("../zenTao/api");
const { processRequirements, processBugs } = require("../zenTao/utils");
const { submitCommit } = require("../features/commitSubmit");
const { getCommitTemp } = require("../store/commitContent");
const { bitchCommit } = require("../features/bitchCommit");
const { bitchCopy } = require("../features/bitchCopy");

// bug添加fix,需求添加feat
// type: 'bug' | 'req'
async function handleCopy({ text, type }) {
    const temp = getCommitTemp();
    const [id, title] = text.split(":").map((item) => item.trim());
    type = type === "bug" ? "fix" : "feat";
    const msg = temp.replace("{type}", type).replace("{id}", id).replace("{title}", title);
    await vscode.env.clipboard.writeText(msg);
}

/**
 * 创建并显示项目和产品选择的 Webview 界面
 * @param {vscode.ExtensionContext} context - 扩展上下文
 * @returns {Promise<void>}
 */
async function getList(context) {
    try {
        // 初始化时从缓存获取项目和产品列表
        let projectsData = getProjects(context);
        let productsData = getProducts(context);

        // 创建 Webview 面板
        const panel = vscode.window.createWebviewPanel(
            "zentaoProjectProductList",
            "禅道项目产品列表",
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: false,
            }
        );

        // 设置 Webview 内容
        panel.webview.html = getListHtml(projectsData, productsData);

        // 监听 Webview 消息
        panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case "query":
                        const token = await ensureToken(context);
                        await handleQuery({ message, panel, token, projectsData, productsData, context });
                        break;
                    case "copyText":
                        await handleCopy({ text: message.text, type: message.type });
                        vscode.window.showInformationMessage("复制成功");
                        break;
                    case "submit":
                        submitCommit({
                            commitMsg: message.text,
                            context,
                            type: message.type,
                        });
                        break;
                    case "bitchCommit":
                        bitchCommit(message.data);
                        break;
                    case "bitchCopy":
                        bitchCopy(message.data);
                        break;
                    default:
                        break;
                }
            },
            undefined,
            context.subscriptions
        );
    } catch (error) {
        console.error("获取项目产品列表失败:", error);
        vscode.window.showErrorMessage(`获取项目产品列表失败: ${error.message}`);
    }
}

/**
 * 生成 Webview 的 HTML 内容
 * @param {Object} projectsData - 项目数据 {list: [], curId?: number}
 * @param {Object} productsData - 产品数据 {list: [], curId?: number}
 * @returns {string} HTML 字符串
 */
function getListHtml(projectsData, productsData) {
    const projects = projectsData.list || [];
    const products = productsData.list || [];
    const selectedProjectId = projectsData.curId || (projects[0] ? projects[0].id : "");
    const selectedProductId = productsData.curId || (products[0] ? products[0].id : "");

    // 生成项目选择选项
    const projectOptions = projects
        .map(
            (project) =>
                `<option value="${project.id}" ${project.id === Number(selectedProjectId) ? "selected" : ""}>
            ${project.name} (ID: ${project.id})
        </option>`
        )
        .join("");

    // 生成产品选择选项
    const productOptions = products
        .map(
            (product) =>
                `<option value="${product.id}" ${product.id === Number(selectedProductId) ? "selected" : ""}>
            ${product.name} (ID: ${product.id})
        </option>`
        )
        .join("");

    // 解决嵌套模板字符串问题的方法：使用单引号+字符串拼接代替内部模板字符串
    return `<!DOCTYPE html>
<html lang="zh-CN">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>禅道项目产品列表</title>
    <style>
        body {
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe WPC', 'Segoe UI', sans-serif;
        }

        .container {
            min-width: 800px;
            width: 90vw;
            max-width: 1500px;
            margin: 0 auto;
        }

        h1 {
            font-size: 18px;
            margin-bottom: 20px;
        }

        .select-group {
            margin-bottom: 15px;
        }

        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
        }

        select {
            width: 100%;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 3px;
            font-size: 14px;
            box-sizing: border-box;
        }

        .button-group {
            margin-top: 20px;
            margin-bottom: 20px;
        }

        button {
            padding: 8px 16px;
            font-size: 14px;
            cursor: pointer;
            border: none;
            border-radius: 3px;
            background-color: #0078d4;
            color: white;
        }

        button:hover {
            background-color: #106ebe;
        }

        .list-container {
            margin-top: 20px;
            display: flex;
            gap: 20px;
        }

        .list {
            flex: 1;
            border: 1px solid #ccc;
            border-radius: 3px;
            padding: 10px;
            max-height: 400px;
            overflow-y: auto;
        }

        .list h3 {
            font-size: 16px;
            margin-top: 0;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #eee;
        }

        .list-item {
            padding: 10px 0;
            border-bottom: 1px solid #f0f0f0;
        }

        .list-item:last-child {
            border-bottom: none;
        }

        .list .copy-btn,
        .submit {
            color: blue;
            display: inline-block;
            margin-left: 10px;
            cursor: pointer;
        }
    </style>
</head>

<body>
    <div class="container">
        <h1>禅道项目产品列表</h1>

        <div class="select-group">
            <label for="projectSelect">选择项目</label>
            <select id="projectSelect" onchange="selectProject()">
                ${projectOptions}
            </select>
        </div>

        <div class="select-group">
            <label for="productSelect">选择产品</label>
            <select id="productSelect" onchange="selectProduct()">
                ${productOptions}
            </select>
        </div>

        <div class="button-group">
            <button id="queryBtn" onclick="query()">查询需求和Bug</button>
            <button id="bitchCopy" onclick="handleBitchCopy()">批量复制</button>
            <button id="bitchCommit" onclick="handleBitchCommit">批量提交</button>
        </div>

        <div class="list-container">
            <div class="list">
                <h3>需求列表</h3>
                <div id="requirementsList">请点击查询按钮获取需求列表</div>
            </div>

            <div class="list">
                <h3>Bug列表</h3>
                <div id="bugsList">请点击查询按钮获取Bug列表</div>
            </div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        // 批量复制
        function handleBitchCopy() {
            const checkboxes = document.querySelectorAll('.list-item-checkbox:checked');
            const list = Array.from(checkboxes || []).map(node => {
                const [id, title] = node.getAttribute('data-item').split(':').map(item => item.trim());
                const type = node.getAttribute('data-type');
                return { id, title, type };
            })
            vscode.postMessage({
                command: 'bitchCopy',
                data: list,
            });
        }
        // 批量提交
        function handleBitchCommit() {
            const checkboxes = document.querySelectorAll('.list-item-checkbox:checked');
            const list = Array.from(checkboxes || []).map(node => {
                const [id, title] = node.getAttribute('data-item').split(':').map(item => item.trim());
                const type = node.getAttribute('data-type');
                return { id, title, type };
            })
            vscode.postMessage({
                command: 'bitchCommit',
                data: list,
            });
        }

        // 复制
        function copyText(text, type) {
            vscode.postMessage({
                command: 'copyText',
                text: text,
                type: type
            });
        }

        // 提交
        function submit(text, type) {
            vscode.postMessage({
                command: 'submit',
                text: text,
                type: type
            });
        }

        // 复制点击事件
        window.onload = () => {
            document.querySelector(".list-container").addEventListener("click", function (event) {
                const target = event.target;
                if (target.classList.contains('copy-btn')) {
                    const bug = target.getAttribute('data-bug');
                    const req = target.getAttribute('data-req');
                    bug?.length ? copyText(bug, 'bug') : copyText(req, 'req');
                }
                if (target.classList.contains('submit')) {
                    const bug = target.getAttribute('data-bug');
                    const req = target.getAttribute('data-req');
                    bug?.length ? submit(bug, 'bug') : submit(req, 'req');
                }
            })
        }


        // 查询需求和Bug
        function query() {
            const projectId = document.getElementById('projectSelect').value;
            const productId = document.getElementById('productSelect').value;

            vscode.postMessage({
                command: 'query',
                projectId: projectId,
                productId: productId
            });
        }

        // 选择项目
        function selectProject() {
            const projectId = document.getElementById('projectSelect').value;
            const projectName = document.getElementById('projectSelect').options[document.getElementById('projectSelect').selectedIndex].text;

            vscode.postMessage({
                command: 'selectProject',
                projectId: projectId,
                projectName: projectName
            });
        }

        // 选择产品
        function selectProduct() {
            const productId = document.getElementById('productSelect').value;
            const productName = document.getElementById('productSelect').options[document.getElementById('productSelect').selectedIndex].text;

            vscode.postMessage({
                command: 'selectProduct',
                productId: productId,
                productName: productName
            });
        }

        // 更新需求列表显示
        function updateRequirementsList(requirements) {
            const listElement = document.getElementById('requirementsList');
            if (requirements.length === 0) {
                listElement.innerHTML = '暂无需求';
                return;
            }

            // 使用单引号和字符串拼接代替模板字符串，避免嵌套反引号问题
            const itemsHtml = requirements.map(function (req) {
                return '<div class="list-item">' + 
                '<input type="checkbox" class="list-item-checkbox" data-item="' + req + '" data-type="req" />' +
                req + '<div class="copy-btn" data-req="' + req + '">复制</div><div class="submit" data-req="' + req + '">提交</div></div>';
            }).join('');
            listElement.innerHTML = itemsHtml;
        }

        // 更新Bug列表显示
        function updateBugsList(bugs) {
            const listElement = document.getElementById('bugsList');
            if (bugs.length === 0) {
                listElement.innerHTML = '暂无Bug';
                return;
            }

            // 使用单引号和字符串拼接代替模板字符串，避免嵌套反引号问题
            const itemsHtml = bugs.map(function (bug) {
                return '<div class="list-item">' +
                    '<input type="checkbox" class="list-item-checkbox" data-item="' + bug + '" data-type="bug" />' +
                    bug +
                    '<div class="copy-btn" data-bug="' + bug + '">复制</div><div class="submit" data - bug="' + bug + '" > 提交</div></div > ';
            }).join('');
            listElement.innerHTML = itemsHtml;
        }

        // 监听来自扩展的消息
        window.addEventListener('message', function (event) {
            const message = event.data;
            switch (message.command) {
                case 'updateRequirements':
                    updateRequirementsList(message.data);
                    break;
                case 'updateBugs':
                    updateBugsList(message.data);
                    break;
            }
        });
    </script>
</body>

</html>`;
}

/**
 * 处理查询请求
 * @param {Object} message - 包含 projectId 和 productId 的消息对象
 * @param {vscode.WebviewPanel} panel - Webview 面板对象
 * @param {string} token - 禅道 API token
 */
async function handleQuery({ message, panel, token, projectsData, productsData, context }) {
    const { projectId, productId } = message;
    await saveProjects(context, { list: projectsData.list, curId: projectId });
    await saveProducts(context, { list: productsData.list, curId: productId });

    try {
        // 显示加载状态
        panel.webview.postMessage({
            command: "updateRequirements",
            data: ["加载中..."],
        });
        panel.webview.postMessage({
            command: "updateBugs",
            data: ["加载中..."],
        });

        // 并行获取需求和Bug列表
        let [requirementsData, bugsData] = await Promise.all([
            fetchRequirements(token, projectId),
            fetchBugs(token, productId),
        ]);

        // const userInfo = getUserInfo(context);

        // bugsData = bugsData.filter((bug) => {
        //     if (!bug.assignedTo || !bug.assignedTo.id) return true;
        //     return bug.assignedTo.id === userInfo.id;
        // });

        // 格式化并更新列表
        const formattedRequirements = processRequirements(requirementsData || []);
        const formattedBugs = processBugs(bugsData || []);

        panel.webview.postMessage({
            command: "updateRequirements",
            data: formattedRequirements,
        });
        panel.webview.postMessage({
            command: "updateBugs",
            data: formattedBugs,
        });
    } catch (error) {
        console.error("查询需求和Bug失败:", error);
        panel.webview.postMessage({
            command: "updateRequirements",
            data: [`获取需求失败: ${error.message}`],
        });
        panel.webview.postMessage({
            command: "updateBugs",
            data: [`获取Bug失败: ${error.message}`],
        });
    }
}

module.exports = {
    getList,
};
