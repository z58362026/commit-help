const axios = require("axios");
const vscode = require("vscode");
const { showLoginForm } = require("../ui/loginForm");
const { getToken, saveToken, saveProducts, saveProjects, getProducts, getProjects } = require("../store");

// 禅道 API 地址
const ZENTAO_API_URL = "https://rizentao.gientech.com/api.php/v1";

/**
 * 弹窗让用户输入账号和密码，并获取 token
 */
async function promptForToken(context) {
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
    // token 存在时验证其有效性
    const validToken = await fetchUserInfo(token);
    if (!token || !validToken) {
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
        if (error.response && error.response.status === 401) {
            console.error("Token 无效或已过期:", error);
            return null;
        }
        throw error;
    }
}

/**
 * 获取需求列表
 */
async function fetchRequirements(token, id) {
    if (!token) return [];
    try {
        const response = await axios.get(`${ZENTAO_API_URL}/projects/${id}/stories?limit=9999&page=1`, {
            headers: { Token: token },
        });
        console.log("获取需求列表成功:", response);
        return response.data.stories || [];
    } catch (error) {
        console.error("获取需求列表失败:", error);
        throw error;
    }
}

/**
 * 获取 Bug 列表
 */
async function fetchBugs(token, id) {
    if (!token) return [];
    try {
        const response = await axios.get(`${ZENTAO_API_URL}/products/${id}/bugs?limit=9999&page=1`, {
            headers: { Token: token },
        });
        console.log("获取 Bug 列表成功:", response.data);
        return response.data.bugs || [];
    } catch (error) {
        console.error("获取 Bug 列表失败:", error);
        throw error;
    }
}

/**
 * 获取 项目 列表
 * {
 *  id: number,
 *  name: string,
 *  status: string    项目状态(wait 未开始 | doing 进行中 | suspend 已挂起 | closed 已关闭)
 *  team: string
 * }
 */
async function fetchProjects({ context, token }) {
    if (!token) return [];
    try {
        const response = await axios.get(`${ZENTAO_API_URL}/projects?limit=9999&page=1`, {
            headers: { Token: token },
        });
        const projects = response.data.projects || [];

        // 只保存未关闭的项目
        const saveInfo = projects.reduce((pre, item) => {
            const { id, name, status } = item;
            if (["wait", "doing"].includes(status)) {
                pre.push({ id, name, status });
            }
            return pre;
        }, []);

        console.log("获取 项目 列表成功:", saveInfo);
        const originProjects = getProjects(context);
        saveProjects(context, { list: saveInfo || [], curId: originProjects?.curId || "" });
        return saveInfo;
    } catch (error) {
        console.error("获取 项目 列表失败:", error);
        throw error;
    }
}

/**
 * 获取 产品 列表
 * {
 *  id: number,
 *  name: string,
 * }
 */
async function fetchProducts({ context, token }) {
    if (!token) return [];
    try {
        const response = await axios.get(`${ZENTAO_API_URL}/products?limit=9999&page=1`, {
            headers: { Token: token },
        });

        const products = response.data.products || [];
        const saveInfo = products.map((item) => {
            const { id, name } = item;
            return {
                id,
                name,
            };
        });

        console.log("获取 产品 列表成功:", saveInfo);
        const originProducts = getProducts(context);
        saveProducts(context, { list: saveInfo || [], curId: originProducts?.curId || "" });
        return saveInfo;
    } catch (error) {
        console.error("获取 产品 列表失败:", error);
        throw error;
    }
}

module.exports = {
    fetchRequirements,
    fetchBugs,
    ensureToken,
    fetchProjects,
    fetchProducts,
};
