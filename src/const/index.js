const ERROE_PASSWORD_ARR = [
    ...Array.from({ length: 10 }, (_, i) => `您还有${i + 1}次尝试机会。`),
    "登录失败，请检查您的用户名或密码是否填写正确。",
];

module.exports = {
    ERROE_PASSWORD_ARR,
};
