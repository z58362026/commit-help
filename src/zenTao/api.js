const axios = require("axios");
const vscode = require("vscode");

// 禅道 API 地址
const ZENTAO_API_URL = "https://rizentao.gientech.com/api.php/v1";

// 获取 token 的 key
const TOKEN_KEY = "zentao_token";

/**
 * 获取本地保存的 token（存储到工作区）
 */
function getToken(context) {
    return context.workspaceState.get(TOKEN_KEY, "");
}

/**
 * 保存 token 到本地（存储到工作区）
 */
function saveToken(context, token) {
    context.workspaceState.update(TOKEN_KEY, token);
}

/**
 * 弹窗让用户输入账号和密码，并获取 token
 */
async function promptForToken(context) {
    // const username = 'P6080583'
    // const password = '!@#EFV5210ww'
    const username = await vscode.window.showInputBox({
        prompt: "请输入禅道账号",
        ignoreFocusOut: true,

    });
    if (!username) return "";

    const password = await vscode.window.showInputBox({
        prompt: "请输入禅道密码",
        password: true,
        ignoreFocusOut: true,
    });
    if (!password) return "";

    try {
        // 这里假设禅道登录接口为 /tokens，实际请根据禅道API文档调整
        const res = await axios.post(
            `${ZENTAO_API_URL}/tokens`,
            {
                account: username,
                password: password,
            },
            {
                headers: {
                    "Content-Type": "application/json"

                },
            }
        );
        const token = res.data && res.data.token;
        if (token) {
            saveToken(context, token);
            vscode.window.showInformationMessage("禅道登录成功，token 已保存。");
            return token;
        } else {
            vscode.window.showErrorMessage("登录失败，未获取到 token。");
            return "";
        }
    } catch (err) {
        vscode.window.showErrorMessage("禅道登录失败: " + err.message);
        return "";
    }
}

/**
 * 获取有效 token，没有则弹窗登录
 */
async function ensureToken(context) {
    let token = getToken(context);
    if (!token) {
        token = await promptForToken(context);
    }
    return token;
}

/**
 * 获取需求列表
 */
async function fetchRequirements(context) {
    const token = await ensureToken(context);
    if (!token) return [];
    try {
        const response = await axios.get(`${ZENTAO_API_URL}/projects/1658/stories`, {

            headers: { "Token": token }
        });
        return response.data.stories || [];
    } catch (error) {
        console.error("获取需求列表失败:", error);
        throw error;
    }
}

/**
 * 获取 Bug 列表
 */
async function fetchBugs(context) {
    const token = await ensureToken(context);
    if (!token) return [];
    try {
        const response = await axios.get(`${ZENTAO_API_URL}/products/399/bugs`, {
            headers: { "Token": token }
        });
        return response.data.bugs || [];
    } catch (error) {
        console.error("获取 Bug 列表失败:", error);
        throw error;
    }
}

module.exports = {
    fetchRequirements,
    fetchBugs,
    ensureToken,
};
