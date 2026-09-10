#!/usr/bin/env python3
"""Cross-platform manager for the C++ problem bank (standard library only)."""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from typing import Any, Iterable


ROOT = Path(__file__).resolve().parent
PROBLEMS_DIR = ROOT / "problems"
INDEXES_DIR = ROOT / "indexes"
TAXONOMY_FILE = ROOT / "config" / "taxonomy.json"
DIFFICULTIES = ["入门", "简单", "中等", "困难", "极难"]
STATUSES = ["待做", "尝试中", "已解决", "需复习"]
SOURCES = [
    ("codeforces", "Codeforces"),
    ("luogu", "洛谷"),
    ("leetcode", "LeetCode"),
    ("atcoder", "AtCoder"),
    ("nowcoder", "牛客"),
    ("acwing", "AcWing"),
    ("poj", "POJ"),
    ("hdu", "HDU"),
]
META_START = "<!-- METADATA:START -->"
META_END = "<!-- METADATA:END -->"


class BankError(Exception):
    """A user-facing problem-bank error."""


def read_json(path: Path) -> dict[str, Any]:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise BankError(f"缺少文件：{path.relative_to(ROOT)}") from exc
    except json.JSONDecodeError as exc:
        raise BankError(
            f"JSON 格式错误：{path.relative_to(ROOT)}:{exc.lineno}:{exc.colno}"
        ) from exc


def write_json(path: Path, data: dict[str, Any]) -> None:
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def load_taxonomy() -> tuple[list[dict[str, Any]], dict[str, dict[str, str]]]:
    data = read_json(TAXONOMY_FILE)
    categories = data.get("categories")
    if not isinstance(categories, list):
        raise BankError("config/taxonomy.json 缺少 categories 数组")
    topic_map: dict[str, dict[str, str]] = {}
    for category in categories:
        for topic in category.get("topics", []):
            topic_map[topic["id"]] = {
                "name": topic["name"],
                "category_id": category["id"],
                "category_name": category["name"],
            }
    return categories, topic_map


def load_problems() -> list[dict[str, Any]]:
    problems: list[dict[str, Any]] = []
    if not PROBLEMS_DIR.exists():
        return problems
    for directory in sorted(PROBLEMS_DIR.iterdir(), key=lambda p: p.name.casefold()):
        if directory.is_dir() and not directory.name.startswith("."):
            metadata = read_json(directory / "problem.json")
            metadata["_dir"] = directory
            problems.append(metadata)
    return problems


def slugify(value: str, field: str) -> str:
    slug = value.strip().lower().replace("_", "-")
    slug = re.sub(r"[^a-z0-9-]+", "-", slug)
    slug = re.sub(r"-+", "-", slug).strip("-")
    if not slug:
        raise BankError(f"{field} 必须包含 ASCII 字母或数字")
    return slug


def safe_id(value: str) -> str:
    return slugify(value, "题号")


def markdown_text(value: Any) -> str:
    return str(value or "—").replace("|", "\\|").replace("\n", " ")


def topic_names(problem: dict[str, Any], topic_map: dict[str, dict[str, str]]) -> str:
    return "、".join(topic_map.get(t, {"name": t})["name"] for t in problem["topics"])


def metadata_block(problem: dict[str, Any], topic_map: dict[str, dict[str, str]]) -> str:
    primary = topic_map.get(problem["primary_topic"], {"name": problem["primary_topic"]})
    source = problem["source"]
    difficulty = problem["difficulty"]
    link = f"[打开题目]({problem['url']})" if problem.get("url") else "—"
    rows = [
        ("来源", source["name"]),
        ("题号", problem["problem_id"]),
        ("题目链接", link),
        ("主要知识点", primary["name"]),
        ("全部知识点", topic_names(problem, topic_map)),
        ("统一难度", difficulty["unified"]),
        ("平台原始难度", difficulty.get("original") or "—"),
        ("状态", problem["status"]),
        ("语言标准", problem.get("cpp_standard", "C++20")),
        ("运行超时", f"{problem.get('time_limit_seconds', 2)} 秒"),
    ]
    lines = [META_START, "", "| 属性 | 内容 |", "|---|---|"]
    lines.extend(f"| {name} | {markdown_text(value)} |" for name, value in rows)
    lines.extend(["", META_END])
    return "\n".join(lines)


