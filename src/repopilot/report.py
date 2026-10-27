"""Terminal report formatting using Rich for RepoPilot."""

from __future__ import annotations

import json
from typing import Any, Optional

from rich.box import ROUNDED
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from rich.tree import Tree

from repopilot.models import (
    ChangeType,
    CheckStatus,
    ConfidenceLevel,
    DiagnosticReport,
    ExploreReport,
    PRCheckReport,
    ProjectCategory,
    TreeNode,
)


def _render_scan_errors(scan: Any, console: Console, title: str) -> bool:
    """Helper to render path existence, directory, and permission errors."""
    if not scan.exists:
        console.print(
            Panel(
                f"[bold red]Scan Error:[/bold red] Repository path does not exist.\n"
                f"[yellow]Target path:[/yellow] {scan.target_path}\n"
                f"[dim]Resolved path: {scan.resolved_path}[/dim]",
                title=f"[bold red]{title}[/bold red]",
                border_style="red",
            )
        )
        return True

    if not scan.is_dir:
        console.print(
            Panel(
                f"[bold red]Scan Error:[/bold red] Target path is a file, not a directory.\n"
                f"[yellow]Target path:[/yellow] {scan.target_path}\n"
                f"[dim]Resolved path: {scan.resolved_path}[/dim]",
                title=f"[bold red]{title}[/bold red]",
                border_style="red",
            )
        )
        return True

    if not scan.is_accessible:
        console.print(
            Panel(
                f"[bold red]Access Error:[/bold red] Cannot access repository directory.\n"
                f"[yellow]Details:[/yellow] {scan.error_message}\n"
                f"[dim]Resolved path: {scan.resolved_path}[/dim]",
                title=f"[bold red]{title}[/bold red]",
                border_style="red",
            )
        )
        return True

    return False


def render_report(report: DiagnosticReport, console: Optional[Console] = None) -> None:
    """Renders a formatted diagnostic report to the Rich console."""
    if console is None:
        console = Console()

    scan = report.scan
    if _render_scan_errors(scan, console, "RepoPilot Doctor"):
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


def _populate_rich_tree(rich_branch: Tree, tree_node: TreeNode) -> None:
    """Recursively adds child nodes to a Rich Tree object."""
    for child in tree_node.children:
        if child.is_dir:
            if child.error:
                label = f"[bold red]📁 {child.name}/ [error: {child.error}][/bold red]"
                rich_branch.add(label)
            elif child.is_symlink:
                target = child.target_symlink or "symlink"
                label = f"[italic cyan]📁 {child.name}/ -> {target} (symlink)[/italic cyan]"
                rich_branch.add(label)
            else:
                label = f"[bold blue]📁 {child.name}/[/bold blue]"
                sub_branch = rich_branch.add(label)
                _populate_rich_tree(sub_branch, child)
        else:
            if child.is_symlink:
                target = child.target_symlink or "symlink"
                label = f"[italic cyan]📄 {child.name} -> {target}[/italic cyan]"
            else:
                label = f"📄 {child.name}"
            rich_branch.add(label)


