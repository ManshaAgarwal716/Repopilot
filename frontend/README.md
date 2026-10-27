# RepoPilot Developer Dashboard 🧭

The modern web frontend for **RepoPilot**, an open-source developer tool for codebase exploration, environment diagnostics, and pre-PR verification.

---

## Tech Stack

- **Framework**: [React 18](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## Design System

Designed for developers with a dark charcoal aesthetic inspired by modern IDEs:
- **Palette**: Charcoal backgrounds (`#0a0c10`, `#0f1117`, `#141720`) with thin subtle borders (`border-charcoal-750`).
- **Accents**: Cyan (`#06b6d4`), Emerald (`#10b981`), Amber (`#f59e0b`), Rose (`#f43f5e`), and Indigo (`#6366f1`).
- **Typography**: Inter for UI text and JetBrains Mono for paths, commands, and code tokens.
- **Responsiveness**: Fully responsive layout with mobile drawer navigation and collapsible tree views.

---

## Setup & Running Locally

### 1. Prerequisites

- **Node.js**: v18.0.0 or newer (tested with Node.js v24)
- **npm**: v9.0.0 or newer

### 2. Install Dependencies

From the repository root:

```bash
cd frontend
npm install
```

### 3. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production

```bash
npm run build
```

This compiles TypeScript (`tsc -b`) and bundles the static distribution in `frontend/dist/`.

### 5. Preview the Production Build

```bash
npm run preview
```

---

## Features & Screens

### 1. Dashboard (`/`)
- Unified workspace overview with quick launch actions.
- Three feature cards for **Repository Doctor**, **Repository Explorer**, and **PR Compass**.
- Recent repositories list with a dedicated empty state and demo data restore button.
- Local repository selector modal with demo and custom path registration.

### 2. Repository Doctor
- Layout displaying detected project type and technology stack.
- Development environment tools readiness audit (Git, Python, Node.js, npm) with versions.
- Common project files audit (package manifests, configuration files, lockfiles).
- Tailored setup recommendations with one-click copyable terminal commands.

### 3. Repository Explorer
- Interactive, searchable file tree hierarchy with file size badges and symlink detection.
- Architecture overview with recognized frameworks and likely entry points.
- Suggested starting points ranked by confidence (High, Medium, Low) with rationale.
- Explanations of core configuration files and their architectural roles.

### 4. PR Compass
- Local branch comparison (`current_branch` vs `base_branch`) and comparison range.
- Summary of committed branch modifications (Added, Modified, Deleted, Renamed).
- **Working Tree Separation**: Explicitly isolates uncommitted working-tree changes (staged, unstaged, untracked) from committed PR differences.
- Heuristic test discovery mapping changed code files to candidate test files.
- Potential test coverage gap warnings with suggested test commands.

---

## Demo Mode vs. Local Path Registration

In this milestone:
- **Demo Mode**: Preloads comprehensive, realistic analysis reports modeled after RepoPilot itself, allowing you to explore all screens and features immediately.
- **Custom Path Registration**: Allows entering any local directory path. The UI clearly notes that live backend execution currently runs via the Python CLI (`repopilot doctor <path>`, `repopilot explore <path>`, `repopilot pr-check <path>`), with the backend HTTP API server planned for the next release.
