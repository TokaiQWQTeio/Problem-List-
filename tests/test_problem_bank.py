import json
import tempfile
import unittest
from pathlib import Path

import problem_bank as bank


class ProblemBankTests(unittest.TestCase):
    def test_normalize_output_ignores_only_trailing_whitespace(self):
        self.assertEqual(bank.normalize_output("1  \n2\n\n"), ["1", "2"])
        self.assertNotEqual(bank.normalize_output(" 1\n"), bank.normalize_output("1\n"))

    def test_slugify_is_cross_platform_safe(self):
        self.assertEqual(bank.slugify("Two_Sum Example!", "name"), "two-sum-example")
        with self.assertRaises(bank.BankError):
            bank.slugify("中文", "name")

    def test_index_generation_and_validation_for_multi_topic_problem(self):
        old_values = (bank.ROOT, bank.PROBLEMS_DIR, bank.INDEXES_DIR, bank.TAXONOMY_FILE)
        try:
            with tempfile.TemporaryDirectory() as temporary:
                root = Path(temporary)
                bank.ROOT = root
                bank.PROBLEMS_DIR = root / "problems"
                bank.INDEXES_DIR = root / "indexes"
                bank.TAXONOMY_FILE = root / "config" / "taxonomy.json"
                bank.PROBLEMS_DIR.mkdir(parents=True)
                bank.INDEXES_DIR.mkdir()
                bank.TAXONOMY_FILE.parent.mkdir()
                taxonomy = {
                    "categories": [
                        {
                            "id": "graph",
                            "name": "图论",
                            "topics": [
                                {"id": "graph.shortest", "name": "最短路"},
                                {"id": "graph.dp", "name": "图上 DP"},
                            ],
                        }
                    ]
                }
                bank.TAXONOMY_FILE.write_text(
                    json.dumps(taxonomy, ensure_ascii=False), encoding="utf-8"
                )
                directory = bank.PROBLEMS_DIR / "codeforces-1a-example"
                (directory / "tests").mkdir(parents=True)
                metadata = {
                    "schema_version": 1,
                    "slug": directory.name,
                    "title": "示例题",
                    "problem_id": "1A",
                    "url": "https://example.com",
                    "source": {"id": "codeforces", "name": "Codeforces"},
                    "difficulty": {"unified": "简单", "original": "800"},
                    "primary_topic": "graph.shortest",
                    "topics": ["graph.shortest", "graph.dp"],
                    "status": "待做",
                    "cpp_standard": "C++20",
                    "time_limit_seconds": 2,
                    "created_at": "2026-01-01",
                }
                (directory / "problem.json").write_text(
                    json.dumps(metadata, ensure_ascii=False), encoding="utf-8"
                )
                problem = dict(metadata, _dir=directory)
                _, topic_map = bank.load_taxonomy()
                (directory / "README.md").write_text(
                    bank.initial_problem_readme(problem, topic_map), encoding="utf-8"
                )
                (directory / "solution.cpp").write_text("int main(){}\n", encoding="utf-8")
                (directory / "tests" / "sample1.in").write_text("", encoding="utf-8")
                (directory / "tests" / "sample1.out").write_text("", encoding="utf-8")

                loaded = bank.load_problems()[0]
                self.assertEqual(bank.validate_problem(loaded, set(topic_map), {}), [])
                self.assertTrue(bank.write_indexes())
                self.assertTrue(bank.write_indexes(check=True))
                index = (root / "INDEX.md").read_text(encoding="utf-8")
                self.assertEqual(index.count("[示例题]"), 2)
                self.assertEqual(len(list(bank.PROBLEMS_DIR.iterdir())), 1)
        finally:
            bank.ROOT, bank.PROBLEMS_DIR, bank.INDEXES_DIR, bank.TAXONOMY_FILE = old_values


if __name__ == "__main__":
    unittest.main()