def initial_problem_readme(problem: dict[str, Any], topic_map: dict[str, dict[str, str]]) -> str:
    return f"""# {problem['title']}

{metadata_block(problem, topic_map)}

## 题目描述

<!-- 在这里填写题目描述或摘要。 -->

## 输入格式

<!-- 在这里填写输入格式。 -->

## 输出格式

<!-- 在这里填写输出格式。 -->

## 解题思路

<!-- 说明核心观察、算法步骤和选择该方法的原因。 -->

## 正确性证明

<!-- 说明算法为什么一定能得到正确答案。 -->

## 易错点与复盘

<!-- 记录边界条件、错误思路和实现陷阱。 -->

## 复杂度

- 时间复杂度：`O(?)`
- 空间复杂度：`O(?)`

## 测试说明

<!-- 记录样例之外的重要边界测试。 -->
"""


def refresh_problem_readme(problem: dict[str, Any], topic_map: dict[str, dict[str, str]]) -> None:
    path = problem["_dir"] / "README.md"
    if not path.exists():
        path.write_text(initial_problem_readme(problem, topic_map), encoding="utf-8")
        return
    content = path.read_text(encoding="utf-8")
    start = content.find(META_START)
    end = content.find(META_END)
    if start < 0 or end < 0 or end < start:
        raise BankError(f"{path.relative_to(ROOT)} 缺少完整的元数据标记")
    end += len(META_END)
    first_line_end = content.find("\n")
    if first_line_end >= 0 and content.startswith("# "):
        content = f"# {problem['title']}" + content[first_line_end:]
        start = content.find(META_START)
        end = content.find(META_END) + len(META_END)
    updated = content[:start] + metadata_block(problem, topic_map) + content[end:]
    path.write_text(updated, encoding="utf-8")


def solution_template(title: str) -> str:
    return f"""// {title}
// C++20

#include <iostream>

using namespace std;

int main() {{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    // TODO: implement solution

    return 0;
}}
"""


def prompt_required(label: str, default: str | None = None) -> str:
    while True:
        suffix = f" [{default}]" if default else ""
        value = input(f"{label}{suffix}: ").strip()
        if value:
            return value
        if default is not None:
            return default
        print("此项不能为空。")


def prompt_optional(label: str, default: str = "") -> str:
    shown = f" [{default}]" if default else ""
    value = input(f"{label}{shown}: ").strip()
    return value if value else default


def choose_one(label: str, values: list[str], default: str | None = None) -> str:
    for number, value in enumerate(values, 1):
        marker = "（默认）" if value == default else ""
        print(f"  {number:>2}. {value}{marker}")
    while True:
        raw = input(f"{label}: ").strip()
        if not raw and default is not None:
            return default
        if raw.isdigit() and 1 <= int(raw) <= len(values):
            return values[int(raw) - 1]
        if raw in values:
            return raw
        print("请输入有效的编号或名称。")


def numbered_topics(
    categories: list[dict[str, Any]],
) -> tuple[list[str], dict[str, str]]:
    ids: list[str] = []
    names: dict[str, str] = {}
    number = 1
    for category in categories:
        print(f"\n{category['name']}：")
        for topic in category["topics"]:
            print(f"  {number:>2}. {topic['name']} ({topic['id']})")
            ids.append(topic["id"])
            names[topic["id"]] = topic["name"]
            number += 1
    return ids, names


def parse_topic_choices(raw: str, ids: list[str]) -> list[str]:
    selected: list[str] = []
    for item in (part.strip() for part in raw.split(",")):
        if not item:
            continue
        if item.isdigit() and 1 <= int(item) <= len(ids):
            topic_id = ids[int(item) - 1]
        elif item in ids:
            topic_id = item
        else:
            raise BankError(f"未知知识点：{item}")
        if topic_id not in selected:
            selected.append(topic_id)
    return selected


