const { fetchRequirements, fetchBugs } = require("../zenTao/api");

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

module.exports = {
    formatRequirement,
    formatBug,
    processRequirements,
    processBugs,
};
