"""Terminal report formatting using Rich for RepoPilot."""

from __future__ import annotations

import json
from typing import Optional

from rich.box import ROUNDED, SIMPLE
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text

from repopilot.models import CheckStatus, DiagnosticReport, ProjectCategory


def render_report(report: DiagnosticReport, console: Optional[Console] = None) -> None:
    """Renders a formatted diagnostic report to the Rich console."""
    if console is None:
        console = Console()

    scan = report.scan

    # 1. Path errors handling
    if not scan.exists:
        console.print(
            Panel(
                f"[bold red]Scan Error:[/bold red] Repository path does not exist.\n"
                f"[yellow]Target path:[/yellow] {scan.target_path}\n"
                f"[dim]Resolved path: {scan.resolved_path}[/dim]",
                title="[bold red]RepoPilot Doctor[/bold red]",
                border_style="red",
            )
        )
        return

    if not scan.is_dir:
        console.print(
            Panel(
                f"[bold red]Scan Error:[/bold red] Target path is a file, not a directory.\n"
                f"[yellow]Target path:[/yellow] {scan.target_path}\n"
                f"[dim]Resolved path: {scan.resolved_path}[/dim]",
                title="[bold red]RepoPilot Doctor[/bold red]",
                border_style="red",
            )
        )
        return

    if not scan.is_accessible:
        console.print(
            Panel(
                f"[bold red]Access Error:[/bold red] Cannot access repository directory.\n"
                f"[yellow]Details:[/yellow] {scan.error_message}\n"
                f"[dim]Resolved path: {scan.resolved_path}[/dim]",
                title="[bold red]RepoPilot Doctor[/bold red]",
                border_style="red",
            )
        )
        return

    # Header Panel
    category_labels = {
        ProjectCategory.PYTHON: "[bold green]Python Project[/bold green]",
        ProjectCategory.NODEJS: "[bold green]Node.js Project[/bold green]",
        ProjectCategory.BOTH: "[bold cyan]Full-Stack Project (Python & Node.js)[/bold cyan]",
        ProjectCategory.NEITHER: "[bold yellow]Unrecognized / Generic Project[/bold yellow]",
    }
    category_text = category_labels.get(scan.category, "[yellow]Unknown[/yellow]")

    header_body = (
        f"[bold]Target Repository:[/bold] [cyan]{scan.resolved_path}[/cyan]\n"
        f"[bold]Detected Type:[/bold] {category_text}"
    )
    console.print(
        Panel(
            header_body,
            title="[bold blue]RepoPilot Doctor — Repository Diagnostics[/bold blue]",
            border_style="blue",
            box=ROUNDED,
        )
    )

    # 2. Project Files Audit Table
    files_table = Table(
        title="Common Project Files Audit",
        box=ROUNDED,
        header_style="bold magenta",
        title_style="bold",
        show_lines=False,
    )
    files_table.add_column("Category", style="cyan", width=18)
    files_table.add_column("File / Directory", style="bold", width=22)
    files_table.add_column("Status", width=16)
    files_table.add_column("Description", style="dim")

    for fc in scan.file_checks:
        if fc.status == CheckStatus.FOUND:
            status_str = "[bold green]✔ Found[/bold green]"
        elif fc.status == CheckStatus.MISSING:
            status_str = "[yellow]✘ Missing[/yellow]"
        else:
            status_str = "[dim]○ Not checked[/dim]"

        name_display = f"{fc.name}/" if fc.is_directory else fc.name
        files_table.add_row(fc.category, name_display, status_str, fc.description)

    console.print(files_table)

    # 3. Environment & Tools Table
    if report.tools:
        tools_table = Table(
            title="Development Environment Tools",
            box=ROUNDED,
            header_style="bold magenta",
            title_style="bold",
            show_lines=False,
        )
        tools_table.add_column("Tool", style="cyan", width=12)
        tools_table.add_column("Command", style="dim", width=18)
        tools_table.add_column("Status", width=16)
        tools_table.add_column("Version / Details")

        for tool in report.tools:
            if tool.installed:
                status_str = "[bold green]✔ Available[/bold green]"
                ver_display = f"[bold]{tool.version}[/bold]" if tool.version else "Installed"
            else:
                if tool.required:
                    status_str = "[bold red]✘ Missing[/bold red]"
                else:
                    status_str = "[yellow]Not installed[/yellow]"
                ver_display = f"[dim]{tool.details or 'Not found in PATH'}[/dim]"

            tools_table.add_row(tool.name, tool.command, status_str, ver_display)

        console.print(tools_table)

    # 4. Suggested Next Steps
    if report.next_steps:
        steps_text = Text()
        step_num = 1
        for step in report.next_steps:
            if step.startswith("  "):
                # Code snippet / indented command
                steps_text.append(f"    {step.strip()}\n", style="bold green")
            else:
                steps_text.append(f"{step_num}. {step}\n", style="white")
                step_num += 1

        console.print(
            Panel(
                steps_text,
                title="[bold green]Suggested Next Steps[/bold green]",
                border_style="green",
                box=ROUNDED,
            )
        )

    # Footer Safety Reassurance
    console.print(
        "[dim]Safety note: RepoPilot inspected files and environment tools in read-only mode.\n"
        "No repository files were modified, no scripts executed, and no credentials accessed.[/dim]\n"
    )


def render_json(report: DiagnosticReport) -> str:
    """Serializes the report to a deterministic, formatted JSON string."""
    return json.dumps(report.to_dict(), indent=2, sort_keys=True)