def choose_topics(
    categories: list[dict[str, Any]],
    current_primary: str | None = None,
    current_topics: list[str] | None = None,
) -> tuple[str, list[str]]:
    ids, _ = numbered_topics(categories)
    while True:
        primary_prompt = "主要知识点编号或 ID"
        if current_primary:
            primary_prompt += f" [{current_primary}]"
        raw = input(f"\n{primary_prompt}: ").strip()
        if not raw and current_primary:
            primary = current_primary
            break
        try:
            chosen = parse_topic_choices(raw, ids)
            if len(chosen) != 1:
                raise BankError("主要知识点必须且只能选择一个")
            primary = chosen[0]
            break
        except BankError as exc:
            print(exc)
    current_extra = [t for t in (current_topics or []) if t != primary]
    hint = ",".join(current_extra)
    raw = input(
        f"附加知识点编号或 ID（逗号分隔，可留空）"
        + (f" [{hint}]" if hint else "")
        + ": "
    ).strip()
    if not raw and current_topics is not None:
        extras = current_extra
    else:
        while True:
            try:
                extras = parse_topic_choices(raw, ids)
                break
            except BankError as exc:
                print(exc)
                raw = input("请重新输入附加知识点: ").strip()
    return primary, [primary] + [topic for topic in extras if topic != primary]


def choose_source(current: dict[str, str] | None = None) -> dict[str, str]:
    labels = [name for _, name in SOURCES] + ["其他"]
    default = current["name"] if current and current["name"] in labels else None
    chosen = choose_one("来源", labels, default)
    if chosen == "其他":
        name = prompt_required("自定义来源名称", current["name"] if current else None)
        source_id = slugify(prompt_required("来源英文标识"), "来源英文标识")
        return {"id": source_id, "name": name}
    source_id = next(item_id for item_id, name in SOURCES if name == chosen)
    return {"id": source_id, "name": chosen}


def parse_timeout(value: str) -> float:
    try:
        timeout = float(value)
    except ValueError as exc:
        raise BankError("超时时间必须是数字") from exc
    if timeout <= 0:
        raise BankError("超时时间必须大于 0")
    return timeout


def command_add(_: argparse.Namespace) -> int:
    categories, topic_map = load_taxonomy()
    print("新增题目（长篇内容稍后在生成的 README.md 中填写）\n")
    title = prompt_required("题目名称")
    problem_id = prompt_required("平台题号")
    english_name = prompt_required("英文短名（如 two-sum）")
    url = prompt_optional("题目链接（可留空）")
    source = choose_source()
    primary, topics = choose_topics(categories)
    difficulty = choose_one("统一难度", DIFFICULTIES, "中等")
    original = prompt_optional("平台原始难度（可留空）")
    status = choose_one("状态", STATUSES, "待做")
    while True:
        try:
            timeout = parse_timeout(prompt_optional("运行超时（秒）", "2"))
            break
        except BankError as exc:
            print(exc)

    folder_name = f"{source['id']}-{safe_id(problem_id)}-{slugify(english_name, '英文短名')}"
    directory = PROBLEMS_DIR / folder_name
    if directory.exists():
        raise BankError(f"题目目录已存在：{directory.relative_to(ROOT)}")
    for existing in load_problems():
        if (
            existing["source"]["id"].casefold() == source["id"].casefold()
            and str(existing["problem_id"]).casefold() == problem_id.casefold()
        ):
            raise BankError(
                f"同一来源和题号已存在：{existing['_dir'].relative_to(ROOT)}"
            )

    problem: dict[str, Any] = {
        "schema_version": 1,
        "slug": folder_name,
        "title": title,
        "problem_id": problem_id,
        "url": url,
        "source": source,
        "difficulty": {"unified": difficulty, "original": original},
        "primary_topic": primary,
        "topics": topics,
        "status": status,
        "cpp_standard": "C++20",
        "time_limit_seconds": timeout,
        "created_at": date.today().isoformat(),
        "_dir": directory,
    }
    serializable = {key: value for key, value in problem.items() if not key.startswith("_")}
    try:
        json.dumps(serializable, ensure_ascii=False).encode("utf-8")
    except UnicodeEncodeError as exc:
        raise BankError("输入包含无法保存为 UTF-8 的字符，请检查终端编码") from exc
    directory.mkdir(parents=True)
    tests_dir = directory / "tests"
    tests_dir.mkdir()
    write_json(directory / "problem.json", serializable)
    (directory / "README.md").write_text(
        initial_problem_readme(problem, topic_map), encoding="utf-8"
    )
    (directory / "solution.cpp").write_text(solution_template(title), encoding="utf-8")
    (tests_dir / "sample1.in").write_text("", encoding="utf-8")
    (tests_dir / "sample1.out").write_text("", encoding="utf-8")
    write_indexes()
    print(f"\n已创建：{directory.relative_to(ROOT)}")
    print("请填写 README.md、solution.cpp 和 tests/ 中的样例。")
    return 0


