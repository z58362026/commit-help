const { getExtensionConfig } = require("../zenTao/utils");

/**
 * 获取指定模板
 * @param {string} routeName 路由名称
 * @returns {string} 路由路径
 */
function getCommitTemp() {
    const config = getExtensionConfig();
    const temp = config.get("commitContent", "{type}: {id}-{title}");
    return temp || "{type}: {id}-{title}";
}

module.exports = {
    getCommitTemp,
};
