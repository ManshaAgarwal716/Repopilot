"""Unit tests for repository exploration, structure overview, tree building, and starting points."""

from __future__ import annotations

import os
from pathlib import Path
from unittest.mock import patch

from repopilot.explorer import (
    analyze_structure,
    build_file_tree,
    detect_frameworks,
    explore_repository,
    find_starting_points,
    identify_important_files,
)
from repopilot.models import ConfidenceLevel, ProjectCategory


def test_explore_empty_directory(tmp_path: Path):
    """Empty directory should be explored safely without errors."""
    report = explore_repository(tmp_path)

    assert report.scan.exists is True
    assert report.scan.is_dir is True
    assert report.scan.category == ProjectCategory.NEITHER
    assert report.tree.total_files == 0
    assert report.tree.total_dirs == 0
    assert report.tree.truncated is False
    assert report.overview.top_level_files == []
    assert report.overview.top_level_dirs == []
    assert report.important_files == []
    assert len(report.starting_points) == 1
    assert report.starting_points[0].confidence == ConfidenceLevel.LOW


def test_explore_python_repository(tmp_path: Path):
    """Detects Python architecture, frameworks, entrypoints, and starting points."""
    pyproject_content = """
[project]
name = "my-service"
version = "0.1.0"
dependencies = [
    "fastapi>=0.100.0",
    "typer>=0.9.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0.0",
]

[project.scripts]
my-cli = "my_service.cli:main"
"""
    (tmp_path / "pyproject.toml").write_text(pyproject_content, encoding="utf-8")
    (tmp_path / "README.md").write_text("# My Service\n", encoding="utf-8")
    (tmp_path / ".gitignore").write_text(".venv/\n", encoding="utf-8")

    src_dir = tmp_path / "src" / "my_service"
    src_dir.mkdir(parents=True)
    (src_dir / "main.py").write_text("print('start')\n", encoding="utf-8")
    (src_dir / "cli.py").write_text("import typer\n", encoding="utf-8")

    tests_dir = tmp_path / "tests"
    tests_dir.mkdir()
    (tests_dir / "test_main.py").write_text("def test_ok(): pass\n", encoding="utf-8")

    report = explore_repository(tmp_path)

    assert report.scan.category == ProjectCategory.PYTHON
    assert "src" in report.overview.source_dirs
    assert "tests" in report.overview.test_dirs
    assert any("my-cli" in ep for ep in report.overview.entry_points)
    assert any("main.py" in ep for ep in report.overview.entry_points)

    # Framework detection
    assert "FastAPI (web framework)" in report.overview.recognized_frameworks
    assert "Typer (CLI framework)" in report.overview.recognized_frameworks
    assert "pytest (test framework)" in report.overview.recognized_frameworks

    # Important files explained
    imp_names = [f.path for f in report.important_files]
    assert "pyproject.toml" in imp_names
    assert "README.md" in imp_names
    assert ".gitignore" in imp_names

    # Starting points
    start_paths = [sp.path for sp in report.starting_points]
    assert "README.md" in start_paths
    assert "pyproject.toml" in start_paths
    assert "tests/" in start_paths


def test_explore_nodejs_repository(tmp_path: Path):
    """Detects Node.js architecture, frameworks, and npm scripts."""
    pkg_content = """{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "express": "^4.18.2"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  }
}"""
    (tmp_path / "package.json").write_text(pkg_content, encoding="utf-8")
    (tmp_path / "package-lock.json").write_text("{}", encoding="utf-8")
    (tmp_path / "tsconfig.json").write_text("{}", encoding="utf-8")
    (tmp_path / "README.md").write_text("# App\n", encoding="utf-8")

    src_dir = tmp_path / "src"
    src_dir.mkdir()
    (src_dir / "index.ts").write_text("console.log('run');\n", encoding="utf-8")

    report = explore_repository(tmp_path)

    assert report.scan.category == ProjectCategory.NODEJS
    assert "src" in report.overview.source_dirs
    assert any("index.ts" in ep for ep in report.overview.entry_points)

    # Frameworks
    assert "React (UI library)" in report.overview.recognized_frameworks
    assert "Express (web framework)" in report.overview.recognized_frameworks
    assert "TypeScript (typed JavaScript)" in report.overview.recognized_frameworks
    assert "Vitest (test framework)" in report.overview.recognized_frameworks

    imp_names = [f.path for f in report.important_files]
    assert "package.json" in imp_names
    assert "package-lock.json" in imp_names
    assert "tsconfig.json" in imp_names


def test_explore_mixed_repository(tmp_path: Path):
    """Detects full-stack Python + Node.js repository with Docker Compose."""
    (tmp_path / "pyproject.toml").write_text("[project]\nname='backend'\ndependencies=['flask']\n", encoding="utf-8")
    (tmp_path / "package.json").write_text('{"name": "frontend", "dependencies": {"next": "14.0.0"}}', encoding="utf-8")
    (tmp_path / "docker-compose.yml").write_text("version: '3.8'\n", encoding="utf-8")
    (tmp_path / "README.md").write_text("# Fullstack\n", encoding="utf-8")

    report = explore_repository(tmp_path)

    assert report.scan.category == ProjectCategory.BOTH
    assert "Flask (web framework)" in report.overview.recognized_frameworks
    assert "Next.js (React framework)" in report.overview.recognized_frameworks
    assert "Docker Compose (multi-service development)" in report.overview.recognized_frameworks

    start_paths = [sp.path for sp in report.starting_points]
    assert "README.md" in start_paths
    assert "docker-compose.yml" in start_paths