def render_explore_report(report: ExploreReport, console: Optional[Console] = None) -> None:
    """Renders a comprehensive exploration report with structure, tree, and starting points."""
    if console is None:
        console = Console()

    scan = report.scan
    if _render_scan_errors(scan, console, "RepoPilot Explorer"):
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
        f"[bold]Detected Type:[/bold] {category_text}\n"
        f"[bold]Tree Scope:[/bold] {report.tree.total_files} files, {report.tree.total_dirs} directories "
        f"(max depth: {report.tree.max_depth}, entry limit: {report.tree.max_entries})"
    )
    console.print(
        Panel(
            header_body,
            title="[bold blue]RepoPilot Explorer — Codebase Structure & Onboarding[/bold blue]",
            border_style="blue",
            box=ROUNDED,
        )
    )

    overview = report.overview

    # 1. Structure Overview Table
    struct_table = Table(
        title="Repository Structure Overview",
        box=ROUNDED,
        header_style="bold magenta",
        title_style="bold",
        show_lines=False,
    )
    struct_table.add_column("Component", style="cyan", width=22)
    struct_table.add_column("Identified Elements", style="white")

    source_display = ", ".join(f"[bold]{d}/[/bold]" for d in overview.source_dirs) if overview.source_dirs else "[dim]None identified (code at root or non-standard)[/dim]"
    struct_table.add_row("Source Directories", source_display)

    test_display = ", ".join(f"[bold]{d}/[/bold]" for d in overview.test_dirs) if overview.test_dirs else "[dim]None identified[/dim]"
    struct_table.add_row("Test Directories", test_display)

    doc_display = ", ".join(f"[bold]{d}/[/bold]" for d in overview.doc_dirs) if overview.doc_dirs else "[dim]None identified[/dim]"
    struct_table.add_row("Documentation", doc_display)

    entry_display = "\n".join(overview.entry_points) if overview.entry_points else "[dim]None identified[/dim]"
    struct_table.add_row("Likely Entry Points", entry_display)

    config_display = ", ".join(overview.config_files) if overview.config_files else "[dim]None identified[/dim]"
    struct_table.add_row("Key Config Files", config_display)

    framework_display = ", ".join(overview.recognized_frameworks) if overview.recognized_frameworks else "[dim]None detected from manifests[/dim]"
    struct_table.add_row("Recognized Frameworks", framework_display)

    console.print(struct_table)

    # 2. Suggested Starting Points Table
    if report.starting_points:
        start_table = Table(
            title="Suggested Starting Points for Exploration",
            box=ROUNDED,
            header_style="bold magenta",
            title_style="bold",
            show_lines=False,
        )
        start_table.add_column("File / Path", style="bold cyan", width=24)
        start_table.add_column("Confidence", width=16)
        start_table.add_column("Why to Inspect First", style="white")

        for sp in report.starting_points:
            if sp.confidence == ConfidenceLevel.HIGH:
                conf_badge = "[bold green]High[/bold green]"
            elif sp.confidence == ConfidenceLevel.MEDIUM:
                conf_badge = "[yellow]Medium[/yellow]"
            else:
                conf_badge = "[dim]Low[/dim]"

            start_table.add_row(sp.path, conf_badge, sp.reason)

        console.print(start_table)
        console.print("[dim]Note: Suggestions are inferred from conventions; inspect files to confirm actual roles.[/dim]\n")

    # 3. Important Files Explained Table
    if report.important_files:
        files_table = Table(
            title="Important Project Files Explained",
            box=ROUNDED,
            header_style="bold magenta",
            title_style="bold",
            show_lines=False,
        )
        files_table.add_column("File / Directory", style="bold cyan", width=24)
        files_table.add_column("Role", style="magenta", width=18)
        files_table.add_column("Description", style="white")

        for f_exp in report.important_files:
            files_table.add_row(f_exp.path, f_exp.role, f_exp.description)

        console.print(files_table)

    # 4. File-Tree Visualization
    tree_root_label = f"[bold green]📁 {report.tree.root.name}/[/bold green] [dim]({scan.resolved_path})[/dim]"
    rich_tree = Tree(tree_root_label)
    _populate_rich_tree(rich_tree, report.tree.root)

    if report.tree.truncated:
        rich_tree.add(
            f"[bold yellow]... additional entries omitted (--max-entries limit of {report.tree.max_entries} reached)[/bold yellow]"
        )

    console.print(
        Panel(
            rich_tree,
            title="[bold blue]Repository Directory Tree[/bold blue]",
            border_style="blue",
            box=ROUNDED,
        )
    )

    # Footer Safety Reassurance
    console.print(
        "[dim]Safety note: RepoPilot inspected filenames and structure only. "
        "No repository scripts were executed and no secrets accessed.[/dim]\n"
    )