def resolve_problem(target: str, problems: list[dict[str, Any]]) -> dict[str, Any]:
    lowered = target.casefold()
    exact = [
        p
        for p in problems
        if p["_dir"].name.casefold() == lowered
        or str(p["problem_id"]).casefold() == lowered
    ]
    if len(exact) == 1:
        return exact[0]
    partial = [
        p
        for p in problems
        if lowered in p["_dir"].name.casefold() or lowered in p["title"].casefold()
    ]
    if len(partial) == 1:
        return partial[0]
    if not exact and not partial:
        raise BankError(f"找不到题目：{target}")
    matches = exact or partial
    candidates = "、".join(p["_dir"].name for p in matches)
    raise BankError(f"题目标识不唯一，请使用完整目录名：{candidates}")


def command_edit(args: argparse.Namespace) -> int:
    categories, topic_map = load_taxonomy()
    problem = resolve_problem(args.target, load_problems())
    print(f"编辑 {problem['_dir'].name}（直接回车保留当前值）\n")
    problem["title"] = prompt_required("题目名称", problem["title"])
    problem["url"] = prompt_optional("题目链接", problem.get("url", ""))
    primary, topics = choose_topics(
        categories, problem["primary_topic"], problem["topics"]
    )
    problem["primary_topic"] = primary
    problem["topics"] = topics
    problem["difficulty"]["unified"] = choose_one(
        "统一难度", DIFFICULTIES, problem["difficulty"]["unified"]
    )
    problem["difficulty"]["original"] = prompt_optional(
        "平台原始难度", problem["difficulty"].get("original", "")
    )
    problem["status"] = choose_one("状态", STATUSES, problem["status"])
    while True:
        try:
            problem["time_limit_seconds"] = parse_timeout(
                prompt_optional(
                    "运行超时（秒）", str(problem.get("time_limit_seconds", 2))
                )
            )
            break
        except BankError as exc:
            print(exc)
    serializable = {key: value for key, value in problem.items() if not key.startswith("_")}
    write_json(problem["_dir"] / "problem.json", serializable)
    refresh_problem_readme(problem, topic_map)
    write_indexes()
    print("元数据与索引已更新。")
    return 0


def problem_row(problem: dict[str, Any], link_prefix: str, topic_map: dict[str, dict[str, str]]) -> str:
    directory = problem["_dir"].name
    link = f"{link_prefix}problems/{directory}/README.md"
    original = problem["difficulty"].get("original") or "—"
    return (
        f"| [{markdown_text(problem['title'])}]({link}) | "
        f"{markdown_text(problem['source']['name'])} | "
        f"{markdown_text(problem['problem_id'])} | "
        f"{markdown_text(problem['difficulty']['unified'])} | "
        f"{markdown_text(original)} | {markdown_text(problem['status'])} | "
        f"{markdown_text(topic_names(problem, topic_map))} |"
    )


TABLE_HEADER = (
    "| 题目 | 来源 | 题号 | 统一难度 | 原始难度 | 状态 | 知识点 |\n"
    "|---|---|---|---|---|---|---|"
)


def table_for(
    problems: Iterable[dict[str, Any]], link_prefix: str, topic_map: dict[str, dict[str, str]]
) -> str:
    items = sorted(problems, key=lambda p: p["_dir"].name.casefold())
    if not items:
        return "_暂无题目。_"
    return TABLE_HEADER + "\n" + "\n".join(
        problem_row(problem, link_prefix, topic_map) for problem in items
    )


