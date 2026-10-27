"""Command line interface for RepoPilot using Typer and Rich."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Optional

import typer
from rich.console import Console

from repopilot import __version__
from repopilot.diagnostics import run_diagnostics
from repopilot.explorer import explore_repository
from repopilot.pr_check import analyze_pr
from repopilot.report import (
    render_explore_report,
    render_json,
    render_pr_check_report,
    render_report,
)
from repopilot.scanner import scan_repository

app = typer.Typer(
    name="repopilot",
    help="RepoPilot: Safe developer tool to inspect repositories, verify tooling, and get running locally.",
    no_args_is_help=True,
    add_completion=False,
)
console = Console()


def version_callback(value: bool) -> None:
    if value:
        console.print(f"[bold blue]RepoPilot[/bold blue] version [green]{__version__}[/green]")
        raise typer.Exit()


def validate_depth(value: int) -> int:
    """Ensure depth is at least 1."""
    if value < 1:
        raise typer.BadParameter("Depth must be at least 1.")
    return value


def validate_max_entries(value: int) -> int:
    """Ensure max_entries is at least 1."""
    if value < 1:
        raise typer.BadParameter("Max entries must be at least 1.")
    return value


@app.callback()
def main(
    version: Optional[bool] = typer.Option(
        None,
        "--version",
        "-v",
        help="Show RepoPilot version and exit.",
        callback=version_callback,
        is_eager=True,
    ),
) -> None:
    """RepoPilot - Safe local repository scanner and developer onboarding tool."""
    pass


@app.command(
    name="doctor",
    help="Scan a local repository to detect project type, audit common files, check tool prerequisites, and suggest next steps.",
)
def doctor(
    path: Path = typer.Argument(
        default=Path("."),
        help="Path to the repository to inspect (defaults to current directory).",
        show_default=".",
    ),
    json_output: bool = typer.Option(
        False,
        "--json",
        help="Output diagnostics report in structured JSON format.",
    ),
) -> None:
    """Execute repository scan and environment diagnostics."""
    try:
        scan_result = scan_repository(path)
        report = run_diagnostics(scan_result)

        if json_output:
            typer.echo(render_json(report))
        else:
            render_report(report, console=console)

        # Non-zero exit code if target directory was invalid, nonexistent, or inaccessible
        if not scan_result.exists or not scan_result.is_dir or not scan_result.is_accessible:
            raise typer.Exit(code=1)

    except typer.Exit:
        raise
    except Exception as exc:
        if json_output:
            typer.echo(json.dumps({"error": str(exc)}))
        else:
            console.print(f"[bold red]Unexpected Error:[/bold red] {exc}")
        raise typer.Exit(code=1)


@app.command(
    name="explore",
    help="Explore repository structure, visualize file tree, explain important files, and identify starting points.",
)
def explore(
    path: Path = typer.Argument(
        default=Path("."),
        help="Path to the repository to explore (defaults to current directory).",
        show_default=".",
    ),
    depth: int = typer.Option(
        2,
        "--depth",
        "-d",
        help="Maximum directory recursion depth (must be >= 1).",
        callback=validate_depth,
    ),
    max_entries: int = typer.Option(
        200,
        "--max-entries",
        "-m",
        help="Maximum number of file tree entries to display (must be >= 1).",
        callback=validate_max_entries,
    ),
    json_output: bool = typer.Option(
        False,
        "--json",
        help="Output repository exploration report in structured JSON format.",
    ),
) -> None:
    """Safely inspects repository architecture, file tree, and recommended onboarding points."""
    try:
        report = explore_repository(path, max_depth=depth, max_entries=max_entries)

        if json_output:
            typer.echo(render_json(report))
        else:
            render_explore_report(report, console=console)

        # Non-zero exit code if target directory was invalid, nonexistent, or inaccessible
        if not report.scan.exists or not report.scan.is_dir or not report.scan.is_accessible:
            raise typer.Exit(code=1)

    except typer.BadParameter:
        raise
    except typer.Exit:
        raise
    except Exception as exc:
        if json_output:
            typer.echo(json.dumps({"error": str(exc)}))
        else:
            console.print(f"[bold red]Unexpected Error:[/bold red] {exc}")
        raise typer.Exit(code=1)


@app.command(
    name="pr-check",
    help="Analyze Git changes relative to a base branch, detect affected areas, discover tests, and highlight gaps before opening a PR.",
)
def pr_check(
    path: Path = typer.Argument(
        default=Path("."),
        help="Path to the repository to inspect (defaults to current directory).",
        show_default=".",
    ),
    base: str = typer.Option(
        "main",
        "--base",
        "-b",
        help="Base branch to compare against (e.g. 'main' or 'master').",
    ),
    json_output: bool = typer.Option(
        False,
        "--json",
        help="Output PR Compass report in structured JSON format.",
    ),
) -> None:
    """Safely audits local Git branch changes and test coverage gaps before submitting a PR."""
    try:
        report = analyze_pr(path, base_branch=base)

        if json_output:
            typer.echo(render_json(report))
        else:
            render_pr_check_report(report, console=console)

        # Exit code 1 if Git repository not found, has no commits, or base branch missing
        if not report.git_info.is_git_repo or not report.git_info.has_commits or report.git_info.base_ref is None:
            raise typer.Exit(code=1)

    except typer.Exit:
        raise
    except Exception as exc:
        if json_output:
            typer.echo(json.dumps({"error": str(exc)}))
        else:
            console.print(f"[bold red]Unexpected Error:[/bold red] {exc}")
        raise typer.Exit(code=1)


@app.command(
    name="serve",
    help="Start the RepoPilot API server to power the developer dashboard.",
)
def serve(
    host: str = typer.Option("127.0.0.1", "--host", "-h", help="Host address to bind to."),
    port: int = typer.Option(8765, "--port", "-p", help="Port number to listen on."),
) -> None:
    """Start the lightweight HTTP API server for the web dashboard."""
    from repopilot.server import run_server

    run_server(host=host, port=port)


if __name__ == "__main__":
    app()
