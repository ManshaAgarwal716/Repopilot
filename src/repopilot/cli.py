"""Command line interface for RepoPilot using Typer and Rich."""

from __future__ import annotations

from pathlib import Path
from typing import Optional

import typer
from rich.console import Console

from repopilot import __version__
from repopilot.diagnostics import run_diagnostics
from repopilot.report import render_json, render_report
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
            typer.echo(f'{{"error": "{str(exc)}"}}')
        else:
            console.print(f"[bold red]Unexpected Error:[/bold red] {exc}")
        raise typer.Exit(code=1)


if __name__ == "__main__":
    app()