def generated_header(title: str) -> list[str]:
    return [
        f"# {title}",
        "",
        "> 此文件由 `python problem_bank.py index` 自动生成，请勿手工修改。",
        "",
    ]


def build_indexes() -> dict[Path, str]:
    categories, topic_map = load_taxonomy()
    problems = load_problems()
    files: dict[Path, str] = {}

    root_lines = generated_header("题库总索引")
    root_lines.extend(
        [
            f"共 **{len(problems)}** 道题。主索引按算法知识点组织；一道题可出现在多个知识点下，但内容只保存一份。",
            "",
            "## 分类入口",
            "",
        ]
    )
    root_lines.extend(
        f"- [{category['name']}](indexes/{category['id']}.md)"
        for category in categories
    )
    root_lines.extend(
        [
            "- [按难度](indexes/by-difficulty.md)",
            "- [按来源](indexes/by-source.md)",
            "- [按状态](indexes/by-status.md)",
            "- [统计](indexes/statistics.md)",
            "",
            "## 按知识点浏览",
            "",
        ]
    )

    for category in categories:
        category_lines = generated_header(category["name"])
        category_lines.extend(["[返回总索引](../INDEX.md)", ""])
        category_has_problems = False
        root_lines.extend([f"### {category['name']}", ""])
        for topic in category["topics"]:
            matched = [p for p in problems if topic["id"] in p["topics"]]
            if matched:
                category_has_problems = True
                root_lines.extend([f"#### {topic['name']}", "", table_for(matched, "", topic_map), ""])
                category_lines.extend(
                    [f"## {topic['name']}", "", table_for(matched, "../", topic_map), ""]
                )
        if not category_has_problems:
            root_lines.extend(["_暂无题目。_", ""])
            category_lines.extend(["_暂无题目。_", ""])
        files[INDEXES_DIR / f"{category['id']}.md"] = "\n".join(category_lines).rstrip() + "\n"
    files[ROOT / "INDEX.md"] = "\n".join(root_lines).rstrip() + "\n"

    secondary_specs = [
        ("按难度", "by-difficulty.md", DIFFICULTIES, lambda p, v: p["difficulty"]["unified"] == v),
        (
            "按来源",
            "by-source.md",
            sorted({p["source"]["name"] for p in problems}, key=str.casefold),
            lambda p, v: p["source"]["name"] == v,
        ),
        ("按状态", "by-status.md", STATUSES, lambda p, v: p["status"] == v),
    ]
    for title, filename, values, predicate in secondary_specs:
        lines = generated_header(title)
        lines.extend(["[返回总索引](../INDEX.md)", ""])
        if not values:
            lines.extend(["_暂无题目。_", ""])
        for value in values:
            matched = [p for p in problems if predicate(p, value)]
            lines.extend([f"## {value}", "", table_for(matched, "../", topic_map), ""])
        files[INDEXES_DIR / filename] = "\n".join(lines).rstrip() + "\n"

    category_counts = Counter(
        topic_map[topic]["category_name"]
        for problem in problems
        for topic in set(problem["topics"])
        if topic in topic_map
    )
    difficulty_counts = Counter(p["difficulty"]["unified"] for p in problems)
    source_counts = Counter(p["source"]["name"] for p in problems)
    status_counts = Counter(p["status"] for p in problems)
    stats = generated_header("题库统计")
    stats.extend(["[返回总索引](../INDEX.md)", "", f"题目总数：**{len(problems)}**", ""])
    for heading, values in [
        ("知识点分类", [(c["name"], category_counts[c["name"]]) for c in categories]),
        ("统一难度", [(v, difficulty_counts[v]) for v in DIFFICULTIES]),
        ("来源", sorted(source_counts.items(), key=lambda item: item[0].casefold())),
        ("状态", [(v, status_counts[v]) for v in STATUSES]),
    ]:
        stats.extend([f"## {heading}", "", "| 分类 | 数量 |", "|---|---:|"])
        stats.extend(f"| {markdown_text(name)} | {count} |" for name, count in values)
        stats.append("")
    files[INDEXES_DIR / "statistics.md"] = "\n".join(stats).rstrip() + "\n"
    return files


