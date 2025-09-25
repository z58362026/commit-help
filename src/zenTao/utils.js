const vscode = require("vscode");

/**
 * 格式化需求
 */
function formatRequirement(requirement) {
    return `${requirement.id}: ${requirement.title}`;
}

/**
 * 格式化 Bug
 */
function formatBug(bug) {
    return `${bug.id}: ${bug.title}`;
}

/**
 * 批量处理需求
 */
function processRequirements(requirements) {
    return requirements.map(formatRequirement);
}

/**
 * 批量处理 Bug
 */
function processBugs(bugs) {
    return bugs.map(formatBug);
}

/**
 * 获取扩展配置
 * @returns {Object} 扩展配置对象
 */
function getExtensionConfig() {
    return vscode.workspace.getConfiguration("commit-helper");
}

module.exports = {
    formatRequirement,
    formatBug,
    processRequirements,
    processBugs,
    getExtensionConfig,
};
