# 针对性行为验证

在博客前端根目录执行 `node scripts/validate-features.cjs`，验证分页边界、搜索乱序与失败状态、校验期间重复提交，以及账号切换后旧资料请求的处理。

`node scripts/validate-joint.cjs` 验证登录恢复、旧会话响应、留言上传名额和提交后的草稿保留。

脚本使用已有 TypeScript 编译器、模拟请求和浏览器存储，不连接后端，也不替代真实浏览器与数据库联调。