def write_indexes(check: bool = False) -> bool:
    files = build_indexes()
    stale: list[Path] = []
    for path, content in files.items():
        existing = path.read_text(encoding="utf-8") if path.exists() else None
        if existing != content:
            stale.append(path)
            if not check:
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(content, encoding="utf-8")
    if check and stale:
        print("以下生成索引不是最新状态：")
        for path in stale:
            print(f"  - {path.relative_to(ROOT)}")
        return False
    if not check:
        print(f"已生成 {len(files)} 个索引文件。")
    return True


def command_index(args: argparse.Namespace) -> int:
    return 0 if write_indexes(args.check) else 1


def command_list(args: argparse.Namespace) -> int:
    _, topic_map = load_taxonomy()
    problems = load_problems()
    if args.topic:
        problems = [p for p in problems if args.topic in p["topics"]]
    if args.difficulty:
        problems = [p for p in problems if p["difficulty"]["unified"] == args.difficulty]
    if args.source:
        value = args.source.casefold()
        problems = [
            p for p in problems
            if value in {p["source"]["id"].casefold(), p["source"]["name"].casefold()}
        ]
    if args.status:
        problems = [p for p in problems if p["status"] == args.status]
    if not problems:
        print("没有符合条件的题目。")
        return 0
    print(f"共 {len(problems)} 道题：")
    for problem in sorted(problems, key=lambda p: p["_dir"].name.casefold()):
        print(
            f"- {problem['_dir'].name}: {problem['title']} | "
            f"{problem['difficulty']['unified']} | {problem['source']['name']} | "
            f"{problem['status']} | {topic_names(problem, topic_map)}"
        )
    return 0


def normalize_output(value: str) -> list[str]:
    lines = [line.rstrip() for line in value.replace("\r\n", "\n").replace("\r", "\n").split("\n")]
    while lines and lines[-1] == "":
        lines.pop()
    return lines


def compiler_path() -> str:
    requested = os.environ.get("CXX", "g++")
    compiler = shutil.which(requested)
    if not compiler:
        raise BankError(
            f"找不到 C++ 编译器“{requested}”。请安装 g++，或用 CXX 环境变量指定编译器。"
        )
    return compiler


def test_problem(problem: dict[str, Any], compiler: str, timeout_override: float | None) -> bool:
    directory: Path = problem["_dir"]
    build_dir = ROOT / ".build" / directory.name
    build_dir.mkdir(parents=True, exist_ok=True)
    executable = build_dir / ("solution.exe" if os.name == "nt" else "solution")
    compile_command = [
        compiler,
        "-std=c++20",
        "-O2",
        "-Wall",
        "-Wextra",
        str(directory / "solution.cpp"),
        "-o",
        str(executable),
    ]
    print(f"\n[{directory.name}] 编译中……")
    compiled = subprocess.run(compile_command, text=True, capture_output=True)
    if compiled.returncode != 0:
        print("编译失败：")
        print(compiled.stderr.rstrip())
        return False
    input_files = sorted((directory / "tests").glob("*.in"))
    timeout = timeout_override or float(problem.get("time_limit_seconds", 2))
    passed = 0
    for input_path in input_files:
        expected_path = input_path.with_suffix(".out")
        if not expected_path.exists():
            print(f"  FAIL {input_path.name}：缺少 {expected_path.name}")
            continue
        try:
            result = subprocess.run(
                [str(executable)],
                input=input_path.read_text(encoding="utf-8"),
                text=True,
                capture_output=True,
                timeout=timeout,
            )
        except subprocess.TimeoutExpired:
            print(f"  FAIL {input_path.name}：超过 {timeout:g} 秒")
            continue
        if result.returncode != 0:
            print(f"  FAIL {input_path.name}：程序退出码 {result.returncode}")
            if result.stderr:
                print("    " + result.stderr.strip().replace("\n", "\n    "))
            continue
        expected = expected_path.read_text(encoding="utf-8")
        if normalize_output(result.stdout) == normalize_output(expected):
            passed += 1
            print(f"  PASS {input_path.name}")
        else:
            print(f"  FAIL {input_path.name}：输出不匹配")
            print(f"    期望：{expected.rstrip()!r}")
            print(f"    实际：{result.stdout.rstrip()!r}")
    print(f"  结果：{passed}/{len(input_files)} 组通过")
    return passed == len(input_files) and bool(input_files)


