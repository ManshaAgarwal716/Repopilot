"""Lightweight HTTP API Server for RepoPilot.

Connects the Python diagnostic and exploration engine directly to the developer dashboard
with real repository cloning, live filesystem traversal, and local command execution.
"""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from typing import Any, Optional
from urllib.parse import parse_qs, urlparse

from repopilot import __version__
from repopilot.diagnostics import run_diagnostics
from repopilot.explorer import explore_repository
from repopilot.models import (
    DiagnosticReport,
    ExploreReport,
    PRCheckReport,
    TreeNode,
)
from repopilot.pr_check import analyze_pr
from repopilot.scanner import scan_repository

DEFAULT_PORT = 8765
DEFAULT_HOST = "127.0.0.1"
CACHE_DIR = Path.home() / ".cache" / "repopilot" / "repos"


def get_cache_dir() -> Path:
    """Ensure and return repository cache directory."""
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    return CACHE_DIR


def parse_git_target(target: str) -> tuple[bool, str, str]:
    """Determine if target is a remote Git repository or local filesystem path.

    Returns:
        (is_remote, clean_name, clone_url_or_path)
    """
    target = target.strip()

    # Match https://github.com/owner/repo or git@github.com:...
    url_match = re.match(r"(?:https?://|git@)github\.com[/:]([\w.-]+)/([\w.-]+?)(?:\.git)?$", target, re.IGNORECASE)
    if url_match:
        owner, repo = url_match.group(1), url_match.group(2)
        return True, f"{owner}_{repo}", f"https://github.com/{owner}/{repo}.git"

    # Match shorthand owner/repo
    shorthand_match = re.match(r"^([\w.-]+)/([\w.-]+?)(?:\.git)?$", target)
    if shorthand_match and not target.startswith((".", "/")):
        owner, repo = shorthand_match.group(1), shorthand_match.group(2)
        return True, f"{owner}_{repo}", f"https://github.com/{owner}/{repo}.git"

    # Otherwise local path
    return False, Path(target).name or "local", target


def resolve_repository_path(target: str) -> tuple[Path, Optional[str]]:
    """Resolve target to a real filesystem directory, cloning remote repositories if necessary."""
    is_remote, name_slug, clone_url = parse_git_target(target)

    if is_remote:
        cache_base = get_cache_dir()
        repo_dir = cache_base / name_slug

        if repo_dir.exists() and (repo_dir / ".git").exists():
            return repo_dir, None

        # Clone shallowly
        try:
            cmd = ["git", "clone", "--depth", "1", clone_url, str(repo_dir)]
            proc = subprocess.run(cmd, capture_output=True, text=True, timeout=60, check=False)
            if proc.returncode != 0:
                # If error, try cleaning corrupted folder
                if repo_dir.exists():
                    shutil.rmtree(repo_dir, ignore_errors=True)
                return repo_dir, f"Git clone failed: {proc.stderr.strip() or proc.stdout.strip()}"
            return repo_dir, None
        except Exception as exc:
            if repo_dir.exists():
                shutil.rmtree(repo_dir, ignore_errors=True)
            return repo_dir, f"Failed to clone remote repository: {exc}"
    else:
        local_path = Path(target).expanduser().resolve()
        if not local_path.exists():
            return local_path, f"Path does not exist: {local_path}"
        if not local_path.is_dir():
            return local_path, f"Path is not a directory: {local_path}"
        return local_path, None


def serialize_tree_node(node: TreeNode) -> dict[str, Any]:
    """Serialize Python TreeNode to Frontend expected schema."""
    return {
        "name": node.name,
        "path": node.rel_path,
        "isDirectory": node.is_dir,
        "isSymlink": node.is_symlink,
        "symlinkTarget": node.target_symlink,
        "children": [serialize_tree_node(c) for c in node.children] if node.children else [],
    }