def render_pr_check_report(report: PRCheckReport, console: Optional[Console] = None) -> None:
    """Renders a formatted pre-PR diagnostic report to the Rich console."""
    if console is None:
        console = Console()

    git_info = report.git_info

    # 1. Error for non-git repositories
    if not git_info.is_git_repo:
        console.print(
            Panel(
                f"[bold red]Git Error:[/bold red] {git_info.error_message}",
                title="[bold red]RepoPilot PR Compass[/bold red]",
                border_style="red",
                box=ROUNDED,
            )
        )
        return

    # Notice for repositories without commits
    if not git_info.has_commits:
        console.print(
            Panel(
                f"[bold yellow]Git Notice:[/bold yellow] {git_info.error_message}",
                title="[bold yellow]RepoPilot PR Compass[/bold yellow]",
                border_style="yellow",
                box=ROUNDED,
            )
        )
        return

    # Header Panel
    status_badge = (
        "[bold yellow]⚠ Uncommitted Changes in Working Tree[/bold yellow]"
        if report.uncommitted.has_uncommitted
        else "[bold green]✔ Clean Working Tree[/bold green]"
    )
    comp_range = git_info.comparison_range or "[yellow]N/A (base branch not resolved)[/yellow]"

    header_body = (
        f"[bold]Current Branch:[/bold] [cyan]{git_info.current_branch}[/cyan]\n"
        f"[bold]Base Branch:[/bold] [cyan]{git_info.base_branch}[/cyan] [dim]({git_info.base_ref or 'unresolved'})[/dim]\n"
        f"[bold]Comparison Range:[/bold] [white]{comp_range}[/white]\n"
        f"[bold]Working Tree Status:[/bold] {status_badge}\n"
        f"[bold]Committed Changes:[/bold] {report.summary.get('total', 0)} files changed "
        f"([green]+{report.summary.get('added', 0)} added[/green], "
        f"[yellow]~{report.summary.get('modified', 0)} modified[/yellow], "
        f"[red]-{report.summary.get('deleted', 0)} deleted[/red], "
        f"[cyan]{report.summary.get('renamed', 0)} renamed[/cyan])"
    )

    console.print(
        Panel(
            header_body,
            title="[bold blue]RepoPilot PR Compass — Pre-PR Diagnostic Report[/bold blue]",
            border_style="blue",
            box=ROUNDED,
        )
    )

    # Base branch missing warning
    if git_info.base_ref is None and git_info.error_message:
        console.print(
            Panel(
                f"[bold yellow]Warning:[/bold yellow] {git_info.error_message}",
                border_style="yellow",
                box=ROUNDED,
            )
        )

    # 2. Committed Branch Changes Table
    if report.branch_changes:
        changes_table = Table(
            title=f"Committed Branch Changes (vs '{git_info.base_branch}')",
            box=ROUNDED,
            header_style="bold magenta",
            title_style="bold",
            show_lines=False,
        )
        changes_table.add_column("Type", width=12)
        changes_table.add_column("File Path", style="bold", width=34)
        changes_table.add_column("Affected Area", style="cyan", width=24)
        changes_table.add_column("Details", style="dim")

        for change in report.branch_changes:
            if change.change_type == ChangeType.ADDED:
                badge = "[bold green]Added[/bold green]"
                det = "New file in branch"
            elif change.change_type == ChangeType.MODIFIED:
                badge = "[bold yellow]Modified[/bold yellow]"
                det = "Existing file modified"
            elif change.change_type == ChangeType.DELETED:
                badge = "[bold red]Deleted[/bold red]"
                det = "File removed"
            elif change.change_type == ChangeType.RENAMED:
                badge = "[bold cyan]Renamed[/bold cyan]"
                det = f"From: {change.old_path}"
            else:
                badge = "[white]Copied[/white]"
                det = f"From: {change.old_path}"

            changes_table.add_row(badge, change.path, change.affected_area, det)

        console.print(changes_table)
    elif git_info.base_ref is not None:
        console.print(
            Panel(
                "[dim]No committed differences between the current branch and the selected base branch.[/dim]",
                title="[bold]Committed Branch Changes[/bold]",
                border_style="dim",
                box=ROUNDED,
            )
        )

    # 3. Uncommitted Working Tree Notice
    if report.uncommitted.has_uncommitted:
        uncommitted_table = Table(
            title="Uncommitted Working Tree Changes",
            box=ROUNDED,
            header_style="bold magenta",
            title_style="bold",
            show_lines=False,
        )
        uncommitted_table.add_column("Category", style="cyan", width=14)
        uncommitted_table.add_column("Count", width=8)
        uncommitted_table.add_column("Files")

        unc = report.uncommitted
        if unc.staged_files:
            uncommitted_table.add_row("[green]Staged[/green]", str(unc.staged_count), ", ".join(unc.staged_files[:5]) + (f" (+{len(unc.staged_files)-5} more)" if len(unc.staged_files) > 5 else ""))
        if unc.unstaged_files:
            uncommitted_table.add_row("[yellow]Unstaged[/yellow]", str(unc.unstaged_count), ", ".join(unc.unstaged_files[:5]) + (f" (+{len(unc.unstaged_files)-5} more)" if len(unc.unstaged_files) > 5 else ""))
        if unc.untracked_files:
            uncommitted_table.add_row("[dim]Untracked[/dim]", str(unc.untracked_count), ", ".join(unc.untracked_files[:5]) + (f" (+{len(unc.untracked_files)-5} more)" if len(unc.untracked_files) > 5 else ""))

        console.print(uncommitted_table)
        console.print("[yellow]Note: Uncommitted changes are present in your workspace but are NOT part of the committed PR comparison.[/yellow]\n")

    # 4. Test Coverage & Gap Analysis Table
    if report.test_analysis.mappings:
        test_table = Table(
            title="Test Coverage & Potential Gap Analysis",
            box=ROUNDED,
            header_style="bold magenta",
            title_style="bold",
            show_lines=False,
        )
        test_table.add_column("Changed File", style="bold", width=32)
        test_table.add_column("Test Status", width=18)
        test_table.add_column("Related Test Files", style="cyan", width=28)
        test_table.add_column("Notes", style="dim")

        for m in report.test_analysis.mappings:
            if m.has_potential_gap:
                status_str = "[bold yellow]⚠ Potential Gap[/bold yellow]"
            elif m.related_tests and m.related_tests != [m.changed_file]:
                status_str = "[bold green]✔ Test Found[/bold green]"
            elif m.related_tests == [m.changed_file]:
                status_str = "[green]Test File[/green]"
            else:
                status_str = "[dim]Non-code[/dim]"

            related_display = ", ".join(m.related_tests) if m.related_tests else "[dim]None detected[/dim]"
            test_table.add_row(m.changed_file, status_str, related_display, m.note)

        console.print(test_table)

    # 5. Suggested Test Commands Panel
    ta = report.test_analysis
    test_body = (
        f"[bold]Detected Test Framework:[/bold] [cyan]{ta.framework}[/cyan]\n"
        f"[bold]Suggested Test Command:[/bold] [bold green]{ta.suggested_command or 'None'}[/bold green]\n"
        f"[bold]Tests Executed by RepoPilot:[/bold] [white]False[/white] "
        f"[dim](RepoPilot is read-only and does not run test suites automatically)[/dim]"
    )
    console.print(
        Panel(
            test_body,
            title="[bold green]Test Verification Recommendations[/bold green]",
            border_style="green",
            box=ROUNDED,
        )
    )

    # Footer Safety Note
    console.print(
        "[dim]Safety note: RepoPilot operates in read-only mode. No Git commits, branches, or worktree files were altered.\n"
        "Missing tests are flagged as potential gaps for human review, not confirmed defects.[/dim]\n"
    )


def render_json(report: Any) -> str:
    """Serializes a report (DiagnosticReport, ExploreReport, or PRCheckReport) to formatted JSON."""
    return json.dumps(report.to_dict(), indent=2, sort_keys=True)