def command_test(args: argparse.Namespace) -> int:
    problems = load_problems()
    if args.all_solved:
        selected = [p for p in problems if p["status"] == "已解决"]
        if not selected:
            print("没有标记为“已解决”的题目，跳过编译测试。")
            return 0
    else:
        selected = [resolve_problem(args.target, problems)]
    compiler = compiler_path()
    results = [test_problem(problem, compiler, args.timeout) for problem in selected]
    return 0 if all(results) else 1


def validate_taxonomy() -> list[str]:
    errors: list[str] = []
    data = read_json(TAXONOMY_FILE)
    categories = data.get("categories", [])
    category_ids: set[str] = set()
    topic_ids: set[str] = set()
    for category in categories:
        category_id = category.get("id")
        if not category_id or category_id in category_ids:
            errors.append(f"算法分类 ID 缺失或重复：{category_id!r}")
        category_ids.add(category_id)
        if not category.get("name"):
            errors.append(f"算法分类缺少名称：{category_id!r}")
        for topic in category.get("topics", []):
            topic_id = topic.get("id")
            if not topic_id or topic_id in topic_ids:
                errors.append(f"知识点 ID 缺失或重复：{topic_id!r}")
            topic_ids.add(topic_id)
            if not topic.get("name"):
                errors.append(f"知识点缺少名称：{topic_id!r}")
    if not categories:
        errors.append("算法分类不能为空")
    return errors


def validate_problem(
    problem: dict[str, Any], topic_ids: set[str], seen_keys: dict[tuple[str, str], str]
) -> list[str]:
    errors: list[str] = []
    directory: Path = problem["_dir"]
    label = str(directory.relative_to(ROOT))
    required = [
        "schema_version", "slug", "title", "problem_id", "source", "difficulty",
        "primary_topic", "topics", "status", "cpp_standard", "time_limit_seconds",
    ]
    for field in required:
        if field not in problem:
            errors.append(f"{label}: 缺少字段 {field}")
    if errors:
        return errors
    if not isinstance(problem["source"], dict):
        errors.append(f"{label}: source 必须是对象")
    if not isinstance(problem["difficulty"], dict):
        errors.append(f"{label}: difficulty 必须是对象")
    if not isinstance(problem["topics"], list):
        errors.append(f"{label}: topics 必须是数组")
    if errors:
        return errors
    if problem["slug"] != directory.name:
        errors.append(f"{label}: slug 必须与目录名一致")
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", directory.name):
        errors.append(f"{label}: 目录名只能包含小写 ASCII 字母、数字和连字符")
    if problem["difficulty"].get("unified") not in DIFFICULTIES:
        errors.append(f"{label}: 无效统一难度")
    if problem["status"] not in STATUSES:
        errors.append(f"{label}: 无效状态")
    if problem["cpp_standard"] != "C++20":
        errors.append(f"{label}: cpp_standard 必须为 C++20")
    topics = problem["topics"]
    if not isinstance(topics, list) or not topics:
        errors.append(f"{label}: topics 必须是非空数组")
    else:
        if len(topics) != len(set(topics)):
            errors.append(f"{label}: topics 存在重复项")
        if problem["primary_topic"] not in topics:
            errors.append(f"{label}: primary_topic 必须包含在 topics 中")
        for topic in topics:
            if topic not in topic_ids:
                errors.append(f"{label}: 未知知识点 {topic}")
    try:
        if float(problem["time_limit_seconds"]) <= 0:
            raise ValueError
    except (TypeError, ValueError):
        errors.append(f"{label}: time_limit_seconds 必须是正数")
    source = problem["source"]
    if not isinstance(source, dict) or not source.get("id") or not source.get("name"):
        errors.append(f"{label}: source 必须包含 id 和 name")
    else:
        key = (source["id"].casefold(), str(problem["problem_id"]).casefold())
        if key in seen_keys:
            errors.append(f"{label}: 与 {seen_keys[key]} 的来源和题号重复")
        else:
            seen_keys[key] = label
    for filename in ["README.md", "solution.cpp"]:
        if not (directory / filename).is_file():
            errors.append(f"{label}: 缺少 {filename}")
    readme = directory / "README.md"
    if readme.is_file():
        content = readme.read_text(encoding="utf-8")
        if META_START not in content or META_END not in content:
            errors.append(f"{label}: README.md 缺少元数据标记")
    tests_dir = directory / "tests"
    if not tests_dir.is_dir():
        errors.append(f"{label}: 缺少 tests 目录")
    else:
        input_stems = {p.stem for p in tests_dir.glob("*.in")}
        output_stems = {p.stem for p in tests_dir.glob("*.out")}
        if not input_stems:
            errors.append(f"{label}: 至少需要一组 .in/.out 测试")
        for stem in sorted(input_stems - output_stems):
            errors.append(f"{label}: {stem}.in 缺少对应的 {stem}.out")
        for stem in sorted(output_stems - input_stems):
            errors.append(f"{label}: {stem}.out 缺少对应的 {stem}.in")
    return errors