def serialize_doctor_report(report: DiagnosticReport) -> dict[str, Any]:
    """Serialize DiagnosticReport into frontend format."""
    return {
        "targetPath": report.scan.target_path,
        "resolvedPath": report.scan.resolved_path,
        "category": report.scan.category.value,
        "projectTypes": report.scan.project_types,
        "fileChecks": [
            {
                "name": fc.name,
                "category": fc.category,
                "status": fc.status.value,
                "description": fc.description,
                "isDirectory": fc.is_directory,
                "details": fc.details,
            }
            for fc in report.scan.file_checks
        ],
        "tools": [
            {
                "name": t.name,
                "command": t.command,
                "installed": t.installed,
                "version": t.version,
                "required": t.required,
                "details": t.details,
            }
            for t in report.tools
        ],
        "nextSteps": report.next_steps,
    }


def serialize_explorer_report(report: ExploreReport) -> dict[str, Any]:
    """Serialize ExplorerReport into frontend format."""
    return {
        "overview": {
            "sourceDirs": report.overview.source_dirs,
            "testDirs": report.overview.test_dirs,
            "docFiles": report.overview.doc_dirs,
            "likelyEntryPoints": report.overview.entry_points,
            "recognizedFrameworks": report.overview.recognized_frameworks,
            "keyConfigFiles": report.overview.config_files,
        },
        "treeRoot": serialize_tree_node(report.tree.root),
        "totalEntries": report.tree.total_files + report.tree.total_dirs,
        "truncated": report.tree.truncated,
        "maxDepth": report.tree.max_depth,
        "startingPoints": [
            {
                "path": sp.path,
                "confidence": sp.confidence.value,
                "rationale": sp.reason,
            }
            for sp in report.starting_points
        ],
        "importantFiles": [
            {
                "path": ifile.path,
                "role": ifile.role,
                "description": ifile.description,
            }
            for ifile in report.important_files
        ],
    }


def serialize_pr_compass_report(report: PRCheckReport) -> dict[str, Any]:
    """Serialize PRCheckReport into frontend format."""
    return {
        "currentBranch": report.git_info.current_branch or "main",
        "baseBranch": report.git_info.base_branch,
        "baseRef": report.git_info.base_ref,
        "comparisonRange": report.git_info.comparison_range,
        "hasCommits": report.git_info.has_commits,
        "uncommitted": {
            "hasUncommitted": report.uncommitted.has_uncommitted,
            "stagedCount": report.uncommitted.staged_count,
            "unstagedCount": report.uncommitted.unstaged_count,
            "untrackedCount": report.uncommitted.untracked_count,
            "stagedFiles": report.uncommitted.staged_files,
            "unstagedFiles": report.uncommitted.unstaged_files,
            "untrackedFiles": report.uncommitted.untracked_files,
        },
        "branchChanges": [
            {
                "path": c.path,
                "changeType": c.change_type.value,
                "oldPath": c.old_path,
                "affectedArea": c.affected_area,
                "statusLabel": c.status_label,
            }
            for c in report.branch_changes
        ],
        "summary": report.summary,
        "affectedAreas": report.affected_areas,
        "testAnalysis": {
            "framework": report.test_analysis.framework,
            "suggestedCommand": report.test_analysis.suggested_command,
            "mappings": [
                {
                    "changedFile": m.changed_file,
                    "relatedTests": m.related_tests,
                    "hasPotentialGap": m.has_potential_gap,
                    "note": m.note,
                }
                for m in report.test_analysis.mappings
            ],
            "potentialGapsCount": report.test_analysis.potential_gaps_count,
            "testsExecuted": report.test_analysis.tests_executed,
        },
        "warnings": report.warnings,
    }


