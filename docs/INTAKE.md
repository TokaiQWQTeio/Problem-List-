# 题目录入台配置与维护

“题目录入台”是题库的附属网站。它使用 GitHub OAuth 登录，只允许 `config/submitters.json` 白名单中且拥有仓库 Write 权限的账号提交。一次提交会创建题目文件、独立分支和 Pull Request，不会自动合并，也不会在后端运行 C++ 代码。

## 网站地址

- 公开题库：<https://tokaiqwqteio.github.io/Problem-List-/>
- 题目录入台：<https://algo-index-intake.crafty-chub-7591.chatgpt.site/>
- OAuth 回调：<https://algo-index-intake.crafty-chub-7591.chatgpt.site/auth/callback>

## 首次配置 GitHub OAuth

1. 打开 GitHub 的 **Settings → Developer settings → OAuth Apps → New OAuth App**。
2. Application name 填写 `ALGO INDEX 题目录入台`。
3. Homepage URL 填写上面的题目录入台地址。
4. Authorization callback URL 填写上面的 OAuth 回调地址。
5. 创建应用并生成 Client Secret。
6. 将 Client ID 保存为站点环境变量 `GITHUB_CLIENT_ID`，Client Secret 保存为机密环境变量 `GITHUB_CLIENT_SECRET`。
7. 另生成一个足够长的随机值，保存为机密环境变量 `SESSION_SECRET`。

这些值不得写入仓库、提交记录、日志或浏览器代码。`.env.local` 已加入忽略列表，只适合本地临时配置。

OAuth 请求 `public_repo read:user` 权限，用于识别账号，并代表登录者在这个公开仓库中创建分支与 Pull Request。登录会话有效期为 7 天；GitHub token 仅加密保存在服务端 D1 数据库中，浏览器只保存 `HttpOnly`、`Secure` 会话 Cookie。

## 添加提交者

1. 在 GitHub 仓库的 **Settings → Collaborators** 中邀请对方，并授予 Write 权限。
2. 将对方的 GitHub 登录名加入 `config/submitters.json` 的 `allowed_github_users` 数组。
3. 提交并发布更改。

两项条件缺一不可。白名单比较不区分大小写。

## 提交流程

录入台依次收集基本信息、知识点与难度、原创题目摘要和题解、C++20 代码、1–20 组测试，然后创建 PR。浏览器会自动保存未提交草稿，也可以手动清除。

PR 创建后，`update-submission-indexes.yml` 使用主分支中的可信管理脚本更新 `INDEX.md`、`indexes/` 和 `dist/data.json`。`validate.yml` 随后校验结构、检查生成文件，并对“已解决”题目编译和运行测试。所有检查通过后仍需人工审核和合并。

## 安全限制

- C++ 文件最多 200KB。
- 每个输入或输出最多 1MB，共 1–20 组测试。
- 整个请求最多 10MB。
- 后端只允许写入新题目的固定文件路径。
- 后端不执行提交的代码。
- 同一来源和题号以及同名题目目录会被拒绝。
- PR 不会自动合并；他人提交时会请求 `TokaiQWQTeio` 审核。