def test_explore_nested_source_directories(tmp_path: Path):
    """Builds tree through nested hierarchies up to specified depth."""
    nested = tmp_path / "packages" / "core" / "src" / "deep"
    nested.mkdir(parents=True)
    (nested / "file.py").write_text("x = 1\n", encoding="utf-8")

    # Depth 1: should only see packages
    tree_d1 = build_file_tree(tmp_path, max_depth=1)
    assert len(tree_d1.root.children) == 1
    assert tree_d1.root.children[0].name == "packages"
    assert len(tree_d1.root.children[0].children) == 0

    # Depth 2: should see packages/core
    tree_d2 = build_file_tree(tmp_path, max_depth=2)
    assert len(tree_d2.root.children[0].children) == 1
    assert tree_d2.root.children[0].children[0].name == "core"

    # Depth 4: should reach deep directory
    tree_d4 = build_file_tree(tmp_path, max_depth=4)
    core = tree_d4.root.children[0].children[0]
    src = core.children[0]
    assert src.name == "src"
    assert src.children[0].name == "deep"


def test_explore_ignores_forbidden_directories(tmp_path: Path):
    """Ignored directories like node_modules and .venv are strictly skipped."""
    (tmp_path / "src").mkdir()
    (tmp_path / "src" / "app.py").write_text("pass\n", encoding="utf-8")

    ignored_venv = tmp_path / ".venv" / "lib"
    ignored_venv.mkdir(parents=True)
    (ignored_venv / "forbidden.py").write_text("pass\n", encoding="utf-8")

    ignored_node = tmp_path / "node_modules" / "express"
    ignored_node.mkdir(parents=True)
    (ignored_node / "index.js").write_text("pass\n", encoding="utf-8")

    tree = build_file_tree(tmp_path, max_depth=3)
    child_names = [c.name for c in tree.root.children]

    assert ".venv" not in child_names
    assert "node_modules" not in child_names
    assert "src" in child_names


def test_explore_symbolic_links(tmp_path: Path):
    """Symbolic links are identified but never traversed recursively."""
    target_dir = tmp_path / "target_dir"
    target_dir.mkdir()
    (target_dir / "target_file.txt").write_text("data\n", encoding="utf-8")

    symlink_dir = tmp_path / "sym_dir"
    try:
        os.symlink(target_dir, symlink_dir, target_is_directory=True)
    except (OSError, NotImplementedError):
        # Skip if filesystem does not support symlinks
        return

    tree = build_file_tree(tmp_path, max_depth=3)
    sym_nodes = [c for c in tree.root.children if c.name == "sym_dir"]
    assert len(sym_nodes) == 1
    assert sym_nodes[0].is_symlink is True
    # The symlinked directory must NOT have been recursed into
    assert len(sym_nodes[0].children) == 0


def test_explore_unreadable_directories(tmp_path: Path):
    """Handles directory access permission errors gracefully."""
    sub_dir = tmp_path / "restricted"
    sub_dir.mkdir()

    real_scandir = os.scandir

    def side_effect(path_arg):
        if str(path_arg) == str(sub_dir):
            raise PermissionError("Access is denied")
        return real_scandir(path_arg)

    with patch("os.scandir", side_effect=side_effect):
        tree = build_file_tree(tmp_path, max_depth=2)
        node = next((c for c in tree.root.children if c.name == "restricted"), None)
        assert node is not None
        assert node.error is not None
        assert "Access denied" in node.error


def test_explore_entry_limit_truncation(tmp_path: Path):
    """Truncates tree and sets flag when max_entries is exceeded."""
    for i in range(15):
        (tmp_path / f"file_{i:02d}.txt").write_text("content\n", encoding="utf-8")

    tree = build_file_tree(tmp_path, max_depth=1, max_entries=5)
    assert tree.truncated is True
    assert len(tree.root.children) == 5


def test_explore_paths_with_spaces_and_unicode(tmp_path: Path):
    """Handles paths containing spaces and Unicode characters safely."""
    unicode_dir = tmp_path / "проект с пробелами 🚀"
    unicode_dir.mkdir()
    (unicode_dir / "README.md").write_text("# Тест\n", encoding="utf-8")
    (unicode_dir / "app.py").write_text("print('привет')\n", encoding="utf-8")

    report = explore_repository(unicode_dir)

    assert report.scan.exists is True
    assert report.scan.is_dir is True
    assert report.scan.category == ProjectCategory.PYTHON
    assert any("README.md" == sp.path for sp in report.starting_points)
    assert any("app.py" == c.name for c in report.tree.root.children)


def test_explore_missing_or_malformed_config_files(tmp_path: Path):
    """Malformed pyproject.toml or package.json should not crash scanner."""
    (tmp_path / "pyproject.toml").write_text("INVALID [[[ TOML SYNTAX", encoding="utf-8")
    (tmp_path / "package.json").write_text("{ unquoted json invalid }", encoding="utf-8")

    report = explore_repository(tmp_path)
    assert report.scan.exists is True
    # Should not crash, frameworks will be empty
    assert report.overview.recognized_frameworks == []