class RepoPilotHandler(BaseHTTPRequestHandler):
    """HTTP Request Handler for RepoPilot API."""

    def _set_cors_headers(self, status: int = 200, content_type: str = "application/json") -> None:
        self.send_response(status)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Content-Type", content_type)
        self.end_headers()

    def do_OPTIONS(self) -> None:  # noqa: N802
        self._set_cors_headers(204)

    def do_GET(self) -> None:  # noqa: N802
        parsed_url = urlparse(self.path)
        path = parsed_url.path

        if path == "/api/health":
            self._set_cors_headers(200)
            self.wfile.write(json.dumps({"status": "ok", "version": __version__}).encode("utf-8"))
            return

        self._set_cors_headers(404)
        self.wfile.write(json.dumps({"error": f"Endpoint not found: {path}"}).encode("utf-8"))

    def do_POST(self) -> None:  # noqa: N802
        parsed_url = urlparse(self.path)
        path = parsed_url.path

        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body_bytes = self.rfile.read(content_length) if content_length > 0 else b"{}"
            payload = json.loads(body_bytes.decode("utf-8")) if body_bytes else {}
        except Exception as exc:
            self._set_cors_headers(400)
            self.wfile.write(json.dumps({"error": f"Invalid JSON payload: {exc}"}).encode("utf-8"))
            return

        if path == "/api/inspect":
            target = payload.get("target", ".").strip()
            if not target:
                target = "."

            repo_path, err = resolve_repository_path(target)
            if err:
                self._set_cors_headers(400)
                self.wfile.write(json.dumps({"success": False, "error": err}).encode("utf-8"))
                return

            try:
                # 1. Doctor Scan & Diagnostics
                scan_res = scan_repository(repo_path)
                doctor_rep = run_diagnostics(scan_res)

                # 2. Explorer File Tree & Starting Points
                explorer_rep = explore_repository(repo_path, max_depth=3, max_entries=250)

                # 3. PR Compass
                pr_rep = analyze_pr(repo_path, base_branch="main")

                response_data = {
                    "success": True,
                    "target": target,
                    "resolvedPath": str(repo_path),
                    "name": repo_path.name,
                    "doctor": serialize_doctor_report(doctor_rep),
                    "explorer": serialize_explorer_report(explorer_rep),
                    "prCompass": serialize_pr_compass_report(pr_rep),
                }

                self._set_cors_headers(200)
                self.wfile.write(json.dumps(response_data).encode("utf-8"))
            except Exception as exc:
                self._set_cors_headers(500)
                self.wfile.write(json.dumps({"success": False, "error": str(exc)}).encode("utf-8"))
            return

        if path == "/api/terminal":
            command = payload.get("command", "").strip()
            target = payload.get("target", ".")
            repo_path, _ = resolve_repository_path(target)
            cwd = str(repo_path) if repo_path.exists() and repo_path.is_dir() else "."

            if not command:
                self._set_cors_headers(400)
                self.wfile.write(json.dumps({"error": "No command provided."}).encode("utf-8"))
                return

            try:
                proc = subprocess.run(command, shell=True, capture_output=True, text=True, cwd=cwd, timeout=30)
                res = {
                    "command": command,
                    "stdout": proc.stdout,
                    "stderr": proc.stderr,
                    "exitCode": proc.returncode,
                }
                self._set_cors_headers(200)
                self.wfile.write(json.dumps(res).encode("utf-8"))
            except subprocess.TimeoutExpired:
                self._set_cors_headers(408)
                self.wfile.write(json.dumps({"error": "Command execution timed out after 30 seconds."}).encode("utf-8"))
            except Exception as exc:
                self._set_cors_headers(500)
                self.wfile.write(json.dumps({"error": str(exc)}).encode("utf-8"))
            return

        self._set_cors_headers(404)
        self.wfile.write(json.dumps({"error": f"Endpoint not found: {path}"}).encode("utf-8"))

    def log_message(self, format: str, *args: Any) -> None:  # noqa: A002
        """Custom minimal logging to keep terminal tidy."""
        pass


def run_server(host: str = DEFAULT_HOST, port: int = DEFAULT_PORT) -> None:
    """Start the RepoPilot HTTP server."""
    server_address = (host, port)
    httpd = HTTPServer(server_address, RepoPilotHandler)
    print(f"RepoPilot API Server listening on http://{host}:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down RepoPilot API Server...")
        httpd.server_close()


if __name__ == "__main__":
    run_server()
