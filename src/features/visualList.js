const vscode = require("vscode");
const { fetchRequirements, fetchBugs, ensureToken, fetchProducts, fetchProjects } = require("../zenTao/api");
const { formatRequirement, formatBug } = require("../zenTao/utils");
const { getProjects, saveProjects, getProducts, saveProducts } = require("../store/index");
const { getList } = require("../ui/selectProjectAndProduct");

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

    // 获取产品和项目列表
    const result = await fetchProductsAndProjects({ context, token });
    if (!result) {
        vscode.window.showErrorMessage("无法获取产品和项目列表，无法显示需求和 Bug 列表。");
        return;
    }

    await getList(context);
}

module.exports = {
    createVisualList,
};
