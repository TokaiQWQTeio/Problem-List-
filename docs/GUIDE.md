# 使用与维护指南

## 新增题目

运行：

```bash
python problem_bank.py add
```

命令会交互式询问题名、题号、链接、来源、主要及附加知识点、统一难度、平台原始难度、状态和超时时间，并创建：

```text
problems/来源-题号-英文短名/
├── problem.json       # 结构化元数据
├── README.md          # 题目、思路、证明、易错点与复杂度笔记
├── solution.cpp       # C++20 解答
└── tests/
    ├── sample1.in
    └── sample1.out
```

目录名只使用小写 ASCII 字母、数字和连字符，格式为 `来源-题号-英文短名`。中文题名记录在元数据和题目文档中。

## 管理命令

```bash
# 查看全部题目
python problem_bank.py list

# 筛选；参数可组合
python problem_bank.py list --topic graph_theory.shortest_path --difficulty 中等
python problem_bank.py list --source Codeforces --status 已解决

# 交互式修改元数据
python problem_bank.py edit <题号或目录名>

# 重新生成索引
python problem_bank.py index

# 检查索引是否为最新，但不修改文件
python problem_bank.py index --check

# 校验题库结构与数据
python problem_bank.py validate

# 测试单题或全部已解决题目
python problem_bank.py test <题号或目录名>
python problem_bank.py test --all-solved
```

题目标识可以使用完整目录名；若题号或英文短名能唯一匹配，也可以直接使用。匹配不唯一时工具会提示候选项。

## 测试规则

- 测试文件必须在题目的 `tests/` 目录中成对出现，如 `sample1.in` 与 `sample1.out`。
- 默认使用 `g++ -std=c++20 -O2 -Wall -Wextra` 编译。
- 可通过环境变量 `CXX` 指定其他兼容编译器。
- 比较输出时忽略每行末尾空白和文件末尾空行，其他内容严格比较。
- 每题超时时间记录在 `problem.json` 中，也可在运行时通过 `--timeout` 临时覆盖。

## 扩展算法分类

编辑 `config/taxonomy.json`，为分类或知识点添加唯一、稳定的英文 `id` 和中文 `name`，然后运行：

```bash
python problem_bank.py validate
python problem_bank.py index
```

已有知识点的 `id` 不应随意修改，否则旧题元数据会失去对应分类。

## 索引与持续集成

`INDEX.md` 是按知识点优先组织的总索引；`indexes/` 包含每个一级知识点的页面以及难度、来源、状态和统计汇总。每次新增或编辑题目后，管理工具会自动更新它们。

GitHub Actions 会在每次推送和拉取请求时：

1. 校验题库结构与元数据；
2. 确认生成索引没有过期；
3. 使用 C++20 编译并测试所有标记为“已解决”的题目。

