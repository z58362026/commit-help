const axios = require("axios");
const vscode = require("vscode");
const { showLoginForm } = require("../ui/loginForm");

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
    // 禅道账号密码，工号/默认密码 Password@123
    console.log("开始收集用户信息...");

    try {
        // 使用新的登录表单代替单独的输入框
        const credentials = await showLoginForm(context);
        if (!credentials || !credentials.username || !credentials.password) {
            console.log("用户取消登录或未输入完整凭证");
            return "";
        }

        const { username, password } = credentials;

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
                        "Content-Type": "application/json",
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
            console.error("禅道登录请求失败:", err);
            vscode.window.showErrorMessage("禅道登录失败: " + err.message);
            return "";
        }
    } catch (error) {
        console.error("显示登录表单时发生错误:", error);
        vscode.window.showErrorMessage("登录表单加载失败: " + error.message);
        return "";
    }
}

/**
 * 获取有效 token，没有则弹窗登录
 */
async function ensureToken(context) {
    let token = getToken(context);
    const validToken = await fetchUserInfo(token);
    if (!token || !isValidToken) {
        console.log("没有找到 token，弹窗登录获取...");
        token = await promptForToken(context);
    }
    console.log("当前 token:", token);
    return token;
}

/**
 * 获取个人信息，用于校验token是否有效
 */
async function fetchUserInfo(token) { 
    if (!token) return null;
    try {
        const response = await axios.get(`${ZENTAO_API_URL}/user`, {
            headers: { Token: token },
        });
        console.log("获取用户信息成功:", response.data);
        return response.data;
    } catch (error) {
        debugger
        if(error.response && error.response.status === 401) {
            console.error("Token 无效或已过期:", error);
            return null;
        }
        throw error;
    }
}
 */

/**
 * 获取需求列表
 */
async function fetchRequirements(token) {
    if (!token) return [];
    try {
        const response = await axios.get(`${ZENTAO_API_URL}/projects/1658/stories`, {
            headers: { Token: token },
        });
        console.log("获取需求列表成功:", response.data);
        return response.data.stories || [];
    } catch (error) {
        console.error("获取需求列表失败:", error);
        throw error;
    }
}

/**
 * 获取 Bug 列表
 */
async function fetchBugs(token) {
    if (!token) return [];
    try {
        const response = await axios.get(`${ZENTAO_API_URL}/products/399/bugs`, {
            headers: { Token: token },
        });
        console.log("获取 Bug 列表成功:", response.data);
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
