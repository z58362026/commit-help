const axios = require("axios");

// 禅道 API 地址，请替换为实际地址
const ZENTAO_API_URL = "https://your-zentao-instance/api";

/**
 * 获取需求列表
 */
async function fetchRequirements() {
    try {
        const response = await axios.get(`${ZENTAO_API_URL}/requirements`);
        return response.data;
    } catch (error) {
        console.error("获取需求列表失败:", error);
        throw error;
    }
}

/**
 * 获取 Bug 列表
 */
async function fetchBugs() {
    try {
        const response = await axios.get(`${ZENTAO_API_URL}/bugs`);
        return response.data;
    } catch (error) {
        console.error("获取 Bug 列表失败:", error);
        throw error;
    }
}

module.exports = {
    fetchRequirements,
    fetchBugs,
};
