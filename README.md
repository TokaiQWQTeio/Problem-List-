# ALGO INDEX · C++ 编程题库

[![Validate problem bank](https://github.com/TokaiQWQTeio/Problem-List-/actions/workflows/validate.yml/badge.svg)](https://github.com/TokaiQWQTeio/Problem-List-/actions/workflows/validate.yml)
[![Deploy website](https://github.com/TokaiQWQTeio/Problem-List-/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/TokaiQWQTeio/Problem-List-/actions/workflows/deploy-pages.yml)

一套以**算法知识点为主线**，同时按统一难度、平台原始难度、来源和完成状态组织的 C++20 编程题库。

每道题的代码与笔记只保存一份；一道题可以关联多个知识点，并通过自动生成的索引从不同分类找到。

## 在线使用

- **[浏览公开题库](https://tokaiqwqteio.github.io/Problem-List-/)**：按知识点、难度、来源和状态查找题目，阅读题解与代码。
- **[提交新题](https://problem-list-intake.acmtokaiteio.chatgpt.site/)**：使用获准的 GitHub 账号登录，通过六步表单创建题目 Pull Request。
- **修改已有题目**：在公开题库中打开题目详情，点击“修改题目”，登录后会自动载入元数据、题解、代码与测试，提交修改 Pull Request。

网页录题流程：

1. 填写题名、平台题号、来源和题目链接；
2. 选择主要及附加知识点，记录统一难度、平台原始难度和状态；
3. 编写原创摘要、输入输出说明、解题思路、正确性证明、易错点与复杂度；
4. 填写 C++20 代码；
5. 添加 1–20 组输入输出测试；
6. 预览并创建 Pull Request，等待自动检查与人工审核。

未提交的内容会自动保存在当前浏览器中。录入台不会执行用户提交的代码，也不会自动合并 Pull Request。

## 本地使用

需要 Python 3.10+。运行 C++ 测试还需要 `g++`，也可以通过 `CXX` 环境变量指定兼容编译器。

```bash
# 交互式新增题目并自动更新索引
python problem_bank.py add

# 查看与筛选题目
python problem_bank.py list
python problem_bank.py list --topic graph_theory.shortest_path --difficulty 中等

# 编译并运行测试
python problem_bank.py test <题号或目录名>

# 校验题库和生成文件
python problem_bank.py validate
python problem_bank.py index --check
```

Windows 如果没有 `python` 命令，可以改用 `py problem_bank.py ...`。完整命令说明见 [使用与维护指南](docs/GUIDE.md)。

## 目录结构

```text
.
├── problems/                 # 题目内容的唯一存储位置
│   └── 来源-题号-英文短名/
│       ├── problem.json      # 结构化元数据
│       ├── README.md         # 摘要、题解、证明与复盘
│       ├── solution.cpp      # 唯一一份 C++20 解答
│       └── tests/            # 成对的 .in / .out 测试
├── config/
│   ├── taxonomy.json         # 算法分类与知识点
│   └── submitters.json       # 网页提交者白名单
├── indexes/                  # 自动生成的分类索引
├── dist/                     # 公开题库网站与生成数据
├── submission-site/          # 题目录入台源代码
├── INDEX.md                  # 自动生成的题库总索引
└── problem_bank.py           # 跨平台题库管理命令
```

## 分类规则

- 优先按算法知识点组织，每题必须指定一个主要知识点，可以添加多个附加知识点。
- 统一难度固定为：`入门`、`简单`、`中等`、`困难`、`极难`。
- 同时保留平台自己的原始难度，例如 Codeforces 分数或 LeetCode 难度。
- 状态固定为：`待做`、`尝试中`、`已解决`、`需复习`。
- `problem.json` 是题目元数据的唯一事实来源。
- `INDEX.md`、`indexes/` 和 `dist/data.json` 均由脚本生成，不手工修改。

## Pull Request 与自动检查

从题目录入台新增或修改题目后，系统会创建 `submission/` 或 `edit/` 分支和普通 Pull Request。GitHub Actions 将自动：

1. 更新总索引、分类索引和网站数据；
2. 校验目录结构、元数据与生成文件；
3. 运行管理器单元测试；
4. 使用 C++20 编译并测试标记为“已解决”的题目。

检查通过后仍需人工审核与合并。

## 添加网页提交者

网页提交者必须同时满足两个条件：

1. 在 GitHub 仓库中拥有 **Write** 或更高权限；
2. GitHub 用户名已加入 [`config/submitters.json`](config/submitters.json) 的 `allowed_github_users`。

详细的 OAuth、会话与安全说明见 [题目录入台配置与维护](docs/INTAKE.md)。

## 相关入口

- [题库总索引](INDEX.md)
- [使用与维护指南](docs/GUIDE.md)
- [算法分类配置](config/taxonomy.json)
- [题目录入台配置与维护](docs/INTAKE.md)
