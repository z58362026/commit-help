const vscode = require("vscode");
const { fetchRequirements, fetchBugs } = require("../zenTao/api");

/**
 * 终端自动补全功能，提供需求和 Bug 的补全建议
 */
function setupAutocomplete() {
    const requirements = fetchRequirements();
    const bugs = fetchBugs();

    const suggestions = [];

    requirements.forEach((req) => {
        suggestions.push({
            label: req.id,
            kind: vscode.CompletionItemKind.Text,
            detail: req.description,
            documentation: `Requirement: ${req.description}`,
        });
    });

    bugs.forEach((bug) => {
        suggestions.push({
            label: bug.id,
            kind: vscode.CompletionItemKind.Text,
            detail: bug.description,
            documentation: `Bug: ${bug.description}`,
        });
    });

    // 注册补全提供器
    vscode.languages.registerCompletionItemProvider("plaintext", {
        provideCompletionItems(document, position) {
            return suggestions;
        },
    });
}

module.exports = {
    setupAutocomplete,
};
