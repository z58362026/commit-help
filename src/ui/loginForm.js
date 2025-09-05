const vscode = require("vscode");

/**
 * 使用Webview创建登录表单，同时输入账号和密码
 * @param {vscode.ExtensionContext} context
 * @returns {Promise<{username: string, password: string} | null>} 包含用户名和密码的对象，用户取消则返回null
 */
function showLoginForm(context) {
    return new Promise((resolve) => {
        // 创建Webview面板
        const panel = vscode.window.createWebviewPanel("zenTaoLogin", "ZenTao 登录", vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: false,
        });

        // 设置Webview内容
        panel.webview.html = getLoginFormHtml();

        // 监听Webview消息
        const disposable = panel.webview.onDidReceiveMessage(
            (message) => {
                switch (message.command) {
                    case "login":
                        // 收到登录信息，关闭面板并返回凭证
                        resolve({ username: message.username, password: message.password });
                        panel.dispose();
                        break;
                    case "cancel":
                        // 用户取消登录
                        panel.dispose();
                        resolve(null);
                        break;
                }
            },
            undefined,
            context ? context.subscriptions : undefined
        );

        // 当面板被关闭时，视为取消登录
        panel.onDidDispose(() => {
            resolve(null);
        });
    });
}

/**
 * 返回登录表单的HTML内容
 */
function getLoginFormHtml() {
    return `<!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ZenTao 登录</title>
        <style>
            body {
                padding: 20px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe WPC', 'Segoe UI', sans-serif;
            }
            .form-container {
                max-width: 400px;
                margin: 0 auto;
            }
            h1 {
                font-size: 18px;
                margin-bottom: 20px;
            }
            .form-group {
                margin-bottom: 15px;
            }
            label {
                display: block;
                margin-bottom: 5px;
                font-weight: 600;
            }
            input {
                width: 100%;
                padding: 8px;
                border: 1px solid #ccc;
                border-radius: 3px;
                font-size: 14px;
                box-sizing: border-box;
            }
            .button-group {
                margin-top: 20px;
                display: flex;
                gap: 10px;
            }
            button {
                padding: 8px 16px;
                font-size: 14px;
                cursor: pointer;
                border: none;
                border-radius: 3px;
            }
            .btn-primary {
                background-color: #0078d4;
                color: white;
            }
            .btn-primary:hover {
                background-color: #106ebe;
            }
            .btn-secondary {
                background-color: #f3f3f3;
                color: #333;
            }
            .btn-secondary:hover {
                background-color: #e6e6e6;
            }
        </style>
    </head>
    <body>
        <div class="form-container">
            <h1>ZenTao 账号登录</h1>
            <form id="loginForm">
                <div class="form-group">
                    <label for="username">账号</label>
                    <input type="text" id="username" placeholder="请输入ZenTao账号" required>
                </div>
                <div class="form-group">
                    <label for="password">密码</label>
                    <input type="password" id="password" placeholder="请输入ZenTao密码" required>
                </div>
                <div class="button-group">
                    <button type="submit" class="btn-primary">登录</button>
                    <button type="button" id="cancelBtn" class="btn-secondary">取消</button>
                </div>
            </form>
        </div>
        <script>
            const vscode = acquireVsCodeApi();
            
            // 处理表单提交
            document.getElementById('loginForm').addEventListener('submit', (e) => {
                e.preventDefault();
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                
                if (username && password) {
                    vscode.postMessage({
                        command: 'login',
                        username: username,
                        password: password
                    });
                }
            });
            
            // 处理取消按钮点击
            document.getElementById('cancelBtn').addEventListener('click', () => {
                vscode.postMessage({ command: 'cancel' });
            });
        </script>
    </body>
    </html>`;
}

module.exports = {
    showLoginForm,
};
