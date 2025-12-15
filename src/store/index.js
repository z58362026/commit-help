const vscode = require("vscode");

// 获取 token 的 key
const TOKEN_KEY = "zentao_token";
const PROJECTS_KEY = "zentao_projects";
const PRODUCTS_KEY = "zentao_products";
const USERINFO_KEY = "zentao_user_info";
// 存储登录的账号密码
const LOGIN_INFO_KEY = "zentao_login_info";

/**
 * 获取本地保存的账号密码
 */
function getLoginInfo(context) {
    const str = context.workspaceState.get(LOGIN_INFO_KEY, "");
    return str ? JSON.parse(str) : "";
}

/**
 * 保存账号密码到本地（存储到工作区）
 */
function saveLoginInfo(context, loginInfo) {
    try {
        saveInfo = loginInfo ? JSON.stringify(loginInfo) : loginInfo;
        context.workspaceState.update(LOGIN_INFO_KEY, saveInfo);
    } catch (error) {
        console.error("保存账号密码失败:", error);
    }
}

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
 * 获取本地保存的 个人信息（存储到工作区）
 */
function getUserInfo(context) {
    const str = context.workspaceState.get(USERINFO_KEY, "");
    return str ? JSON.parse(str) : "";
}

/**
 * 保存 个人信息 到本地（存储到工作区）
 */
function saveUserInfo(context, userInfo) {
    try {
        context.workspaceState.update(USERINFO_KEY, JSON.stringify(userInfo));
    } catch (error) {
        console.error("保存个人信息失败:", error);
    }
}

/**
 * 获取本地保存的 项目列表（存储到工作区）
 *
 * 结构 {
 *  list: [], curId:string
 * }
 */
function getProjects(context) {
    const str = context.workspaceState.get(PROJECTS_KEY, "");
    return str ? JSON.parse(str) : "";
}

/**
 * 保存 项目 到本地（存储到工作区）
 */
function saveProjects(context, projects) {
    try {
        context.workspaceState.update(PROJECTS_KEY, JSON.stringify(projects));
    } catch (error) {
        console.error("保存项目列表失败:", error);
    }
}

/**
 * 获取本地保存的 产品列表（存储到工作区）
 *
 * 结构 {
 *  list: [], curId:string
 * }
 */
function getProducts(context) {
    const str = context.workspaceState.get(PRODUCTS_KEY, "");
    return str ? JSON.parse(str) : "";
}

/**
 * 保存 产品 到本地（存储到工作区）
 */
function saveProducts(context, products) {
    try {
        context.workspaceState.update(PRODUCTS_KEY, JSON.stringify(products));
    } catch (error) {
        console.error("保存项目列表失败:", error);
    }
}

module.exports = {
    getToken,
    saveToken,
    getProjects,
    saveProjects,
    getProducts,
    saveProducts,
    getUserInfo,
    saveUserInfo,
    saveLoginInfo,
    getLoginInfo,
};
