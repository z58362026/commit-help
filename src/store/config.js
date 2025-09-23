const vscode = require("vscode");

/**
 * 获取扩展配置
 * @returns {Object} 扩展配置对象
 */
function getExtensionConfig() {
    return vscode.workspace.getConfiguration("commit-helper");
}

/**
 * 获取指定路由的配置
 * @param {string} routeName 路由名称
 * @returns {string} 路由路径
 */
function getRoute(routeName) {
    const config = getExtensionConfig();
    const routes = config.get("routes", {});
    return routes[routeName] || `/${routeName}`;
}

/**
 * 构建完整的API URL，支持动态参数替换
 * @param {string} path - 路由路径名称
 * @param {Object} params - 可选的动态参数对象，用于替换URL中的占位符
 * @returns {string} 完整的API URL
 */
function buildApiUrl(path, params = {}) {
    const baseUrl = getRoute("baseUrl");
    let remainingPath = getRoute(path);

    // 替换URL中的动态参数占位符
    if (params) {
        Object.keys(params).forEach((key) => {
            const placeholder = `{${key}}`;
            remainingPath = remainingPath.replace(placeholder, params[key]);
        });
    }

    const url = `${baseUrl}${remainingPath}`;
    console.log(`构建的API URL:`, url);
    return url;
}

module.exports = {
    buildApiUrl,
};