def command_validate(_: argparse.Namespace) -> int:
    errors = validate_taxonomy()
    if errors:
        print(f"校验失败，共 {len(errors)} 个问题：")
        for error in errors:
            print(f"  - {error}")
        return 1
    _, topic_map = load_taxonomy()
    seen_keys: dict[tuple[str, str], str] = {}
    try:
        problems = load_problems()
    except BankError as exc:
        errors.append(str(exc))
        problems = []
    for problem in problems:
        errors.extend(validate_problem(problem, set(topic_map), seen_keys))
    if errors:
        print(f"校验失败，共 {len(errors)} 个问题：")
        for error in errors:
            print(f"  - {error}")
        return 1
    print(f"校验通过：{len(problems)} 道题，未发现结构或元数据问题。")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="以算法知识点为主线的跨平台 C++20 题库管理工具"
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    add_parser = subparsers.add_parser("add", help="交互式新增题目")
    add_parser.set_defaults(func=command_add)

    edit_parser = subparsers.add_parser("edit", help="交互式修改题目元数据")
    edit_parser.add_argument("target", help="题号、目录名或可唯一匹配的名称")
    edit_parser.set_defaults(func=command_edit)

    list_parser = subparsers.add_parser("list", help="列出和筛选题目")
    list_parser.add_argument("--topic", help="知识点 ID")
    list_parser.add_argument("--difficulty", choices=DIFFICULTIES, help="统一难度")
    list_parser.add_argument("--source", help="来源 ID 或名称")
    list_parser.add_argument("--status", choices=STATUSES, help="状态")
    list_parser.set_defaults(func=command_list)

    index_parser = subparsers.add_parser("index", help="生成全部索引")
    index_parser.add_argument("--check", action="store_true", help="仅检查索引是否最新")
    index_parser.set_defaults(func=command_index)

    test_parser = subparsers.add_parser("test", help="编译并运行测试")
    target_group = test_parser.add_mutually_exclusive_group(required=True)
    target_group.add_argument("target", nargs="?", help="题号、目录名或可唯一匹配的名称")
    target_group.add_argument("--all-solved", action="store_true", help="测试全部已解决题目")
    test_parser.add_argument("--timeout", type=float, help="临时覆盖运行超时（秒）")
    test_parser.set_defaults(func=command_test)

    validate_parser = subparsers.add_parser("validate", help="校验题库结构和元数据")
    validate_parser.set_defaults(func=command_validate)
    return parser


def main() -> int:
    try:
        args = build_parser().parse_args()
        if getattr(args, "timeout", None) is not None and args.timeout <= 0:
            raise BankError("--timeout 必须大于 0")
        return args.func(args)
    except BankError as exc:
        print(f"错误：{exc}", file=sys.stderr)
        return 2
    except KeyboardInterrupt:
        print("\n操作已取消。", file=sys.stderr)
        return 130


if __name__ == "__main__":
    raise SystemExit(main())
