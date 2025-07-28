// 需求类型定义
interface Requirement {
    id: number;
    title: string;
    description: string;
    status: string;
}

// Bug 类型定义
interface Bug {
    id: number;
    title: string;
    description: string;
    severity: string;
    status: string;
}

// 禅道 API 类型定义
interface ZenTaoAPI {
    fetchRequirements(): Promise<Requirement[]>;
    fetchBugs(): Promise<Bug[]>;
}

// 剪切板数据类型定义
interface ClipboardData {
    ids: number[];
    descriptions: string[];
}

// 提交数据类型定义
interface CommitSubmission {
    message: string;
    requirements: Requirement[];
    bugs: Bug[];
}

// commit-helper 模块声明
declare module "commit-helper" {
    export function createVisualList(): void;
    export function submitCommit(data: CommitSubmission): Promise<void>;
    export function copyToClipboard(data: ClipboardData): void;
    export function setupAutocomplete(): void;
}
