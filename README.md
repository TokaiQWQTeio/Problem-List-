# C++ 编程题库

这是一套以**算法知识点为主线**，同时按难度、来源和状态组织的 C++20 编程题库。
每道题的代码和笔记只保存一份，多知识点分类由自动生成的索引完成。

## 快速开始

环境要求：Python 3.10+；运行题目测试还需要 `g++`（或通过 `CXX` 环境变量指定兼容编译器）。

```bash
python problem_bank.py add
python problem_bank.py list
python problem_bank.py test <题号或目录名>
python problem_bank.py validate
```

Windows 如果没有 `python` 命令，可以使用 `py problem_bank.py ...`。

## 浏览题库

- [题库总索引](INDEX.md)
- [使用与维护指南](docs/GUIDE.md)
- [算法分类配置](config/taxonomy.json)
- [题库网站](dist/index.html)
- [题目录入台配置与维护](docs/INTAKE.md)

## 题目录入台

获准的 GitHub 协作者可以在“题目录入台”中填写完整题目信息、C++20 解法和测试数据。系统会为每道新题创建独立分支和普通 Pull Request；GitHub Actions 自动更新索引并执行结构校验、编译与测试，最终仍由人工审核合并。

提交者白名单位于 `config/submitters.json`。新增使用者时，还需要在 GitHub 仓库中授予其 Write 权限。

## 设计原则

- `problems/` 是题目内容的唯一存储位置。
- `problem.json` 是每道题结构化信息的唯一事实来源。
- `INDEX.md` 与 `indexes/` 均由命令生成，不手工修改。
- 一道题可以属于多个知识点，但必须指定一个主要知识点。
- 统一难度固定为：入门、简单、中等、困难、极难。
- 状态固定为：待做、尝试中、已解决、需复习。
- 网站数据也由 `python problem_bank.py index` 同步生成。
